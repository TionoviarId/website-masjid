'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  initializeApp,
  FirebaseOptions,
  getApp,
  getApps
} from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { Calendar, Moon, User, Clock, AlertCircle, Sunset, RefreshCw } from 'lucide-react';
import Navbar from '@/components/navbar';

// Types
type PrayerTime = {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

type RamadhanDay = {
  id: string;
  date: string;
  dayNumber: number;
  prayerTimes: PrayerTime;
  imam?: string;
  penceramah?: string;
  hijriDate: string;
};

// Constants
const FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: 'AIzaSyCurarGPJ7bJH7XUQn6_VzIu0ITEn5SgkE',
  authDomain: 'website-masjid-16e5b.firebaseapp.com',
  projectId: 'website-masjid-16e5b',
  storageBucket: 'website-masjid-16e5b.appspot.com',
  messagingSenderId: '713268684394',
  appId: '1:713268684394:web:b90ccf8401f68deff54c13',
  measurementId: 'G-XX2P2XT005',
};

const RAMADHAN_START_DATE = '2026-02-17';
const RAMADHAN_DAYS = 30;
const API_DELAY = 800;
const FALLBACK_DELAY = 200;
const VISIBLE_DAYS_INCREMENT = 6;

// Default prayer times fallback
const DEFAULT_PRAYER_TIMES: PrayerTime = {
  fajr: '04:58',
  dhuhr: '12:12',
  asr: '15:36',
  maghrib: '18:13',
  isha: '19:22',
};

// Maghrib Countdown Component
const MaghribCountdown = React.memo(() => {
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const [maghribTime, setMaghribTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMaghribTime = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

      const res = await fetch(`/api/prayertime?date=${formattedDate}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const maghribStr = data?.data?.timings?.Maghrib || '18:00';
      const [hour, minute] = maghribStr.split(':').map(Number);

      const maghribDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute, 0);
      if (new Date() > maghribDate) {
        maghribDate.setDate(maghribDate.getDate() + 1);
      }
      setMaghribTime(maghribDate);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil waktu Maghrib');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaghribTime();
  }, [fetchMaghribTime]);

  useEffect(() => {
    if (!maghribTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = maghribTime.getTime() - now.getTime();

      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      } else {
        clearInterval(timer);
        fetchMaghribTime();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [maghribTime, fetchMaghribTime]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br w-full from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl text-center text-white animate-pulse">
        <Clock className="w-10 h-10 mx-auto mb-3" />
        <p className="text-lg">Mengambil waktu Maghrib...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 rounded-3xl shadow-2xl p-[2px] mx-auto">
      <div className="bg-white/90 max-w-md mx-auto backdrop-blur-md rounded-3xl p-8 text-center">
        <div className="flex justify-center items-center gap-3 mb-6">
          <Sunset className="w-10 h-10 text-amber-500 drop-shadow" />
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-wide">
            Countdown Maghrib
          </h2>
        </div>

        {error && (
          <div className="bg-amber-100 border border-amber-300 text-amber-700 px-3 py-2 rounded-lg text-sm mb-4 shadow">
            ⚠️ {error}
          </div>
        )}

        <div className="relative">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 shadow-lg">
            <p className="text-5xl font-extrabold text-white font-mono drop-shadow-lg">
              {timeLeft}
            </p>
          </div>
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-emerald-400 animate-ping"></div>
        </div>

        {maghribTime && (
          <p className="text-gray-700 text-lg mt-6">
            🌅 Maghrib:{" "}
            <span className="font-semibold text-gray-900">
              {maghribTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </span>
          </p>
        )}

        <button
          onClick={fetchMaghribTime}
          className="mt-6 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>
    </div>
  );
});

MaghribCountdown.displayName = 'MaghribCountdown';

function RamadhanSchedulePage() {
  // Firebase initialization
  const app = useMemo(() => 
    !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApp(), 
    []
  );
  const db = useMemo(() => getFirestore(app), [app]);

  // State management
  const [ramadhanSchedule, setRamadhanSchedule] = useState<RamadhanDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleDays, setVisibleDays] = useState(VISIBLE_DAYS_INCREMENT);

  // Generate Ramadhan dates
  const ramadhanDates = useMemo(() => {
    const ramadhanStart = new Date(RAMADHAN_START_DATE);
    const dates = [];
    
    for (let i = 0; i < RAMADHAN_DAYS; i++) {
      const currentDate = new Date(ramadhanStart);
      currentDate.setDate(ramadhanStart.getDate() + i);
      
      dates.push({
        date: currentDate.toISOString().split('T')[0],
        dayNumber: i + 1,
        hijriDate: `${i + 1} Ramadhan 1447 H`,
        gregorianDate: currentDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });
    }
    
    return dates;
  }, []);

  // Fetch prayer times
  const fetchPrayerTimes = useCallback(async (dateString: string): Promise<PrayerTime> => {
    try {
      const [year, month, day] = dateString.split('-');
      const formattedDate = `${day}-${month}-${year}`;

      const response = await fetch(`/api/prayertime?date=${formattedDate}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data?.timings) {
        throw new Error('Invalid API response format');
      }

      const timings = data.data.timings;

      return {
        fajr: timings.Fajr.substring(0, 5),
        dhuhr: timings.Dhuhr.substring(0, 5),
        asr: timings.Asr.substring(0, 5),
        maghrib: timings.Maghrib.substring(0, 5),
        isha: timings.Isha.substring(0, 5),
      };
    } catch (error) {
      console.error(`Failed to fetch prayer times for ${dateString}:`, error);
      return DEFAULT_PRAYER_TIMES;
    }
  }, []);

  // Utility functions
  const delay = useCallback((ms: number) => 
    new Promise(resolve => setTimeout(resolve, ms)), 
    []
  );

  const showMoreDays = useCallback(() => {
    setVisibleDays(prev => Math.min(prev + VISIBLE_DAYS_INCREMENT, RAMADHAN_DAYS));
  }, []);

  // Schedule management functions
  const createSchedule = useCallback(async (dates: typeof ramadhanDates, delayMs: number) => {
    const schedule: RamadhanDay[] = [];
    
    for (let i = 0; i < dates.length; i++) {
      const dateInfo = dates[i];
      const prayerTimes = await fetchPrayerTimes(dateInfo.date);
      
      const dayData: RamadhanDay = {
        id: `day-${dateInfo.dayNumber}`,
        date: dateInfo.date,
        dayNumber: dateInfo.dayNumber,
        prayerTimes,
        hijriDate: dateInfo.hijriDate,
        imam: '',
        penceramah: ''
      };
      
      schedule.push(dayData);
      
      if (i < dates.length - 1) {
        await delay(delayMs);
      }
    }
    
    return schedule;
  }, [fetchPrayerTimes, delay]);

  const saveScheduleToFirebase = useCallback(async (schedule: RamadhanDay[]) => {
    const savePromises = schedule.map(dayData => 
      setDoc(doc(db, 'ramadhanSchedule2026', dayData.id), dayData)
    );
    await Promise.all(savePromises);
  }, [db]);

  const loadExistingSchedule = useCallback(async (snapshot: QuerySnapshot<DocumentData>) => {
    const existingSchedule = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    } as RamadhanDay));
    
    existingSchedule.sort((a: RamadhanDay, b: RamadhanDay) => a.dayNumber - b.dayNumber);
    setRamadhanSchedule(existingSchedule);
  }, []);

  // Initialize Ramadhan schedule
  const initializeRamadhanSchedule = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const snapshot = await getDocs(collection(db, 'ramadhanSchedule2026'));
      
      if (snapshot.empty) {
        const newSchedule = await createSchedule(ramadhanDates, API_DELAY);
        await saveScheduleToFirebase(newSchedule);
        setRamadhanSchedule(newSchedule);
      } else {
        await loadExistingSchedule(snapshot);
      }
      
    } catch (error) {
      console.error('Error in initializeRamadhanSchedule:', error);
      setError('Gagal memuat jadwal. Menggunakan jadwal cadangan...');
      
      // Fallback schedule
      const fallbackSchedule = await createSchedule(ramadhanDates, FALLBACK_DELAY);
      setRamadhanSchedule(fallbackSchedule);
    } finally {
      setLoading(false);
    }
  }, [db, ramadhanDates, createSchedule, saveScheduleToFirebase, loadExistingSchedule]);

  // Effects
  useEffect(() => {
    initializeRamadhanSchedule();
  }, [initializeRamadhanSchedule]);

  // Loading component
  const LoadingComponent = () => (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Moon className="w-8 h-8 text-emerald-600 animate-pulse" />
            <Clock className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Memuat Halaman...
          </h3>
          <p className="text-gray-600 mb-4">
            Mohon tunggu sebentar
          </p>
        </div>
      </div>
    </div>
  );

  // Error component
  const ErrorComponent = () => (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Terjadi Kesalahan</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            initializeRamadhanSchedule();
          }}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingComponent />;
  }

  if (error && ramadhanSchedule.length === 0) {
    return <ErrorComponent />;
  }
////////////////mulai tampilan/////////////////////////
  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat text-white h-[90vh] flex items-center"
        style={{ backgroundImage: "url('/masjid-solo.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div id='beranda' className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            Selamat Datang di Masjid Khalid bin Walid
          </h2>
          <p className="text-lg md:text-xl mb-6 drop-shadow-md">
            Menyatukan Iman, Ilmu, dan Amal
          </p>
          <a
            href="#tentang"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Lihat Selengkapnya
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="py-16 bg-white px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-4 text-gray-800">Tentang Masjid Kami</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Masjid Khalid bin Walid, berdiri megah di kawasan Kota Jambi sejak tahun 2018, menjadi simbol kebersamaan dan semangat keagamaan generasi muda di kota. Terinspirasi oleh semangat sahabat Nabi Khalid bin Walid, masjid ini hadir sebagai pusat spiritual, pendidikan, dan sosial yang inklusif.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Dengan berbagai kegiatan seperti kajian rutin, TPA, dan bakti sosial, kami berupaya menjadi 
              bagian dari solusi umat dan masyarakat sekitar.
            </p>
          </div>
          <div className="w-full h-72 md:h-full">
            <img
              src="/Best-Masjid-Wallpaper.jpg"
              alt="Masjid Khalid bin Walid"
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Maghrib Countdown Section */}
      <section id='countdown' className="py-16 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8 text-gray-800">Countdown Waktu Maghrib</h3>
          <MaghribCountdown />
        </div>
      </section>

      {/* Ramadhan Schedule Section */}
      <div id="jadwal" className="min-h-screen w-full bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 p-4">
        <div className="mx-auto">
          {/* Header */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-8">
            <div className="text-center">
              <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl">🕌</div>
                <Moon className="w-10 h-10 text-amber-500" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Jadwal Ramadhan 1447 H / 2026 M
              </h1>
              <p className="text-xl text-gray-600">Masjid Kota Jambi, Provinsi Jambi</p>
              <div className="mt-4 inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="font-semibold">30 Hari Waktu Shalat Real-Time</span>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-amber-100 border border-amber-400 rounded-lg flex items-center justify-center max-w-md mx-auto">
                  <AlertCircle className="w-4 h-4 text-amber-600 mr-2" />
                  <p className="text-sm text-amber-700">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-12 gap-6">
            {ramadhanSchedule.slice(0, visibleDays).map((day) => (
              <div
                key={day.id}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">Hari ke-{day.dayNumber}</h3>
                      <p className="text-emerald-100 text-sm">{day.hijriDate}</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-2">
                      <Moon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-emerald-100 text-sm mt-2">
                    {new Date(day.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>

                {/* Prayer Times */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Waktu Shalat
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subuh:</span>
                      <span className="font-semibold text-emerald-600">{day.prayerTimes.fajr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dzuhur:</span>
                      <span className="font-semibold text-blue-600">{day.prayerTimes.dhuhr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ashar:</span>
                      <span className="font-semibold text-amber-600">{day.prayerTimes.asr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maghrib:</span>
                      <span className="font-semibold text-red-600">{day.prayerTimes.maghrib}</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-gray-600">Isya & Tarawih:</span>
                      <span className="font-semibold text-purple-600">{day.prayerTimes.isha}</span>
                    </div>
                  </div>

                  {/* Imam & Penceramah Section */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Imam & Penceramah
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Imam:</span>
                        <span className="font-medium text-gray-800 text-sm">
                          {day.imam || 'Belum diisi'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Penceramah:</span>
                        <span className="font-medium text-gray-800 text-sm">
                          {day.penceramah || 'Belum diisi'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show More Button */}
          {visibleDays < ramadhanSchedule.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={showMoreDays}
                className="bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 font-semibold py-3 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
              >
                Lihat Lebih Banyak ({ramadhanSchedule.length - visibleDays} hari tersisa)
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl mt-8 text-center">
            <p className="text-gray-600">
              🕌 Jadwal waktu shalat real-time dari Aladhan API untuk Kota Jambi
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Koordinat: -1.6101°, 103.6131° | Method: MUIS Singapore
            </p>
          </div>
        </div>
      </div>
      <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        
        {/* Kolom 1: Nama Masjid */}
        <div>
          <h2 className="text-xl font-bold mb-2">Masjid Khalid bin Walid</h2>
          <p className="text-sm text-gray-300">
            “Menyatukan Iman, Ilmu, dan Amal”
          </p>
        </div>

        {/* Kolom 2: Navigasi */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Navigasi</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:text-white transition">Beranda</a></li>
            <li><a href="#about" className="hover:text-white transition">Tentang Kami</a></li>
            <li><a href="#jadwal" className="hover:text-white transition">Jadwal</a></li>
            <li><a href="#countdown" className="hover:text-white transition">Countdown</a></li>
          </ul>
        </div>

        {/* Kolom 3: Kontak */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Kontak</h3>
          <p className="text-sm text-gray-300">
            Jl. Khairul anam, Kota Jambi, Indonesia<br />
            Email: info@masjidkhalid.or.id<br />
            Telp: +62 812-3456-7890
          </p>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Masjid Khalid bin Walid. All rights reserved.
      </div>
    </footer>
    </div>
  );
}

export default RamadhanSchedulePage;