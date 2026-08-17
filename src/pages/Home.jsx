import React, { useMemo } from 'react';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ProductImg } from '../components/Shared.jsx';
import { Icon } from '../components/icons.jsx';
import { tr } from '../i18n.js';
import { getProductGradient } from '../data.js';

export default function Home() {
  const { lang, currentUser, products, customCategories, categoryImages, orders, notifyRequests } = useApp();
  const { navigate } = useRouter();

  // ===== الأكثر طلباً هذا الأسبوع (من بداية الأسبوع) =====
  const topThisWeek = useMemo(() => {
    const start = new Date();
    const day = (start.getDay() + 6) % 7; // الاثنين = 0
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const counts = {};
    orders.forEach(o => {
      const t = new Date(o.createdAt || 0).getTime();
      if (t >= start.getTime() && Array.isArray(o.items)) {
        o.items.forEach(it => { counts[String(it.id)] = (counts[String(it.id)] || 0) + (it.quantity || 1); });
      }
    });
    return products
      .map(p => ({ p, n: counts[String(p.id)] || 0 }))
      .filter(x => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 4)
      .map(x => x.p);
  }, [orders, products]);

  const cats = [
    { id: 'eyes', label: 'عيون', en: 'Eyes' },
    { id: 'skincare', label: 'العناية بالبشرة', en: 'Skincare' },
    { id: 'lipstick', label: 'روج', en: 'Lips' },
    { id: 'nails', label: 'أظافر', en: 'Nails' },
    { id: 'blusher', label: 'بلاشر', en: 'Blusher' },
    ...customCategories.map(c => ({ id: c.id, label: c.label, en: c.labelEn || c.label }))
  ];

  const featured = products.filter(p => p && p.image).slice(0, 4);

  return (
    <div>
      {/* ترحيب */}
      <section className="section" style={{ paddingTop: 36 }}>
        <div className="container">
          <div className="home-hero">
            <h2>{lang === 'en' ? `Welcome, ${currentUser?.name || ''} ✨` : `أهلاً ${currentUser?.name || ''} ✨`}</h2>
            <p>{tr(lang, 'tagline')} — {lang === 'en' ? 'curated makeup & skincare for your natural radiance' : 'مكياج وعناية منتقاة لإبراز إشراقتك الطبيعية'}</p>
            <button className="btn btn-primary" style={{ marginTop: 22 }} onClick={() => navigate('products')}>{tr(lang, 'browseProducts')}</button>
          </div>
        </div>
      </section>

      {/* التصنيفات */}
      <section className="section" style={{ background: 'var(--surface-3)' }}>
        <div className="container">
          <div className="section-head-left">
            <div>
              <h2 className="section-title" style={{ fontSize: 'clamp(24px,3.5vw,32px)' }}>{tr(lang, 'curatedCategories')}</h2>
              <p className="section-sub">{lang === 'en' ? 'Explore our specialised collections' : 'استكشفي مجموعاتنا المتخصصة'}</p>
            </div>
            <a className="view-all-link" href="#/products">{tr(lang, 'viewAll')} <Icon.ArrowLeft /></a>
          </div>
          <div className="cats-grid">
            {cats.map((c, i) => {
              const img = categoryImages[c.id];
              return (
                <div className="cat-card" key={c.id} onClick={() => navigate('products')}>
                  {img ? <ProductImg src={img} alt={c.label} /> : <div style={{ width: '100%', height: '100%', background: getProductGradient(c.id) }} />}
                  <div className="overlay">
                    <span className="cat-name">{c.en}</span>
                    <span className="cat-ar">{c.label}</span>
                  </div>
                  {i === 0 && <span className="new-badge">Top</span>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* الأكثر طلباً هذا الأسبوع */}
      {topThisWeek.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">🔥 {lang === 'en' ? 'Most Ordered This Week' : 'الأكثر طلباً هذا الأسبوع'}</h2>
              <div className="accent-line" />
            </div>
            <div className="week-grid">
              {topThisWeek.map(p => <ProductCard key={p.id} product={p} notifyRequested={notifyRequests.some(r => String(r.productId) === String(p.id) && currentUser && r.userEmail === currentUser.email)} />)}
            </div>
          </div>
        </section>
      )}

      {/* مجموعة مميزة */}
      {featured.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">{tr(lang, 'signatureCollection')}</h2>
              <div className="accent-line" />
            </div>
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p.id} product={p} notifyRequested={notifyRequests.some(r => String(r.productId) === String(p.id) && currentUser && r.userEmail === currentUser.email)} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
