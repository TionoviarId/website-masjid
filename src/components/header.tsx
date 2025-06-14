'use client';
import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../../lib/firebase'; // ganti path sesuai lokasi inisialisasi Firebase
// import { useAuth } from '../../src/context/AuthContext';
const auth = getAuth(app);
const db = getFirestore(app);

type UserData = {
  nama: string;
  role: string;
};

export default function Header() {
  const [userData, setUserData] = useState<UserData | null>(null);
//  const { user } = useAuth();
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        }
      });
    }
  }, []);

  return (
    <header className="w-full bg-teal-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">🕌 Website Masjid</h1>
      {userData ? (
        <div className="text-right">
          <p className="font-semibold">{userData.nama}</p>
          <p className="text-sm capitalize">{userData.role}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </header>
  );
}
