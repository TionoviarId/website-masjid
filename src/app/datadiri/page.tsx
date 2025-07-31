'use client'

import { useEffect, useState } from 'react'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'
import {
  getAuth,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import { initializeApp, getApps } from 'firebase/app'
import { FirebaseOptions } from 'firebase/app'

const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyCurarGPJ7bJH7XUQn6_VzIu0ITEn5SgkE',
  authDomain: 'website-masjid-16e5b.firebaseapp.com',
  projectId: 'website-masjid-16e5b',
  storageBucket: 'website-masjid-16e5b.appspot.com',
  messagingSenderId: '713268684394',
  appId: '1:713268684394:web:b90ccf8401f68deff54c13',
  measurementId: 'G-XX2P2XT005',
}

if (!getApps().length) {
  initializeApp(firebaseConfig)
}

const db = getFirestore()
const auth = getAuth()
const storage = getStorage()

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [form, setForm] = useState({
    nama: '',
    email: '',
    alamat: '',
    photoUrl: '',
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u)
        const docRef = doc(db, 'users', u.uid)
        const snap = await getDoc(docRef)

        if (snap.exists()) {
          const data = snap.data()
          setForm({
            nama: data.nama || u.displayName || '',
            email: data.email || u.email || '',
            alamat: data.alamat || '',
            photoUrl: data.photoUrl || '',
          })
        } else {
          setForm({
            nama: u.displayName || '',
            email: u.email || '',
            alamat: '',
            photoUrl: '',
          })
        }
      }
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  const handleSave = async () => {
    if (!user) return

    let photoUrl = form.photoUrl

    if (file) {
      const storageRef = ref(storage, `profile_pics/${user.uid}`)
      await uploadBytes(storageRef, file)
      photoUrl = await getDownloadURL(storageRef)
    }

    const updatedData = {
      ...form,
      photoUrl,
    }

    await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true })
    alert('Profil berhasil diperbarui!')
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Profil Akun</h2>

      {/* Gambar profil */}
      <div className="mb-4 text-center">
        <img
          src={preview || form.photoUrl || '/default-avatar.png'}
          alt="Foto Profil"
          className="w-28 h-28 rounded-full mx-auto object-cover border"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-2 text-sm text-gray-600"
        />
      </div>

      {/* Form input */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Nama</label>
          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Alamat</label>
          <input
            type="text"
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-all duration-200"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  )
}
