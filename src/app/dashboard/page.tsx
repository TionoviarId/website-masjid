'use client'

import React, { useEffect, useState } from 'react'
import { Calendar, ListChecks, Timer, Moon } from 'lucide-react'

// Pesan random Ramadhan
const texts = [
  "Marhaban ya Ramadhan",
  "Bulan penuh berkah dan ampunan",
  "Perbanyak doa dan amal baik",
  "Ramadhan bulan berbagi",
  "Perkuat iman, sucikan hati"
]

// Waktu Maghrib (contoh default)
const MAGHRIB_TIME = "18:13" // format HH:mm

function LandingPage() {
  const [index, setIndex] = useState(0)
  const [countdown, setCountdown] = useState('')

  // Ganti pesan setiap 8 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Countdown ke Maghrib
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const [h, m] = MAGHRIB_TIME.split(':').map(Number)
      const maghrib = new Date()
      maghrib.setHours(h, m, 0, 0)

      let diff = maghrib.getTime() - now.getTime()
      if (diff < 0) diff += 24 * 60 * 60 * 1000 // kalau sudah lewat, hitung ke besok

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown(`${hours}j ${minutes}m ${seconds}d`)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-teal-400 via-emerald-400 to-blue-500 flex items-center justify-center py-10 px-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-5xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <Moon className="w-10 h-10 text-amber-500" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-teal-700">
              Selamat Datang di Ramadhan 1447 H
            </h1>
          </div>
          <p className="text-lg md:text-xl font-semibold text-teal-800 bg-white px-4 py-2 rounded-xl inline-block shadow">
            {texts[index]}
          </p>
        </div>

        {/* Konten */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agenda Ramadhan */}
          <div className="bg-gradient-to-br from-[#9ACBD0] to-[#7BB9C3] rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center mb-4 space-x-2">
              <Calendar className="w-6 h-6 text-teal-700" />
              <h2 className="text-xl font-bold text-teal-700">Agenda Ramadhan</h2>
            </div>
            <ul className="text-gray-800 text-base font-medium list-disc ml-5 space-y-1">
              <li>Tarawih - Imam Ust. Ahmad</li>
              <li>Ceramah - Ust. Fulan (Setiap Sabtu)</li>
              <li>Buka Bersama - 15 Ramadhan</li>
            </ul>
          </div>

          {/* To Do List */}
          <div className="bg-gradient-to-br from-[#9ACBD0] to-[#7BB9C3] rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center mb-4 space-x-2">
              <ListChecks className="w-6 h-6 text-teal-700" />
              <h2 className="text-xl font-bold text-teal-700">To Do List</h2>
            </div>
            <ul className="text-gray-800 text-base font-medium list-disc ml-5 space-y-1">
              <li>Tadarus minimal 1 juz/hari</li>
              <li>Sedekah harian</li>
              <li>Sholat Tarawih di masjid</li>
            </ul>
          </div>

          {/* Countdown Berbuka */}
          <div className="bg-gradient-to-br from-[#9ACBD0] to-[#7BB9C3] rounded-2xl shadow-lg p-6 hover:shadow-xl transition md:col-span-2">
            <div className="flex items-center mb-4 space-x-2">
              <Timer className="w-6 h-6 text-teal-700" />
              <h2 className="text-xl font-bold text-teal-700">Countdown Berbuka</h2>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-center text-teal-800">
              {countdown}
            </p>
            <p className="text-center text-sm text-gray-700 mt-2">
              Menuju Maghrib: {MAGHRIB_TIME} WIB
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
