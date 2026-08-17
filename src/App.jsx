import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './store.jsx';
import { RouterProvider, useRouter } from './router.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import MobileNav from './components/MobileNav.jsx';
import Footer from './components/Footer.jsx';
import { Ticker, Toast, CartSnackbar, NotifPrompt, ThemeFab, ImageZoom, Modal, ProductImg } from './components/Shared.jsx';
import Landing from './pages/Landing.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Home from './pages/Home.jsx';
import Products, { OffersPage } from './pages/Products.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import { Addresses, NotificationsPage, Account, Branches } from './pages/Pages.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import { fmtMoney } from './data.js';
import { STATUS_META } from './pages/Orders.jsx';

function OrderDetailsModal() {
  const { openOrderId, setOpenOrderId, orders, isOwner, acceptOrder, rejectOrder, markShipped } = useApp();
  const order = orders.find(o => String(o.id) === String(openOrderId));
  const [view, setView] = useState(null); // {mode:'accept'|'reject', id}

  useEffect(() => { setView(null); }, [openOrderId]);

  if (!openOrderId) return null;

  return (
    <>
      <Modal open={!!openOrderId && !!order} onClose={() => setOpenOrderId(null)} title={`تفاصيل الطلب ${order ? order.id : ''}`}>
        {order && (
          <>
            <div className="dash-card" style={{ padding: 14 }}>
              <div className="flex-between"><span className="text-muted">العميل</span><strong>{order.customerName} — <span dir="ltr">{order.customerPhone || '-'}</span></strong></div>
              <div className="flex-between" style={{ marginTop: 6 }}><span className="text-muted">العنوان</span><strong>{order.governorate} — {order.region} — {order.address}</strong></div>
              <div className="flex-between" style={{ marginTop: 6 }}><span className="text-muted">طريقة الدفع</span><strong>💰 الدفع عند الاستلام</strong></div>
              <div className="flex-between" style={{ marginTop: 6 }}><span className="text-muted">الحالة</span><span className={`status-badge ${(STATUS_META[order.status] || STATUS_META.pending).cls}`} style={{ fontSize: 11.5 }}>{(STATUS_META[order.status] || STATUS_META.pending).ar}</span></div>
              {order.promoCode && <div className="flex-between" style={{ marginTop: 6 }}><span className="text-muted">كود الخصم</span><strong>🎟️ {order.promoCode}</strong></div>}
              {order.notes && <div className="flex-between" style={{ marginTop: 6 }}><span className="text-muted">ملاحظات</span><strong>{order.notes}</strong></div>}
            </div>
            <h4 style={{ margin: '14px 0 10px' }}>المنتجات</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.items && order.items.map(it => (
                <div key={String(it.id)} className="order-item">
                  <ProductImg src={it.image} alt="" />
                  <span style={{ flex: 1 }}>{it.nameAr || it.nameEn} × {it.quantity}</span>
                  <strong>{fmtMoney((Number(it.price) || 0) * (it.quantity || 1))}</strong>
                </div>
              ))}
            </div>
            <div className="order-totals">
              <div className="flex-between"><span>المجموع الفرعي</span><span>{fmtMoney((Number(order.subtotal) || 0) - (Number(order.discount) || 0))}</span></div>
              {Number(order.shipping) > 0 && <div className="flex-between"><span>رسوم التوصيل</span><span>{fmtMoney(order.shipping)}</span></div>}
              <div className="flex-between grand"><span>الإجمالي</span><span>{fmtMoney(order.total)}</span></div>
            </div>
            {order.rejectReason && <div className="reject-reason">❌ سبب الرفض: {order.rejectReason}</div>}
            {order.ownerNote && order.status === 'accepted' && <div className="reject-reason" style={{ background: 'rgba(22,163,74,0.07)', color: 'var(--success)' }}>📝 {order.ownerNote}</div>}

            {isOwner && order.status === 'pending' && (
              <div className="flex gap-12" style={{ marginTop: 16 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setView({ mode: 'accept', id: order.id })}>قبول الطلب وتحديد رسوم التوصيل</button>
                <button className="btn btn-danger" onClick={() => setView({ mode: 'reject', id: order.id })}>رفض الطلب</button>
              </div>
            )}
            {isOwner && order.status === 'accepted' && (
              <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => { markShipped(order.id); setOpenOrderId(null); }}>🚚 تم الشحن — أخطر العميل</button>
            )}
          </>
        )}
      </Modal>

      {view && view.mode === 'accept' && (
        <Modal open onClose={() => setView(null)} title={`قبول الطلب ${view.id}`}>
          <AcceptMini orderId={view.id} onDone={() => { acceptOrder(view.id, window.__feeData); setOpenOrderId(null); }} />
        </Modal>
      )}
      {view && view.mode === 'reject' && (
        <Modal open onClose={() => setView(null)} title={`رفض الطلب ${view.id}`}>
          <RejectMini orderId={view.id} onReject={(reason) => { rejectOrder(view.id, reason); setOpenOrderId(null); }} />
        </Modal>
      )}
    </>
  );
}

function AcceptMini({ orderId, onDone }) {
  const { orders } = useApp();
  const o = orders.find(x => String(x.id) === String(orderId));
  const [fee, setFee] = useState('');
  const [note, setNote] = useState('');
  const subtotal = (Number(o && o.subtotal) || 0) - (Number(o && o.discount) || 0);
  return (
    <div className="form">
      <div className="form-field"><label className="form-label">رسوم التوصيل (ج.م)</label><input className="input" type="number" dir="ltr" min="0" value={fee} onChange={e => setFee(e.target.value)} autoFocus /></div>
      <div className="form-field"><label className="form-label">ملاحظة للعميل (اختياري)</label><input className="input" value={note} onChange={e => setNote(e.target.value)} /></div>
      <div className="summary-card" style={{ padding: 16 }}>
        <div className="flex-between"><span>المجموع الفرعي</span><strong>{fmtMoney(subtotal)}</strong></div>
        <div className="flex-between grand"><span>الإجمالي النهائي</span><strong>{fmtMoney(subtotal + (Number(fee) || 0))}</strong></div>
      </div>
      <button className="btn btn-primary btn-block" onClick={() => { window.__feeData = { shippingFee: fee, note }; onDone(); }}>✅ قبول الطلب وإرسال الإشعار</button>
    </div>
  );
}

function RejectMini({ onReject }) {
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  return (
    <div className="form">
      <div className="form-field"><label className="form-label">سبب الرفض (هيوصل للعميل)</label><textarea className="textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="مثال: المنتج غير متوفر حالياً" /></div>
      {err && <div className="error-text">{err}</div>}
      <button className="btn btn-danger btn-block" onClick={() => { if (!reason.trim()) { setErr('اكتب سبب الرفض'); return; } onReject(reason); }}>❌ تأكيد الرفض</button>
    </div>
  );
}

// ===== معالجة ?openOrder= من رابط الإشعار =====
function OpenOrderHandler() {
  const { setOpenOrderId, fsReady } = useApp();
  const { params } = useRouter();
  useEffect(() => {
    if (!fsReady) return;
    const oid = params.openOrder;
    if (oid) setOpenOrderId(oid);
  }, [fsReady, params, setOpenOrderId]);
  return null;
}

function Shell() {
  const { currentUser, isOwner } = useApp();
  const { path, navigate } = useRouter();

  // التحويلات التلقائية (المالك للداشبورد، العميل للرئيسية)
  useEffect(() => {
    if (isOwner && (path === 'home' || path === 'landing' || path === '' || path === 'login' || path === 'register')) {
      navigate('dashboard');
    } else if (currentUser && !isOwner && (path === 'landing' || path === 'login' || path === 'register')) {
      navigate('home');
    }
  }, [currentUser, isOwner, path, navigate]);

  // حماية الصفحات
  const PUBLIC_PATHS = ['products', 'offers', 'branches', 'cart'];
  if (path === 'landing') {
    return <><Landing /><ThemeFab /><ImageZoom /><Toast /></>;
  }
  if (path === 'login' || path === 'register') {
    return (
      <>
        <Header />
        <main className="page container" style={{ paddingBottom: 60 }}>
          {path === 'login' ? <Login /> : <Register />}
        </main>
        <Footer />
        <Toast />
      </>
    );
  }
  if (!currentUser && !PUBLIC_PATHS.includes(path)) {
    return <><Landing /><Toast /></>;
  }
  if (isOwner && path !== 'dashboard') {
    return <><Landing /><Toast /></>; // المالك عمره ما يروح لصفحات العميل
  }
  if (!isOwner && path === 'dashboard') {
    return <><Landing /><Toast /></>;
  }

  const page = (() => {
    switch (path) {
      case 'home': return <Home />;
      case 'products': return <Products />;
      case 'offers': return <OffersPage />;
      case 'cart': return <Cart />;
      case 'checkout': return <Checkout />;
      case 'orders': return <Orders />;
      case 'addresses': return <Addresses />;
      case 'notifications': return <NotificationsPage />;
      case 'account': return <Account />;
      case 'branches': return <Branches />;
      case 'dashboard': return <Dashboard />;
      default: return <Home />;
    }
  })();

  const isDash = path === 'dashboard';

  return (
    <>
      <Ticker />
      <Header />
      <main className={`container page ${isDash ? '' : ''}`} style={isDash ? { maxWidth: 1280, paddingTop: 24, paddingBottom: 40 } : { paddingTop: 24 }}>
        {page}
      </main>
      {!isDash && <Footer />}
      {!isDash && <MobileNav />}
      <Sidebar />
      <ThemeFab />
      <Toast />
      <CartSnackbar />
      <NotifPrompt />
      <ImageZoom />
      <OrderDetailsModal />
      <OpenOrderHandler />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RouterProvider>
        <Shell />
      </RouterProvider>
    </AppProvider>
  );
}
