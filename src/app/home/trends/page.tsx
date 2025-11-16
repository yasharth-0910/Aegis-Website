'use client';

import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendData {
  month: number;
  severity: number;
  safety: number;
}

interface HourlyData {
  hour: number;
  severity: number;
  safety: number;
}

export default function TrendsScreen() {
  const [selectedArea, setSelectedArea] = useState(1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [monthlyData, setMonthlyData] = useState<TrendData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [yearlyComparison, setYearlyComparison] = useState<{ year: number; avgSafety: number }[]>([]);
  
  const [viewMode, setViewMode] = useState<'monthly' | 'hourly' | 'yearly'>('monthly');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    fetchTrendsData();
  }, [selectedArea, year]);

  const severityToSafety = (severity: number): number => {
    const sMin = 0.7;
    const sMax = 33.5167;
    const scaled = (severity - sMin) / (sMax - sMin);
    const safety = 10 * (1 - scaled);
    return Math.max(0, Math.min(10, safety));
  };

  const fetchTrendsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch monthly trends (12 months)
      const monthlyPromises = Array.from({ length: 12 }, (_, i) => 
        fetch('https://aegis-api-sszj.onrender.com/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Community_Area: selectedArea,
            Month: i + 1,
            Hour: 12,
            Year: year,
          }),
        }).then(res => res.json())
      );

      const monthlyResults = await Promise.all(monthlyPromises);
      const monthlyTrends = monthlyResults.map((data, i) => ({
        month: i + 1,
        severity: parseFloat(data.severity_score),
        safety: severityToSafety(parseFloat(data.severity_score)),
      }));
      setMonthlyData(monthlyTrends);

      // Fetch hourly trends (24 hours)
      const hourlyPromises = Array.from({ length: 24 }, (_, i) => 
        fetch('https://aegis-api-sszj.onrender.com/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Community_Area: selectedArea,
            Month: new Date().getMonth() + 1,
            Hour: i,
            Year: year,
          }),
        }).then(res => res.json())
      );

      const hourlyResults = await Promise.all(hourlyPromises);
      const hourlyTrends = hourlyResults.map((data, i) => ({
        hour: i,
        severity: parseFloat(data.severity_score),
        safety: severityToSafety(parseFloat(data.severity_score)),
      }));
      setHourlyData(hourlyTrends);

      // Fetch yearly comparison (last 5 years)
      const yearlyPromises = Array.from({ length: 5 }, (_, i) => {
        const y = year - 4 + i;
        return fetch('https://aegis-api-sszj.onrender.com/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Community_Area: selectedArea,
            Month: 6,
            Hour: 12,
            Year: y,
          }),
        }).then(res => res.json()).then(data => ({
          year: y,
          avgSafety: severityToSafety(parseFloat(data.severity_score)),
        }));
      });

      const yearlyResults = await Promise.all(yearlyPromises);
      setYearlyComparison(yearlyResults);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch trend data');
    } finally {
      setLoading(false);
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthlyChartData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Safety Score',
        data: monthlyData.map(d => d.safety),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const hourlyChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Safety Score',
        data: hourlyData.map(d => d.safety),
        backgroundColor: hourlyData.map(d => {
          if (d.safety >= 8) return 'rgba(34, 197, 94, 0.8)';
          if (d.safety >= 7.5) return 'rgba(234, 179, 8, 0.8)';
          return 'rgba(239, 68, 68, 0.8)';
        }),
      },
    ],
  };

  const yearlyChartData = {
    labels: yearlyComparison.map(d => d.year.toString()),
    datasets: [
      {
        label: 'Average Safety Score',
        data: yearlyComparison.map(d => d.avgSafety),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: {
          callback: function(value: any) {
            return value.toFixed(1);
          }
        }
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Safety: ${context.parsed.y.toFixed(2)}/10`;
          }
        }
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
      },
    },
  };

  const getSafetyInsights = () => {
    if (monthlyData.length === 0) return null;

    const avgSafety = monthlyData.reduce((sum, d) => sum + d.safety, 0) / monthlyData.length;
    const safestMonth = monthlyData.reduce((max, d) => d.safety > max.safety ? d : max);
    const leastSafeMonth = monthlyData.reduce((min, d) => d.safety < min.safety ? d : min);

    return { avgSafety, safestMonth, leastSafeMonth };
  };

  const getHourlyInsights = () => {
    if (hourlyData.length === 0) return null;

    const safestHour = hourlyData.reduce((max, d) => d.safety > max.safety ? d : max);
    const leastSafeHour = hourlyData.reduce((min, d) => d.safety < min.safety ? d : min);
    const daytimeSafety = hourlyData.filter(d => d.hour >= 6 && d.hour <= 18).reduce((sum, d) => sum + d.safety, 0) / 13;
    const nighttimeSafety = hourlyData.filter(d => d.hour < 6 || d.hour > 18).reduce((sum, d) => sum + d.safety, 0) / 11;

    return { safestHour, leastSafeHour, daytimeSafety, nighttimeSafety };
  };

  const insights = getSafetyInsights();
  const hourlyInsights = getHourlyInsights();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md animate-slide-in">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="flex-shrink-0 hover:bg-red-600 rounded p-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Safety Trends & Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Analyze crime patterns and safety trends over time</p>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Community Area</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              >
                {Array.from({ length: 77 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>Area {n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              >
                {Array.from({ length: new Date().getFullYear() + 10 - 2013 + 1 }, (_, i) => 2013 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">View Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'monthly'
                      ? 'bg-[#FF5A5F] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setViewMode('hourly')}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'hourly'
                      ? 'bg-[#FF5A5F] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Hourly
                </button>
                <button
                  onClick={() => setViewMode('yearly')}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'yearly'
                      ? 'bg-[#FF5A5F] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-md p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF5A5F] mb-4"></div>
              <p className="text-gray-600">Analyzing trends...</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Insights Cards */}
          {viewMode === 'monthly' && insights && (
            <div className="max-w-7xl mx-auto px-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Average Safety</h3>
                    <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold">{insights.avgSafety.toFixed(1)}/10</p>
                  <p className="text-sm opacity-80 mt-1">for {year}</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Safest Month</h3>
                    <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold">{monthNames[insights.safestMonth.month - 1]}</p>
                  <p className="text-sm opacity-80 mt-1">Safety: {insights.safestMonth.safety.toFixed(1)}/10</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Least Safe Month</h3>
                    <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold">{monthNames[insights.leastSafeMonth.month - 1]}</p>
                  <p className="text-sm opacity-80 mt-1">Safety: {insights.leastSafeMonth.safety.toFixed(1)}/10</p>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'hourly' && hourlyInsights && (
            <div className="max-w-7xl mx-auto px-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Safest Hour</h3>
                    <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold">{hourlyInsights.safestHour.hour}:00</p>
                  <p className="text-sm opacity-80 mt-1">Safety: {hourlyInsights.safestHour.safety.toFixed(1)}/10</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Least Safe Hour</h3>
                    <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <p className="text-4xl font-bold">{hourlyInsights.leastSafeHour.hour}:00</p>
                  <p className="text-sm opacity-80 mt-1">Safety: {hourlyInsights.leastSafeHour.safety.toFixed(1)}/10</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Daytime Avg</h3>
                    <span className="text-2xl">☀️</span>
                  </div>
                  <p className="text-4xl font-bold">{hourlyInsights.daytimeSafety.toFixed(1)}/10</p>
                  <p className="text-sm opacity-80 mt-1">6 AM - 6 PM</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Nighttime Avg</h3>
                    <span className="text-2xl">🌙</span>
                  </div>
                  <p className="text-4xl font-bold">{hourlyInsights.nighttimeSafety.toFixed(1)}/10</p>
                  <p className="text-sm opacity-80 mt-1">6 PM - 6 AM</p>
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="max-w-7xl mx-auto px-4 pb-20">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {viewMode === 'monthly' && `Monthly Safety Trends - ${year}`}
                {viewMode === 'hourly' && `24-Hour Safety Analysis - Area ${selectedArea}`}
                {viewMode === 'yearly' && `Year-over-Year Comparison - Area ${selectedArea}`}
              </h3>
              
              <div className="h-96">
                {viewMode === 'monthly' && monthlyData.length > 0 && (
                  <Line data={monthlyChartData} options={chartOptions} />
                )}
                {viewMode === 'hourly' && hourlyData.length > 0 && (
                  <Bar data={hourlyChartData} options={barChartOptions} />
                )}
                {viewMode === 'yearly' && yearlyComparison.length > 0 && (
                  <Line data={yearlyChartData} options={chartOptions} />
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
