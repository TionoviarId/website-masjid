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
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  setDoc
} from 'firebase/firestore';
import {
  getAuth,
  onAuthStateChanged
} from 'firebase/auth';
import { Calendar, Moon, User, Clock } from 'lucide-react';

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

function RamadhanSchedule() {
  const [role, setRole] = useState<string | null>(null);
  const [ramadhanSchedule, setRamadhanSchedule] = useState<RamadhanDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ imam: '', penceramah: '' });

  // Generate Ramadhan 2026 dates (estimated - Ramadhan 1447 AH)
  const generateRamadhanDates = () => {
    const ramadhanStart = new Date('2026-02-17'); // Estimated start date
    const dates = [];
    
    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(ramadhanStart);
      currentDate.setDate(ramadhanStart.getDate() + i);
      
      const dayNumber = i + 1;
      const hijriDay = dayNumber;
      
      dates.push({
        date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
        dayNumber,
        hijriDate: `${hijriDay} Ramadhan 1447 H`,
        gregorianDate: currentDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });
    }
    
    return dates;
  };

 // Fetch prayer times for a specific date (via /api/prayertime)
const fetchPrayerTimes = async (dateString: string): Promise<PrayerTime> => {
  try {
    const [year, month, day] = dateString.split('-');
    const formattedDate = `${day}-${month}-${year}`; // DD-MM-YYYY

    console.log(`Fetching prayer times for: ${dateString} -> ${formattedDate}`);

    // Fetch dari API route Next.js
    const response = await fetch(`/api/prayertime?date=${formattedDate}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const timings = data.data.timings;

    const prayerTimes: PrayerTime = {
      fajr: timings.Fajr.substring(0, 5),
      dhuhr: timings.Dhuhr.substring(0, 5),
      asr: timings.Asr.substring(0, 5),
      maghrib: timings.Maghrib.substring(0, 5),
      isha: timings.Isha.substring(0, 5),
    };

    console.log(`Success for ${formattedDate}:`, prayerTimes);
    return prayerTimes;
  } catch (error) {
    console.error(`Failed to fetch prayer times for ${dateString}:`, error);

    // fallback waktu default
    return {
      fajr: '04:58',
      dhuhr: '12:12',
      asr: '15:36',
      maghrib: '18:13',
      isha: '19:22',
    };
  }
};


  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userSnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setRole(userData.role);
        }
      }
    });

    initializeRamadhanSchedule();
    return () => unsubscribe();
  }, []);

  const initializeRamadhanSchedule = async () => {
    setLoading(true);
    setLoadingProgress(0);
    
    try {
      // Check if schedule exists in Firebase
      const snapshot = await getDocs(collection(db, 'ramadhanSchedule2026'));
      
      if (snapshot.empty) {
        console.log('No existing schedule found. Creating new one...');
        
        // Generate new schedule
        const dates = generateRamadhanDates();
        const newSchedule: RamadhanDay[] = [];
        
        for (let i = 0; i < dates.length; i++) {
          const dateInfo = dates[i];
          setLoadingProgress(Math.round(((i + 1) / dates.length) * 100));
          
          console.log(`Processing day ${i + 1} of 30: ${dateInfo.date}`);
          
          // Fetch prayer times for this specific date
          const prayerTimes = await fetchPrayerTimes(dateInfo.date);
          
          const dayData: RamadhanDay = {
            id: `day-${dateInfo.dayNumber}`,
            date: dateInfo.date,
            dayNumber: dateInfo.dayNumber,
            prayerTimes: prayerTimes,
            hijriDate: dateInfo.hijriDate,
            imam: '',
            penceramah: ''
          };
          
          // Save to Firebase
          await setDoc(doc(db, 'ramadhanSchedule2026', dayData.id), dayData);
          newSchedule.push(dayData);
          
          // Delay to avoid rate limiting
          if (i < dates.length - 1) {
            await delay(800);
          }
        }
        
        setRamadhanSchedule(newSchedule);
        console.log('New schedule created successfully!');
        
      } else {
        console.log('Loading existing schedule...');
        
        // Load existing schedule
        const existingSchedule = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as RamadhanDay));
        
        // Sort by day number
        existingSchedule.sort((a, b) => a.dayNumber - b.dayNumber);
        setRamadhanSchedule(existingSchedule);
        
        console.log('Existing schedule loaded successfully!');
      }
      
    } catch (error) {
      console.error('Error in initializeRamadhanSchedule:', error);
      
      // Fallback: create basic schedule without Firebase
      console.log('Using fallback schedule...');
      const dates = generateRamadhanDates();
      const fallbackSchedule: RamadhanDay[] = [];
      
      for (let i = 0; i < dates.length; i++) {
        const dateInfo = dates[i];
        setLoadingProgress(Math.round(((i + 1) / dates.length) * 100));
        
        const prayerTimes = await fetchPrayerTimes(dateInfo.date);
        
        fallbackSchedule.push({
          id: `day-${dateInfo.dayNumber}`,
          date: dateInfo.date,
          dayNumber: dateInfo.dayNumber,
          prayerTimes: prayerTimes,
          hijriDate: dateInfo.hijriDate,
          imam: '',
          penceramah: ''
        });
        
        if (i < dates.length - 1) {
          await delay(200);
        }
      }
      
      setRamadhanSchedule(fallbackSchedule);
    }
    
    setLoading(false);
  };

  const handleEdit = (day: RamadhanDay) => {
    setEditingDay(day.id);
    setEditForm({
      imam: day.imam || '',
      penceramah: day.penceramah || ''
    });
  };

  const handleSave = async (dayId: string) => {
    try {
      await updateDoc(doc(db, 'ramadhanSchedule2026', dayId), {
        imam: editForm.imam,
        penceramah: editForm.penceramah
      });

      setRamadhanSchedule(prev => 
        prev.map(day => 
          day.id === dayId 
            ? { ...day, imam: editForm.imam, penceramah: editForm.penceramah }
            : day
        )
      );

      setEditingDay(null);
      setEditForm({ imam: '', penceramah: '' });
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Gagal menyimpan perubahan');
    }
  };

  const handleCancel = () => {
    setEditingDay(null);
    setEditForm({ imam: '', penceramah: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Moon className="w-8 h-8 text-emerald-600 animate-pulse" />
              <Clock className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Memuat Jadwal Ramadhan
            </h3>
            <p className="text-gray-600 mb-4">
              Mengambil waktu shalat untuk setiap hari...
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">{loadingProgress}% selesai</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 p-4">
      <div className=" mx-auto">
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
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ramadhanSchedule.map((day) => (
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
                  
                  {editingDay === day.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Nama Imam.."
                        value={editForm.imam}
                        onChange={(e) => setEditForm(prev => ({ ...prev, imam: e.target.value }))}
                        className="w-full placeholder:text-gray-500 text-gray-900 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Nama Penceramah.."
                        value={editForm.penceramah}
                        onChange={(e) => setEditForm(prev => ({ ...prev, penceramah: e.target.value }))}
                        className="w-full placeholder:text-gray-500 text-gray-900 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSave(day.id)}
                          className="flex-1 bg-emerald-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
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
                      
                      {role === 'admin' && (
                        <button
                          onClick={() => handleEdit(day)}
                          className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
                        >
                          Edit Jadwal
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

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
  );
}

export default RamadhanSchedule;