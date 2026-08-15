import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  db, auth, FS,
  OWNER_EMAIL, OWNER_PASSWORD, OWNER_PHONE,
  CLOUDINARY_URL, UPLOAD_PRESET,
  PUSH_WORKER_URL, PUSH_WORKER_SECRET, PUSH_ENDPOINT, VAPID_KEY, LOGO_URL,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged
} from './firebase.js';
import {
  collection, doc, setDoc, deleteDoc, getDocs, getDoc, onSnapshot, writeBatch
} from 'firebase/firestore';
import { DEFAULT_SETTINGS, EGYPT_AREAS, uid } from './data.js';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const LS = {
  cart: 'elmo3tarf_cart',
  lang: 'elmo3tarf_lang',
  theme: 'elmo3tarf_theme',
  dismissed: 'elmo3tarf_dismissed',
  owner: 'elmo3tarf_owner_session',
  ticker: 'elmo3tarf_ticker_dismissed',
  intro: 'elmo3tarf_intro_seen'
};

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}

// ===== صوت الإشعارات (نغمة ناعمة واضحة) =====
function playNotifSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const play = (freq, start, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    };
    play(880, 0, 0.25);
    play(1174.66, 0.18, 0.35);
    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch (e) { /* تجاهل */ }
}

export function AppProvider({ children }) {
  // ===== UI =====
  const [lang, setLangState] = useState(() => localStorage.getItem(LS.lang) || 'ar');
  const [theme, setThemeState] = useState(() => localStorage.getItem(LS.theme) || 'light');
  const [toast, setToast] = useState(null);
  const [cartSnackbar, setCartSnackbar] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fsReady, setFsReady] = useState(false);
  const [openOrderId, setOpenOrderId] = useState(null); // تفاصيل الطلب (مودال)
  const [imageZoom, setImageZoom] = useState(null);     // تكبير صورة منتج

  // ===== البيانات =====
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [offers, setOffers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [notifyRequests, setNotifyRequests] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});
  const [promos, setPromos] = useState([]);
  const [banners, setBanners] = useState([]);
  const [storeSettings, setStoreSettings] = useState({ ...DEFAULT_SETTINGS });
  const [counters, setCounters] = useState({ nextProductId: 100, nextOfferId: 50, nextOrderId: 1 });
  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => JSON.parse(localStorage.getItem(LS.dismissed) || '[]'));
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem(LS.cart) || '[]'));
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [notifPrompt, setNotifPrompt] = useState(false);

  const isOwner = !!(currentUser && currentUser.email && currentUser.email.toUpperCase() === OWNER_EMAIL.toUpperCase());

  // ===== مرجع لأحدث القيم (للأكشنز) =====
  const ref = useRef({});
  ref.current = {
    currentUser, products, orders, offers, notifications, savedAddresses, notifyRequests,
    customCategories, categoryImages, promos, banners, storeSettings, counters,
    dismissedNotifIds, cart, appliedPromo, isOwner
  };

  // ===== localStorage للـ cart =====
  useEffect(() => { localStorage.setItem(LS.cart, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem(LS.lang, lang); document.documentElement.lang = lang === 'en' ? 'en' : 'ar'; document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl'; }, [lang]);
  useEffect(() => { localStorage.setItem(LS.theme, theme); document.documentElement.dataset.theme = theme; }, [theme]);

  const showToast = useCallback((msg, isError) => {
    setToast({ msg, isError, id: Date.now() });
    setTimeout(() => setToast(t => (t && t.id === Date.now() ? null : t)), 2600);
  }, []);

  // ===== حفظ في Firestore (مؤجل) =====
  const skipSave = useRef(false);
  const saveTimer = useRef(null);
  const saveToFirestore = useCallback(async (d) => {
    try {
      const b = writeBatch(db);
      const ts = new Date().toISOString();
      let n = 0;
      const add = (col, id, obj) => { b.set(doc(db, col, String(id)), { ...obj, _updated: ts }); n++; };
      (d.products || []).forEach(p => { if (p && p.id != null && p.nameAr) add(FS.products, p.id, p); });
      (d.orders || []).forEach(o => { if (o && o.id != null && o.customerEmail) add(FS.orders, String(o.id).replace('#', ''), o); });
      (d.offers || []).forEach(f => { if (f && f.id != null && f.name) add(FS.offers, f.id, f); });
      (d.notifications || []).forEach(x => { if (x && x.id && x.title) add(FS.notifications, x.id, x); });
      (d.savedAddresses || []).forEach(a => { if (a && a.id && a.userEmail) add(FS.addresses, a.id, a); });
      (d.notifyRequests || []).forEach(r => { if (r && r.productId != null && r.userEmail) add(FS.notifyReqs, `${r.productId}_${String(r.userEmail).replace(/[.@]/g, '_')}`, r); });
      (d.customCategories || []).forEach(c => { if (c && c.id != null && c.label) add(FS.categories, c.id, c); });
      (d.promos || []).forEach(p => { if (p && p.code) add(FS.promos, String(p.code).toUpperCase(), p); });
      (d.banners || []).forEach(bn => { if (bn && bn.id != null && bn.text) add(FS.banners, bn.id, bn); });
      add(FS.appState, 'counters', { nextProductId: d.counters.nextProductId, nextOfferId: d.counters.nextOfferId, nextOrderId: d.counters.nextOrderId, categoryImages: d.categoryImages || {} });
      add(FS.settings, 'store', d.storeSettings || {});
      await b.commit();
    } catch (err) {
      if (err && err.code === 'permission-denied') console.warn('Firestore: permission denied');
      else console.warn('Firestore save error:', err && err.message);
    }
  }, []);

  // منع حفظ Loop: منقارن بصمة البيانات — لو مفيش تغيير حقيقي منكتبش تاني
  const lastSavedKey = useRef('');
  useEffect(() => {
    if (!fsReady) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (skipSave.current) return;
      const d = ref.current;
      const key = JSON.stringify([
        d.products, d.orders, d.offers, d.notifications, d.savedAddresses, d.notifyRequests,
        d.customCategories, d.categoryImages, d.promos, d.banners, d.storeSettings, d.counters
      ]);
      if (key === lastSavedKey.current) return;
      lastSavedKey.current = key;
      saveToFirestore({
        products: d.products, orders: d.orders, offers: d.offers, notifications: d.notifications,
        savedAddresses: d.savedAddresses, notifyRequests: d.notifyRequests,
        customCategories: d.customCategories, categoryImages: d.categoryImages,
        promos: d.promos, banners: d.banners, storeSettings: d.storeSettings, counters: d.counters
      });
    }, 900);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [fsReady, products, orders, offers, notifications, savedAddresses, notifyRequests, customCategories, categoryImages, promos, banners, storeSettings, counters, saveToFirestore]);

  // ===== تحميل البيانات من Firestore عند البدء =====
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const snap = (col) => getDocs(collection(db, col)).catch(() => null);
        const [p, o, f, c, nt, ad, rq, pr, bn] = await Promise.all([
          snap(FS.products), snap(FS.orders), snap(FS.offers), snap(FS.categories),
          snap(FS.notifications), snap(FS.addresses), snap(FS.notifyReqs), snap(FS.promos), snap(FS.banners)
        ]);
        if (!live) return;
        const clean = (x) => { const d = x.data(); if (d) delete d._updated; return d; };
        const map = (s, valid) => s && s.docs ? s.docs.map(clean).filter(valid) : [];
        if (p) setProducts(map(p, d => d && d.id != null && d.nameAr).sort((a, b) => a.id - b.id));
        if (o) setOrders(map(o, d => d && d.id != null && d.customerEmail));
        if (f) setOffers(map(f, d => d && d.id != null && d.name));
        if (c) setCustomCategories(map(c, d => d && d.id != null && d.label));
        if (nt) setNotifications(map(nt, d => d && d.id && d.title));
        if (ad) setSavedAddresses(map(ad, d => d && d.id && d.userEmail));
        if (rq) setNotifyRequests(map(rq, d => d && d.productId != null && d.userEmail));
        if (pr) setPromos(map(pr, d => d && d.code && d.code !== '_seed'));
        if (bn) setBanners(map(bn, d => d && d.id != null && d.text && d.id !== '_seed'));
        const st = await getDoc(doc(db, FS.settings, 'store')).catch(() => null);
        if (st && st.exists() && st.data() && !st.data()._seed && live) {
          const sd = { ...st.data() }; delete sd._updated;
          setStoreSettings(prev => ({ ...DEFAULT_SETTINGS, ...sd }));
        }
        const cs = await getDoc(doc(db, FS.appState, 'counters')).catch(() => null);
        if (cs && cs.exists() && live) {
          const sd = cs.data();
          setCounters(prev => ({
            nextProductId: sd.nextProductId || prev.nextProductId,
            nextOfferId: sd.nextOfferId || prev.nextOfferId,
            nextOrderId: sd.nextOrderId || prev.nextOrderId
          }));
          if (sd.categoryImages && typeof sd.categoryImages === 'object') setCategoryImages(sd.categoryImages);
        }
        setFsReady(true);
      } catch (e) {
        console.warn('load fail', e);
        setFsReady(true);
      }
    })();
    return () => { live = false; };
  }, []);

  // ===== Live listeners (طلبات + منتجات + إشعارات + بانرات) =====
  useEffect(() => {
    const onSnap = (col, setter, valid) => onSnapshot(collection(db, col), snap => {
      const items = snap.docs.map(x => { const d = x.data(); if (d) delete d._updated; return d; }).filter(valid);
      if (col === FS.products) items.sort((a, b) => a.id - b.id);
      setter(items);
    }, () => {});
    const un1 = onSnap(FS.products, setProducts, d => d && d.id != null && d.nameAr);
    const un2 = onSnap(FS.orders, setOrders, d => d && d.id != null && d.customerEmail);
    const un3 = onSnap(FS.notifications, setNotifications, d => d && d.id && d.title);
    const un4 = onSnap(FS.banners, setBanners, d => d && d.id != null && d.text && d.id !== '_seed');
    const un5 = onSnap(FS.categories, setCustomCategories, d => d && d.id != null && d.label);
    const un6 = onSnap(FS.promos, setPromos, d => d && d.code && d.code !== '_seed');
    const un7 = onSnapshot(doc(db, FS.settings, 'store'), snap => {
      if (snap.exists() && snap.data() && !snap.data()._seed) {
        const sd = { ...snap.data() }; delete sd._updated;
        setStoreSettings(prev => ({ ...DEFAULT_SETTINGS, ...sd }));
      }
    }, () => {});
    return () => { [un1, un2, un3, un4, un5, un6, un7].forEach(u => u()); };
  }, []);

  // ===== الجلسة (Firebase Auth + المالك) =====
  useEffect(() => {
    const savedOwner = localStorage.getItem(LS.owner);
    if (savedOwner === '1') {
      setCurrentUser({ name: 'المالك', email: OWNER_EMAIL, phone: OWNER_PHONE });
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        let name = (u.displayName) || u.email.split('@')[0];
        let phone = '';
        const dd = await getDoc(doc(db, FS.users, u.uid)).catch(() => null);
        if (dd && dd.exists()) { name = dd.data().name || name; phone = dd.data().phone || ''; }
        setCurrentUser({ uid: u.uid, name, email: u.email, phone });
      } else if (!localStorage.getItem(LS.owner)) {
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, []);

  // ===== تنبيه الطلبات المتأخرة (للمالك) =====
  const slowReminded = useRef([]);
  useEffect(() => {
    const iv = setInterval(() => {
      const st = ref.current.storeSettings;
      const hours = Number(st.slowOrderHours) || 2;
      const now = Date.now();
      ref.current.orders.forEach(o => {
        if (o.status !== 'pending' && o.status !== 'accepted') return;
        if (slowReminded.current.includes(String(o.id))) return;
        const t = new Date(o.createdAt || now).getTime();
        if (now - t > hours * 3600 * 1000) {
          slowReminded.current.push(String(o.id));
          addNotification('⏰ طلب متأخر في الرد', `الطلب ${o.id} من ${o.customerName || 'العميل'} مستني ردك من ${hours} ساعات`, '⏰', 'rgba(245,158,11,0.12)', OWNER_EMAIL, { orderId: o.id });
        }
      });
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  // ===== إشعارات =====
  const sendFcmPush = useCallback(async (targetEmail, title, body, url) => {
    try {
      const cleanBody = String(body || '').replace(/<[^>]*>/g, ' ').slice(0, 200);
      const notifUrl = String(url || './');
      let q = null;
      if (!targetEmail) q = query(collection(db, FS.pushSubs), where('role', '==', 'customer'));
      else if (targetEmail.toUpperCase() === OWNER_EMAIL.toUpperCase()) q = query(collection(db, FS.pushSubs), where('role', '==', 'admin'));
      else q = query(collection(db, FS.pushSubs), where('email', '==', targetEmail));
      const snap = await getDocs(q).catch(() => null);
      const subs = (snap ? snap.docs : []).map(d => d.data()).filter(s => s.endpoint && s.p256dh)
        .map(s => ({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth || '' } }));
      if (subs.length) {
        const res = await fetch(PUSH_WORKER_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: PUSH_WORKER_SECRET, subs, title, body: cleanBody, icon: LOGO_URL, url: notifUrl })
        }).catch(() => null);
        if (res && res.ok) { const r = await res.json().catch(() => ({})); if (r && r.ok) return; }
      }
      if (PUSH_ENDPOINT) {
        await fetch(PUSH_ENDPOINT, {
          method: 'POST', headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ title, body: cleanBody, targetEmail: targetEmail || '' })
        }).catch(() => {});
      }
    } catch (e) { console.warn('sendFcmPush', e); }
  }, []);

  const addNotification = useCallback((title, text, icon = '🔔', iconBg = 'rgba(232,67,147,0.1)', targetEmail = null, extra = null) => {
    const me = ref.current.currentUser;
    const notifObj = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      title, text, icon, iconBg,
      time: new Date().toLocaleString('ar-EG'),
      new: true
    };
    if (targetEmail) notifObj.targetUserEmail = targetEmail;
    if (extra && extra.orderId) notifObj.orderId = String(extra.orderId);
    setNotifications(prev => [...prev, notifObj]);
    if (!targetEmail || (me && targetEmail === me.email)) playNotifSound();
    const pushUrl = (extra && extra.orderId) ? './?openOrder=' + encodeURIComponent(String(extra.orderId)) : './';
    sendFcmPush(targetEmail, title, text, pushUrl);
    // نوتيفيكيشن المتصفح لو ظاهر
    if (!targetEmail || (me && targetEmail === me.email)) {
      if (document.visibilityState === 'visible' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, { body: text, icon: LOGO_URL, data: { url: pushUrl, orderId: extra && extra.orderId ? String(extra.orderId) : null } });
        } catch (e) { /* */ }
      }
    }
  }, [sendFcmPush]);

  const getFilteredNotifications = useCallback(() => {
    const d = ref.current;
    const me = d.currentUser;
    let list = d.notifications;
    if (me && me.email.toUpperCase() === OWNER_EMAIL.toUpperCase()) {
      list = list.filter(n => !n.targetUserEmail || n.targetUserEmail.toUpperCase() === OWNER_EMAIL.toUpperCase());
    } else if (me) {
      list = list.filter(n => !n.targetUserEmail || n.targetUserEmail === me.email);
    } else {
      list = list.filter(n => !n.targetUserEmail);
    }
    return list.filter(n => !d.dismissedNotifIds.includes(n.id));
  }, []);

  const dismissNotification = useCallback((id) => {
    setDismissedNotifIds(prev => {
      const next = [...prev, id];
      localStorage.setItem(LS.dismissed, JSON.stringify(next));
      return next;
    });
    deleteDoc(doc(db, FS.notifications, String(id))).catch(() => {});
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => (n.new ? { ...n, new: false } : n)));
  }, []);

  // ===== Push subscription =====
  const initPush = useCallback(async () => {
    const me = ref.current.currentUser;
    if (!me) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
        });
      }
      const enc = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
      const docId = me.email.toUpperCase() === OWNER_EMAIL.toUpperCase() ? 'admin_' + me.email.replace(/[^a-z0-9]/gi, '_') : me.email.replace(/[^a-z0-9]/gi, '_');
      await setDoc(doc(db, FS.pushSubs, docId), {
        email: me.email,
        role: me.email.toUpperCase() === OWNER_EMAIL.toUpperCase() ? 'admin' : 'customer',
        endpoint: sub.endpoint,
        p256dh: sub.getKey('p256dh') ? enc(sub.getKey('p256dh')) : '',
        auth: sub.getKey('auth') ? enc(sub.getKey('auth')) : '',
        updatedAt: Date.now()
      }).catch(() => {});
    } catch (e) { console.warn('initPush', e); }
  }, []);

  // طلب تفعيل الإشعارات لو مش مفعلة
  useEffect(() => {
    if (!currentUser) { setNotifPrompt(false); return; }
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') { setNotifPrompt(false); return; }
    const t = setTimeout(() => setNotifPrompt(true), 4000);
    const iv = setInterval(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        setNotifPrompt(false);
        initPush();
        clearInterval(iv);
      }
    }, 30000);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [currentUser, initPush]);

  const enableNotifications = useCallback(async () => {
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') { setNotifPrompt(false); await initPush(); showToast('✅ تم تفعيل الإشعارات'); }
    } catch (e) { /* */ }
  }, [initPush, showToast]);

  // ===== تسجيل الدخول =====
  const login = useCallback(async (email, password) => {
    const em = String(email || '').trim().toLowerCase();
    if (em === OWNER_EMAIL.toLowerCase() && password === OWNER_PASSWORD) {
      localStorage.setItem(LS.owner, '1');
      setCurrentUser({ name: 'المالك', email: OWNER_EMAIL, phone: OWNER_PHONE });
      showToast('✅ أهلاً بك يا مالك المتجر');
      return { ok: true, isOwner: true };
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, em, password);
      const u = cred.user;
      let name = (u.displayName) || em.split('@')[0];
      let phone = '';
      const dd = await getDoc(doc(db, FS.users, u.uid)).catch(() => null);
      if (dd && dd.exists()) { name = dd.data().name || name; phone = dd.data().phone || ''; }
      setCurrentUser({ uid: u.uid, name, email: u.email, phone });
      showToast('✅ تم تسجيل الدخول بنجاح');
      return { ok: true, isOwner: false };
    } catch (err) {
      const map = {
        'auth/user-not-found': 'هذا الحساب غير موجود. يرجى إنشاء حساب جديد',
        'auth/wrong-password': 'كلمة المرور غير صحيحة',
        'auth/invalid-email': 'البريد الإلكتروني غير صالح',
        'auth/too-many-requests': 'محاولات كثيرة. حاول مرة أخرى لاحقاً',
        'auth/invalid-credential': 'بيانات الدخول غير صحيحة'
      };
      return { ok: false, error: map[err.code] || 'تعذر تسجيل الدخول، حاول مرة أخرى' };
    }
  }, [showToast]);

  // ===== إنشاء حساب =====
  const register = useCallback(async ({ name, email, phone, password }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, String(email).trim(), password);
      const u = cred.user;
      await setDoc(doc(db, FS.users, u.uid), { name, email: u.email, phone, createdAt: Date.now() }).catch(() => {});
      setCurrentUser({ uid: u.uid, name, email: u.email, phone });
      showToast('✅ تم إنشاء حسابك بنجاح');
      return { ok: true };
    } catch (err) {
      const map = {
        'auth/email-already-in-use': 'هذا البريد مسجل بالفعل — سجل دخول',
        'auth/invalid-email': 'البريد الإلكتروني غير صالح',
        'auth/weak-password': 'كلمة المرور ضعيفة — 6 أحرف على الأقل'
      };
      return { ok: false, error: map[err.code] || 'تعذر إنشاء الحساب، حاول مرة أخرى' };
    }
  }, [showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem(LS.owner);
    auth.signOut().catch(() => {});
    setCurrentUser(null);
    showToast('تم تسجيل الخروج');
  }, [showToast]);

  // ===== السلة =====
  const addToCart = useCallback((productId) => {
    const d = ref.current;
    const product = d.products.find(p => String(p.id) === String(productId));
    if (!product) return;
    const stock = Number(product.stock);
    if (product.stock !== undefined && stock <= 0) {
      showToast('⚠️ هذا المنتج غير متوفر حالياً');
      return;
    }
    setCart(prev => {
      const ex = prev.find(i => String(i.id) === String(productId));
      if (ex) return prev.map(i => (String(i.id) === String(productId) ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...product, quantity: 1 }];
    });
    const name = product.nameAr || product.nameEn || 'منتج';
    setCartSnackbar({ name, count: null, ts: Date.now() });
    setTimeout(() => setCartSnackbar(null), 3500);
  }, [showToast]);

  const updateCartQty = useCallback((productId, delta) => {
    setCart(prev => prev
      .map(i => (String(i.id) === String(productId) ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
      .filter(i => i.quantity > 0));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(i => String(i.id) !== String(productId)));
  }, []);

  const clearCart = useCallback(() => { setCart([]); setAppliedPromo(null); }, []);

  const removePromo = useCallback(() => { setAppliedPromo(null); }, []);

  // ===== البرومو كود =====
  const applyPromoCode = useCallback((code) => {
    const d = ref.current;
    const promo = d.promos.find(p => String(p.code).toUpperCase() === String(code || '').trim().toUpperCase());
    if (!promo) return { ok: false, error: 'الكود غير صحيح' };
    if (promo.disabled) return { ok: false, error: 'هذا الكود غير مفعّل' };
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return { ok: false, error: 'انتهت صلاحية هذا الكود' };
    const uses = Number(promo.used || 0);
    if (promo.maxUses && uses >= Number(promo.maxUses)) return { ok: false, error: 'تم استخدام هذا الكود بالكامل' };
    const me = d.currentUser;
    if (promo.maxPerUser && me) {
      const usedByMe = (promo.usedBy && promo.usedBy[me.email]) || 0;
      if (usedByMe >= Number(promo.maxPerUser)) return { ok: false, error: 'لقد استخدمت هذا الكود من قبل' };
    }
    const subtotal = cartSubtotal(d.cart);
    const discountAmount = Math.round(subtotal * (Number(promo.discountPct) || 0) / 100);
    setAppliedPromo({ code: promo.code, discountPct: Number(promo.discountPct) || 0, discountAmount, promoId: promo.id });
    return { ok: true };
  }, []);

  function cartSubtotal(items) {
    return (items || []).reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 1), 0);
  }

  // ===== الطلبات =====
  const placeOrder = useCallback(({ governorate, region, address, phone, notes, saveIt, addressName }) => {
    const d = ref.current;
    const me = d.currentUser;
    if (!me) return { ok: false, error: 'يرجى تسجيل الدخول أولاً' };
    const items = d.cart.map(i => ({
      id: i.id, nameAr: i.nameAr, nameEn: i.nameEn, price: i.price,
      quantity: i.quantity, image: i.image || ''
    }));
    if (!items.length) return { ok: false, error: 'سلتك فارغة' };
    const subtotal = cartSubtotal(d.cart);
    const discount = d.appliedPromo ? d.appliedPromo.discountAmount : 0;
    const id = `#${d.counters.nextOrderId}`;
    const order = {
      id, customerName: me.name, customerEmail: me.email, customerPhone: phone || me.phone || '',
      governorate, region, address, notes: notes || '',
      items, subtotal, discount, shipping: 0, total: Math.max(0, subtotal - discount),
      paymentMethod: 'cod', status: 'pending', createdAt: new Date().toISOString(),
      promoCode: d.appliedPromo ? d.appliedPromo.code : null
    };
    setOrders(prev => [...prev, order]);
    setCounters(prev => ({ ...prev, nextOrderId: prev.nextOrderId + 1 }));
    // سجل استخدام البرومو
    if (d.appliedPromo) {
      setPromos(prev => prev.map(p => {
        if (String(p.code).toUpperCase() !== String(d.appliedPromo.code).toUpperCase()) return p;
        const usedBy = { ...(p.usedBy || {}), [me.email]: ((p.usedBy && p.usedBy[me.email]) || 0) + 1 };
        return { ...p, used: (Number(p.used) || 0) + 1, usedBy };
      }));
    }
    // إشعار المالك
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);
    addNotification('🛒 طلب جديد', `طلب جديد من ${me.name} — ${itemCount} منتج بقيمة ${Math.max(0, subtotal - discount)} ج.م`, '🛒', 'rgba(232,67,147,0.1)', OWNER_EMAIL, { orderId: id });
    setCart([]);
    setAppliedPromo(null);
    return { ok: true, orderId: id };
  }, [addNotification]);

  const acceptOrder = useCallback((orderId, { shippingFee, note }) => {
    const fee = Math.max(0, Number(shippingFee) || 0);
    setOrders(prev => prev.map(o => {
      if (String(o.id) !== String(orderId)) return o;
      return { ...o, status: 'accepted', shipping: fee, total: (Number(o.subtotal) || 0) - (Number(o.discount) || 0) + fee, ownerNote: note || '', acceptedAt: new Date().toISOString() };
    }));
    const o = ref.current.orders.find(x => String(x.id) === String(orderId));
    if (o) addNotification('✅ تم قبول طلبك', `طلبك ${orderId} تم قبوله ${note ? '— ' + note : ''}`, '✅', 'rgba(16,185,129,0.1)', o.customerEmail, { orderId });
  }, [addNotification]);

  const rejectOrder = useCallback((orderId, reason) => {
    setOrders(prev => prev.map(o => (String(o.id) === String(orderId) ? { ...o, status: 'rejected', rejectReason: reason || '', rejectedAt: new Date().toISOString() } : o)));
    const o = ref.current.orders.find(x => String(x.id) === String(orderId));
    if (o) addNotification('❌ تم رفض طلبك', `طلبك ${orderId} تم رفضه${reason ? ' — السبب: ' + reason : ''}`, '❌', 'rgba(239,68,68,0.1)', o.customerEmail, { orderId });
  }, [addNotification]);

  const markShipped = useCallback((orderId) => {
    setOrders(prev => prev.map(o => (String(o.id) === String(orderId) ? { ...o, status: 'shipped', shippedAt: new Date().toISOString() } : o)));
    const o = ref.current.orders.find(x => String(x.id) === String(orderId));
    if (o) addNotification('🚚 تم شحن طلبك', `طلبك ${orderId} تم شحنه — هيوصلك قريباً 📦`, '🚚', 'rgba(16,185,129,0.1)', o.customerEmail, { orderId });
  }, [addNotification]);

  // ===== بلغني عند التوفير =====
  const notifyMe = useCallback((productId) => {
    const me = ref.current.currentUser;
    if (!me) { showToast('يرجى تسجيل الدخول أولاً'); return; }
    const existing = ref.current.notifyRequests.find(r => String(r.productId) === String(productId) && r.userEmail === me.email);
    if (existing) {
      setNotifyRequests(prev => prev.filter(r => !(String(r.productId) === String(productId) && r.userEmail === me.email)));
      deleteDoc(doc(db, FS.notifyReqs, `${productId}_${me.email.replace(/[.@]/g, '_')}`)).catch(() => {});
      showToast('تم إلغاء طلب الإشعار');
    } else {
      const req = { productId, userEmail: me.email, userName: me.name, createdAt: Date.now() };
      setNotifyRequests(prev => [...prev, req]);
      setDoc(doc(db, FS.notifyReqs, `${productId}_${me.email.replace(/[.@]/g, '_')}`), req).catch(() => {});
      showToast('تم الطلب! سنخطرك عند توفره 🔔');
    }
  }, [showToast]);

  // ===== العناوين =====
  const saveAddress = useCallback((addr) => {
    const me = ref.current.currentUser;
    if (!me) return;
    const a = { ...addr, id: addr.id || uid('addr_'), userEmail: me.email, createdAt: Date.now() };
    setSavedAddresses(prev => {
      const ex = prev.find(x => x.id === a.id);
      return ex ? prev.map(x => (x.id === a.id ? a : x)) : [...prev, a];
    });
    return a;
  }, []);

  const deleteAddress = useCallback((id) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
    deleteDoc(doc(db, FS.addresses, String(id))).catch(() => {});
  }, []);

  // ===== رفع صورة كلاودنري =====
  const uploadImage = useCallback(async (imageFile) => {
    if (!imageFile) return null;
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
      const data = await res.json();
      if (data && data.secure_url) return data.secure_url;
      showToast('⚠️ تعذر رفع الصورة، حاول مرة أخرى', true);
      return null;
    } catch (e) {
      showToast('⚠️ تعذر رفع الصورة - حاول مرة أخرى', true);
      return null;
    }
  }, [showToast]);

  // ===== إدارة المنتجات =====
  const saveProduct = useCallback(async (data, imageFile) => {
    let image = data.image || '';
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (!url) return { ok: false, error: 'تعذر رفع الصورة' };
      image = url;
    }
    const d = ref.current;
    if (data.id) {
      setProducts(prev => prev.map(p => (String(p.id) === String(data.id) ? { ...p, ...data, image, oldPrice: data.oldPrice || null } : p)));
      showToast('✅ تم تحديث المنتج');
      return { ok: true };
    }
    const newId = d.counters.nextProductId;
    const product = {
      id: newId, nameAr: data.nameAr, nameEn: data.nameEn || '', price: Number(data.price) || 0,
      oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
      category: data.category || 'default', stock: data.stock !== '' && data.stock != null ? Number(data.stock) : undefined,
      image, createdAt: Date.now()
    };
    setProducts(prev => [...prev, product]);
    setCounters(prev => ({ ...prev, nextProductId: prev.nextProductId + 1 }));
    showToast('✅ تمت إضافة المنتج');
    return { ok: true };
  }, [uploadImage, showToast]);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
    deleteDoc(doc(db, FS.products, String(id))).catch(() => {});
    setNotifyRequests(prev => prev.filter(r => String(r.productId) !== String(id)));
    showToast('🗑️ تم حذف المنتج');
  }, [showToast]);

  // ===== إدارة التصنيفات =====
  const saveCategory = useCallback(async (data, imageFile) => {
    let image = data.image || '';
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (!url) return { ok: false, error: 'تعذر رفع الصورة' };
      image = url;
    }
    const d = ref.current;
    if (data.id && d.customCategories.find(c => c.id === data.id)) {
      setCustomCategories(prev => prev.map(c => (c.id === data.id ? { ...c, label: data.label, labelEn: data.labelEn || '' } : c)));
    } else if (data.id && DEFAULT_CATEGORIES_IDS.includes(data.id)) {
      // تعديل تصنيف افتراضي — نحفظ صورة بس
      if (image) setCategoryImages(prev => ({ ...prev, [data.id]: image }));
      showToast('✅ تم تحديث التصنيف');
      return { ok: true };
    } else {
      const id = data.id || uid('cat_');
      setCustomCategories(prev => [...prev, { id, label: data.label, labelEn: data.labelEn || '' }]);
      data.id = id;
    }
    if (image) setCategoryImages(prev => ({ ...prev, [data.id]: image }));
    showToast('✅ تم حفظ التصنيف');
    return { ok: true };
  }, [uploadImage, showToast]);

  const deleteCategory = useCallback((id) => {
    setCustomCategories(prev => prev.filter(c => c.id !== id));
    deleteDoc(doc(db, FS.categories, String(id))).catch(() => {});
    setCategoryImages(prev => { const n = { ...prev }; delete n[id]; return n; });
    showToast('🗑️ تم حذف التصنيف');
  }, [showToast]);

  // ===== إدارة العروض =====
  const saveOffer = useCallback(async (data, imageFile) => {
    let image = data.image || '';
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (!url) return { ok: false, error: 'تعذر رفع الصورة' };
      image = url;
    }
    const d = ref.current;
    if (data.id) {
      setOffers(prev => prev.map(o => (String(o.id) === String(data.id) ? { ...o, ...data, image } : o)));
      showToast('✅ تم تحديث العرض');
      return { ok: true };
    }
    const newId = d.counters.nextOfferId;
    const offer = {
      id: newId, name: data.name, description: data.description || '',
      price: Number(data.price) || 0, discountPct: data.discountPct ? Number(data.discountPct) : null,
      image, expiresAt: data.expiresAt || null, createdAt: Date.now()
    };
    setOffers(prev => [...prev, offer]);
    setCounters(prev => ({ ...prev, nextOfferId: prev.nextOfferId + 1 }));
    addNotification('🎉 عرض جديد', `عرض جديد: ${offer.name}${offer.discountPct ? ' — خصم ' + offer.discountPct + '%' : ''}`, '🎉', 'rgba(232,67,147,0.1)', null, {});
    showToast('✅ تم نشر العرض');
    return { ok: true };
  }, [uploadImage, showToast, addNotification]);

  const deleteOffer = useCallback((id) => {
    setOffers(prev => prev.filter(o => String(o.id) !== String(id)));
    deleteDoc(doc(db, FS.offers, String(id))).catch(() => {});
    showToast('🗑️ تم حذف العرض');
  }, [showToast]);

  // ===== إدارة البرومو =====
  const savePromo = useCallback(async (data) => {
    const promo = {
      id: data.id || uid('promo_'),
      code: String(data.code || '').trim().toUpperCase(),
      discountPct: Number(data.discountPct) || 0,
      maxUses: data.maxUses ? Number(data.maxUses) : null,
      maxPerUser: data.maxPerUser ? Number(data.maxPerUser) : null,
      expiresAt: data.expiresAt || null,
      disabled: !!data.disabled,
      announce: !!data.announce,
      used: 0, usedBy: {}, createdAt: Date.now()
    };
    if (!promo.code) return { ok: false, error: 'اكتب الكود' };
    if (data.id) {
      setPromos(prev => prev.map(p => (p.id === data.id ? { ...p, ...promo } : p)));
      showToast('✅ تم تحديث الكود');
      return { ok: true };
    }
    if (ref.current.promos.find(p => String(p.code).toUpperCase() === promo.code)) return { ok: false, error: 'الكود موجود بالفعل' };
    setPromos(prev => [...prev, promo]);
    if (promo.announce) {
      addNotification('🎟️ كود خصم جديد', `استخدم كود ${promo.code} واحصل على خصم ${promo.discountPct}%`, '🎟️', 'rgba(232,67,147,0.1)', null, {});
    }
    showToast('✅ تمت إضافة الكود');
    return { ok: true };
  }, [addNotification, showToast]);

  const togglePromo = useCallback((id) => {
    setPromos(prev => prev.map(p => (p.id === id ? { ...p, disabled: !p.disabled } : p)));
  }, []);

  const deletePromo = useCallback((id) => {
    setPromos(prev => prev.filter(p => p.id !== id));
    deleteDoc(doc(db, FS.promos, String(id))).catch(() => {});
    showToast('🗑️ تم حذف الكود');
  }, [showToast]);

  // ===== إدارة البانرات =====
  const addBanner = useCallback((text) => {
    if (!String(text || '').trim()) return;
    const banner = { id: uid('bnr_'), text: String(text).trim(), createdAt: Date.now() };
    setBanners(prev => [...prev, banner]);
    addNotification('📢 إعلان جديد', String(text).trim(), '📢', 'rgba(232,67,147,0.1)', null, {});
    showToast('✅ تم نشر الإعلان');
  }, [addNotification, showToast]);

  const deleteBanner = useCallback((id) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    deleteDoc(doc(db, FS.banners, String(id))).catch(() => {});
  }, []);

  // ===== الإعدادات =====
  const updateSettings = useCallback((partial) => {
    setStoreSettings(prev => ({ ...prev, ...partial }));
    showToast('✅ تم حفظ الإعدادات');
  }, [showToast]);

  const value = {
    lang, setLang: setLangState,
    theme, setTheme: setThemeState,
    toast, cartSnackbar, sidebarOpen, setSidebarOpen,
    fsReady, openOrderId, setOpenOrderId, imageZoom, setImageZoom,
    currentUser, isOwner,
    products, orders, offers, notifications, savedAddresses, notifyRequests,
    customCategories, categoryImages, promos, banners, storeSettings, counters,
    cart, appliedPromo, notifPrompt,
    showToast, login, register, logout, initPush, enableNotifications,
    addToCart, updateCartQty, removeFromCart, clearCart,
    applyPromoCode, removePromo, placeOrder, acceptOrder, rejectOrder, markShipped,
    notifyMe, saveAddress, deleteAddress, uploadImage,
    saveProduct, deleteProduct, saveCategory, deleteCategory,
    saveOffer, deleteOffer, savePromo, togglePromo, deletePromo,
    addBanner, deleteBanner, updateSettings,
    addNotification, dismissNotification, markAllRead, getFilteredNotifications
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const DEFAULT_CATEGORIES_IDS = ['nails', 'blusher', 'lipstick', 'skincare', 'eyes'];
