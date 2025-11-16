'use client';

import { useState, useEffect } from 'react';

interface CSVData {
  Community_Area: number;
  Year: number;
  Month: number;
  Total_Arrests: number;
  Total_Domestic_Crimes: number;
  Total_Crimes: number;
  Percentage_Domestic: number;
  Primary_Crime1: string;
  Primary_Crime2: string;
  Primary_Crime3: string;
  Location1: string;
  Location2: string;
  Location3: string;
}

export default function SearchScreen() {
  // API Comparison
  const [areaA, setAreaA] = useState(1);
  const [areaB, setAreaB] = useState(2);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [hour, setHour] = useState(new Date().getHours());
  const [year, setYear] = useState(new Date().getFullYear());

  // API Results
  const [severityA, setSeverityA] = useState<number | null>(null);
  const [safetyA, setSafetyA] = useState<number | null>(null);
  const [severityB, setSeverityB] = useState<number | null>(null);
  const [safetyB, setSafetyB] = useState<number | null>(null);

  const [colorA, setColorA] = useState('#9e9e9e');
  const [colorB, setColorB] = useState('#9e9e9e');

  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // CSV Data
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [csvYearA, setCsvYearA] = useState(2022);
  const [csvMonthA, setCsvMonthA] = useState(1);
  const [csvYearB, setCsvYearB] = useState(2022);
  const [csvMonthB, setCsvMonthB] = useState(1);
  const [csvA, setCsvA] = useState<CSVData | null>(null);
  const [csvB, setCsvB] = useState<CSVData | null>(null);

  useEffect(() => {
    fetchBoth();
  }, [areaA, areaB, month, hour, year]);

  useEffect(() => {
    loadCSVData();
  }, []);

  useEffect(() => {
    if (csvData.length > 0) {
      fetchCsvData();
    }
  }, [csvData, areaA, areaB, csvYearA, csvMonthA, csvYearB, csvMonthB]);

  const loadCSVData = async () => {
    try {
      const response = await fetch('/chicago_stats.csv');
      const text = await response.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const parsed: CSVData[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',');
        
        parsed.push({
          Community_Area: parseInt(values[0]),
          Year: parseInt(values[1]),
          Month: parseInt(values[2]),
          Total_Arrests: parseInt(values[3]),
          Total_Domestic_Crimes: parseInt(values[4]),
          Total_Crimes: parseInt(values[5]),
          Percentage_Domestic: parseFloat(values[6]),
          Primary_Crime1: values[7],
          Primary_Crime2: values[8],
          Primary_Crime3: values[9],
          Location1: values[10],
          Location2: values[11],
          Location3: values[12],
        });
      }
      
      setCsvData(parsed);
    } catch (error) {
      console.error('Error loading CSV:', error);
    }
  };

  const fetchCsvData = () => {
    const dataA = csvData.find(
      (d) => d.Community_Area === areaA && d.Year === csvYearA && d.Month === csvMonthA
    );
    const dataB = csvData.find(
      (d) => d.Community_Area === areaB && d.Year === csvYearB && d.Month === csvMonthB
    );
    
    setCsvA(dataA || null);
    setCsvB(dataB || null);
  };

  const fetchBoth = async () => {
    await Promise.all([fetchForA(), fetchForB()]);
  };

  const fetchForA = async () => {
    setLoadingA(true);
    try {
      const sev = await fetchSeverity(areaA, month, hour, year);
      setSeverityA(sev);
      const safety = severityToSafety(sev);
      setSafetyA(safety);
      setColorA(safetyToColor(safety));
    } catch (error) {
      console.error('Error fetching area A:', error);
    } finally {
      setLoadingA(false);
    }
  };

  const fetchForB = async () => {
    setLoadingB(true);
    try {
      const sev = await fetchSeverity(areaB, month, hour, year);
      setSeverityB(sev);
      const safety = severityToSafety(sev);
      setSafetyB(safety);
      setColorB(safetyToColor(safety));
    } catch (error) {
      console.error('Error fetching area B:', error);
    } finally {
      setLoadingB(false);
    }
  };

  const fetchSeverity = async (
    area: number,
    month: number,
    hour: number,
    year: number
  ): Promise<number> => {
    const response = await fetch('https://aegis-api-sszj.onrender.com/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Community_Area: area,
        Month: month,
        Hour: hour,
        Year: year,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return parseFloat(data.severity_score);
    }
    throw new Error('API Error');
  };

  const severityToSafety = (severity: number): number => {
    const sMin = 0.7;
    const sMax = 33.5167;
    const scaled = (severity - sMin) / (sMax - sMin);
    const safety = 10 * (1 - scaled);
    return Math.max(0, Math.min(10, safety));
  };

  const safetyToColor = (safety: number): string => {
    const minSafe = 7.0;
    const maxSafe = 8.0;
    let t = (safety - minSafe) / (maxSafe - minSafe);
    t = Math.max(0, Math.min(1, t));

    const k = 10.0;
    const center = 0.5;
    t = 1 / (1 + Math.exp(-k * (t - center)));

    const hue = t * 120.0;
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Compare Areas</h1>
        </div>
      </div>

      {/* Real-Time API Comparison */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Real-Time Comparison</h2>
        
        {/* Time Controls */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F]"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Hour: {hour}</label>
              <input
                type="range"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value))}
                className="w-full accent-[#FF5A5F]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F]"
              >
                {Array.from({ length: 10 }, (_, i) => 2015 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Area Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Area A */}
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Area A</h3>
              <select
                value={areaA}
                onChange={(e) => setAreaA(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F]"
              >
                {Array.from({ length: 77 }, (_, i) => i + 1).map((a) => (
                  <option key={a} value={a}>Area {a}</option>
                ))}
              </select>
            </div>

            {loadingA ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5A5F] mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: colorA + '20' }}
                >
                  <p className="text-sm font-semibold" style={{ color: colorA }}>
                    Safety: {safetyA?.toFixed(2)} / 10
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-700">
                    Severity: {severityA?.toFixed(3)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Area B */}
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Area B</h3>
              <select
                value={areaB}
                onChange={(e) => setAreaB(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F]"
              >
                {Array.from({ length: 77 }, (_, i) => i + 1).map((a) => (
                  <option key={a} value={a}>Area {a}</option>
                ))}
              </select>
            </div>

            {loadingB ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5A5F] mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: colorB + '20' }}
                >
                  <p className="text-sm font-semibold" style={{ color: colorB }}>
                    Safety: {safetyB?.toFixed(2)} / 10
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-700">
                    Severity: {severityB?.toFixed(3)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical CSV Data Comparison */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Historical Data Comparison</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* CSV Area A */}
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Area {areaA} Historical</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <select
                value={csvYearA}
                onChange={(e) => setCsvYearA(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {Array.from({ length: 10 }, (_, i) => 2015 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={csvMonthA}
                onChange={(e) => setCsvMonthA(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>Month {m}</option>
                ))}
              </select>
            </div>

            {csvA ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-red-50 rounded">
                  <span className="font-semibold">Total Crimes:</span>
                  <span className="text-red-700 font-bold">{csvA.Total_Crimes}</span>
                </div>
                <div className="flex justify-between p-2 bg-orange-50 rounded">
                  <span className="font-semibold">Total Arrests:</span>
                  <span className="text-orange-700 font-bold">{csvA.Total_Arrests}</span>
                </div>
                <div className="flex justify-between p-2 bg-purple-50 rounded">
                  <span className="font-semibold">Domestic Crimes:</span>
                  <span className="text-purple-700 font-bold">{csvA.Total_Domestic_Crimes}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded mt-3">
                  <p className="font-semibold mb-1">Top Crimes:</p>
                  <p className="text-xs">1. {csvA.Primary_Crime1}</p>
                  <p className="text-xs">2. {csvA.Primary_Crime2}</p>
                  <p className="text-xs">3. {csvA.Primary_Crime3}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>

          {/* CSV Area B */}
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Area {areaB} Historical</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <select
                value={csvYearB}
                onChange={(e) => setCsvYearB(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {Array.from({ length: 10 }, (_, i) => 2015 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={csvMonthB}
                onChange={(e) => setCsvMonthB(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>Month {m}</option>
                ))}
              </select>
            </div>

            {csvB ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-red-50 rounded">
                  <span className="font-semibold">Total Crimes:</span>
                  <span className="text-red-700 font-bold">{csvB.Total_Crimes}</span>
                </div>
                <div className="flex justify-between p-2 bg-orange-50 rounded">
                  <span className="font-semibold">Total Arrests:</span>
                  <span className="text-orange-700 font-bold">{csvB.Total_Arrests}</span>
                </div>
                <div className="flex justify-between p-2 bg-purple-50 rounded">
                  <span className="font-semibold">Domestic Crimes:</span>
                  <span className="text-purple-700 font-bold">{csvB.Total_Domestic_Crimes}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded mt-3">
                  <p className="font-semibold mb-1">Top Crimes:</p>
                  <p className="text-xs">1. {csvB.Primary_Crime1}</p>
                  <p className="text-xs">2. {csvB.Primary_Crime2}</p>
                  <p className="text-xs">3. {csvB.Primary_Crime3}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
