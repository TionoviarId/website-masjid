'use client'

import React, { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getApp, getApps, initializeApp } from 'firebase/app'
import { useRouter } from 'next/navigation'
import { Calendar, ListChecks, Timer,  } from 'lucide-react'

// Firebase Config
const firebaseConfig = {
  apiKey: 'AIzaSyCurarGPJ7bJH7XUQn6_VzIu0ITEn5SgkE',
  authDomain: 'website-masjid-16e5b.firebaseapp.com',
  projectId: 'website-masjid-16e5b',
  storageBucket: 'website-masjid-16e5b.appspot.com',
  messagingSenderId: '713268684394',
  appId: '1:713268684394:web:b90ccf8401f68deff54c13',
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)

const texts = [
  "Jangan lupa sahur ya!",
  "Perbanyak ibadah di bulan Ramadhan",
  "Bersihkan hati, kuatkan iman",
  "Ramadhan penuh berkah",
  "Tebar kebaikan setiap hari"
]

function Page() {
  const [index, setIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/login')
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 via-emerald-400 to-blue-500 py-12 px-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-4xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-teal-700 mb-4">
            Selamat Datang di Dashboard Ramadhan
          </h1>
          <p className="text-lg md:text-xl font-semibold text-teal-800 bg-white px-4 py-2 rounded-xl inline-block shadow">
            {texts[index]}
          </p>
        </div>

        {/* Card List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agenda Ramadhan */}
          <div className="bg-gradient-to-br from-[#9ACBD0] to-[#7BB9C3] rounded-2xl shadow-lg p-6 transition hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center mb-4 space-x-2">
              <Calendar className="w-6 h-6 text-teal-700" />
              <h2 className="text-xl font-bold text-teal-700">Agenda Ramadhan</h2>
            </div>
            <p className="text-gray-800 text-base font-medium">
              Lihat jadwal Imam Tarawih, ceramah, dan kegiatan penting lainnya selama Ramadhan.
            </p>
          </div>

          {/* To Do List */}
          <div className="bg-gradient-to-br from-[#9ACBD0] to-[#7BB9C3] rounded-2xl shadow-lg p-6 transition hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center mb-4 space-x-2">
              <ListChecks className="w-6 h-6 text-teal-700" />
              <h2 className="text-xl font-bold text-teal-700">To Do List</h2>
            </div>
            <p className="text-gray-800 text-base font-medium">
              Atur dan capai tujuan Ramadhan Anda dengan daftar tugas harian yang membantu menjaga fokus & keberkahan.
            </p>
          </div>

          {/* Countdown Berbuka */}
          <div className="bg-gradient-to-br from-[#9ACBD0] to-[#7BB9C3] rounded-2xl shadow-lg p-6 transition hover:shadow-xl hover:-translate-y-1 md:col-span-2">
            <div className="flex items-center mb-4 space-x-2">
              <Timer className="w-6 h-6 text-teal-700" />
              <h2 className="text-xl font-bold text-teal-700">Countdown Berbuka</h2>
            </div>
            <p className="text-gray-800 text-base font-medium">
              Hitung mundur menuju waktu berbuka puasa hari ini.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
