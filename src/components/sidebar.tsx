'use client'

import { Home, User, Settings, Folder, Info } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "../../lib/firebase"
import Link from "next/link"
import { useState } from "react"

const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [showConfirmLogout, setShowConfirmLogout] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      console.log("Logout berhasil")
      router.push("/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  const hideSidebar = ["/login", "/register",'/'].includes(pathname)
  if (hideSidebar) return null

  return (
    <>
      <div className="flex min-h-screen w-64 bg-[#006A71] text-white flex flex-col shadow-lg">
        <div className="p-6 text-2xl font-bold border-gray-700">Agenda Ramadhan</div>
        <nav className="flex-1 p-4">
          <div className="space-y-4">
            <Link href="/dashboard" className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded">
              <Home size={20} /><span>Home</span>
            </Link>
            <Link href="/datadiri" className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded">
              <Home size={20} /><span>Data diri</span>
            </Link>
            <Link href="/agenda" className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded">
              <User size={20} /><span>Agenda Imam dan Ceramah</span>
            </Link>
            <Link href="/countdown" className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded">
              <Folder size={20} /><span>Countdown Berbuka</span>
            </Link>
            <Link href="/ramadhan_goals" className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded">
              <Settings size={20} /><span>Ramadhan Goals</span>
            </Link>
            <Link href="/buku" className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded">
              <Settings size={20} /><span>Buku</span>
            </Link>
            <button
              onClick={() => setShowConfirmLogout(true)}
              className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded w-full text-left"
            >
              <Info size={20} /><span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Modal konfirmasi logout */}
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-[#006A71] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-80 text-black">
            <p className="text-lg font-semibold mb-4">Yakin mau logout?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
