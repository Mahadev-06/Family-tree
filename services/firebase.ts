
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Check if API key is present in environment variables
const env = (import.meta as any).env;
const apiKey = env?.VITE_FIREBASE_API_KEY;

export const isFirebaseConfigured = !!apiKey && apiKey.length > 0;

const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY,
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env?.VITE_FIREBASE_APP_ID
};

let app;
let db: any;
let auth: any;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Fallback to ensure app doesn't crash if keys are invalid
    db = null;
    auth = null;
  }
} else {
  console.log("Firebase credentials missing. Running in Local Mode.");
  db = null;
  auth = null;
}

export { db, auth };
