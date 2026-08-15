import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../store.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { Icon } from '../components/icons.jsx';
import { tr } from '../i18n.js';
import { fmtMoney } from '../data.js';

const PER_PAGE = 12;

export default function Products() {
  const { lang, products, customCategories, categoryImages, notifyRequests, currentUser } = useApp();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [tab, search]);

  const tabs = useMemo(() => {
    const base = [
      { id: 'all', label: tr(lang, 'all'), en: 'All' },
      { id: 'discounts', label: tr(lang, 'discounts'), en: 'Discounts' },
      { id: 'nails', label: 'أظافر', en: 'Nails' },
      { id: 'blusher', label: 'بلاشر', en: 'Blusher' },
      { id: 'lipstick', label: 'روج', en: 'Lipstick' },
      { id: 'skincare', label: 'العناية بالبشرة', en: 'Skincare' },
      { id: 'eyes', label: 'عيون', en: 'Eyes' }
    ];
    customCategories.forEach(c => {
      if (!base.find(b => b.id === c.id)) base.push({ id: c.id, label: c.label, en: c.labelEn || c.label });
    });
    return base;
  }, [customCategories, lang]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (tab === 'discounts') list = list.filter(p => p.oldPrice && Number(p.oldPrice) > Number(p.price));
    else if (tab !== 'all') list = list.filter(p => p.category === tab);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        (p.nameAr || '').toLowerCase().includes(q) ||
        (p.nameEn || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div>
      {/* التبويبات */}
      <div className="tabs-row">
        {tabs.map(t => (
          <button key={t.id} className={`tab-chip ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {lang === 'en' ? t.en : t.label}
          </button>
        ))}
      </div>

      {/* السيرش */}
      <div className="search-bar">
        <Icon.Search />
        <input
          placeholder={tr(lang, 'searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button onClick={() => setSearch('')} aria-label="مسح"><Icon.Close /></button>}
      </div>

      {/* الشبكة */}
      {pageItems.length ? (
        <>
          <div className="products-grid">
            {pageItems.map(p => (
              <ProductCard key={p.id} product={p} notifyRequested={notifyRequests.some(r => String(r.productId) === String(p.id) && currentUser && r.userEmail === currentUser.email)} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}><Icon.ChevronRight /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} className={`page-btn ${n === safePage ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}><Icon.ChevronLeft /></button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="es-icon">💄</div>
          <h3>{lang === 'en' ? 'No products found' : 'لا توجد منتجات'}</h3>
          <p>{lang === 'en' ? 'Try a different search or category' : 'جرّب بحثاً أو تصنيفاً مختلفاً'}</p>
        </div>
      )}
    </div>
  );
}

// ===== صفحة العروض =====
export function OffersPage() {
  const { lang, offers } = useApp();
  if (!offers.length) {
    return (
      <div className="empty-state">
        <div className="es-icon">🎉</div>
        <h3>{lang === 'en' ? 'No offers right now' : 'لا توجد عروض حالياً'}</h3>
        <p>{lang === 'en' ? 'Stay tuned for new offers soon!' : 'ترقبوا العروض الجديدة قريباً!'}</p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="page-title">{lang === 'en' ? 'Offers & Deals' : 'العروض والتخفيضات'}</h1>
      <p className="page-sub text-muted">{lang === 'en' ? 'Limited-time deals — grab them now' : 'عروض لفترة محدودة — الحق دلوقتي'}</p>
      <div className="products-grid">
        {offers.map(o => (
          <div key={o.id} className="product-card">
            <div className="product-img-wrap">
              <img src={o.image || 'https://res.cloudinary.com/w635mvns/image/upload/v1785542698/myi7pnercgigghiav7rq.png'} alt={o.name} loading="lazy" />
              {o.discountPct > 0 && <span className="discount-badge">-{o.discountPct}%</span>}
            </div>
            <div className="product-info">
              <div className="product-cat">🎉 {lang === 'en' ? 'Offer' : 'عرض'}</div>
              <div className="product-name">{o.name}</div>
              {o.description && <p className="product-name-en" style={{ marginTop: 4 }}>{o.description}</p>}
              <div className="price-row">
                <span className="price">{fmtMoney(o.price)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
