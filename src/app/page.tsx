'use client'

import React, { useEffect, useState } from 'react'

const texts = [
  "Jangan lupa sahur ya!",
  "Perbanyak ibadah di bulan Ramadhan",
  "Bersihkan hati, kuatkan iman",
  "Ramadhan penuh berkah",
  "Tebar kebaikan setiap hari"
]

function Page() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length)
    }, 10000) // ganti setiap 10 detik

    return () => clearInterval(interval)
  }, [])

  return (
    <div className='w-full py-10 bg-gradient-to-br from-teal-400 to-blue-500 flex justify-center min-h-screen items-center'>
      <div className='bg-white/90 backdrop-blur-sm w-11/12 rounded-3xl py-10'>
        <p className='text-2xl text-teal-700 my-10 text-center font-bold'>
          Selamat Datang di Dashboard Ramadhan
        </p>
        <p className='text-2xl text-teal-700 my-10 text-center font-bold bg-white'>
         {texts[index]}
        </p>
        <div className='flex flex-col gap-5'>

        <div className='w-11/12 rounded-3xl mx-auto bg-[#9ACBD0] flex flex-col justify-center '>
          <p className='text-2xl font-bold text-teal-700 pt-2 px-5'>Agenda Ramadhan</p>
          <p className='text-black text-xl font-semibold transition-all duration-500 pb-5 px-5'>
            Di sini Anda dapat melihat jadwal Imam Tarawih, ceramah, dan kegiatan penting lainnya selama Ramadhan.
          </p>
        </div>
        <div className='w-11/12 rounded-3xl mx-auto bg-[#9ACBD0] flex flex-col justify-center '>
          <p className='text-2xl font-bold text-teal-700 pt-2 px-5'>To Do List</p>
          <p className='text-black text-xl font-semibold transition-all duration-500 pb-5 px-5'>
           Atur dan sesuaikan tujuan Ramadhan Anda dengan daftar tugas yang akan membantu Anda menjaga fokus dan berkah selama bulan suci ini.
          </p>
        </div>
        <div className='w-11/12 rounded-3xl mx-auto bg-[#9ACBD0] flex flex-col justify-center '>
          <p className='text-2xl font-bold text-teal-700 pt-2 px-5'>To Do List</p>
          <p className='text-black text-xl font-semibold transition-all duration-500 pb-5 px-5'>
           Atur dan sesuaikan tujuan Ramadhan Anda dengan daftar tugas yang akan membantu Anda menjaga fokus dan berkah selama bulan suci ini.
          </p>
        </div>
        <div className='w-11/12 rounded-3xl mx-auto bg-[#9ACBD0] flex flex-col justify-center '>
          <p className='text-2xl font-bold text-teal-700 pt-2 px-5'>Countdown Berbuka</p>
          <p className='text-black text-xl font-semibold transition-all duration-500 pb-5 px-5'>
          Hitung mundur menuju waktu berbuka.
          </p>
        </div>
       
        </div>
      </div>
    </div>
  )
}

export default Page
