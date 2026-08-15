import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ===== FIREBASE CONFIG =====
export const firebaseConfig = {
  apiKey: "AIzaSyAPZROFTek8tdfVEz9PCZReb19ltetk5rQ",
  authDomain: "elmo3tarf.firebaseapp.com",
  projectId: "elmo3tarf",
  storageBucket: "elmo3tarf.firebasestorage.app",
  messagingSenderId: "976522924742",
  appId: "1:976522924742:web:6d91d5c37cc202bcf23dc7",
  measurementId: "G-5ESL3DY9YD"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile };

// ===== OWNER =====
export const OWNER_EMAIL = 'ELMO3TARF.MAKEUP.OWNER@elmo3tarf.com';
export const OWNER_PASSWORD = 'Elmo3tarf_E123';
export const OWNER_PHONE = '01234567891';

// ===== CLOUDINARY =====
export const CLOUD_NAME = 'w635mvns';
export const UPLOAD_PRESET = 'Elmo3tarfS';
export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// ===== PUSH NOTIFICATIONS =====
export const PUSH_WORKER_URL = (localStorage.getItem('elmo3tarf_push_worker_url') || '').trim() || 'https://notifications.elom3tarf-makeup.workers.dev/';
export const PUSH_WORKER_SECRET = (localStorage.getItem('elmo3tarf_push_worker_secret') || '').trim() || '7867c55d0b1a1f4ac4a432698d5c5ba5a3ef';
export const PUSH_ENDPOINT = (localStorage.getItem('elmo3tarf_push_endpoint') || '').trim() || 'https://script.google.com/macros/s/AKfycbzBegKB40dGx40dSm91pH8pCdeKB0Ue4cW-e8wniQr8Lduu6o7ALcRG0BLugHyg6777WA/exec';
export const VAPID_KEY = 'BF-SSYHVPEc8Mzc-wjEU1xxX_O9NPT08Vp4JnjNuRLw-Ji_ixnMYqaNKeuoYWSL87D2F3eDonOTwVoq84A13zg0';
export const LOGO_URL = 'https://res.cloudinary.com/w635mvns/image/upload/v1785542698/myi7pnercgigghiav7rq.png';

// ===== FIRESTORE COLLECTIONS =====
export const FS = {
  products: 'elmo3tarf_products',
  orders: 'elmo3tarf_orders',
  offers: 'elmo3tarf_offers',
  categories: 'elmo3tarf_categories',
  notifications: 'elmo3tarf_notifications',
  addresses: 'elmo3tarf_addresses',
  notifyReqs: 'elmo3tarf_notifyReqs',
  shipping: 'elmo3tarf_shipping',
  appState: 'elmo3tarf_appState',
  users: 'elmo3tarf_users',
  pushSubs: 'elmo3tarf_pushSubs',
  promos: 'elmo3tarf_promos',
  banners: 'elmo3tarf_banners',
  settings: 'elmo3tarf_settings'
};
