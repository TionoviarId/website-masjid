'use client'

import { useEffect, useState } from 'react'

const CountdownToMaghrib = () => {
  const [timeLeft, setTimeLeft] = useState('')
  const [maghribTime, setMaghribTime] = useState<Date | null>(null)

  useEffect(() => {
    const fetchMaghribTime = async () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')

      // Ganti 1301 dengan kode kota kamu, contoh: Jakarta Pusat = 1301
      const res = await fetch(`https://api.myquran.com/v1/sholat/jadwal/1301/${year}/${month}/${day}`)
      const data = await res.json()
      const timeString = data.data.jadwal.maghrib // contoh: "17:46"

      const [hours, minutes] = timeString.split(':').map(Number)
      const maghrib = new Date()
      maghrib.setHours(hours, minutes, 0)

      setMaghribTime(maghrib)
    }

    fetchMaghribTime()
  }, [])

  useEffect(() => {
    if (!maghribTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = maghribTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("Waktunya berbuka!")
        return
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft(
        `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [maghribTime])

  return (
    <div className="text-center text-3xl font-bold text-[#48A6A7] mt-6">
    

      {timeLeft || 'Loading...'}
        
    </div>
  )
}

export default CountdownToMaghrib
