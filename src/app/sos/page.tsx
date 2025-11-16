'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SOSPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'Police', number: '911', icon: '🚓' },
    { name: 'Fire Department', number: '911', icon: '🚒' },
    { name: 'Ambulance', number: '911', icon: '🚑' },
  ]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      sendSOSAlert();
    }
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(5);
  };

  const cancelCountdown = () => {
    setCountdown(null);
  };

  const sendSOSAlert = async () => {
    setSending(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/sos/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          location,
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        alert('SOS Alert sent to all emergency contacts!');
      } else {
        alert('Failed to send SOS alert. Please call emergency services directly.');
      }
    } catch (error) {
      alert('Failed to send SOS alert. Please call emergency services directly.');
    } finally {
      setSending(false);
      setCountdown(null);
    }
  };

  const callEmergency = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 pb-20">
      {/* Header */}
      <div className="bg-red-700/50 backdrop-blur-sm p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <Link href="/home">
            <button className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
          <h1 className="text-white text-xl font-bold">Emergency SOS</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* SOS Button */}
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        {countdown === null ? (
          <div className="text-center">
            <button
              onClick={startCountdown}
              disabled={sending}
              className="w-64 h-64 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center hover:scale-105 transition-transform active:scale-95 relative overflow-hidden"
            >
              {/* Pulsing animation */}
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25"></div>
              
              <svg className="w-32 h-32 text-red-600 mb-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-red-600 text-3xl font-bold relative z-10">SOS</span>
              <span className="text-gray-600 text-sm mt-2 relative z-10">Press & Hold</span>
            </button>
            
            <p className="text-white text-center mt-8 max-w-md">
              Press the SOS button to alert your emergency contacts and share your location
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-64 h-64 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center relative">
              {/* Progress circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="#fee2e2"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="#ef4444"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (countdown / 5)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              
              <div className="relative z-10">
                <div className="text-red-600 text-7xl font-bold mb-2">{countdown}</div>
                <span className="text-gray-600 text-lg">Sending SOS...</span>
              </div>
            </div>
            
            <button
              onClick={cancelCountdown}
              className="mt-8 bg-white px-8 py-4 rounded-full text-red-600 font-semibold text-lg hover:shadow-xl transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="px-6 pb-6">
        <h2 className="text-white text-xl font-bold mb-4">Quick Dial</h2>
        <div className="space-y-3">
          {emergencyContacts.map((contact, index) => (
            <button
              key={index}
              onClick={() => callEmergency(contact.number)}
              className="w-full bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{contact.icon}</div>
                <div className="text-left">
                  <h3 className="text-white font-semibold">{contact.name}</h3>
                  <p className="text-gray-300 text-sm">{contact.number}</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          ))}
        </div>

        {/* Location Info */}
        {location && (
          <div className="mt-6 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-2">Your Current Location</h3>
            <p className="text-gray-300 text-sm">
              Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              This location will be shared with emergency contacts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
