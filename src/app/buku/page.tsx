'use client'

import React, { useEffect, useState } from 'react'
import {
  initializeApp,
  getApps,
  getApp,
  FirebaseOptions,
} from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore'

const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyCurarGPJ7bJH7XUQn6_VzIu0ITEn5SgkE',
  authDomain: 'website-masjid-16e5b.firebaseapp.com',
  projectId: 'website-masjid-16e5b',
  storageBucket: 'website-masjid-16e5b.appspot.com',
  messagingSenderId: '713268684394',
  appId: '1:713268684394:web:b90ccf8401f68deff54c13',
  measurementId: 'G-XX2P2XT005',
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)

interface Book {
  id?: string
  title: string
  author: string
  year: number
}

const BookPage = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [form, setForm] = useState<Book>({ title: '', author: '', year: 2023 })
  const [editId, setEditId] = useState<string | null>(null)

  const fetchBooks = async () => {
    const snapshot = await getDocs(collection(db, 'books'))
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Book[]
    setBooks(data)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm({
      ...form,
      [name]: name === 'year' ? Number(value) : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const {  ...data } = form

    if (editId) {
      await updateDoc(doc(db, 'books', editId), data)
      setEditId(null)
    } else {
      await addDoc(collection(db, 'books'), data)
    }

    setForm({ title: '', author: '', year: 2023 })
    fetchBooks()
  }

  const handleEdit = (book: Book) => {
    setForm(book)
    setEditId(book.id ?? null)
  }

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'books', id))
    fetchBooks()
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-sky-100 via-white to-emerald-100 py-10 px-4">
      <div className="w-full mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center text-emerald-700 mb-8">
          📚 Manajemen Buku
        </h1>

        {/* Form Input */}
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-200 rounded-lg p-6 shadow-inner mb-10 space-y-4"
        >
          <div className="grid md:grid-cols-3 gap-4 text-black placeholder-bg-gray-700">
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Judul Buku"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="Penulis"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              placeholder="Tahun"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-full shadow hover:brightness-110 transition"
            >
              {editId ? '🔄 Update Buku' : '➕ Tambah Buku'}
            </button>
          </div>
        </form>

        {/* Tabel Buku */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-black placeholder-bg-gray-700 text-sm text-left border rounded shadow-md">
            <thead className="bg-emerald-100 text-emerald-800">
              <tr>
                <th className="px-4 py-3 border-b">Judul</th>
                <th className="px-4 py-3 border-b">Penulis</th>
                <th className="px-4 py-3 border-b">Tahun</th>
                <th className="px-4 py-3 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {books.length > 0 ? (
                books.map((book) => (
                  <tr key={book.id} className="hover:bg-emerald-50">
                    <td className="px-4 py-2 border-b">{book.title}</td>
                    <td className="px-4 py-2 border-b">{book.author}</td>
                    <td className="px-4 py-2 border-b">{book.year}</td>
                    <td className="px-4 py-2 border-b text-center space-x-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-full transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book.id!)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full transition"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center px-4 py-6 text-gray-500">
                    Belum ada data buku.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BookPage
