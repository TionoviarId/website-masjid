'use client'
import React, { useState, useEffect } from 'react';

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

const Page: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [maghribTime, setMaghribTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Calculate prayer times using a simple algorithm for Padang coordinates
  const calculatePrayerTimes = (): PrayerTimes => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const latitude = -0.9471; // Padang latitude
    const longitude = 100.4172; // Padang longitude
    
    // Simple calculation for Maghrib (sunset + 3 minutes)
    // This is a simplified calculation - actual prayer time calculation is more complex
    const timeZoneOffset = 7; // WIB (UTC+7)
    
    // Calculate equation of time and solar declination (simplified)
    const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
    const E = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
    const decl = 23.45 * Math.sin((360 / 365) * (dayOfYear + 284) * (Math.PI / 180));
    
    // Calculate sunset time
    const latRad = latitude * (Math.PI / 180);
    const declRad = decl * (Math.PI / 180);
    const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(declRad));
    const sunsetTime = 12 + (hourAngle * (180 / Math.PI)) / 15 + (longitude - 15 * timeZoneOffset) / 15 + E / 60;
    
    // Maghrib is approximately 3 minutes after sunset
    const maghribDecimal = sunsetTime + 0.05; // 3 minutes = 0.05 hours
    const maghribHour = Math.floor(maghribDecimal);
    const maghribMinute = Math.floor((maghribDecimal - maghribHour) * 60);
    
    // Format times (simplified for other prayers)
    return {
      fajr: '05:30',
      sunrise: '06:45',
      dhuhr: '12:15',
      asr: '15:30',
      maghrib: `${maghribHour.toString().padStart(2, '0')}:${maghribMinute.toString().padStart(2, '0')}`,
      isha: '19:30'
    };
  };

  // Alternative API approach using a CORS proxy or different endpoint
  const getPrayerTimesFromAPI = async (): Promise<string | null> => {
    try {
      // Using Aladhan API which typically has better CORS support
      const today = new Date();
      const dateString = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
      
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${dateString}?city=Padang&country=Indonesia&method=2`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code === 200 && data.data && data.data.timings && data.data.timings.Maghrib) {
        return data.data.timings.Maghrib;
      }
      
      throw new Error('Invalid API response');
    } catch (err) {
      console.error('API Error:', err);
      return null;
    }
  };

  const initializePrayerTime = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      let maghribTimeString: string;
      
      // Try API first
      const apiTime = await getPrayerTimesFromAPI();
      
      if (apiTime) {
        maghribTimeString = apiTime;
        console.log('Successfully got Maghrib time from API:', maghribTimeString);
      } else {
        // Use calculation as fallback
        const calculatedTimes = calculatePrayerTimes();
        maghribTimeString = calculatedTimes.maghrib;
        console.log('Using calculated Maghrib time:', maghribTimeString);
        setError('Menggunakan perhitungan waktu Maghrib untuk Padang');
      }
      
      // Parse time string (handle both HH:MM and HH:MM:SS formats)
      const timeParts = maghribTimeString.split(':');
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      
      const today = new Date();
      const maghribDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0);
      
      // If today's Maghrib time has passed, set for tomorrow
      if (new Date() > maghribDateTime) {
        maghribDateTime.setDate(maghribDateTime.getDate() + 1);
      }
      
      setMaghribTime(maghribDateTime);
      setLoading(false);
      console.log('Maghrib time set for Padang:', maghribDateTime);
      
    } catch (err) {
      console.error('Complete initialization failed:', err);
      
      // Final fallback - use a reasonable default time for Padang
      const fallbackTime = '18:25'; // Average Maghrib time for Padang
      const [hours, minutes] = fallbackTime.split(':').map(Number);
      const today = new Date();
      const maghribDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0);
      
      if (new Date() > maghribDateTime) {
        maghribDateTime.setDate(maghribDateTime.getDate() + 1);
      }
      
      setMaghribTime(maghribDateTime);
      setError('Menggunakan waktu perkiraan Maghrib untuk Padang');
      setLoading(false);
    }
  };

  useEffect(() => {
    initializePrayerTime();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isActive && maghribTime) {
      interval = setInterval(() => {
        const now = new Date();
        const difference = maghribTime.getTime() - now.getTime();
        
        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          setTimeLeft(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
        } else {
          setTimeLeft('00:00:00');
          setIsActive(false);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, maghribTime]);

  const resetTimer = (): void => {
    setIsActive(true);
    initializePrayerTime();
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-teal-400 to-blue-500 flex justify-center min-h-screen items-center">
        <div className="bg-white/90 backdrop-blur-sm w-[600px] justify-center rounded-3xl py-10 shadow-2xl h-96 flex gap-5 flex-col items-center">
          <p className="text-3xl text-teal-700 font-bold">🕌 Mengambil Waktu Maghrib</p>
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="text-lg text-gray-600">Mendapatkan jadwal sholat Padang...</p>
          </div>
          <p className="text-gray-700 text-sm text-center w-10/12">
            Menghubungi API jadwal sholat... 📖
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-teal-400 to-blue-500 flex justify-center min-h-screen items-center">
      <div className="bg-white/90 backdrop-blur-sm w-[600px] justify-center rounded-3xl py-10 shadow-2xl h-auto min-h-96 flex gap-5 flex-col items-center">
        <div className="text-center">
          <p className="text-3xl text-teal-700 font-bold">⏳ Waktu Menuju Berbuka</p>
          <p className="text-sm text-gray-600 mt-1">📍 Padang, Sumatera Barat</p>
        </div>
        
        {error && (
          <div className="bg-amber-50 border border-amber-300 text-amber-700 px-4 py-2 rounded-lg text-sm text-center max-w-md">
            ⚠️ {error}
          </div>
        )}
        
        <div className="flex flex-col items-center gap-3">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg">
            <p className="text-5xl font-extrabold font-mono text-center">{timeLeft}</p>
          </div>
          
          {maghribTime && (
            <p className="text-lg text-gray-700 font-medium">
              🌅 Maghrib: {maghribTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </p>
          )}
          
          {timeLeft === '00:00:00' && (
            <div className="text-center bg-green-50 p-6 rounded-xl border border-green-200">
              <p className="text-2xl text-green-600 font-bold mb-2">🕌 Waktu Maghrib Telah Tiba!</p>
              <p className="text-lg text-gray-700 mb-4">Selamat berbuka puasa! 🤲</p>
              <button 
                onClick={resetTimer}
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg font-medium"
              >
                🔄 Reset Timer
              </button>
            </div>
          )}
        </div>
        
        <div className="text-center max-w-md">
          <p className="text-gray-700 text-lg mb-4">
            Jangan lupa untuk menyiapkan takjil dan berbuka dengan yang manis 🍵🍯
          </p>
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={initializePrayerTime}
              className="text-sm text-teal-600 hover:text-teal-800 underline transition-colors"
            >
              🔄 Refresh Waktu Maghrib
            </button>
            <p className="text-xs text-gray-500">
              Waktu saat ini: {new Date().toLocaleTimeString('id-ID')} WIB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;