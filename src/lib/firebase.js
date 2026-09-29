import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

let app = null;
let auth = null;
let googleProvider = null;

export function initFirebase() {
  if (typeof window === 'undefined' || !firebaseConfig.apiKey) {
    return { app: null, auth: null, googleProvider: null };
  }
  try {
    if (!app) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }
    if (!auth && app) {
      auth = getAuth(app);
    }
    if (!googleProvider) {
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
    }
  } catch (err) {
    console.error('[Firebase Init Error]', err);
  }
  return { app, auth, googleProvider };
}

// Initial client-side attempt
if (typeof window !== 'undefined') {
  initFirebase();
}

export function getFirebaseAuth() {
  return initFirebase();
}

export { app, auth, googleProvider };
