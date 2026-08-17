import React, { useState } from 'react';
import { useApp } from '../store.jsx';
import { useRouter } from '../router.jsx';
import { RoseMark } from '../components/Logo.jsx';

export function Login() {
  const { login, initPush, lang } = useApp();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) { setErr('يرجى إدخال البريد الإلكتروني وكلمة المرور'); return; }
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (!res.ok) { setErr(res.error); return; }
    initPush();
    if (res.isOwner) navigate('dashboard');
    else navigate('home');
  };

  return (
    <div className="container">
      <form className="auth-card" onSubmit={submit}>
        <RoseMark size={72} style={{ display: 'block', margin: '0 auto 10px' }} />
        <h2 className="auth-title" style={{ marginBottom: 4 }}>Elmo3tarf</h2>
        <p className="auth-sub">{lang === 'en' ? 'Welcome back — sign in' : 'مرحباً بعودتك — سجّل دخولك'}</p>
        <div className="form">
          <div className="form-field">
            <label className="form-label">البريد الإلكتروني</label>
            <input className={`input ${err ? 'input-error' : ''}`} type="email" dir="ltr" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">كلمة المرور</label>
            <input className={`input ${err ? 'input-error' : ''}`} type="password" dir="ltr" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {err && <div className="error-text">{err}</div>}
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? '...' : 'دخول'}</button>
        </div>
        <div className="auth-switch">
          {lang === 'en' ? "Don't have an account? " : 'ليس لديك حساب؟ '}
          <button type="button" onClick={() => navigate('register')}>{lang === 'en' ? 'Create one' : 'إنشاء حساب جديد'}</button>
        </div>
      </form>
    </div>
  );
}

export function Register() {
  const { register, initPush, lang } = useApp();
  const { navigate } = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.name || !form.email || !form.phone || !form.password) { setErr('يرجى ملء جميع الحقول'); return; }
    if (form.password.length < 6) { setErr('كلمة المرور أقل من 6 أحرف'); return; }
    if (form.password !== form.confirm) { setErr('كلمتا المرور غير متطابقتين'); return; }
    setBusy(true);
    const res = await register(form);
    setBusy(false);
    if (!res.ok) { setErr(res.error); return; }
    initPush();
    navigate('home');
  };

  return (
    <div className="container">
      <form className="auth-card" onSubmit={submit}>
        <RoseMark size={72} style={{ display: 'block', margin: '0 auto 10px' }} />
        <h2 className="auth-title" style={{ marginBottom: 4 }}>{lang === 'en' ? 'Create Account' : 'إنشاء حساب جديد'}</h2>
        <p className="auth-sub">{lang === 'en' ? 'Join Elmo3tarf family' : 'انضمي لعائلة المعترف'}</p>
        <div className="form">
          <div className="form-field">
            <label className="form-label">الاسم بالكامل</label>
            <input className="input" placeholder="الاسم ثلاثي" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-field">
            <label className="form-label">البريد الإلكتروني</label>
            <input className="input" type="email" dir="ltr" placeholder="example@email.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-field">
            <label className="form-label">رقم الهاتف</label>
            <input className="input" type="tel" dir="ltr" placeholder="01XXXXXXXXX" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="form-field">
            <label className="form-label">كلمة المرور</label>
            <input className="input" type="password" dir="ltr" placeholder="أقل شيء 6 أحرف" value={form.password} onChange={set('password')} />
          </div>
          <div className="form-field">
            <label className="form-label">تأكيد كلمة المرور</label>
            <input className="input" type="password" dir="ltr" placeholder="أعد كتابة كلمة المرور" value={form.confirm} onChange={set('confirm')} />
          </div>
          {err && <div className="error-text">{err}</div>}
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? '...' : 'إنشاء الحساب'}</button>
        </div>
        <div className="auth-switch">
          {lang === 'en' ? 'Already have an account? ' : 'لديك حساب بالفعل؟ '}
          <button type="button" onClick={() => navigate('login')}>{lang === 'en' ? 'Sign in' : 'تسجيل الدخول'}</button>
        </div>
      </form>
    </div>
  );
}
