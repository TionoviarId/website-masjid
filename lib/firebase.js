import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCurarGPJ7bJH7XUQn6_VzIu0ITEn5SgkE",
  authDomain: "website-masjid-16e5b.firebaseapp.com",
  projectId: "website-masjid-16e5b",
  storageBucket: "website-masjid-16e5b.firebasestorage.app",
  messagingSenderId: "713268684394",
  appId: "1:713268684394:web:b90ccf8401f68deff54c13",
  measurementId: "G-XX2P2XT005"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);