import React, { useState } from 'react';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import { Icon } from '../components/icons.jsx';
import { ProductImg, EmptyState } from '../components/Shared.jsx';
import { fmtMoney } from '../data.js';
import { tr } from '../i18n.js';

export default function Cart() {
  const { cart, updateCartQty, removeFromCart, applyPromoCode, removePromo, appliedPromo, lang, clearCart, currentUser } = useApp();
  const { navigate } = useRouter();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');

  const subtotal = cart.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 1), 0);
  const discount = appliedPromo ? appliedPromo.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  if (!cart.length) {
    return (
      <EmptyState
        icon="🛍️"
        title={tr(lang, 'emptyCart')}
        sub={tr(lang, 'emptyCartHint')}
        action={<button className="btn btn-primary" onClick={() => navigate('products')}>{tr(lang, 'shopNow')}</button>}
      />
    );
  }

  const apply = () => {
    const res = applyPromoCode(code);
    if (!res.ok) { setErr(res.error); } else { setErr(''); setCode(''); }
  };

  return (
    <div className="cart-page">
      <div>
        <h1 className="page-title">{tr(lang, 'cart')}</h1>
        <div className="cart-items">
          {cart.map(i => (
            <div className="cart-item" key={String(i.id)}>
              <ProductImg src={i.image} alt={i.nameAr || i.nameEn} />
              <div>
                <div className="ci-name">{lang === 'en' ? (i.nameEn || i.nameAr) : (i.nameAr || i.nameEn)}</div>
                <div className="ci-price">{fmtMoney(i.price)}</div>
                <div className="qty-row">
                  <button className="qty-btn" onClick={() => updateCartQty(i.id, -1)}><Icon.Minus /></button>
                  <span style={{ fontWeight: 700, minWidth: 22, textAlign: 'center' }}>{i.quantity}</span>
                  <button className="qty-btn" onClick={() => updateCartQty(i.id, 1)}><Icon.Plus /></button>
                </div>
              </div>
              <button className="ci-remove" onClick={() => removeFromCart(i.id)} aria-label="حذف"><Icon.Trash /></button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="summary-card">
          <h3 style={{ marginBottom: 14 }}>{lang === 'en' ? 'Order Summary' : 'ملخص الطلب'}</h3>

          <div className="promo-input">
            <input placeholder="🎟️ كود الخصم (اختياري)" value={code} onChange={e => setCode(e.target.value)} />
            <button className="btn btn-secondary btn-sm" onClick={apply}>{lang === 'en' ? 'Apply' : 'تطبيق'}</button>
          </div>
          {err && <div className="error-text" style={{ marginBottom: 10 }}>{err}</div>}
          {appliedPromo && (
            <div className="promo-input" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontWeight: 700, color: 'var(--success)', flex: 1 }}>🎟️ {appliedPromo.code} — -{appliedPromo.discountPct}%</span>
              <button onClick={() => removePromo()} style={{ color: 'var(--error)' }}>✕</button>
            </div>
          )}

          <div className="summary-row"><span>{tr(lang, 'subtotal')}</span><span>{fmtMoney(subtotal)}</span></div>
          {discount > 0 && <div className="summary-row discount-row"><span>خصم</span><span>-{fmtMoney(discount)}</span></div>}
          <div className="summary-row"><span>{tr(lang, 'shipping')}</span><span className="text-muted">{tr(lang, 'shippingLater')}</span></div>
          <div className="summary-row total"><span>{tr(lang, 'total')}</span><span>{fmtMoney(total)}</span></div>

          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={() => navigate(currentUser ? 'checkout' : 'login')}>{tr(lang, 'checkout')}</button>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={() => navigate('products')}>{tr(lang, 'continueShopping')}</button>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 4, color: 'var(--error)' }} onClick={() => { clearCart(); }}>🗑️ {lang === 'en' ? 'Clear cart' : 'مسح السلة'}</button>
        </div>
      </div>
    </div>
  );
}
