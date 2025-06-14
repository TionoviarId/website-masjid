'use client';

import React, { useState } from 'react';
import {
  initializeApp,
  FirebaseOptions
} from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc
} from 'firebase/firestore';

import { useRouter } from 'next/navigation';

// Firebase config
const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyCurarGPJ7bJH7XUQn6_VzIu0ITEn5SgkE',
  authDomain: 'website-masjid-16e5b.firebaseapp.com',
  projectId: 'website-masjid-16e5b',
  storageBucket: 'website-masjid-16e5b.appspot.com',
  messagingSenderId: '713268684394',
  appId: '1:713268684394:web:b90ccf8401f68deff54c13',
  measurementId: 'G-XX2P2XT005',
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function RegisterPage() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Simpan ke Firestore
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        nama,
        email,
        role
      });

      alert('Registrasi berhasil!');
      setNama('');
      setEmail('');
      setPassword('');
      setRole('admin');
      router.push('/');
    } catch (error: any) {
      console.error('Gagal daftar:', error);
      alert(`Gagal daftar: ${error.message}`);
    }
    setLoading(false);
  };
   const router = useRouter();

  return (
    <div className="flex justify-center w-full text-gray-700 items-center min-h-screen bg-gradient-to-br from-teal-400 to-blue-500">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Daftar Akun</h2>

        <input
          type="text"
          placeholder="Nama Lengkap"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="password"
          placeholder="Kata Sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mb-6 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="admin">Admin</option>
         
          <option value="yayasan">Yayasan</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-700 text-white py-2 rounded-lg font-bold hover:bg-teal-800 disabled:opacity-50"
        >
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
