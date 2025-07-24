'use client'
import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

function Page() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string>('');

  // Load Goals from Firestore
  const loadGoalsFromFirestore = async () => {
    try {
      const q = query(collection(db, 'ramadhanGoals'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const loadedGoals: Goal[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          text: data.text,
          completed: data.completed,
          createdAt: data.createdAt.toDate(),
        };
      });

      setGoals(loadedGoals);
      console.log('Goals loaded from Firestore:', loadedGoals.length);
    } catch (error) {
      console.error('Error loading goals from Firestore:', error);
      setFirebaseError('Gagal memuat data dari Firebase');
      loadDefaultGoals();
    }
  };

  // Load default goals (offline mode)
  const loadDefaultGoals = () => {
    const initialGoals: Goal[] = [
      {
        id: 'default-1',
        text: 'Tadarus 1 juz setiap hari',
        completed: false,
        createdAt: new Date(),
      },
      {
        id: 'default-2',
        text: 'Sholat Tarawih di masjid',
        completed: true,
        createdAt: new Date(),
      },
    ];
    setGoals(initialGoals);
  };

  useEffect(() => {
    loadGoalsFromFirestore();
  }, []);

  // Add Goal
  const addGoal = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);

    try {
      const newGoal = {
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'ramadhanGoals'), {
        ...newGoal,
        createdAt: Timestamp.fromDate(newGoal.createdAt),
      });

      setGoals((prev) => [{ ...newGoal, id: docRef.id }, ...prev]);
      setInputValue('');
      setFirebaseError('');
      console.log('Goal added with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding goal:', error);
      setFirebaseError('Gagal menambah goal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Update Goal
  const updateGoalInFirestore = async (id: string, updates: Partial<Goal>) => {
    try {
      const goalRef = doc(db, 'ramadhanGoals', id);
      await updateDoc(goalRef, updates);
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
      );
      console.log('Goal updated:', id);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const toggleGoal = async (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    try {
      await updateGoalInFirestore(id, { completed: !goal.completed });
    } catch {
      setFirebaseError('Gagal update status goal.');
    }
  };

  // Delete Goal
  const deleteGoalFromFirestore = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ramadhanGoals', id));
      setGoals((prev) => prev.filter((g) => g.id !== id));
      console.log('Goal deleted:', id);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await deleteGoalFromFirestore(id);
    } catch {
      setFirebaseError('Gagal menghapus goal.');
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addGoal();
    }
  };

  // Progress
  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full bg-gradient-to-br from-teal-400 to-blue-500 flex justify-center min-h-screen items-center p-4">
      <div className="bg-white/90 backdrop-blur-sm w-full max-w-2xl rounded-3xl py-8 px-6 shadow-2xl min-h-96">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-2xl text-teal-700 font-extrabold mb-2">
            🎯 Ramadhan Goals: Catatan Amal & Aktivitas
          </p>
          <div className="bg-teal-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-teal-700">
              📊 Progress: <span className="font-bold">{completedCount}/{totalCount}</span> goals completed
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {firebaseError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-700 text-sm">{firebaseError}</p>
              <button
                onClick={() => setFirebaseError('')}
                className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                title="Tutup pesan error"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="flex w-full mb-6 gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="p-3 flex-1 border text-gray-700 border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Contoh: Tadarus 1 juz, Sholat Dhuha, Sedekah harian..."
            disabled={loading}
          />
          <button
            onClick={addGoal}
            disabled={loading || !inputValue.trim()}
            className="text-white rounded-lg px-6 py-3 font-bold bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? '⏳' : '➕ Tambah'}
          </button>
        </div>

        {/* Goals List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">📝 Belum ada goals yang ditambahkan</p>
              <p className="text-sm">Mulai tambahkan target ibadah dan aktivitas Ramadhan Anda!</p>
            </div>
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  goal.completed
                    ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                    : 'bg-white border-gray-200 shadow-md hover:shadow-lg'
                }`}
              >
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    goal.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-gray-300 hover:border-teal-500'
                  }`}
                >
                  {goal.completed && '✓'}
                </button>

                <span
                  className={`flex-1 transition-all duration-200 ${
                    goal.completed
                      ? 'text-emerald-700 line-through opacity-75'
                      : 'text-gray-800'
                  }`}
                >
                  {goal.text}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {goal.createdAt.toLocaleDateString('id-ID')}
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-400 hover:text-red-600 transition-colors duration-200 p-1"
                    title="Hapus goal"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        {goals.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>🎯 Total Goals: {totalCount}</span>
              <span>✅ Completed: {completedCount}</span>
              <span>⏳ Remaining: {totalCount - completedCount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;