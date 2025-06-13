'use client';
import React, { useState, useEffect } from 'react';
import {
  initializeApp,
  FirebaseOptions
} from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';

// ✅ Firebase config
const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyCurarGPJ7bJH7XUQn6_VzIu0ITEn5SgkE',
  authDomain: 'website-masjid-16e5b.firebaseapp.com',
  projectId: 'website-masjid-16e5b',
  storageBucket: 'website-masjid-16e5b.appspot.com',
  messagingSenderId: '713268684394',
  appId: '1:713268684394:web:b90ccf8401f68deff54c13',
  measurementId: 'G-XX2P2XT005',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  const [prayerSchedules, setPrayerSchedules] = useState<PrayerSchedule[]>([]);
  const [prayerForm, setPrayerForm] = useState<Omit<PrayerSchedule, 'id'>>({
    tanggal: '',
    subuh: '',
    dzuhur: '',
    ashar: '',
    maghrib: '',
    isya: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrayerSchedules();
    loadImamSchedules();
  }, []);

  async function loadPrayerSchedules() {
    try {
      const snapshot = await getDocs(collection(db, 'prayerSchedules'));
      const schedules = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<PrayerSchedule, 'id'>),
      }));
      setPrayerSchedules(schedules);
    } catch (error) {
      console.error('Error loading prayer schedules:', error);
      alert('Gagal mengambil jadwal shalat');
    }
  }

  async function addPrayerSchedule() {
    const { tanggal, subuh, dzuhur, ashar, maghrib, isya } = prayerForm;
    if (!tanggal || !subuh || !dzuhur || !ashar || !maghrib || !isya) {
      alert('Mohon isi semua field');
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'prayerSchedules'), prayerForm);
      setPrayerSchedules((prev) => [...prev, { id: docRef.id, ...prayerForm }]);
      setPrayerForm({
        tanggal: '',
        subuh: '',
        dzuhur: '',
        ashar: '',
        maghrib: '',
        isya: '',
      });
      alert('Jadwal shalat berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding prayer schedule:', error);
      alert('Gagal menambahkan jadwal');
    }
    setLoading(false);
  }

  async function deletePrayerSchedule(id: string) {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'prayerSchedules', id));
      setPrayerSchedules((prev) => prev.filter((x) => x.id !== id));
      alert('Jadwal berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting prayer schedule:', error);
      alert('Gagal menghapus jadwal');
    }
    setLoading(false);
  }

  const [imamSchedules, setImamSchedules] = useState<ImamSchedule[]>([]);
  const [imamForm, setImamForm] = useState<Omit<ImamSchedule, 'id'>>({
    tanggal: '',
    imam: '',
    penceramah: ''
  });
  const [loading1, setLoading1] = useState(false);

  async function loadImamSchedules() {
    try {
      const snapshot = await getDocs(collection(db, 'imamSchedules'));
      const schedules = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ImamSchedule, 'id'>),
      }));
      setImamSchedules(schedules);
    } catch (error) {
      console.error('Error loading Imam schedules:', error);
      alert('Gagal mengambil jadwal imam');
    }
  }

  async function addImamSchedule() {
    const { tanggal, imam, penceramah } = imamForm;
    if (!tanggal || !imam || !penceramah) {
      alert('Mohon isi semua field');
      return;
    }

    setLoading1(true);
    try {
      const docRef = await addDoc(collection(db, 'imamSchedules'), imamForm);
      setImamSchedules((prev) => [...prev, { id: docRef.id, ...imamForm }]);
      setImamForm({
        tanggal: '',
        imam: '',
        penceramah: ''
      });
      alert('Jadwal imam berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding imam schedule:', error);
      alert('Gagal menambahkan jadwal imam');
    }
    setLoading1(false);
  }

  async function deleteImamSchedule(id: string) {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;
    setLoading1(true);
    try {
      await deleteDoc(doc(db, 'imamSchedules', id));
      setImamSchedules((prev) => prev.filter((x) => x.id !== id));
      alert('Jadwal berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting imam schedule:', error);
      alert('Gagal menghapus jadwal');
    }
    setLoading1(false);
  }

  return (
    <div className="w-full bg-gradient-to-br from-teal-400 to-blue-500 flex justify-center min-h-screen items-start p-4">
      <div className="bg-white/90 backdrop-blur-sm w-full flex flex-col items-center max-w-4xl rounded-3xl py-10 shadow-2xl">
        {/* Form Jadwal Shalat */}
        <h2 className="text-3xl text-teal-700 font-bold mb-4">📖 Tambah Jadwal Shalat</h2>
        <div className="flex flex-col w-11/12 gap-3 mb-6">
          {(['tanggal', 'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as const).map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={prayerForm[field]}
              onChange={(e) => setPrayerForm((prev) => ({ ...prev, [field]: e.target.value }))}
              className="p-3 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={loading}
            />
          ))}
        </div>
        <button
          onClick={addPrayerSchedule}
          disabled={loading}
          className="bg-teal-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-teal-800 disabled:opacity-50"
        >
          {loading ? 'Menambahkan...' : 'Tambah Jadwal'}
        </button>

        {/* Tabel Jadwal Shalat */}
        <h2 className="text-3xl text-teal-700 font-bold mt-10 mb-4">📋 Daftar Jadwal</h2>
        {prayerSchedules.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada jadwal shalat.</p>
        ) : (
          <div className="overflow-auto w-11/12 max-h-96">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="p-2">Tanggal</th>
                  <th className="p-2">Subuh</th>
                  <th className="p-2">Dzuhur</th>
                  <th className="p-2">Ashar</th>
                  <th className="p-2">Maghrib</th>
                  <th className="p-2">Isya</th>
                  <th className="p-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {prayerSchedules.map((sched) => (
                  <tr key={sched.id} className="text-center border-b text-gray-700">
                    <td className="p-2">{sched.tanggal}</td>
                    <td className="p-2">{sched.subuh}</td>
                    <td className="p-2">{sched.dzuhur}</td>
                    <td className="p-2">{sched.ashar}</td>
                    <td className="p-2">{sched.maghrib}</td>
                    <td className="p-2">{sched.isya}</td>
                    <td className="p-2">
                      <button
                        onClick={() => deletePrayerSchedule(sched.id)}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Form Jadwal Imam */}
        <h2 className="mt-10 text-3xl text-teal-700 font-bold mb-4">🌙 Jadwal Imam Tarawih dan Penceramah</h2>
        <div className="flex flex-col w-11/12 gap-3 mb-6">
          {(['tanggal', 'imam', 'penceramah'] as const).map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={imamForm[field]}
              onChange={(e) => setImamForm((prev) => ({ ...prev, [field]: e.target.value }))}
              className="p-3 border border-gray-300 rounded-lg text-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={loading1}
            />
          ))}
        </div>
        <button
          onClick={addImamSchedule}
          disabled={loading1}
          className="bg-teal-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-teal-800 disabled:opacity-50"
        >
          {loading1 ? 'Menambahkan...' : 'Tambah Jadwal'}
        </button>

        {/* Tabel Jadwal Imam */}
        <h2 className="text-3xl text-teal-700 font-bold mt-10 mb-4">📋 Daftar Jadwal</h2>
        {imamSchedules.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada jadwal shalat.</p>
        ) : (
          <div className="overflow-auto w-11/12 max-h-96">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="p-2">Tanggal</th>
                  <th className="p-2">Imam</th>
                  <th className="p-2">Penceramah</th>
                  <th className="p-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {imamSchedules.map((sched) => (
                  <tr key={sched.id} className="text-center border-b text-gray-700">
                    <td className="p-2">{sched.tanggal}</td>
                    <td className="p-2">{sched.imam}</td>
                    <td className="p-2">{sched.penceramah}</td>
                    <td className="p-2">
                      <button
                        onClick={() => deleteImamSchedule(sched.id)}
                        disabled={loading1}
                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
