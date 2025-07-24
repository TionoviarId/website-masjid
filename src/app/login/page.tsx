'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../../../lib/firebase'; // pastikan ini benar


const auth = getAuth(app);
const db = getFirestore(app);

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const q = query(collection(db, 'users'), where('uid', '==', uid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert('Akun tidak ditemukan di database user.');
        setLoading(false);
        return;
      }

      const userData = snapshot.docs[0].data();
      alert(`Login berhasil sebagai ${userData.role}!`);

      // Redirect ke dashboard
      router.push('/');
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
      alert(`Login gagal: ${errorMessage}`);
    }

    setLoading(false);
  };

  return (
    <div className="flex w-full text-gray-700 justify-center items-center min-h-screen bg-gradient-to-br from-blue-400 to-teal-500">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Masuk Akun</h2>

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
          className="w-full mb-6 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-700 text-white py-2 rounded-lg font-bold hover:bg-teal-800 disabled:opacity-50"
        >
          {loading ? 'Masuk...' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
