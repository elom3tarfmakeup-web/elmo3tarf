import React from 'react';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import { Icon } from './icons.jsx';
import Logo from './Logo.jsx';
import { tr } from '../i18n.js';

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, currentUser, isOwner, lang, setLang, theme, setTheme, logout, cart } = useApp();
  const { path, navigate } = useRouter();
  if (!sidebarOpen) return null;

  const cartCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);

  const items = [
    { id: 'home', label: tr(lang, 'home'), icon: 'Home' },
    { id: 'products', label: tr(lang, 'products'), icon: 'Grid' },
    { id: 'offers', label: tr(lang, 'offers'), icon: 'Gift' },
    { id: 'branches', label: tr(lang, 'branches'), icon: 'MapPin' },
    { id: 'orders', label: tr(lang, 'myOrders'), icon: 'Package' },
    { id: 'addresses', label: tr(lang, 'myAddresses'), icon: 'MapPin' },
    { id: 'notifications', label: tr(lang, 'notifications'), icon: 'Bell' },
    { id: 'account', label: tr(lang, 'account'), icon: 'User' }
  ];
  if (isOwner) items.unshift({ id: 'dashboard', label: tr(lang, 'dashboard'), icon: 'Settings' });

  const go = (p) => { navigate(p); setSidebarOpen(false); };

  return (
    <>
      <div className="drawer-backdrop" onClick={() => setSidebarOpen(false)} />
      <div className="drawer">
        <div className="drawer-header">
          <Logo size={34} sm />
          <button className="modal-close" onClick={() => setSidebarOpen(false)}><Icon.Close /></button>
        </div>
        <div className="drawer-body">
          {currentUser && (
            <div className="dash-card" style={{ padding: 16, marginBottom: 10 }}>
              <div className="flex gap-12">
                <span className="avatar" style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>
                  {(currentUser.name || '؟').charAt(0)}
                </span>
                <div>
                  <div style={{ fontWeight: 700 }}>{currentUser.name}</div>
                  <div className="text-muted" style={{ fontSize: 12.5 }}>{currentUser.email}</div>
                </div>
              </div>
            </div>
          )}

          {items.map(it => (
            <button key={it.id} className={`drawer-link ${path === it.id ? 'active' : ''}`} onClick={() => go(it.id)}>
              <span className="dl-icon">{React.createElement(Icon[it.icon] || Icon.Sparkle)}</span>
              {it.label}
              {it.id === 'cart' && cartCount > 0 && <span className="badge" style={{ marginInlineStart: 'auto' }}>{cartCount}</span>}
            </button>
          ))}

          <div className="drawer-section">{tr(lang, 'settings')}</div>
          <div className="toggle-row">
            <span className="flex gap-8"><Icon.Moon /> {tr(lang, 'darkMode')}</span>
            <button className={`switch ${theme === 'dark' ? 'on' : ''}`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="الوضع الليلي" />
          </div>
          <div className="toggle-row">
            <span className="flex gap-8"><Icon.Globe /> {tr(lang, 'language')}</span>
            <button
              className={`switch ${lang === 'en' ? 'on' : ''}`}
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              aria-label="تغيير اللغة"
            />
          </div>
          <div className="toggle-row text-muted" style={{ fontSize: 12.5 }}>
            {lang === 'ar' ? 'العربية — English متاح' : 'English — العربية available'}
          </div>

          {currentUser && (
            <button className="drawer-link" style={{ color: 'var(--error)' }} onClick={() => { logout(); setSidebarOpen(false); go('landing'); }}>
              <span className="dl-icon"><Icon.Logout /></span> {tr(lang, 'logout')}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
