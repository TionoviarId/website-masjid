'use client'
import React, { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import { Upload, Edit, Trash2, Eye, Plus } from 'lucide-react'
import Image from 'next/image'

interface Foto {
  id: string
  judul: string
  imageUrl: string
  timestamp: any
}

const PustakaUNPPage = () => {
  const [fotoList, setFotoList] = useState<Foto[]>([])
  const [judul, setJudul] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  const fetchData = async () => {
    const q = query(collection(db, 'pustakaUNP'), orderBy('timestamp', 'desc'))
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Foto[]
    setFotoList(data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async () => {
    if (!judul || !imageUrl) return
    if (editId) {
      await updateDoc(doc(db, 'pustakaUNP', editId), { judul, imageUrl })
      setEditId(null)
    } else {
      await addDoc(collection(db, 'pustakaUNP'), {
        judul,
        imageUrl,
        timestamp: Timestamp.now()
      })
    }
    setJudul('')
    setImageUrl('')
    fetchData()
  }

  const handleEdit = (foto: Foto) => {
    setEditId(foto.id)
    setJudul(foto.judul)
    setImageUrl(foto.imageUrl)
  }

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'pustakaUNP', id))
    fetchData()
  }

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <h1 className="text-3xl font-bold text-red-800 mb-6">📸 Galeri Pustaka UNP</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-red-200">
        <h2 className="text-lg font-semibold mb-2 text-red-700">Tambah / Edit Foto</h2>
        <input
          type="text"
          placeholder="Judul Foto"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          className="w-full p-2 mb-2 border border-red-200 rounded"
        />
        <input
          type="text"
          placeholder="URL Gambar"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full p-2 mb-4 border border-red-200 rounded"
        />
        <button
          onClick={handleSubmit}
          className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 flex items-center gap-2"
        >
          <Upload size={16} />
          {editId ? 'Update Foto' : 'Tambah Foto'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {fotoList.map((foto) => (
          <div key={foto.id} className="bg-white border border-red-200 rounded-lg shadow overflow-hidden">
            <img src={foto.imageUrl} alt={foto.judul} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-red-800">{foto.judul}</h3>
              <div className="flex gap-3 mt-2">
                <button onClick={() => window.open(foto.imageUrl)} className="text-blue-500 hover:underline">
                  <Eye size={16} />
                </button>
                <button onClick={() => handleEdit(foto)} className="text-yellow-500 hover:underline">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(foto.id)} className="text-red-600 hover:underline">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PustakaUNPPage
