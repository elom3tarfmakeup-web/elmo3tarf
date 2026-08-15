import React, { useState } from 'react';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import { EGYPT_AREAS, uid } from '../data.js';
import { Icon } from '../components/icons.jsx';
import { EmptyState } from '../components/Shared.jsx';
import { tr } from '../i18n.js';

// ===== عناويني =====
export function Addresses() {
  const { savedAddresses, currentUser, saveAddress, deleteAddress, lang } = useApp();
  const { navigate } = useRouter();
  const [form, setForm] = useState({ name: '', governorate: '', region: '', address: '' });
  const [err, setErr] = useState('');
  const mine = savedAddresses.filter(a => a.userEmail === currentUser?.email);
  const regions = form.governorate ? EGYPT_AREAS[form.governorate] || [] : [];

  const save = () => {
    if (!form.name.trim()) { setErr('سمِّ العنوان (مثال: المنزل)'); return; }
    if (!form.governorate || !form.region) { setErr('اختر المحافظة والمنطقة'); return; }
    if (!form.address.trim()) { setErr('اكتب تفاصيل العنوان'); return; }
    setErr('');
    saveAddress({ ...form });
    setForm({ name: '', governorate: '', region: '', address: '' });
  };

  return (
    <div>
      <h1 className="page-title">{tr(lang, 'myAddresses')}</h1>
      <div className="cart-page" style={{ gridTemplateColumns: '1fr' }}>
        <div className="dash-card">
          <h3>{lang === 'en' ? 'Add New Address' : 'إضافة عنوان جديد'}</h3>
          <div className="form">
            <div className="form-field">
              <label className="form-label">اسم العنوان</label>
              <input className="input" placeholder="المنزل، العمل..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid-2">
              <div className="form-field">
                <label className="form-label">المحافظة</label>
                <select className="select" value={form.governorate} onChange={e => setForm({ ...form, governorate: e.target.value, region: '' })}>
                  <option value="">اختر المحافظة</option>
                  {Object.keys(EGYPT_AREAS).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">المنطقة</label>
                <select className="select" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} disabled={!form.governorate}>
                  <option value="">اختر المنطقة</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">تفاصيل العنوان</label>
              <input className="input" placeholder="شارع، مبنى، شقة..." value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            {err && <div className="error-text">{err}</div>}
            <button className="btn btn-primary" onClick={save}>{tr(lang, 'save')}</button>
          </div>
        </div>

        {mine.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mine.map(a => (
              <div className="address-card" key={a.id}>
                <div className="flex-between">
                  <span className="ad-name">📍 {a.name || a.label}</span>
                  <button className="mini-btn red" onClick={() => deleteAddress(a.id)}><Icon.Trash /> {tr(lang, 'delete')}</button>
                </div>
                <div className="ad-detail">{a.governorate} — {a.region}</div>
                <div className="ad-detail">{a.address}</div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="📍" title={lang === 'en' ? 'No saved addresses' : 'لا توجد عناوين محفوظة'} sub={lang === 'en' ? 'Add a new address above' : 'أضف عنواناً جديداً ليظهر هنا'} />
        )}
      </div>
    </div>
  );
}

// ===== الإشعارات =====
export function NotificationsPage() {
  const { getFilteredNotifications, dismissNotification, markAllRead, setOpenOrderId, lang } = useApp();
  const { navigate } = useRouter();
  const list = getFilteredNotifications().slice().reverse();
  const hasNew = list.some(n => n.new);

  const open = (n) => {
    if (n.orderId) {
      if (n.targetUserEmail && n.targetUserEmail.toUpperCase().includes('OWNER')) navigate('dashboard');
      else navigate('orders');
      setOpenOrderId(n.orderId);
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{tr(lang, 'notifications')}</h1>
        {hasNew && <button className="btn btn-secondary btn-sm" onClick={markAllRead}>✓ {lang === 'en' ? 'Mark all read' : 'قراءة الكل'}</button>}
      </div>
      {list.length ? (
        <div className="notif-list">
          {list.map(n => (
            <div key={n.id} className={`notif-item ${n.new ? 'unread' : ''}`} onClick={() => open(n)}>
              <span className="notif-icon" style={{ background: n.iconBg || 'rgba(232,67,147,0.1)' }}>{n.icon || '🔔'}</span>
              <div style={{ flex: 1 }}>
                <div className="ni-title">{n.title}</div>
                <div className="ni-text">{n.text}</div>
                <div className="ni-time">{n.time}{n.orderId ? ' — 👆 اضغط لفتح تفاصيل الطلب' : ''}</div>
              </div>
              <button className="ni-dismiss" onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }} aria-label="حذف"><Icon.Close /></button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="🔔" title={tr(lang, 'noNotifs')} sub={lang === 'en' ? 'You are all caught up' : 'مفيش إشعارات جديدة دلوقتي'} />
      )}
    </div>
  );
}

// ===== حسابي =====
export function Account() {
  const { currentUser, isOwner, logout, theme, setTheme, lang, setLang, orders, savedAddresses } = useApp();
  const { navigate } = useRouter();
  if (!currentUser) { navigate('login'); return null; }

  const myOrders = orders.filter(o => o.customerEmail === currentUser.email).length;
  const myAddrs = savedAddresses.filter(a => a.userEmail === currentUser.email).length;

  const rows = [
    { icon: 'Package', label: tr(lang, 'myOrders'), sub: `${myOrders} ${lang === 'en' ? 'orders' : 'طلبات'}`, to: 'orders' },
    { icon: 'MapPin', label: tr(lang, 'myAddresses'), sub: `${myAddrs} ${lang === 'en' ? 'addresses' : 'عناوين'}`, to: 'addresses' },
    { icon: 'Bell', label: tr(lang, 'notifications'), sub: '', to: 'notifications' }
  ];
  if (isOwner) rows.unshift({ icon: 'Settings', label: tr(lang, 'dashboard'), sub: lang === 'en' ? 'Store management' : 'إدارة المتجر', to: 'dashboard' });

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="auth-card" style={{ boxShadow: 'var(--shadow-soft)', marginTop: 0 }}>
        <div className="flex gap-16" style={{ marginBottom: 24 }}>
          <span className="avatar" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 28 }}>
            {(currentUser.name || '؟').charAt(0)}
          </span>
          <div>
            <h2 style={{ fontSize: 22 }}>{currentUser.name}</h2>
            <p className="text-muted" style={{ fontSize: 13.5 }} dir="ltr">{currentUser.email}</p>
            {currentUser.phone && <p className="text-muted" style={{ fontSize: 13.5 }} dir="ltr">{currentUser.phone}</p>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(r => (
            <button key={r.to} className="drawer-link" style={{ border: '1px solid var(--border)', borderRadius: 14 }} onClick={() => navigate(r.to)}>
              <span className="dl-icon">{React.createElement(Icon[r.icon] || Icon.Sparkle)}</span>
              <span style={{ flex: 1 }}>{r.label}</span>
              {r.sub && <small className="text-muted">{r.sub}</small>}
              <Icon.ChevronLeft />
            </button>
          ))}
        </div>

        <div style={{ marginTop: 22, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div className="toggle-row">
            <span className="flex gap-8">{theme === 'dark' ? <Icon.Sun /> : <Icon.Moon />} {theme === 'dark' ? tr(lang, 'lightMode') : tr(lang, 'darkMode')}</span>
            <button className={`switch ${theme === 'dark' ? 'on' : ''}`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          </div>
          <div className="toggle-row">
            <span className="flex gap-8"><Icon.Globe /> {tr(lang, 'language')}: {lang === 'ar' ? 'العربية' : 'English'}</span>
            <button className={`switch ${lang === 'en' ? 'on' : ''}`} onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} />
          </div>
        </div>

        <button className="btn btn-danger btn-block" style={{ marginTop: 22 }} onClick={() => { logout(); navigate('landing'); }}>
          <Icon.Logout /> {tr(lang, 'logout')}
        </button>
      </div>
    </div>
  );
}

// ===== فروعنا =====
export function Branches() {
  const { storeSettings, lang } = useApp();
  const s = storeSettings || {};
  const branches = Array.isArray(s.branches) && s.branches.length ? s.branches : [];
  const hours = s.workHours || {};

  const contacts = [
    { label: tr(lang, 'whatsappGroup'), url: s.whatsappGroup, icon: 'WhatsApp', color: '#25D366' },
    { label: tr(lang, 'tiktok'), url: s.tiktok, icon: 'TikTok', color: '#000' },
    { label: tr(lang, 'telegram'), url: s.telegram, icon: 'Telegram', color: '#229ED9' },
    { label: tr(lang, 'facebook'), url: s.facebook, icon: 'Facebook', color: '#1877F2' }
  ].filter(c => c.url);

  return (
    <div>
      <div className="section-head" style={{ marginBottom: 36 }}>
        <span className="icon-badge">🏪</span>
        <h1 className="section-title">{tr(lang, 'branches')}</h1>
        <p className="section-sub">{lang === 'en' ? 'Visit our store — where beauty comes alive 💕' : 'زورونا في فرعنا — جمالك يبدأ من هنا 💕'}</p>
      </div>

      <div className="branches-grid">
        {branches.map(b => (
          <div className="branch-card" key={b.id}>
            <span className="bc-icon">🏪</span>
            <h3>{b.name}</h3>
            {b.sub && <div className="bc-sub">{b.sub}</div>}
            {b.address && <div className="bc-addr">{b.address}</div>}
            {b.mapUrl && (
              <a className="btn btn-secondary btn-sm" style={{ marginTop: 18 }} href={b.mapUrl} target="_blank" rel="noreferrer">
                <Icon.MapPin /> {tr(lang, 'openInMaps')}
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="section-head" style={{ margin: '56px 0 24px' }}>
        <h2 className="section-title">{lang === 'en' ? 'Connect With Us' : 'تواصل معنا'}</h2>
        <div className="accent-line" />
      </div>
      <div className="contact-row">
        {contacts.map(c => (
          <a key={c.label} className="contact-pill" href={c.url} target="_blank" rel="noreferrer">
            {React.createElement(Icon[c.icon] || Icon.Sparkle, { style: { color: c.color } })} {c.label}
          </a>
        ))}
      </div>
      {s.phone && (
        <p className="text-muted" style={{ textAlign: 'center', marginTop: 16, fontWeight: 600 }} dir="ltr">
          📞 {s.phone}
        </p>
      )}

      <div className="section-head" style={{ margin: '48px 0 20px' }}>
        <h2 className="section-title">{tr(lang, 'workHours')}</h2>
        <div className="accent-line" />
      </div>
      <div className="hours-card">
        <div className="flex-between" style={{ padding: '8px 0' }}><span>{tr(lang, 'weekdays')}</span><strong>{hours.weekdays || '10:00 ص - 10:00 م'}</strong></div>
        <div className="flex-between" style={{ padding: '8px 0', borderTop: '1px dashed var(--border)' }}><span>{tr(lang, 'friday')}</span><strong>{hours.friday || '2:00 م - 10:00 م'}</strong></div>
      </div>
    </div>
  );
}
