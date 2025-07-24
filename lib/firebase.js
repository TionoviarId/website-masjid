import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCurarGPJ7bJH7XUQn6_VzIu0ITEn5SgkE",
  authDomain: "website-masjid-16e5b.firebaseapp.com",
  projectId: "website-masjid-16e5b",
  storageBucket: "website-masjid-16e5b.appspot.com",
  messagingSenderId: "713268684394",
  appId: "1:713268684394:web:b90ccf8401f68deff54c13",
  measurementId: "G-XX2P2XT005"
};

// ✅ Inisialisasi hanya kalau belum ada instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app); 

export { app, db ,auth};
