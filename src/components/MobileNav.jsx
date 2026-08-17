import React from 'react';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import { Icon } from './icons.jsx';

export default function MobileNav() {
  const { cart, currentUser, isOwner, getFilteredNotifications } = useApp();
  const { path, navigate } = useRouter();
  const cartCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);
  const notifCount = getFilteredNotifications().filter(n => n.new).length;

  const items = isOwner
    ? [
        { id: 'dashboard', label: 'لوحة', icon: 'Settings' },
        { id: 'notifications', label: 'الإشعارات', icon: 'Bell', badge: notifCount }
      ]
    : currentUser
      ? [
          { id: 'home', label: 'الرئيسية', icon: 'Home' },
          { id: 'products', label: 'المنتجات', icon: 'Grid' },
          { id: 'cart', label: 'السلة', icon: 'Cart', badge: cartCount },
          { id: 'notifications', label: 'الإشعارات', icon: 'Bell', badge: notifCount },
          { id: 'account', label: 'حسابي', icon: 'User' }
        ]
      : [
          { id: 'landing', label: 'الرئيسية', icon: 'Home' },
          { id: 'products', label: 'المنتجات', icon: 'Grid' },
          { id: 'offers', label: 'العروض', icon: 'Gift' },
          { id: 'login', label: 'دخول', icon: 'User' }
        ];

  return (
    <nav className="bottom-nav">
      {items.map(it => (
        <button key={it.id} className={`bottom-nav-item ${path === it.id ? 'active' : ''}`} onClick={() => navigate(it.id)}>
          {React.createElement(Icon[it.icon] || Icon.Sparkle)}
          <span>{it.label}</span>
          {it.badge > 0 && <span className="badge">{it.badge > 99 ? '99+' : it.badge}</span>}
        </button>
      ))}
    </nav>
  );
}
