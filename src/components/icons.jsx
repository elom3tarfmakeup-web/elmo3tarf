import React from 'react';

const S = (props) => ({
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  ...props
});

export const Icon = {
  Home: (p) => <svg {...S(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></svg>,
  Cart: (p) => <svg {...S(p)}><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /><path d="M3 4h2l2.4 12.2a1.6 1.6 0 0 0 1.6 1.3h7.9a1.6 1.6 0 0 0 1.6-1.3L20 8H6" /></svg>,
  Bell: (p) => <svg {...S(p)}><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" /><path d="M10.3 19a2 2 0 0 0 3.4 0" /></svg>,
  User: (p) => <svg {...S(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg>,
  Search: (p) => <svg {...S(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  Heart: (p) => <svg {...S(p)}><path d="M12 20.5s-7.5-4.7-9.3-9.3C1.5 8 3.5 4.8 6.8 4.4c2-.2 3.9.7 5.2 2.3 1.3-1.6 3.2-2.5 5.2-2.3 3.3.4 5.3 3.6 4.1 6.8-1.8 4.6-9.3 9.3-9.3 9.3Z" /></svg>,
  Close: (p) => <svg {...S(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>,
  Menu: (p) => <svg {...S(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  Sun: (p) => <svg {...S(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>,
  Moon: (p) => <svg {...S(p)}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" /></svg>,
  Globe: (p) => <svg {...S(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" /></svg>,
  ChevronLeft: (p) => <svg {...S(p)}><path d="m15 6-6 6 6 6" /></svg>,
  ChevronRight: (p) => <svg {...S(p)}><path d="m9 6 6 6-6 6" /></svg>,
  ChevronDown: (p) => <svg {...S(p)}><path d="m6 9 6 6 6-6" /></svg>,
  ArrowLeft: (p) => <svg {...S(p)}><path d="M19 12H5m6-7-7 7 7 7" /></svg>,
  Plus: (p) => <svg {...S(p)}><path d="M12 5v14M5 12h14" /></svg>,
  Minus: (p) => <svg {...S(p)}><path d="M5 12h14" /></svg>,
  Trash: (p) => <svg {...S(p)}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7" /></svg>,
  Check: (p) => <svg {...S(p)}><path d="m5 13 4 4L19 7" /></svg>,
  MapPin: (p) => <svg {...S(p)}><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>,
  Tag: (p) => <svg {...S(p)}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1.3" /></svg>,
  Package: (p) => <svg {...S(p)}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>,
  Clock: (p) => <svg {...S(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  Sparkle: (p) => <svg {...S(p)}><path d="M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8m0-12.8-2.8 2.8M8.4 15.6l-2.8 2.8" /></svg>,
  WhatsApp: (p) => <svg fill="currentColor" viewBox="0 0 24 24" {...p}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.5-6c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.6 6.6 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.4c.1-.2.2-.3.3-.5s0-.4 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c.6.3 1.1.4 1.5.5a3.5 3.5 0 0 0 1.6.1 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z" /></svg>,
  TikTok: (p) => <svg fill="currentColor" viewBox="0 0 24 24" {...p}><path d="M16.6 3c.4 2.1 1.8 3.7 3.9 4v3.1c-1.5 0-2.8-.5-3.9-1.3v6.4a6.3 6.3 0 1 1-6.3-6.3c.3 0 .7 0 1 .1v3.2a3.1 3.1 0 1 0 2.2 3V3h3.1Z" /></svg>,
  Telegram: (p) => <svg fill="currentColor" viewBox="0 0 24 24" {...p}><path d="M21.9 4.6 18.9 19c-.2 1-.8 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.8L18.2 6c.4-.3-.1-.5-.6-.2L7 13 2.3 11.5c-1-.3-1-1 .2-1.5L20.6 3c.8-.3 1.6.2 1.3 1.6Z" /></svg>,
  Facebook: (p) => <svg fill="currentColor" viewBox="0 0 24 24" {...p}><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v6h3v-6h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5H14Z" /></svg>,
  Star: (p) => <svg fill="currentColor" viewBox="0 0 24 24" {...p}><path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8L12 3Z" /></svg>,
  Logout: (p) => <svg {...S(p)}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="m10 8-4 4 4 4M6 12h10" /></svg>,
  Diamond: (p) => <svg {...S(p)}><path d="M12 3 21 9l-9 12L3 9l9-6Z" /><path d="m3 9 9-6 9 6M12 21 3 9h18l-9 12Z" /></svg>,
  Grid: (p) => <svg {...S(p)}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>,
  Percent: (p) => <svg {...S(p)}><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /></svg>,
  Users: (p) => <svg {...S(p)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.6c1.9.9 3 2.6 3 5.4" /></svg>,
  Box: (p) => <svg {...S(p)}><path d="M4 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8" /><path d="M2.5 5h19v3h-19V5Z" /><path d="M9 12h6" /></svg>,
  Megaphone: (p) => <svg {...S(p)}><path d="M3 11v2a2 2 0 0 0 2 2h2l3 4V5L7 9H5a2 2 0 0 0-2 2Z" /><path d="M14 8a4 4 0 0 1 0 8M17 5.5a8 8 0 0 1 0 13" /></svg>,
  Settings: (p) => <svg {...S(p)}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.7h4l.4-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" /></svg>,
  Gift: (p) => <svg {...S(p)}><rect x="4" y="9" width="16" height="11" rx="2" /><path d="M2.5 5.5h19V9h-19V5.5Z" /><path d="M12 5.5V20M12 5.5C12 4 10.5 3 9 3.5 7.8 3.9 7.5 5.5 9 6c1.5.5 3 0 3-.5Zm0 0c0-1.5 1.5-2.5 3-2 1.2.4 1.5 2 0 2.5-1.5.5-3 0-3-.5Z" /></svg>
};

export function IconBtn({ icon, badge, onClick, label, className }) {
  const I = Icon[icon] || Icon.Sparkle;
  return (
    <button className={`icon-btn ${className || ''}`} onClick={onClick} aria-label={label} title={label}>
      <I />
      {badge > 0 && <span className="badge">{badge > 99 ? '99+' : badge}</span>}
    </button>
  );
}
