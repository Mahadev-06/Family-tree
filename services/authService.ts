
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth } from './firebase';

export const login = async (email: string, pass: string) => {
  if (!auth) throw new Error("Auth not configured");
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const signup = async (email: string, pass: string) => {
  if (!auth) throw new Error("Auth not configured");
  return await createUserWithEmailAndPassword(auth, email, pass);
};

export const loginWithGoogle = async () => {
  if (!auth) throw new Error("Auth not configured");
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

export const logout = async () => {
  if (!auth) return;
  return await signOut(auth);
};

export const resetPassword = async (email: string) => {
  if (!auth) throw new Error("Auth not configured");
  return await sendPasswordResetEmail(auth, email);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
