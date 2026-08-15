import React from 'react';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import { tr } from '../i18n.js';

export default function Footer() {
  const { lang, storeSettings } = useApp();
  const { navigate } = useRouter();
  const s = storeSettings || {};
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>{tr(lang, 'explore')}</h4>
            <ul>
              <li><a href="#/branches">{tr(lang, 'branches')}</a></li>
              <li><a href="#/products">{tr(lang, 'products')}</a></li>
              <li><a href="#/offers">{tr(lang, 'offers')}</a></li>
            </ul>
          </div>
          <div>
            <h4>{tr(lang, 'connect')}</h4>
            <ul>
              <li><a href={s.whatsappGroup || '#'} target="_blank" rel="noreferrer">{tr(lang, 'whatsappGroup')}</a></li>
              <li><a href={s.tiktok || '#'} target="_blank" rel="noreferrer">{tr(lang, 'tiktok')}</a></li>
              <li><a href={s.telegram || '#'} target="_blank" rel="noreferrer">{tr(lang, 'telegram')}</a></li>
              <li><a href={s.facebook || '#'} target="_blank" rel="noreferrer">{tr(lang, 'facebook')}</a></li>
            </ul>
          </div>
          <div className="footer-brand">
            <h3>Elmo3tarf - المعترف</h3>
            <p>وجهتك الأولى لمستحضرات التجميل الفاخرة والعناية الشخصية، دعنا نبرز جمالك الطبيعي.</p>
            <p style={{ marginTop: 8 }}>{s.phone || ''}</p>
          </div>
        </div>
        <hr className="footer-divider" />
        <div className="footer-bottom">
          {tr(lang, 'rightsReserved')} 2024 © Elmo3tarf - المعترف
        </div>
      </div>
    </footer>
  );
}
