import React from 'react';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import { Icon, IconBtn } from './icons.jsx';
import Logo from './Logo.jsx';
import { tr } from '../i18n.js';

export default function Header() {
  const { currentUser, isOwner, cart, getFilteredNotifications, setSidebarOpen, lang } = useApp();
  const { path, navigate } = useRouter();

  const cartCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);
  const notifCount = getFilteredNotifications().filter(n => n.new).length;

  const links = isOwner
    ? [{ id: 'dashboard', label: tr(lang, 'dashboard'), icon: 'Settings' }]
    : [
        { id: 'home', label: tr(lang, 'home'), icon: 'Home' },
        { id: 'products', label: tr(lang, 'products'), icon: 'Grid' },
        { id: 'offers', label: tr(lang, 'offers'), icon: 'Gift' },
        { id: 'branches', label: tr(lang, 'branches'), icon: 'MapPin' }
      ];

  const go = (p) => {
    if (p === 'notifications') navigate('notifications');
    else if (p === 'cart') navigate('cart');
    else if (p === 'account') navigate('account');
    else navigate(p);
    setSidebarOpen(false);
  };

  // ===== وضع الزائر (مش مسجل): نفس شكل اللاندنج مع كلمة تسجيل الدخول =====
  if (!currentUser) {
    return (
      <header className="header">
        <div className="container header-inner">
          <button className="logo" onClick={() => go('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Logo />
          </button>
          <nav className="nav-links">
            <button className={`nav-link ${path === 'products' ? 'active' : ''}`} onClick={() => go('products')}>{tr(lang, 'products')}</button>
            <button className={`nav-link ${path === 'offers' ? 'active' : ''}`} onClick={() => go('offers')}>{tr(lang, 'offers')}</button>
            <button className={`nav-link ${path === 'branches' ? 'active' : ''}`} onClick={() => go('branches')}>{tr(lang, 'branches')}</button>
            <button className="nav-link" onClick={() => go('branches')}>{tr(lang, 'contactUs')}</button>
          </nav>
          <div className="header-actions">
            <button className="btn btn-primary btn-sm" onClick={() => go('login')}>{tr(lang, 'login')}</button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <button className="logo" onClick={() => go(currentUser ? 'home' : 'landing')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Logo />
        </button>

        <nav className="nav-links">
          {links.map(l => (
            <button key={l.id} className={`nav-link ${path === l.id ? 'active' : ''}`} onClick={() => go(l.id)}>
              {l.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <IconBtn icon="Bell" badge={notifCount} label={tr(lang, 'notifications')} onClick={() => go('notifications')} />
          {!isOwner && <IconBtn icon="Cart" badge={cartCount} label={tr(lang, 'cart')} onClick={() => go('cart')} />}
          {currentUser && (
            <button className="user-chip" onClick={() => go('account')}>
              <span className="avatar">{(currentUser.name || '؟').charAt(0)}</span>
              <span>{currentUser.name}</span>
            </button>
          )}
          <IconBtn icon="Menu" label="القائمة" className="hamburger" onClick={() => setSidebarOpen(true)} />
        </div>
      </div>
    </header>
  );
}
