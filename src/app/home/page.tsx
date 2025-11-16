'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LocationScreen from './location/page';
import FamilyScreen from './family/page';
import SearchScreen from './search/page';
import RoutePlanningScreen from './route/page';
import TrendsScreen from './trends/page';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      fetchUser(token);
    }
  }, [router]);

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const screens = [
    <LocationScreen key="location" />,
    <FamilyScreen key="family" />,
    <SearchScreen key="search" />,
    <RoutePlanningScreen key="route" />,
    <TrendsScreen key="trends" />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A5F] to-[#e84850] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Aegis</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setCurrentTab(0)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentTab === 0
                    ? 'bg-[#FF5A5F] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>Crime Map</span>
                </div>
              </button>
              <button
                onClick={() => setCurrentTab(1)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentTab === 1
                    ? 'bg-[#FF5A5F] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Family</span>
                </div>
              </button>
              <button
                onClick={() => setCurrentTab(2)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentTab === 2
                    ? 'bg-[#FF5A5F] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search</span>
                </div>
              </button>
              <button
                onClick={() => setCurrentTab(3)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentTab === 3
                    ? 'bg-[#FF5A5F] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Route</span>
                </div>
              </button>
              <button
                onClick={() => setCurrentTab(4)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentTab === 4
                    ? 'bg-[#FF5A5F] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Trends</span>
                </div>
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Link href="/sos">
                <button className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>SOS</span>
                </button>
              </Link>
              <div className="flex items-center space-x-2 px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:inline text-gray-700 font-medium">{user?.name || 'User'}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {screens[currentTab]}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2 px-2">
          <button
            onClick={() => setCurrentTab(0)}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all ${
              currentTab === 0 ? 'bg-red-50' : ''
            }`}
          >
            <svg
              className={`w-6 h-6 ${currentTab === 0 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}
              fill={currentTab === 0 ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className={`text-xs font-medium ${currentTab === 0 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}>
              Map
            </span>
          </button>

          <button
            onClick={() => setCurrentTab(1)}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all ${
              currentTab === 1 ? 'bg-red-50' : ''
            }`}
          >
            <svg
              className={`w-6 h-6 ${currentTab === 1 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}
              fill={currentTab === 1 ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className={`text-xs font-medium ${currentTab === 1 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}>
              Family
            </span>
          </button>

          <button
            onClick={() => setCurrentTab(2)}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all ${
              currentTab === 2 ? 'bg-red-50' : ''
            }`}
          >
            <svg
              className={`w-6 h-6 ${currentTab === 2 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}
              fill={currentTab === 2 ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className={`text-xs font-medium ${currentTab === 2 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}>
              Search
            </span>
          </button>

          <button
            onClick={() => setCurrentTab(3)}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all ${
              currentTab === 3 ? 'bg-red-50' : ''
            }`}
          >
            <svg
              className={`w-6 h-6 ${currentTab === 3 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}
              fill={currentTab === 3 ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className={`text-xs font-medium ${currentTab === 3 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}>
              Route
            </span>
          </button>

          <button
            onClick={() => setCurrentTab(4)}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all ${
              currentTab === 4 ? 'bg-red-50' : ''
            }`}
          >
            <svg
              className={`w-6 h-6 ${currentTab === 4 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}
              fill={currentTab === 4 ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className={`text-xs font-medium ${currentTab === 4 ? 'text-[#FF5A5F]' : 'text-gray-400'}`}>
              Trends
            </span>
          </button>

          <Link href="/sos">
            <button className="flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-xs font-medium text-red-500">SOS</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
