'use client';
import React, { useState, useEffect } from 'react';
import {
  initializeApp,
  FirebaseOptions,
  getApp,
  getApps
} from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import {
  getAuth,
  onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyCurarGPJ7bJH7XUQn6_VzIu0ITEn5SgkE',
  authDomain: 'website-masjid-16e5b.firebaseapp.com',
  projectId: 'website-masjid-16e5b',
  storageBucket: 'website-masjid-16e5b.appspot.com',
  messagingSenderId: '713268684394',
  appId: '1:713268684394:web:b90ccf8401f68deff54c13',
  measurementId: 'G-XX2P2XT005',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Types
type PrayerSchedule = {
  id: string;
  tanggal: string;
  subuh: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
};

type ImamSchedule = {
  id: string;
  tanggal: string;
  imam: string;
  penceramah: string;
};

function Page() {
  const [role, setRole] = useState<string | null>(null);
  const [prayerSchedules, setPrayerSchedules] = useState<PrayerSchedule[]>([]);
  const [prayerForm, setPrayerForm] = useState<Omit<PrayerSchedule, 'id'>>({
    tanggal: '', subuh: '', dzuhur: '', ashar: '', maghrib: '', isya: ''
  });
  const [imamSchedules, setImamSchedules] = useState<ImamSchedule[]>([]);
  const [imamForm, setImamForm] = useState<Omit<ImamSchedule, 'id'>>({
    tanggal: '', imam: '', penceramah: ''
  });
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userSnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setRole(userData.role);
        }
      } else {
        alert('Kamu belum login!');
      }
    });

    loadPrayerSchedules();
    loadImamSchedules();

    return () => unsubscribe();
  }, []);

  async function loadPrayerSchedules() {
    const snapshot = await getDocs(collection(db, 'prayerSchedules'));
    const schedules = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<PrayerSchedule, 'id'>)
    }));
    setPrayerSchedules(schedules);
  }

  async function addPrayerSchedule() {
    if (Object.values(prayerForm).some(val => !val)) {
      alert('Isi semua field!'); return;
    }
    setLoading(true);
    const docRef = await addDoc(collection(db, 'prayerSchedules'), prayerForm);
    setPrayerSchedules(prev => [...prev, { id: docRef.id, ...prayerForm }]);
    setPrayerForm({ tanggal: '', subuh: '', dzuhur: '', ashar: '', maghrib: '', isya: '' });
    setLoading(false);
  }

  async function deletePrayerSchedule(id: string) {
    if (!confirm('Hapus jadwal?')) return;
    setLoading(true);
    await deleteDoc(doc(db, 'prayerSchedules', id));
    setPrayerSchedules(prev => prev.filter(x => x.id !== id));
    setLoading(false);
  }

  async function loadImamSchedules() {
    const snapshot = await getDocs(collection(db, 'imamSchedules'));
    const schedules = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ImamSchedule, 'id'>)
    }));
    setImamSchedules(schedules);
  }

  async function addImamSchedule() {
    if (Object.values(imamForm).some(val => !val)) {
      alert('Isi semua field!'); return;
    }
    setLoading1(true);
    const docRef = await addDoc(collection(db, 'imamSchedules'), imamForm);
    setImamSchedules(prev => [...prev, { id: docRef.id, ...imamForm }]);
    setImamForm({ tanggal: '', imam: '', penceramah: '' });
    setLoading1(false);
  }

  async function deleteImamSchedule(id: string) {
    if (!confirm('Hapus jadwal?')) return;
    setLoading1(true);
    await deleteDoc(doc(db, 'imamSchedules', id));
    setImamSchedules(prev => prev.filter(x => x.id !== id));
    setLoading1(false);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-teal-400 to-blue-500 flex justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm max-w-4xl w-full rounded-3xl py-10 px-6 shadow-2xl">
        {role === 'admin' && (
            <div>
                <h2 className="text-3xl text-teal-700 font-bold mb-4">📖 Tambah Jadwal Shalat</h2>

          <div className="flex flex-col gap-3 mb-6">
            {(['tanggal', 'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as const).map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field}
                value={prayerForm[field]}
                onChange={(e) => setPrayerForm(prev => ({ ...prev, [field]: e.target.value }))}
                className="p-3 border text-gray-700 border-gray-300 rounded"
              />
            ))}
            <button
              onClick={addPrayerSchedule}
              className="bg-teal-700 text-white px-4 py-2 rounded"
              disabled={loading}
            >{loading ? 'Menambahkan...' : 'Tambah Jadwal'}</button>
          </div>
            </div>
        )}

        <h2 className="text-3xl text-teal-700 font-bold mb-2">📋 Daftar Jadwal Shalat</h2>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-teal-700 text-white">
              <th className="p-2">Tanggal</th>
              <th>Subuh</th><th>Dzuhur</th><th>Ashar</th><th>Maghrib</th><th>Isya</th>
              {role === 'admin' && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {prayerSchedules.map(s => (
              <tr key={s.id} className="text-center text-gray-700 pt-2 ">
                <td className='mb-2'>{s.tanggal}</td><td className='mb-2'>{s.subuh}</td><td className='mb-2'>{s.dzuhur}</td><td className='mb-2'>{s.ashar}</td><td className='mb-2'>{s.maghrib}</td><td className='mb-2'>{s.isya}</td>
                {role === 'admin' && (
                  <td className='mb-2'>
                    <button
                      onClick={() => deletePrayerSchedule(s.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >Hapus</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {role === 'admin' && (
            <div>
                <h2 className="text-3xl text-teal-700 font-bold mt-10 mb-4">🌙 Jadwal Imam Tarawih</h2>

          <div className="flex flex-col gap-3 mb-6">
            {(['tanggal', 'imam', 'penceramah'] as const).map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field}
                value={imamForm[field]}
                onChange={(e) => setImamForm(prev => ({ ...prev, [field]: e.target.value }))}
                className="p-3 border text-gray-700 border-gray-300 rounded"
              />
            ))}
            <button
              onClick={addImamSchedule}
              className="bg-teal-700 text-white px-4 py-2 rounded"
              disabled={loading1}
            >{loading1 ? 'Menambahkan...' : 'Tambah Jadwal'}</button>
          </div>
            </div>
        )}

        <h2 className="text-3xl text-teal-700 font-bold mb-2">📋 Daftar Jadwal Imam</h2>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-teal-700 text-white">
              <th className="p-2">Tanggal</th>
              <th>Imam</th><th>Penceramah</th>
              {role === 'admin' && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {imamSchedules.map(s => (
              <tr key={s.id} className="text-center text-gray-700 mt-2">
                <td className='mb-2'>{s.tanggal}</td><td className='mb-2'>{s.imam}</td><td className='mb-2'>{s.penceramah}</td>
                {role === 'admin' && (
                  <td className='mb-2'>
                    <button
                      onClick={() => deleteImamSchedule(s.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >Hapus</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Page;
