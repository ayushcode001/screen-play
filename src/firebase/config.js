import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate required config (will warn in console if missing)
const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
required.forEach(key => {
  if (!firebaseConfig[key]) {
    console.error(
      `[Firebase] Missing env var: VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}. ` +
      'Copy .env.example → .env.local and fill in your Firebase project values.'
    );
  }
});

const app = initializeApp(firebaseConfig);

// Auth — browserLocalPersistence keeps user signed in across refreshes/restarts
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Firestore
export const db = getFirestore(app);

export default app;
