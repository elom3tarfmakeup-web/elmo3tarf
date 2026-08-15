import React, { useEffect, useState } from 'react';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import { Icon } from './icons.jsx';

// ===== مودال =====
export function Modal({ open, onClose, title, children, footer, wide }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className="modal" style={wide ? { maxWidth: 760 } : {}}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="إغلاق"><Icon.Close /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ===== توست =====
export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return <div key={toast.id} className={`toast ${toast.isError ? 'error' : ''}`}>{toast.msg}</div>;
}

// ===== شريط الإعلانات المتحرك =====
export function Ticker() {
  const { banners } = useApp();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('elmo3tarf_ticker_dismissed') === '1');
  if (dismissed || !banners.length) return null;
  const items = banners.filter(b => b && b.text).slice(0, 6);
  if (!items.length) return null;
  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.map(b => (
          <span key={b.id} className="ticker-item">
            <span className="dot" /> {b.text}
          </span>
        ))}
      </div>
      <button
        className="ticker-close"
        onClick={() => { setDismissed(true); localStorage.setItem('elmo3tarf_ticker_dismissed', '1'); }}
        aria-label="إغلاق الإعلان"
      ><Icon.Close /></button>
    </div>
  );
}

// ===== سنيكبار السلة =====
export function CartSnackbar() {
  const { cartSnackbar } = useApp();
  const { navigate } = useRouter();
  if (!cartSnackbar) return null;
  const count = cartSnackbar.count != null ? `${cartSnackbar.count} عناصر` : `عنصر واحد`;
  return (
    <button className="cart-snackbar" onClick={() => navigate('cart')}>
      <Icon.Cart />
      السلة — {count}
    </button>
  );
}

// ===== شريط تفعيل الإشعارات =====
export function NotifPrompt() {
  const { notifPrompt, enableNotifications } = useApp();
  if (!notifPrompt) return null;
  return (
    <div className="notif-prompt">
      <span style={{ fontSize: 26 }}>🔔</span>
      <div className="np-text">
        <strong>فعّل الإشعارات</strong>
        عشان توصلك تنبيهات الطلبات والعروض فوراً
      </div>
      <button className="btn btn-primary btn-sm" onClick={enableNotifications}>تفعيل</button>
    </div>
  );
}

// ===== زر الدارك مود الطائر =====
export function ThemeFab() {
  const { theme, setTheme } = useApp();
  return (
    <button className="theme-fab" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="تبديل الوضع">
      {theme === 'dark' ? <Icon.Sun /> : <Icon.Moon />}
    </button>
  );
}

// ===== تكبير الصورة =====
export function ImageZoom() {
  const { imageZoom, setImageZoom } = useApp();
  if (!imageZoom) return null;
  return (
    <div className="zoom-overlay" onClick={() => setImageZoom(null)}>
      <img src={imageZoom} alt="تكبير المنتج" />
    </div>
  );
}

// ===== حالة فارغة =====
export function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="empty-state">
      <div className="es-icon">{icon || '🛍️'}</div>
      <h3>{title}</h3>
      {sub && <p>{sub}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

// ===== صورة منتج (مع fallback) =====
export function ProductImg({ src, alt, className, onClick, style }) {
  const [err, setErr] = useState(false);
  const fallback = 'https://res.cloudinary.com/w635mvns/image/upload/v1785542698/myi7pnercgigghiav7rq.png';
  const url = (src && !err) ? src : fallback;
  return <img src={url} alt={alt || ''} className={className} style={style} onClick={onClick} loading="lazy" onError={() => setErr(true)} />;
}

// ===== صورة رفع من الملف =====
export function FileUpload({ label, preview, onChange }) {
  const [name, setName] = useState('');
  return (
    <div className="file-upload">
      <input type="file" accept="image/*" onChange={(e) => {
        const f = e.target.files && e.target.files[0];
        setName(f ? f.name : '');
        onChange(f);
      }} />
      <div className="file-upload-box">
        <span className="fu-icon">🖼️</span>
        <span>{name || label || 'اختيار صورة'}</span>
        {!name && <small className="text-muted">اسحب أو اضغط لاختيار صورة</small>}
      </div>
      {preview && <img className="file-upload-preview" src={preview} alt="معاينة" />}
    </div>
  );
}
