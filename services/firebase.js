import { initializeApp } from 'firebase/app';
import {
  getAuth, initializeAuth, getReactNativePersistence,
  GoogleAuthProvider, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile,
} from 'firebase/auth';
import {
  getFirestore, collection, onSnapshot,
  doc, setDoc, getDoc, updateDoc, addDoc,
  query, orderBy, where, serverTimestamp,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDthCyewBXGbfae8ACKEwoV5r2TI6bPEA0',
  authDomain: 'bharkahadevi-cd818.firebaseapp.com',
  projectId: 'bharkahadevi-cd818',
  storageBucket: 'bharkahadevi-cd818.firebasestorage.app',
  messagingSenderId: '517542560333',
  appId: '1:517542560333:web:c3739a55e130fac8f41204',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ── Auth Functions ──────────────────────────────
export const signInEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpEmail = async (email, password, name) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, 'users', cred.user.uid), {
    name, email, createdAt: serverTimestamp(),
    referCode: 'BD' + Math.random().toString(36).substring(2,7).toUpperCase(),
    referCount: 0, usedCoupons: [],
  });
  return cred;
};

export const signOutUser = () => signOut(auth);
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ── Firestore Listeners ─────────────────────────
export const listenProducts = (cb) => {
  const q = query(collection(db, 'products'), orderBy('name'));
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
};

export const listenShopStatus = (cb) => {
  return onSnapshot(doc(db, 'config', 'shopStatus'), snap => {
    cb(snap.exists() ? snap.data() : { isOpen: true });
  });
};

// ── Orders ──────────────────────────────────────
export const placeOrder = async (orderData) => {
  const ref = await addDoc(collection(db, 'orders'), {
    ...orderData, createdAt: serverTimestamp(), status: 'pending',
  });
  return ref.id;
};

export const listenUserOrders = (uid, cb) => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
};

// ── User Profile ────────────────────────────────
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const updateUserProfile = (uid, data) =>
  updateDoc(doc(db, 'users', uid), data);

// ── Referral ────────────────────────────────────
export const applyReferCode = async (uid, code) => {
  const usersSnap = await getDoc(doc(db, 'users', uid));
  const userData = usersSnap.data();
  if (userData?.usedCoupons?.includes('REFER50')) {
    return { success: false, msg: 'Already used refer bonus!' };
  }
  // Find referrer
  const q = query(collection(db, 'users'), where('referCode', '==', code));
  const { getDocs } = await import('firebase/firestore');
  const snap = await getDocs(q);
  if (snap.empty) return { success: false, msg: 'Invalid refer code!' };
  const referrerDoc = snap.docs[0];
  // Give coupon to new user
  await updateDoc(doc(db, 'users', uid), {
    usedCoupons: [...(userData.usedCoupons || []), 'REFER50'],
    activeCoupon: { code: 'REFER50', discount: 50, type: 'percent' },
  });
  // Increment referrer count
  await updateDoc(doc(db, 'users', referrerDoc.id), {
    referCount: (referrerDoc.data().referCount || 0) + 1,
  });
  return { success: true, msg: '50% OFF coupon added!' };
};

// ── Cloud Functions (Twilio relay) ──────────────
const functions = getFunctions(app);

export const sendPreorderRequest = (payload) =>
  httpsCallable(functions, 'sendPreorderWhatsApp')(payload);