import React, { useState } from 'react';
import { useApp } from '../store.jsx';
import { ProductImg } from './Shared.jsx';
import { Icon } from './icons.jsx';
import { fmtMoney } from '../data.js';

export default function ProductCard({ product, notifyRequested }) {
  const { addToCart, notifyMe, setImageZoom, currentUser, lang } = useApp();
  const [justAdded, setJustAdded] = useState(false);
  if (!product) return null;

  const stock = product.stock;
  const out = stock !== undefined && Number(stock) <= 0;
  const discountPct = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const isNew = product.createdAt && (Date.now() - product.createdAt) < 7 * 24 * 3600 * 1000;

  const name = lang === 'en' ? (product.nameEn || product.nameAr) : (product.nameAr || product.nameEn);

  return (
    <div className="product-card">
      <div className="product-img-wrap" onClick={() => setImageZoom(product.image || '')}>
        <ProductImg src={product.image} alt={name} />
        {discountPct > 0 && <span className="discount-badge">-{discountPct}%</span>}
        {isNew && <span className="new-badge">New</span>}
        {out && <span className="stock-badge no">غير متوفر</span>}
        {!out && stock !== undefined && stock > 0 && <span className="stock-badge ok">متوفر ({stock})</span>}
      </div>
      <div className="product-info">
        <div className="product-cat">{product.category || ''}</div>
        <div className="product-name">{name}</div>
        {lang === 'en' && product.nameAr && <div className="product-name-en">{product.nameAr}</div>}
        {lang === 'ar' && product.nameEn && <div className="product-name-en">{product.nameEn}</div>}
        <div className="price-row">
          <span className="price">{fmtMoney(product.price)}</span>
          {product.oldPrice && <span className="old-price">{fmtMoney(product.oldPrice)}</span>}
        </div>
        {out ? (
          <button
            className={`add-btn notify ${notifyRequested ? 'notified' : ''}`}
            onClick={() => {
              if (!currentUser) { notifyMe(product.id); return; }
              notifyMe(product.id);
            }}
          >
            <Icon.Bell /> {notifyRequested ? '🔔 هنبلغك عند توفره' : 'بلغني عند توفره'}
          </button>
        ) : (
          <button
            className={`add-btn ${justAdded ? 'added' : ''}`}
            onClick={() => { addToCart(product.id); setJustAdded(true); setTimeout(() => setJustAdded(false), 1500); }}
          >
            <Icon.Cart /> {justAdded ? '✓ تمت الإضافة' : 'إضافة للسلة'}
          </button>
        )}
      </div>
    </div>
  );
}
