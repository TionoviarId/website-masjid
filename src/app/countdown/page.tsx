'use client';
import React, { useEffect, useState } from 'react';
import { Clock, Sunset, RefreshCw } from 'lucide-react';

const MaghribCountdown = () => {
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const [maghribTime, setMaghribTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMaghribTime = async () => {
    try {
      setLoading(true);
      setError('');
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      const res = await fetch(`/api/prayertime?date=${dateString}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const maghribStr = data?.data?.timings?.Maghrib || '18:00';
      const [hour, minute] = maghribStr.split(':').map(Number);

      const maghribDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute, 0);
      if (new Date() > maghribDate) {
        maghribDate.setDate(maghribDate.getDate() + 1);
      }
      setMaghribTime(maghribDate);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil waktu Maghrib');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaghribTime();
  }, []);

  useEffect(() => {
    if (!maghribTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = maghribTime.getTime() - now.getTime();

      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      } else {
        clearInterval(timer);
        fetchMaghribTime();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [maghribTime]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br w-full from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl text-center text-white animate-pulse">
        <Clock className="w-10 h-10 mx-auto mb-3" />
        <p className="text-lg">Mengambil waktu Maghrib...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 rounded-3xl shadow-2xl p-[2px] mx-auto ">
      <div className="bg-white/90 max-w-md mx-auto  backdrop-blur-md rounded-3xl p-8 text-center">
        <div className="flex justify-center items-center gap-3 mb-6">
          <Sunset className="w-10 h-10 text-amber-500 drop-shadow" />
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-wide">
            Countdown Maghrib
          </h2>
        </div>

        {error && (
          <div className="bg-amber-100 border border-amber-300 text-amber-700 px-3 py-2 rounded-lg text-sm mb-4 shadow">
            ⚠️ {error}
          </div>
        )}

        <div className="relative">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 shadow-lg">
            <p className="text-5xl font-extrabold text-white font-mono drop-shadow-lg">
              {timeLeft}
            </p>
          </div>
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-emerald-400 animate-ping"></div>
        </div>

        {maghribTime && (
          <p className="text-gray-700 text-lg mt-6">
            🌅 Maghrib:{" "}
            <span className="font-semibold text-gray-900">
              {maghribTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </span>
          </p>
        )}

        <button
          onClick={fetchMaghribTime}
          className="mt-6 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>
    </div>
  );
};

export default MaghribCountdown;
