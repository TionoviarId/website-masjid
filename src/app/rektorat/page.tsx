'use client'

import React from 'react'

const Rektorat = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-red-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Menu</h2>
        <ul className="space-y-4">
          <li className="hover:text-yellow-300 font-semibold">Rektorat</li>
          <li className="hover:text-yellow-300 font-semibold">Pustaka</li>
        </ul>
      </div>

      {/* Konten Utama */}
      <div className="flex-1 bg-red-800 p-6 text-white">
        <h1 className="text-3xl font-bold mb-6">Rektorat</h1>

        <div className="overflow-x-auto bg-white text-black rounded-xl shadow-lg p-4 w-full max-w-xl">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-red-700 text-white">
              <tr>
                <th className="border border-gray-300 px-4 py-2">No</th>
                <th className="border border-gray-300 px-4 py-2">Field</th>
                <th className="border border-gray-300 px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">1</td>
                <td className="border border-gray-300 px-4 py-2">Nama</td>
                <td className="border border-gray-300 px-4 py-2">Nayla Khansa Zhafira</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">2</td>
                <td className="border border-gray-300 px-4 py-2">NIM</td>
                <td className="border border-gray-300 px-4 py-2">123456789</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">3</td>
                <td className="border border-gray-300 px-4 py-2">Program Studi</td>
                <td className="border border-gray-300 px-4 py-2">Informatika</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">4</td>
                <td className="border border-gray-300 px-4 py-2">Fakultas</td>
                <td className="border border-gray-300 px-4 py-2">FTI</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">5</td>
                <td className="border border-gray-300 px-4 py-2">Email</td>
                <td className="border border-gray-300 px-4 py-2">nayla@example.com</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Rektorat
