import React, { useMemo, useState } from 'react';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import { EGYPT_AREAS, fmtMoney, uid } from '../data.js';
import { tr } from '../i18n.js';
import { Icon } from '../components/icons.jsx';

export default function Checkout() {
  const { cart, savedAddresses, saveAddress, placeOrder, appliedPromo, lang, currentUser } = useApp();
  const { navigate } = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ governorate: '', region: '', address: '', phone: currentUser?.phone || '', notes: '', saveIt: false, addressName: '' });
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);

  const subtotal = cart.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 1), 0);
  const discount = appliedPromo ? appliedPromo.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  const regions = useMemo(() => (form.governorate ? EGYPT_AREAS[form.governorate] || [] : []), [form.governorate]);
  const myAddresses = savedAddresses.filter(a => a.userEmail === currentUser?.email);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (done) {
    return (
      <div className="empty-state" style={{ paddingTop: 80 }}>
        <div className="es-icon">🎉</div>
        <h3>{tr(lang, 'orderConfirmed')}</h3>
        <p>{tr(lang, 'orderConfirmedText')}</p>
        <p style={{ marginTop: 8, fontWeight: 700, color: 'var(--primary-deep)' }}>{done}</p>
        <button className="btn btn-primary" style={{ marginTop: 22 }} onClick={() => navigate('orders')}>{lang === 'en' ? 'View My Orders' : 'عرض طلباتي'}</button>
        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => navigate('products')}>{tr(lang, 'backToShopping')}</button>
      </div>
    );
  }

  const next = () => {
    if (!form.governorate) { setErr('اختر المحافظة'); return; }
    if (!form.region) { setErr('اختر المنطقة'); return; }
    if (!form.address.trim()) { setErr('اكتب تفاصيل العنوان'); return; }
    if (!form.phone.trim()) { setErr('اكتب رقم الهاتف للتواصل'); return; }
    setErr('');
    setStep(2);
  };

  const confirm = () => {
    const res = placeOrder(form);
    if (!res.ok) { setErr(res.error); return; }
    setDone(res.orderId);
  };

  return (
    <div className="cart-page">
      <div>
        <h1 className="page-title">{tr(lang, 'checkout')}</h1>
        <div className="steps">
          <div className={`step-dot ${step >= 1 ? 'done' : ''}`} />
          <div className={`step-dot ${step >= 2 ? 'done' : ''}`} />
        </div>

        {step === 1 && (
          <>
            {/* العناوين المحفوظة */}
            {myAddresses.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 className="page-sub" style={{ marginBottom: 12 }}>{lang === 'en' ? 'Saved Addresses' : 'العناوين المحفوظة'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {myAddresses.map(a => (
                    <button key={a.id} className="radio-card" onClick={() => setForm({ ...form, governorate: a.governorate, region: a.region, address: a.address, phone: a.phone || form.phone })}>
                      <span className="rc-icon">📍</span>
                      <span className="rc-label">{a.name || a.label || 'العنوان'}</span>
                      <span className="rc-sub">{a.governorate} — {a.region}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="dash-card">
              <h3>{lang === 'en' ? 'Shipping Address' : 'عنوان الشحن'}</h3>
              <div className="form">
                <div className="form-field">
                  <label className="form-label">المحافظة</label>
                  <select className="select" value={form.governorate} onChange={set('governorate')}>
                    <option value="">اختر المحافظة</option>
                    {Object.keys(EGYPT_AREAS).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">المنطقة</label>
                  <select className="select" value={form.region} onChange={set('region')} disabled={!form.governorate}>
                    <option value="">{form.governorate ? 'اختر المنطقة' : 'اختر المحافظة أولاً'}</option>
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">تفاصيل العنوان</label>
                  <input className="input" placeholder="شارع، مبنى، شقة، رقم الدور..." value={form.address} onChange={set('address')} />
                </div>
                <div className="form-field">
                  <label className="form-label">رقم الهاتف للتواصل</label>
                  <input className="input" dir="ltr" placeholder="01XXXXXXXXX" value={form.phone} onChange={set('phone')} />
                </div>
                <div className="form-field">
                  <label className="form-label">ملاحظات (اختياري)</label>
                  <textarea className="textarea" placeholder="أي ملاحظات إضافية للديليفري..." value={form.notes} onChange={set('notes')} />
                </div>
                <div className="form-field">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.saveIt} onChange={e => setForm({ ...form, saveIt: e.target.checked })} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
                    حفظ هذا العنوان
                  </label>
                  {form.saveIt && (
                    <input className="input" placeholder="مثال: المنزل، العمل..." value={form.addressName} onChange={set('addressName')} style={{ marginTop: 4 }} />
                  )}
                </div>
              </div>
            </div>
            {err && <div className="error-text" style={{ margin: '12px 0' }}>{err}</div>}
            <button className="btn btn-primary btn-block" onClick={next}>{tr(lang, 'next')}: {tr(lang, 'paymentMethod')}</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="dash-card">
              <h3>{tr(lang, 'paymentMethod')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="radio-card selected">
                  <input type="radio" name="pay" checked readOnly />
                  <span className="rc-icon">💰</span>
                  <span className="rc-label">{tr(lang, 'cashOnDelivery')}</span>
                  <span className="rc-sub">{tr(lang, 'available')}</span>
                </div>
                {[['🏦', tr(lang, 'instapay')], ['📱', tr(lang, 'vodafoneCash')], ['💳', tr(lang, 'visa')]].map(([ic, lb]) => (
                  <div className="radio-card" key={lb} style={{ opacity: 0.55 }}>
                    <input type="radio" name="pay" disabled />
                    <span className="rc-icon">{ic}</span>
                    <span className="rc-label">{lb}</span>
                    <span className="rc-sub">{tr(lang, 'notAvailable')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-card">
              <h3>{lang === 'en' ? 'Order Summary' : 'إجمالي الطلب'}</h3>
              <div className="summary-row"><span>{tr(lang, 'subtotal')}</span><span>{fmtMoney(subtotal)}</span></div>
              {discount > 0 && <div className="summary-row discount-row"><span>خصم</span><span>-{fmtMoney(discount)}</span></div>}
              <div className="summary-row"><span>{tr(lang, 'shipping')}</span><span className="text-muted">{tr(lang, 'shippingLater')}</span></div>
              <div className="summary-row total"><span>{tr(lang, 'total')}</span><span>{fmtMoney(total)}</span></div>
              <p className="text-muted" style={{ fontSize: 12.5, marginTop: 10 }}>
                🚚 {lang === 'en' ? 'Delivery takes 1 to 5 days' : 'التوصيل يستغرق من 1 إلى 5 أيام'}
              </p>
            </div>
            {err && <div className="error-text" style={{ margin: '12px 0' }}>{err}</div>}
            <div className="flex gap-12">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>{tr(lang, 'back')}</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirm}>{tr(lang, 'confirm')}</button>
            </div>
          </>
        )}
      </div>

      {/* ملخص جانبي */}
      <div>
        <div className="summary-card">
          <h3 style={{ marginBottom: 14 }}>{lang === 'en' ? 'Your Order' : 'ملخص الطلب'}</h3>
          {cart.map(i => (
            <div key={String(i.id)} className="order-item" style={{ padding: '6px 0' }}>
              <img src={i.image || 'https://res.cloudinary.com/w635mvns/image/upload/v1785542698/myi7pnercgigghiav7rq.png'} alt="" />
              <span style={{ flex: 1, fontSize: 13.5 }}>{lang === 'en' ? (i.nameEn || i.nameAr) : (i.nameAr || i.nameEn)} × {i.quantity}</span>
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>{fmtMoney((Number(i.price) || 0) * (i.quantity || 1))}</span>
            </div>
          ))}
          <div className="order-totals">
            <div className="flex-between"><span>{tr(lang, 'subtotal')}</span><span>{fmtMoney(subtotal)}</span></div>
            <div className="flex-between grand"><span>{tr(lang, 'total')}</span><span>{fmtMoney(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
