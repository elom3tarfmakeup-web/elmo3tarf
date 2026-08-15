import React from 'react';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import { Icon, IconBtn } from './icons.jsx';
import { tr } from '../i18n.js';

export default function Header() {
  const { currentUser, isOwner, cart, getFilteredNotifications, setSidebarOpen, lang } = useApp();
  const { path, navigate } = useRouter();

  const cartCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);
  const notifCount = getFilteredNotifications().filter(n => n.new).length;

  const links = [
    { id: 'home', label: tr(lang, 'home'), icon: 'Home' },
    { id: 'products', label: tr(lang, 'products'), icon: 'Grid' },
    { id: 'offers', label: tr(lang, 'offers'), icon: 'Gift' },
    { id: 'branches', label: tr(lang, 'branches'), icon: 'MapPin' }
  ];
  if (isOwner) links.push({ id: 'dashboard', label: tr(lang, 'dashboard'), icon: 'Settings' });

  const go = (p) => {
    if (p === 'notifications') navigate('notifications');
    else if (p === 'cart') navigate('cart');
    else if (p === 'account') navigate('account');
    else navigate(p);
    setSidebarOpen(false);
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <button className="logo" onClick={() => go(currentUser ? 'home' : 'landing')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <img className="logo-img" src="images/logo.png" alt="Elmo3tarf" />
          <span className="logo-text">
            Elmo3tarf
            <small>المعترف</small>
          </span>
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
          <IconBtn icon="Cart" badge={cartCount} label={tr(lang, 'cart')} onClick={() => go('cart')} />
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
