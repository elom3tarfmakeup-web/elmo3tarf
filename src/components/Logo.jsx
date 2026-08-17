import React, { useId } from 'react';

// ===== شارة الشعار: حرف E + وردة =====
export function RoseMark({ size = 48, style }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const g1 = `elmg-${uid}`;
  const g2 = `elmg2-${uid}`;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} fill="none" style={style} aria-hidden="true">
      <defs>
        <linearGradient id={g1} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8B07D" />
          <stop offset="55%" stopColor="#D98E8B" />
          <stop offset="100%" stopColor="#B76E79" />
        </linearGradient>
        <linearGradient id={g2} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#C7795F" />
          <stop offset="100%" stopColor="#E8B07D" />
        </linearGradient>
      </defs>
      {/* ساق الوردة */}
      <path d="M30 100 C28 84 31 64 43 48" stroke={`url(#${g1})`} strokeWidth="3.4" strokeLinecap="round" />
      {/* ورقة سفلية */}
      <path d="M33 88 C25 86 20 80 21 72 C29 73 34 80 33 88 Z" fill={`url(#${g2})`} />
      {/* ورقة علوية */}
      <path d="M38 74 C29 71 23 63 25 53 C33 57 40 64 38 74 Z" fill={`url(#${g2})`} />
      {/* البرعم */}
      <path d="M43 48 C36 45 32 38 33 31 C33 26 38 23 43 25 C49 27 51 32 50 38 C49 43 47 46 43 48 Z" fill={`url(#${g1})`} />
      <path d="M43 33 C41 36 41 40 43 44" stroke="#F6E7D6" strokeWidth="1.5" strokeLinecap="round" />
      {/* حرف E */}
      <text x="66" y="87" textAnchor="middle" fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight="700" fontSize="72" fill={`url(#${g1})`}>E</text>
    </svg>
  );
}

// ===== الشعار الكامل: الشارة + الكلمتين المتداخلتين =====
export default function Logo({ size = 46, sm, className, style }) {
  return (
    <span className={`el-logo ${sm ? 'el-logo-sm' : ''} ${className || ''}`} style={style}>
      <RoseMark size={size} />
      <span className="el-logo-txt">
        <span className="el-logo-en">Elmo3tarf</span>
        <span className="el-logo-ar">المعترف</span>
      </span>
    </span>
  );
}
