import React from 'react';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import { EmptyState } from '../components/Shared.jsx';
import { fmtMoney } from '../data.js';
import { tr } from '../i18n.js';

export const STATUS_META = {
  pending: { cls: 'status-pending', ar: '⏳ قيد الانتظار', en: '⏳ Pending' },
  accepted: { cls: 'status-accepted', ar: '✅ مقبول', en: '✅ Accepted' },
  rejected: { cls: 'status-rejected', ar: '❌ مرفوض', en: '❌ Rejected' },
  shipped: { cls: 'status-shipped', ar: '🚚 تم الشحن', en: '🚚 Shipped' }
};

export default function Orders() {
  const { orders, currentUser, lang } = useApp();
  const { navigate } = useRouter();
  const mine = orders
    .filter(o => o.customerEmail === currentUser?.email)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  if (!mine.length) {
    return (
      <EmptyState
        icon="📦"
        title={tr(lang, 'noOrders')}
        sub={tr(lang, 'noOrdersHint')}
        action={<button className="btn btn-primary" onClick={() => navigate('products')}>{tr(lang, 'shopNow')}</button>}
      />
    );
  }

  return (
    <div>
      <h1 className="page-title">{tr(lang, 'myOrders')}</h1>
      <p className="page-sub text-muted">🚚 {lang === 'en' ? 'Delivery takes 1 to 5 days' : 'التوصيل يستغرق من 1 إلى 5 أيام'}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mine.map(o => {
          const st = STATUS_META[o.status] || STATUS_META.pending;
          return (
            <div className="order-card" key={String(o.id)}>
              <div className="order-head">
                <div>
                  <span className="order-id">{o.id}</span>
                  <div className="order-time">{new Date(o.createdAt || Date.now()).toLocaleString('ar-EG')}</div>
                </div>
                <span className={`status-badge ${st.cls}`}>{lang === 'en' ? st.en : st.ar}</span>
              </div>
              <div className="order-items">
                {Array.isArray(o.items) && o.items.map(it => (
                  <div className="order-item" key={String(it.id)}>
                    <img src={it.image || 'https://res.cloudinary.com/w635mvns/image/upload/v1785542698/myi7pnercgigghiav7rq.png'} alt="" />
                    <span style={{ flex: 1 }}>{lang === 'en' ? (it.nameEn || it.nameAr) : (it.nameAr || it.nameEn)}</span>
                    <span className="text-muted">× {it.quantity}</span>
                    <span style={{ fontWeight: 600 }}>{fmtMoney((Number(it.price) || 0) * (it.quantity || 1))}</span>
                  </div>
                ))}
              </div>
              {o.rejectReason && <div className="reject-reason">❌ {lang === 'en' ? 'Reason' : 'سبب الرفض'}: {o.rejectReason}</div>}
              {o.ownerNote && o.status === 'accepted' && <div className="reject-reason" style={{ background: 'rgba(22,163,74,0.07)', color: 'var(--success)' }}>📝 {o.ownerNote}</div>}
              <div className="order-totals">
                <div className="flex-between"><span>{tr(lang, 'subtotal')}</span><span>{fmtMoney((Number(o.subtotal) || 0) - (Number(o.discount) || 0))}</span></div>
                {o.shipping > 0 && <div className="flex-between"><span>{tr(lang, 'shipping')}</span><span>{fmtMoney(o.shipping)}</span></div>}
                <div className="flex-between grand"><span>{tr(lang, 'total')}</span><span>{fmtMoney(o.total)}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
