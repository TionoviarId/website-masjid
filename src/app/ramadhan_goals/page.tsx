'use client'
import React, { useState, useEffect } from 'react';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCurarGPJ7bJH7XUQn6_VzIu0ITEn5SgkE",
  authDomain: "website-masjid-16e5b.firebaseapp.com",
  projectId: "website-masjid-16e5b",
  storageBucket: "website-masjid-16e5b.firebasestorage.app",
  messagingSenderId: "713268684394",
  appId: "1:713268684394:web:b90ccf8401f68deff54c13",
  measurementId: "G-XX2P2XT005"
};

function Page() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string>('');
  const [db, setDb] = useState<any>(null);

  // Initialize Firebase
  const initFirebase = async () => {
    try {
      // Initialize Firebase (using CDN approach for artifact compatibility)
      const firebaseScript = document.createElement('script');
      firebaseScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
      document.head.appendChild(firebaseScript);

      const firestoreScript = document.createElement('script');
      firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js';
      document.head.appendChild(firestoreScript);

      await new Promise((resolve) => {
        firestoreScript.onload = resolve;
      });

      // Initialize Firebase app
      if (!(window as any).firebase.apps.length) {
        (window as any).firebase.initializeApp(firebaseConfig);
      }

      const firestore = (window as any).firebase.firestore();
      setDb(firestore);
      
      console.log('Firebase initialized successfully');
      setFirebaseError('');
      await loadGoalsFromFirestore(firestore);

    } catch (error) {
      console.error('Firebase initialization error:', error);
      setFirebaseError('Gagal terhubung ke Firebase. Menggunakan mode offline.');
      loadDefaultGoals();
    }
  };

  const loadGoalsFromFirestore = async (firestore: any) => {
    try {
      const goalsCollection = firestore.collection('ramadhanGoals');
      const snapshot = await goalsCollection.orderBy('createdAt', 'desc').get();
      
      const loadedGoals: Goal[] = [];
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        loadedGoals.push({
          id: doc.id,
          text: data.text,
          completed: data.completed,
          createdAt: data.createdAt.toDate()
        });
      });
      
      setGoals(loadedGoals);
      console.log('Goals loaded from Firestore:', loadedGoals.length);
      
    } catch (error) {
      console.error('Error loading goals from Firestore:', error);
      setFirebaseError('Gagal memuat data dari Firebase');
      loadDefaultGoals();
    }
  };

  const loadDefaultGoals = () => {
    const initialGoals: Goal[] = [
      {
        id: 'default-1',
        text: 'Tadarus 1 juz setiap hari',
        completed: false,
        createdAt: new Date()
      },
      {
        id: 'default-2', 
        text: 'Sholat Tarawih di masjid',
        completed: true,
        createdAt: new Date()
      }
    ];
    setGoals(initialGoals);
  };

  useEffect(() => {
    initFirebase();
  }, []);

  const addGoalToFirestore = async (newGoal: Omit<Goal, 'id'>) => {
    if (!db) throw new Error('Firebase not initialized');
    
    try {
      const goalsCollection = db.collection('ramadhanGoals');
      const docRef = await goalsCollection.add({
        text: newGoal.text,
        completed: newGoal.completed,
        createdAt: (window as any).firebase.firestore.Timestamp.fromDate(newGoal.createdAt)
      });
      
      const goalWithId = { ...newGoal, id: docRef.id };
      setGoals(prevGoals => [goalWithId, ...prevGoals]);
      
      console.log('Goal added to Firestore with ID:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('Error adding goal to Firestore:', error);
      throw error;
    }
  };

  const addGoal = async () => {
    if (!inputValue.trim()) return;
    
    setLoading(true);
    
    try {
      const newGoal = {
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date()
      };
      
      await addGoalToFirestore(newGoal);
      setInputValue('');
      setFirebaseError('');
      
    } catch (error) {
      console.error('Error adding goal:', error);
      setFirebaseError('Gagal menambah goal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const updateGoalInFirestore = async (id: string, updates: Partial<Goal>) => {
    if (!db) throw new Error('Firebase not initialized');
    
    try {
      const goalDoc = db.collection('ramadhanGoals').doc(id);
      await goalDoc.update(updates);
      
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === id ? { ...goal, ...updates } : goal
        )
      );
      
      console.log('Goal updated in Firestore:', id);
      
    } catch (error) {
      console.error('Error updating goal in Firestore:', error);
      throw error;
    }
  };

  const toggleGoal = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    
    try {
      await updateGoalInFirestore(id, { completed: !goal.completed });
      setFirebaseError('');
    } catch (error) {
      setFirebaseError('Gagal update status goal.');
    }
  };

  const deleteGoalFromFirestore = async (id: string) => {
    if (!db) throw new Error('Firebase not initialized');
    
    try {
      await db.collection('ramadhanGoals').doc(id).delete();
      
      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
      
      console.log('Goal deleted from Firestore:', id);
      
    } catch (error) {
      console.error('Error deleting goal from Firestore:', error);
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await deleteGoalFromFirestore(id);
      setFirebaseError('');
    } catch (error) {
      setFirebaseError('Gagal menghapus goal.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addGoal();
    }
  };

  const completedCount = goals.filter(goal => goal.completed).length;
  const totalCount = goals.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full bg-gradient-to-br from-teal-400 to-blue-500 flex justify-center min-h-screen items-center p-4">
      <div className='bg-white/90 backdrop-blur-sm w-full max-w-2xl rounded-3xl py-8 px-6 shadow-2xl min-h-96'>
        
        {/* Header */}
        <div className="text-center mb-6">
          <p className='text-2xl text-teal-700 font-extrabold mb-2'>
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

        {/* Input Section */}
        <div className='flex w-full mb-6 gap-2'>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className='p-3 flex-1 border text-gray-700 border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent' 
            placeholder='Contoh: Tadarus 1 juz, Sholat Dhuha, Sedekah harian...' 
            disabled={loading || !db}
          />
          <button 
            onClick={addGoal}
            disabled={loading || !inputValue.trim() || !db}
            className='text-white rounded-lg px-6 py-3 font-bold bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl'
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
                  disabled={!db}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 disabled:opacity-50 ${
                    goal.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-gray-300 hover:border-teal-500'
                  }`}
                >
                  {goal.completed && '✓'}
                </button>
                
                <span className={`flex-1 transition-all duration-200 ${
                  goal.completed 
                    ? 'text-emerald-700 line-through opacity-75' 
                    : 'text-gray-800'
                }`}>
                  {goal.text}
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {goal.createdAt.toLocaleDateString('id-ID')}
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    disabled={!db}
                    className="text-red-400 hover:text-red-600 transition-colors duration-200 p-1 disabled:opacity-50"
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