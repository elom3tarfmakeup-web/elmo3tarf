import React, { useMemo, useState } from 'react';
import { useApp } from '../../store.jsx';
import { Modal, EmptyState, ProductImg, FileUpload } from '../../components/Shared.jsx';
import { Icon } from '../../components/icons.jsx';
import { fmtMoney, uid } from '../../data.js';
import { STATUS_META } from '../Orders.jsx';

export default function Dashboard() {
  const [tab, setTab] = useState('overview');
  const tabs = [
    { id: 'overview', label: '📊 نظرة عامة' },
    { id: 'orders', label: '📋 الطلبات' },
    { id: 'customers', label: '👥 العملاء' },
    { id: 'products', label: '📦 المنتجات' },
    { id: 'categories', label: '🏷️ التصنيفات' },
    { id: 'offers', label: '🎉 العروض' },
    { id: 'promos', label: '🎟️ الرموز الترويجية' },
    { id: 'banners', label: '📢 الإعلانات' },
    { id: 'settings', label: '⚙️ الإعدادات' }
  ];

  return (
    <div className="dash">
      <nav className="dash-nav">
        {tabs.map(t => (
          <button key={t.id} className={`dash-nav-item ${tab === t.id ? 'active-dash-nav' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </nav>
      <div>
        {tab === 'overview' && <Overview go={setTab} />}
        {tab === 'orders' && <OrdersAdmin />}
        {tab === 'customers' && <Customers />}
        {tab === 'products' && <ProductsAdmin />}
        {tab === 'categories' && <CategoriesAdmin />}
        {tab === 'offers' && <OffersAdmin />}
        {tab === 'promos' && <PromosAdmin />}
        {tab === 'banners' && <BannersAdmin />}
        {tab === 'settings' && <SettingsAdmin />}
      </div>
    </div>
  );
}

// ===== نظرة عامة =====
function Overview({ go }) {
  const { orders, products } = useApp();
  const customers = useMemo(() => {
    const m = {};
    orders.forEach(o => { if (o.customerEmail) m[o.customerEmail] = (m[o.customerEmail] || 0) + 1; });
    return Object.keys(m).length;
  }, [orders]);
  const pending = orders.filter(o => o.status === 'pending').length;
  const recent = orders.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
  const stats = [
    { icon: '📦', num: orders.length, label: 'إجمالي الطلبات' },
    { icon: '⏳', num: pending, label: 'طلبات معلقة' },
    { icon: '👥', num: customers, label: 'إجمالي العملاء' },
    { icon: '🛍️', num: products.length, label: 'إجمالي المنتجات' }
  ];
  return (
    <>
      <div className="stat-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <span className="st-icon">{s.icon}</span>
            <div className="st-num">{s.num}</div>
            <div className="st-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="dash-card">
        <div className="dash-card-header"><h3>آخر الطلبات</h3><button className="btn btn-secondary btn-sm" onClick={() => go('orders')}>عرض الكل</button></div>
        {recent.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recent.map(o => (
              <div key={String(o.id)} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div><strong style={{ color: 'var(--primary-deep)' }}>{o.id}</strong> <span className="text-muted" style={{ fontSize: 13 }}>— {o.customerName}</span></div>
                <span className={`status-badge ${(STATUS_META[o.status] || STATUS_META.pending).cls}`} style={{ fontSize: 11.5 }}>{(STATUS_META[o.status] || STATUS_META.pending).ar}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-muted">لا توجد طلبات بعد</p>}
      </div>
    </>
  );
}

// ===== الطلبات =====
function OrdersAdmin() {
  const { orders, acceptOrder, rejectOrder, markShipped } = useApp();
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [acceptModal, setAcceptModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);

  const list = orders
    .filter(o => filter === 'all' || o.status === filter)
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return (
    <>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3>إدارة الطلبات</h3>
          <div className="tabs-row" style={{ marginBottom: 0 }}>
            {[['all', 'الكل'], ['pending', 'معلق'], ['accepted', 'مقبول'], ['rejected', 'مرفوض'], ['shipped', 'تم الشحن']].map(([id, lb]) => (
              <button key={id} className={`tab-chip ${filter === id ? 'active' : ''}`} style={{ padding: '7px 14px', fontSize: 12.5 }} onClick={() => setFilter(id)}>{lb}</button>
            ))}
          </div>
        </div>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr><th>الطلب</th><th>العميل</th><th>الهاتف</th><th>العنوان</th><th>الإجمالي</th><th>الحالة</th><th></th></tr>
            </thead>
            <tbody>
              {list.map(o => (
                <tr key={String(o.id)}>
                  <td><strong style={{ color: 'var(--primary-deep)' }}>{o.id}</strong><br /><small className="text-muted">{new Date(o.createdAt || 0).toLocaleString('ar-EG')}</small></td>
                  <td>{o.customerName}<br /><small className="text-muted" dir="ltr">{o.customerEmail}</small></td>
                  <td dir="ltr">{o.customerPhone || '-'}</td>
                  <td><small>{o.governorate} — {o.region}<br />{o.address}</small></td>
                  <td><strong>{fmtMoney(o.total)}</strong></td>
                  <td><span className={`status-badge ${(STATUS_META[o.status] || STATUS_META.pending).cls}`} style={{ fontSize: 11.5 }}>{(STATUS_META[o.status] || STATUS_META.pending).ar}</span></td>
                  <td><button className="mini-btn primary" onClick={() => setDetail(o)}>التفاصيل</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && <p className="text-muted" style={{ padding: 16 }}>لا توجد طلبات</p>}
        </div>
      </div>

      {/* تفاصيل الطلب */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`تفاصيل الطلب ${detail ? detail.id : ''}`}>
        {detail && (
          <>
            <div className="dash-card" style={{ padding: 14 }}>
              <div className="flex-between"><span className="text-muted">العميل</span><strong>{detail.customerName} — <span dir="ltr">{detail.customerPhone}</span></strong></div>
              <div className="flex-between" style={{ marginTop: 6 }}><span className="text-muted">العنوان</span><strong>{detail.governorate} — {detail.region} — {detail.address}</strong></div>
              <div className="flex-between" style={{ marginTop: 6 }}><span className="text-muted">طريقة الدفع</span><strong>💰 الدفع عند الاستلام</strong></div>
              {detail.notes && <div className="flex-between" style={{ marginTop: 6 }}><span className="text-muted">ملاحظات</span><strong>{detail.notes}</strong></div>}
              {detail.promoCode && <div className="flex-between" style={{ marginTop: 6 }}><span className="text-muted">كود الخصم</span><strong>🎟️ {detail.promoCode}</strong></div>}
            </div>
            <h4 style={{ margin: '14px 0 10px' }}>المنتجات</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {detail.items && detail.items.map(it => (
                <div key={String(it.id)} className="order-item">
                  <ProductImg src={it.image} alt="" />
                  <span style={{ flex: 1 }}>{it.nameAr || it.nameEn} × {it.quantity}</span>
                  <strong>{fmtMoney((Number(it.price) || 0) * (it.quantity || 1))}</strong>
                </div>
              ))}
            </div>
            <div className="order-totals">
              <div className="flex-between"><span>المجموع الفرعي</span><span>{fmtMoney((Number(detail.subtotal) || 0) - (Number(detail.discount) || 0))}</span></div>
              {Number(detail.shipping) > 0 && <div className="flex-between"><span>رسوم التوصيل</span><span>{fmtMoney(detail.shipping)}</span></div>}
              <div className="flex-between grand"><span>الإجمالي</span><span>{fmtMoney(detail.total)}</span></div>
            </div>
            {detail.rejectReason && <div className="reject-reason">❌ سبب الرفض: {detail.rejectReason}</div>}
            {detail.ownerNote && detail.status === 'accepted' && <div className="reject-reason" style={{ background: 'rgba(22,163,74,0.07)', color: 'var(--success)' }}>📝 {detail.ownerNote}</div>}
          </>
        )}
      </Modal>

      {/* قبول الطلب */}
      <Modal open={!!acceptModal} onClose={() => setAcceptModal(null)} title={`قبول الطلب ${acceptModal ? acceptModal.id : ''}`}>
        <FeeForm order={acceptModal} onSave={(fee, note) => { acceptOrder(acceptModal.id, { shippingFee: fee, note }); setAcceptModal(null); }} onCancel={() => setAcceptModal(null)} />
      </Modal>

      {/* رفض الطلب */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title={`رفض الطلب ${rejectModal ? rejectModal.id : ''}`}>
        <RejectForm order={rejectModal} onSave={(reason) => { rejectOrder(rejectModal.id, reason); setRejectModal(null); }} onCancel={() => setRejectModal(null)} />
      </Modal>

      {/* أزرار القبول/الرفض/الشحن - تظهر تحت التفاصيل */}
      {detail && detail.status === 'pending' && (
        <div className="flex gap-12" style={{ marginTop: 14 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setAcceptModal(detail); setDetail(null); }}>قبول الطلب وتحديد رسوم التوصيل</button>
          <button className="btn btn-danger" onClick={() => { setRejectModal(detail); setDetail(null); }}>رفض الطلب</button>
        </div>
      )}
      {detail && detail.status === 'accepted' && (
        <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={() => { markShipped(detail.id); setDetail(null); }}>🚚 تم الشحن — أخطر العميل</button>
      )}
    </>
  );
}

function FeeForm({ order, onSave, onCancel }) {
  const [fee, setFee] = useState('');
  const [note, setNote] = useState('');
  const subtotal = (Number(order && order.subtotal) || 0) - (Number(order && order.discount) || 0);
  const total = subtotal + (Number(fee) || 0);
  return (
    <div className="form">
      <div className="form-field">
        <label className="form-label">رسوم التوصيل (ج.م)</label>
        <input className="input" type="number" dir="ltr" min="0" placeholder="مثال: 50" value={fee} onChange={e => setFee(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">ملاحظة للعميل (اختياري)</label>
        <input className="input" placeholder="مثال: هيوصلك خلال يومين" value={note} onChange={e => setNote(e.target.value)} />
      </div>
      <div className="summary-card" style={{ padding: 16 }}>
        <div className="flex-between"><span>المجموع الفرعي</span><strong>{fmtMoney(subtotal)}</strong></div>
        <div className="flex-between grand"><span>الإجمالي النهائي</span><strong>{fmtMoney(total)}</strong></div>
      </div>
      <div className="flex gap-12">
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>إلغاء</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSave(fee, note)}>✅ قبول الطلب</button>
      </div>
    </div>
  );
}

function RejectForm({ onSave, onCancel }) {
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  return (
    <div className="form">
      <div className="form-field">
        <label className="form-label">سبب الرفض (سيظهر للعميل)</label>
        <textarea className="textarea" placeholder="مثال: المنتج غير متوفر حالياً" value={reason} onChange={e => setReason(e.target.value)} />
      </div>
      {err && <div className="error-text">{err}</div>}
      <div className="flex gap-12">
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>إلغاء</button>
        <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { if (!reason.trim()) { setErr('اكتب سبب الرفض'); return; } onSave(reason); }}>❌ تأكيد الرفض</button>
      </div>
    </div>
  );
}

// ===== العملاء =====
function Customers() {
  const { orders } = useApp();
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const m = {};
    orders.forEach(o => {
      if (!o.customerEmail) return;
      const c = m[o.customerEmail] || { name: o.customerName, email: o.customerEmail, phone: o.customerPhone, count: 0, last: 0 };
      c.count += 1;
      c.last = Math.max(c.last, new Date(o.createdAt || 0).getTime());
      if (o.customerPhone) c.phone = o.customerPhone;
      m[o.customerEmail] = c;
    });
    return Object.values(m).sort((a, b) => b.last - a.last);
  }, [orders]);
  const filtered = list.filter(c => (c.name || '').includes(q) || (c.phone || '').includes(q) || (c.email || '').includes(q));

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>العملاء</h3>
        <div className="search-bar" style={{ marginBottom: 0, maxWidth: 300, padding: '10px 16px' }}>
          <Icon.Search />
          <input placeholder="ابحث عن عميل بالاسم أو الرقم..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead><tr><th>العميل</th><th>رقم الهاتف</th><th>البريد</th><th>عدد الطلبات</th><th>آخر طلب</th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.email}>
                <td><strong>{c.name || '-'}</strong></td>
                <td dir="ltr">{c.phone || '-'}</td>
                <td dir="ltr"><small>{c.email}</small></td>
                <td>{c.count}</td>
                <td>{c.last ? new Date(c.last).toLocaleDateString('ar-EG') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p className="text-muted" style={{ padding: 16 }}>لا يوجد عملاء</p>}
      </div>
    </div>
  );
}

// ===== المنتجات =====
function ProductsAdmin() {
  const { products, saveProduct, deleteProduct, saveCategory, customCategories } = useApp();
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);
  const [stockModal, setStockModal] = useState(null);
  const [img, setImg] = useState(null);
  const [err, setErr] = useState('');

  const list = products.filter(p => (p.nameAr || '').includes(q) || (p.nameEn || '').includes(q) || (p.category || '').includes(q));
  const cats = ['nails', 'blusher', 'lipstick', 'skincare', 'eyes', ...customCategories.map(c => c.id)];

  const openNew = () => { setModal({ nameAr: '', nameEn: '', price: '', oldPrice: '', category: 'lipstick', stock: '' }); setImg(null); setErr(''); };
  const openEdit = (p) => { setModal({ ...p, price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : '', stock: p.stock != null ? String(p.stock) : '' }); setImg(null); setErr(''); };

  const save = async () => {
    if (!modal.nameAr.trim() || !modal.price) { setErr('اكتب الاسم والسعر'); return; }
    const res = await saveProduct({ ...modal, image: modal.image }, img);
    if (!res.ok) { setErr(res.error); return; }
    setModal(null);
  };

  return (
    <>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3>إدارة المنتجات ({products.length})</h3>
          <div className="flex gap-12">
            <div className="search-bar" style={{ marginBottom: 0, maxWidth: 280, padding: '10px 16px' }}>
              <Icon.Search />
              <input placeholder="ابحث عن منتج..." value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={openNew}>+ إضافة منتج</button>
          </div>
        </div>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>المنتج</th><th>السعر</th><th>التصنيف</th><th>المخزون</th><th></th></tr></thead>
            <tbody>
              {list.map(p => (
                <tr key={String(p.id)}>
                  <td>
                    <div className="dash-product-row">
                      <ProductImg src={p.image} alt="" />
                      <div>
                        <strong>{p.nameAr}</strong>
                        {p.nameEn && <div><small className="text-muted">{p.nameEn}</small></div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{fmtMoney(p.price)}</strong>
                    {p.oldPrice && <div><small className="text-muted" style={{ textDecoration: 'line-through' }}>{fmtMoney(p.oldPrice)}</small></div>}
                  </td>
                  <td>{p.category || '-'}</td>
                  <td>{p.stock != null ? (Number(p.stock) > 0 ? `${p.stock} متوفر` : 'غير متوفر') : 'مفتوح'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-btn" onClick={() => openEdit(p)}>تعديل</button>
                      <button className="mini-btn" onClick={() => setStockModal(p)}>تغيير الكمية</button>
                      {p.oldPrice
                        ? <button className="mini-btn" onClick={() => saveProduct({ ...p, oldPrice: null, price: Number(p.oldPrice), image: p.image })}>إلغاء الخصم</button>
                        : <button className="mini-btn green" onClick={() => { const np = prompt(`خصم على "${p.nameAr}"\nأدخل السعر الجديد بعد الخصم:`); if (np) saveProduct({ ...p, oldPrice: p.price, price: Number(np), image: p.image }); }}>إضافة خصم</button>}
                      <button className="mini-btn red" onClick={() => { if (confirm(`حذف "${p.nameAr}"؟`)) deleteProduct(p.id); }}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && <p className="text-muted" style={{ padding: 16 }}>لا توجد منتجات</p>}
        </div>
      </div>

      {/* مودال إضافة/تعديل منتج */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal && modal.id ? 'تعديل منتج' : 'إضافة منتج جديد'} wide>
        {modal && (
          <div className="form">
            <div className="grid-2">
              <div className="form-field"><label className="form-label">الاسم بالعربية *</label><input className="input" value={modal.nameAr} onChange={e => setModal({ ...modal, nameAr: e.target.value })} /></div>
              <div className="form-field"><label className="form-label">الاسم بالإنجليزية</label><input className="input" dir="ltr" value={modal.nameEn} onChange={e => setModal({ ...modal, nameEn: e.target.value })} /></div>
            </div>
            <div className="grid-2">
              <div className="form-field"><label className="form-label">السعر (ج.م) *</label><input className="input" type="number" dir="ltr" value={modal.price} onChange={e => setModal({ ...modal, price: e.target.value })} /></div>
              <div className="form-field"><label className="form-label">السعر القديم (اختياري — للخصم)</label><input className="input" type="number" dir="ltr" value={modal.oldPrice || ''} onChange={e => setModal({ ...modal, oldPrice: e.target.value })} /></div>
            </div>
            <div className="grid-2">
              <div className="form-field">
                <label className="form-label">التصنيف</label>
                <select className="select" value={modal.category} onChange={e => setModal({ ...modal, category: e.target.value })}>
                  {cats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">الكمية في المخزن (اتركها فاضية = مفتوح)</label>
                <input className="input" type="number" dir="ltr" min="0" placeholder="0 = غير متوفر" value={modal.stock || ''} onChange={e => setModal({ ...modal, stock: e.target.value })} />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">صورة المنتج</label>
              <FileUpload label="اختيار صورة" preview={img ? URL.createObjectURL(img) : modal.image} onChange={setImg} />
            </div>
            {err && <div className="error-text">{err}</div>}
            <div className="flex gap-12">
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(null)}>إلغاء</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>حفظ</button>
            </div>
          </div>
        )}
      </Modal>

      {/* تغيير الكمية */}
      <Modal open={!!stockModal} onClose={() => setStockModal(null)} title={`تغيير كمية: ${stockModal ? stockModal.nameAr : ''}`}>
        {stockModal && (
          <StockForm p={stockModal} onSave={(stock) => { saveProduct({ ...stockModal, stock, image: stockModal.image }); setStockModal(null); }} onCancel={() => setStockModal(null)} />
        )}
      </Modal>
    </>
  );
}

function StockForm({ p, onSave, onCancel }) {
  const [stock, setStock] = useState(p.stock != null ? String(p.stock) : '');
  return (
    <div className="form">
      <div className="form-field">
        <label className="form-label">الكمية الحالية في المخزن (0 = غير متوفر)</label>
        <input className="input" type="number" dir="ltr" min="0" value={stock} onChange={e => setStock(e.target.value)} autoFocus />
      </div>
      <div className="flex gap-12">
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>إلغاء</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSave(stock === '' ? undefined : Number(stock))}>تنفيذ</button>
      </div>
    </div>
  );
}

// ===== التصنيفات =====
function CategoriesAdmin() {
  const { customCategories, categoryImages, saveCategory, deleteCategory } = useApp();
  const [modal, setModal] = useState(null);
  const [img, setImg] = useState(null);

  const openNew = () => setModal({ label: '', labelEn: '' });
  const openEdit = (c) => { setModal({ ...c, image: categoryImages[c.id] }); setImg(null); };

  return (
    <>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3>إدارة التصنيفات</h3>
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ إضافة تصنيف</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {['nails', 'blusher', 'lipstick', 'skincare', 'eyes', ...customCategories.map(c => c.id)].map(id => {
            const cat = customCategories.find(c => c.id === id);
            const label = cat ? cat.label : ({ nails: 'أظافر', blusher: 'بلاشر', lipstick: 'روج', skincare: 'العناية بالبشرة', eyes: 'عيون' })[id];
            const imgUrl = categoryImages[id];
            const isDefault = ['nails', 'blusher', 'lipstick', 'skincare', 'eyes'].includes(id);
            return (
              <div key={id} className="dash-card" style={{ padding: 14, marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {imgUrl
                  ? <img src={imgUrl} alt={label} style={{ height: 90, width: '100%', objectFit: 'cover', borderRadius: 10 }} />
                  : <div style={{ height: 90, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🏷️</div>}
                <strong>{label}{cat && cat.labelEn ? ` (${cat.labelEn})` : ''}</strong>
                <div className="row-actions">
                  <button className="mini-btn" onClick={() => openEdit({ id, label, labelEn: cat && cat.labelEn ? cat.labelEn : '' })}>تعديل</button>
                  {!isDefault && <button className="mini-btn red" onClick={() => { if (confirm(`حذف تصنيف "${label}"؟`)) deleteCategory(id); }}>حذف</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal && modal.id ? 'تعديل تصنيف' : 'إضافة تصنيف'}>
        {modal && (
          <div className="form">
            <div className="form-field"><label className="form-label">اسم التصنيف (عربي)</label><input className="input" value={modal.label} onChange={e => setModal({ ...modal, label: e.target.value })} /></div>
            <div className="form-field"><label className="form-label">الاسم بالإنجليزية</label><input className="input" dir="ltr" value={modal.labelEn || ''} onChange={e => setModal({ ...modal, labelEn: e.target.value })} /></div>
            <div className="form-field">
              <label className="form-label">صورة التصنيف (بتظهر في الرئيسية)</label>
              <FileUpload label="اختيار صورة" preview={img ? URL.createObjectURL(img) : modal.image} onChange={setImg} />
            </div>
            <div className="flex gap-12">
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(null)}>إلغاء</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={async () => { if (!modal.label.trim()) return; await saveCategory(modal, img); setModal(null); }}>حفظ</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// ===== العروض =====
function OffersAdmin() {
  const { offers, saveOffer, deleteOffer } = useApp();
  const [modal, setModal] = useState(null);
  const [img, setImg] = useState(null);
  const [err, setErr] = useState('');

  const openNew = () => { setModal({ name: '', description: '', price: '', discountPct: '', expiresAt: '' }); setImg(null); setErr(''); };
  const openEdit = (o) => { setModal({ ...o, price: String(o.price), discountPct: o.discountPct ? String(o.discountPct) : '', expiresAt: o.expiresAt || '' }); setImg(null); setErr(''); };

  return (
    <>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3>إدارة العروض ({offers.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ إضافة عرض</button>
        </div>
        {offers.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {offers.map(o => (
              <div key={String(o.id)} className="dash-card" style={{ padding: 14, marginBottom: 0 }}>
                <img src={o.image || 'https://res.cloudinary.com/w635mvns/image/upload/v1785542698/myi7pnercgigghiav7rq.png'} alt={o.name} style={{ height: 110, width: '100%', objectFit: 'cover', borderRadius: 10 }} />
                <strong style={{ display: 'block', marginTop: 8 }}>{o.name} {o.discountPct ? `(-${o.discountPct}%)` : ''}</strong>
                <small className="text-muted">{o.description}</small>
                <div style={{ fontWeight: 700, color: 'var(--primary-deep)', marginTop: 4 }}>{fmtMoney(o.price)}</div>
                <div className="row-actions" style={{ marginTop: 8 }}>
                  <button className="mini-btn" onClick={() => openEdit(o)}>تعديل</button>
                  <button className="mini-btn red" onClick={() => { if (confirm('حذف العرض؟')) deleteOffer(o.id); }}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-muted">لا توجد عروض</p>}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal && modal.id ? 'تعديل عرض' : 'إضافة عرض جديد'} wide>
        {modal && (
          <div className="form">
            <div className="form-field"><label className="form-label">اسم العرض</label><input className="input" value={modal.name} onChange={e => setModal({ ...modal, name: e.target.value })} /></div>
            <div className="form-field"><label className="form-label">وصف العرض</label><textarea className="textarea" placeholder="مثال: اشتري منتج كذا مع كذا وخد واحد هدية" value={modal.description} onChange={e => setModal({ ...modal, description: e.target.value })} /></div>
            <div className="grid-2">
              <div className="form-field"><label className="form-label">السعر (ج.م)</label><input className="input" type="number" dir="ltr" value={modal.price} onChange={e => setModal({ ...modal, price: e.target.value })} /></div>
              <div className="form-field"><label className="form-label">نسبة الخصم % (اختياري)</label><input className="input" type="number" dir="ltr" value={modal.discountPct || ''} onChange={e => setModal({ ...modal, discountPct: e.target.value })} /></div>
            </div>
            <div className="form-field"><label className="form-label">تاريخ انتهاء العرض (اختياري)</label><input className="input" type="date" dir="ltr" value={modal.expiresAt || ''} onChange={e => setModal({ ...modal, expiresAt: e.target.value })} /></div>
            <div className="form-field">
              <label className="form-label">صورة العرض</label>
              <FileUpload label="اختيار صورة" preview={img ? URL.createObjectURL(img) : modal.image} onChange={setImg} />
            </div>
            {err && <div className="error-text">{err}</div>}
            <div className="flex gap-12">
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(null)}>إلغاء</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={async () => { if (!modal.name.trim() || !modal.price) { setErr('اكتب الاسم والسعر'); return; } const r = await saveOffer(modal, img); if (!r.ok) { setErr(r.error); return; } setModal(null); }}>نشر العرض</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// ===== الرموز الترويجية =====
function PromosAdmin() {
  const { promos, savePromo, togglePromo, deletePromo } = useApp();
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState('');

  const openNew = () => setModal({ code: '', discountPct: '', maxUses: '', maxPerUser: '', expiresAt: '', announce: false });
  const openEdit = (p) => setModal({ ...p, discountPct: String(p.discountPct), maxUses: p.maxUses ? String(p.maxUses) : '', maxPerUser: p.maxPerUser ? String(p.maxPerUser) : '', expiresAt: p.expiresAt || '' });

  return (
    <>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3>الرموز الترويجية ({promos.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ إضافة كود خصم</button>
        </div>
        {promos.length ? (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead><tr><th>الكود</th><th>الخصم</th><th>الاستخدام</th><th>لكل عميل</th><th>الحالة</th><th></th></tr></thead>
              <tbody>
                {promos.map(p => (
                  <tr key={p.id}>
                    <td><strong style={{ color: 'var(--primary-deep)' }}>{p.code}</strong>{p.announce && ' 📣'}</td>
                    <td>{p.discountPct}%</td>
                    <td>{p.maxUses ? `${p.used || 0}/${p.maxUses}` : `${p.used || 0}`}</td>
                    <td>{p.maxPerUser ? `${p.maxPerUser} مرة` : 'بدون حد'}</td>
                    <td>{p.disabled ? <span className="status-badge status-rejected" style={{ fontSize: 11.5 }}>متوقف</span> : <span className="status-badge status-accepted" style={{ fontSize: 11.5 }}>مفعّل</span>}</td>
                    <td>
                      <div className="row-actions">
                        <button className="mini-btn" onClick={() => openEdit(p)}>تعديل</button>
                        <button className={`mini-btn ${p.disabled ? 'green' : ''}`} onClick={() => togglePromo(p.id)}>{p.disabled ? 'تفعيل' : 'إيقاف'}</button>
                        <button className="mini-btn red" onClick={() => { if (confirm('حذف الكود؟')) deletePromo(p.id); }}>حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-muted">لا توجد رموز ترويجية</p>}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal && modal.id ? 'تعديل كود' : 'إضافة كود خصم'}>
        {modal && (
          <div className="form">
            <div className="form-field"><label className="form-label">الكود *</label><input className="input" dir="ltr" placeholder="SAVE20" value={modal.code} onChange={e => setModal({ ...modal, code: e.target.value })} /></div>
            <div className="grid-2">
              <div className="form-field"><label className="form-label">نسبة الخصم % *</label><input className="input" type="number" dir="ltr" value={modal.discountPct} onChange={e => setModal({ ...modal, discountPct: e.target.value })} /></div>
              <div className="form-field"><label className="form-label">أقصى استخدام (0 = بدون حد)</label><input className="input" type="number" dir="ltr" value={modal.maxUses || ''} onChange={e => setModal({ ...modal, maxUses: e.target.value })} /></div>
            </div>
            <div className="grid-2">
              <div className="form-field"><label className="form-label">أقصى استخدام للعميل الواحد (0 = بدون حد)</label><input className="input" type="number" dir="ltr" value={modal.maxPerUser || ''} onChange={e => setModal({ ...modal, maxPerUser: e.target.value })} /></div>
              <div className="form-field"><label className="form-label">تاريخ الانتهاء (اختياري)</label><input className="input" type="date" dir="ltr" value={modal.expiresAt || ''} onChange={e => setModal({ ...modal, expiresAt: e.target.value })} /></div>
            </div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!modal.announce} onChange={e => setModal({ ...modal, announce: e.target.checked })} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
              أعلن عنه للعملاء (رسالة لكل العملاء)
            </label>
            {err && <div className="error-text">{err}</div>}
            <div className="flex gap-12">
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(null)}>إلغاء</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={async () => { const r = await savePromo(modal); if (!r.ok) { setErr(r.error); return; } setModal(null); }}>حفظ</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// ===== الإعلانات =====
function BannersAdmin() {
  const { banners, addBanner, deleteBanner } = useApp();
  const [text, setText] = useState('');
  return (
    <div className="dash-card">
      <h3>الإعلانات المتحركة (شريط فوق الموقع)</h3>
      <p className="text-muted" style={{ marginBottom: 16 }}>أول ما تنشر إعلان بيوصل إشعار لكل العملاء، وبيظهر في الشريط المتحرك فوق الموقع</p>
      <div className="flex gap-12" style={{ marginBottom: 20 }}>
        <input className="input" placeholder="مثال: خصم 20% على كل المنتجات!" value={text} onChange={e => setText(e.target.value)} />
        <button className="btn btn-primary" onClick={() => { addBanner(text); setText(''); }}>+ إضافة إعلان</button>
      </div>
      {banners.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {banners.map(b => (
            <div key={b.id} className="flex-between" style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 16px' }}>
              <span>📢 {b.text}</span>
              <button className="mini-btn red" onClick={() => deleteBanner(b.id)}>حذف</button>
            </div>
          ))}
        </div>
      ) : <p className="text-muted">لا توجد إعلانات</p>}
    </div>
  );
}

// ===== الإعدادات =====
function SettingsAdmin() {
  const { storeSettings, updateSettings, deleteBanner } = useApp();
  const s = storeSettings || {};
  const [form, setForm] = useState({
    slowOrderHours: String(s.slowOrderHours ?? 2),
    phone: s.phone || '',
    whatsappGroup: s.whatsappGroup || '',
    tiktok: s.tiktok || '',
    telegram: s.telegram || '',
    facebook: s.facebook || '',
    weekdays: (s.workHours || {}).weekdays || '10:00 ص - 10:00 م',
    friday: (s.workHours || {}).friday || '2:00 م - 10:00 م'
  });
  const [branchModal, setBranchModal] = useState(null);
  const [branches, setBranches] = useState(s.branches || []);

  const save = () => {
    updateSettings({
      slowOrderHours: Number(form.slowOrderHours) || 2,
      phone: form.phone,
      whatsappGroup: form.whatsappGroup,
      tiktok: form.tiktok,
      telegram: form.telegram,
      facebook: form.facebook,
      workHours: { weekdays: form.weekdays, friday: form.friday },
      branches
    });
  };

  const saveBranch = (b) => {
    if (b.id) setBranches(prev => prev.map(x => (x.id === b.id ? b : x)));
    else setBranches(prev => [...prev, { ...b, id: uid('branch_') }]);
    setBranchModal(null);
  };

  return (
    <>
      <div className="dash-card">
        <h3>⏰ تنبيه الطلبات المتأخرة</h3>
        <p className="text-muted" style={{ marginBottom: 14 }}>بعد كام ساعة بدون رد (قبول/رفض) توصلك رسالة إن الطلب متأخر؟</p>
        <div className="form-field" style={{ maxWidth: 220 }}>
          <input className="input" type="number" dir="ltr" min="1" value={form.slowOrderHours} onChange={e => setForm({ ...form, slowOrderHours: e.target.value })} />
        </div>
      </div>

      <div className="dash-card">
        <h3>📞 رقم التواصل</h3>
        <div className="form-field" style={{ maxWidth: 320 }}>
          <input className="input" dir="ltr" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>

      <div className="dash-card">
        <h3>🔗 لينكات المنصات (بتظهر في صفحة فروعنا)</h3>
        <div className="form" style={{ gap: 12 }}>
          {[['whatsappGroup', 'جروب واتساب'], ['tiktok', 'تيك توك'], ['telegram', 'تيليجرام'], ['facebook', 'فيسبوك']].map(([k, lb]) => (
            <div className="form-field" key={k}>
              <label className="form-label">{lb}</label>
              <input className="input" dir="ltr" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <h3>🕐 مواعيد العمل</h3>
        <div className="grid-2">
          <div className="form-field"><label className="form-label">السبت - الخميس</label><input className="input" value={form.weekdays} onChange={e => setForm({ ...form, weekdays: e.target.value })} /></div>
          <div className="form-field"><label className="form-label">الجمعة</label><input className="input" value={form.friday} onChange={e => setForm({ ...form, friday: e.target.value })} /></div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <h3>🏪 الفروع</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setBranchModal({ name: '', sub: '', address: '', mapUrl: '' })}>+ إضافة فرع</button>
        </div>
        {branches.map(b => (
          <div key={b.id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div><strong>{b.name}</strong><div className="text-muted" style={{ fontSize: 13 }}>{b.address}</div></div>
            <div className="row-actions">
              <button className="mini-btn" onClick={() => setBranchModal(b)}>تعديل</button>
              <button className="mini-btn red" onClick={() => setBranches(prev => prev.filter(x => x.id !== b.id))}>حذف</button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary btn-block" onClick={save}>💾 حفظ كل الإعدادات</button>
      <p className="text-muted" style={{ textAlign: 'center', marginTop: 10, fontSize: 12.5 }}>كل التغييرات بتتحفظ في قاعدة البيانات وبتظهر فوراً في الموقع</p>

      <Modal open={!!branchModal} onClose={() => setBranchModal(null)} title={branchModal && branchModal.id ? 'تعديل فرع' : 'إضافة فرع'}>
        {branchModal && (
          <BranchForm b={branchModal} onSave={saveBranch} onCancel={() => setBranchModal(null)} />
        )}
      </Modal>
    </>
  );
}

function BranchForm({ b, onSave, onCancel }) {
  const [f, setF] = useState(b);
  return (
    <div className="form">
      <div className="form-field"><label className="form-label">اسم الفرع</label><input className="input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
      <div className="form-field"><label className="form-label">وصف مختصر</label><input className="input" value={f.sub || ''} onChange={e => setF({ ...f, sub: e.target.value })} /></div>
      <div className="form-field"><label className="form-label">العنوان</label><input className="input" value={f.address || ''} onChange={e => setF({ ...f, address: e.target.value })} /></div>
      <div className="form-field"><label className="form-label">لينك خرائط جوجل</label><input className="input" dir="ltr" value={f.mapUrl || ''} onChange={e => setF({ ...f, mapUrl: e.target.value })} /></div>
      <div className="flex gap-12">
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>إلغاء</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSave(f)}>حفظ</button>
      </div>
    </div>
  );
}
