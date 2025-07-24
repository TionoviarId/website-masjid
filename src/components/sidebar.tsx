'use client'

import { Home, User, Settings, Folder, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "../../lib/firebase"
import Link from "next/link"

const Sidebar = () => {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      console.log("Logout berhasil")
      router.push("/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  return (
    <div className="flex min-h-screen w-64 bg-[#006A71] text-white flex flex-col shadow-lg">
      <div className="p-6 text-2xl font-bold border-gray-700">Agenda Ramadhan</div>
      <nav className="flex-1 p-4">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded">
            <Home size={20} /><span>Home</span>
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
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded w-full text-left"
          >
            <Info size={20} /><span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Sidebar
