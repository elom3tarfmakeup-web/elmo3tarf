import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ProductImg } from '../components/Shared.jsx';
import { Icon } from '../components/icons.jsx';
import { tr } from '../i18n.js';
import { getProductGradient } from '../data.js';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const { lang, products, customCategories, categoryImages, notifyRequests, currentUser } = useApp();
  const { navigate } = useRouter();
  const root = useRef(null);

  const cats = [
    { id: 'eyes', labelEn: 'Eyes', labelAr: 'عيون' },
    { id: 'skincare', labelEn: 'Skincare', labelAr: 'العناية بالبشرة' },
    { id: 'lipstick', labelEn: 'Lips', labelAr: 'روج' },
    ...customCategories.map(c => ({ id: c.id, labelEn: c.labelEn || c.label, labelAr: c.label }))
  ].slice(0, 4);

  const featured = products.filter(p => p && p.image).slice(0, 3);
  const goProducts = () => navigate('products');

  // ===== أنيميشن GSAP =====
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.landing-hero .hero-copy > *', { y: 40, opacity: 0, duration: 0.9, stagger: 0.14, ease: 'power3.out', delay: 0.2 });
      gsap.from('.hero-visual', { opacity: 0, scale: 0.85, duration: 1.4, ease: 'power3.out', delay: 0.5 });
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, {
          y: 50, opacity: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root}>
      {/* ===== هيدر اللاندنج (وضع الزائر) ===== */}
      <Header />

      {/* ===== الهيرو ===== */}
      <section className="landing-hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title">
              {lang === 'en' ? 'Elmo3tarf' : 'Elmo3tarf'}<br />
              <em>{tr(lang, 'tagline')}</em>
            </h1>
            <p className="hero-sub">
              {lang === 'en'
                ? 'Premium makeup and skincare, curated for your natural radiance. Discover the signature collection that celebrates your unique beauty.'
                : 'مستحضرات مكياج وعناية فاخرة، منتقاة بعناية لإبراز إشراقتك الطبيعية. اكتشفي مجموعتنا المميزة التي تحتفل بجمالك الفريد.'}
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={goProducts}>{tr(lang, 'browseProducts')}</button>
              <button className="btn btn-secondary" onClick={() => navigate('login')}>{tr(lang, 'login')}</button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== التصنيفات ===== */}
      <section className="section" style={{ background: 'var(--surface-3)' }}>
        <div className="container">
          <div className="section-head-left reveal">
            <div>
              <h2 className="section-title" style={{ fontSize: 'clamp(24px,3.5vw,34px)' }}>{tr(lang, 'curatedCategories')}</h2>
              <p className="section-sub">{lang === 'en' ? 'Explore our specialised collections' : 'استكشفي مجموعاتنا المتخصصة'}</p>
            </div>
            <a className="view-all-link" href="#/products">{tr(lang, 'viewAll')} <Icon.ArrowLeft /></a>
          </div>
          <div className="cats-grid reveal">
            {cats.map((c, i) => {
              const img = categoryImages[c.id];
              return (
                <div className="cat-card" key={c.id} onClick={goProducts}>
                  {img ? <ProductImg src={img} alt={c.labelAr} /> : <div style={{ width: '100%', height: '100%', background: getProductGradient(c.id) }} />}
                  <div className="overlay">
                    <span className="cat-name">{c.labelEn}</span>
                    <span className="cat-ar">{c.labelAr}</span>
                  </div>
                  {i === 0 && <span className="new-badge">Top</span>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== المجموعة المميزة ===== */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <h2 className="section-title">{tr(lang, 'signatureCollection')}</h2>
            <div className="accent-line" />
          </div>
          {featured.length ? (
            <div className="products-grid reveal">
              {featured.map(p => <ProductCard key={p.id} product={p} notifyRequested={notifyRequests.some(r => String(r.productId) === String(p.id) && currentUser && r.userEmail === currentUser.email)} />)}
            </div>
          ) : (
            <p className="text-muted" style={{ textAlign: 'center' }}>{lang === 'en' ? 'Products coming soon' : 'المنتجات قريباً'}</p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
