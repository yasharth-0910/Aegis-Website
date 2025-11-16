'use client';

import { useState, useEffect, useRef } from 'react';

interface Community {
  id: string;
  areaNumber: number;
  severity: number | null;
  safety: number | null;
  color: string;
  path: string;
  bounds?: { x: number; y: number; width: number; height: number };
}

export default function LocationScreen() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [month, setMonth] = useState(7);
  const [hour, setHour] = useState(20);
  const [year, setYear] = useState(2022);
  const [loading, setLoading] = useState(true);
  const [fetchingScores, setFetchingScores] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadSvgAndFetch();
  }, []);

  useEffect(() => {
    if (communities.length > 0) {
      fetchSeverityForAll();
    }
  }, [month, hour, year]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadSvgAndFetch = async () => {
    try {
      const response = await fetch('/chicago_communities.svg');
      
      if (!response.ok) {
        throw new Error('Failed to load Chicago map. Please refresh the page.');
      }
      
      const svgText = await response.text();
      
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      
      const parsedCommunities: Community[] = [];
      
      // Parse grouped paths
      svgDoc.querySelectorAll('g[id^="community_"]').forEach((gEl) => {
        const id = gEl.getAttribute('id');
        if (!id) return;
        
        const areaNumber = parseInt(id.replace('community_', ''));
        const paths: string[] = [];
        
        gEl.querySelectorAll('path').forEach((pathEl) => {
          const d = pathEl.getAttribute('d');
          const fill = pathEl.getAttribute('fill');
          const stroke = pathEl.getAttribute('stroke');
          
          const isStrokeOnly = (!fill || fill === 'none') && stroke;
          if (d && !isStrokeOnly) {
            paths.push(d);
          }
        });
        
        if (paths.length > 0) {
          parsedCommunities.push({
            id,
            areaNumber,
            path: paths.join(' '),
            severity: null,
            safety: null,
            color: '#9e9e9e',
          });
        }
      });
      
      // Parse standalone paths
      svgDoc.querySelectorAll('path[id^="community_"]').forEach((pathEl) => {
        const id = pathEl.getAttribute('id');
        const d = pathEl.getAttribute('d');
        if (!id || !d) return;
        
        const fill = pathEl.getAttribute('fill');
        const stroke = pathEl.getAttribute('stroke');
        const isStrokeOnly = (!fill || fill === 'none') && stroke;
        
        if (isStrokeOnly) return;
        
        if (!parsedCommunities.some((c) => c.id === id)) {
          const areaNumber = parseInt(id.replace('community_', ''));
          parsedCommunities.push({
            id,
            areaNumber,
            path: d,
            severity: null,
            safety: null,
            color: '#9e9e9e',
          });
        }
      });
      
      if (parsedCommunities.length === 0) {
        throw new Error('No community areas found in map data.');
      }
      
      setCommunities(parsedCommunities);
      setLoading(false);
      
      // Fetch scores after setting communities
      fetchScoresForCommunities(parsedCommunities);
    } catch (error: any) {
      console.error('Error loading SVG:', error);
      setError(error.message || 'Failed to load map data');
      setLoading(false);
    }
  };

  const fetchScoresForCommunities = async (communitiesToFetch: Community[]) => {
    setFetchingScores(true);
    const apiUrl = 'https://aegis-api-sszj.onrender.com/predict';
    
    try {
      const updatedCommunities = await Promise.all(
        communitiesToFetch.map(async (community) => {
          try {
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                Community_Area: community.areaNumber,
                Month: month,
                Hour: hour,
                Year: year,
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              const severity = parseFloat(data.severity_score);
              const safety = severityToSafety(severity);
              const color = safetyToColor(safety);
              
              return { ...community, severity, safety, color };
            } else {
              console.error(`API error for area ${community.areaNumber}:`, response.status);
              return community;
            }
          } catch (error) {
            console.error(`Error fetching data for area ${community.areaNumber}:`, error);
            return community;
          }
        })
      );
      
      setCommunities(updatedCommunities);
    } catch (error: any) {
      setError('Failed to fetch crime data from server. Showing default colors.');
      console.error('Error fetching scores:', error);
    } finally {
      setFetchingScores(false);
    }
  };

  const fetchSeverityForAll = () => {
    if (communities.length > 0) {
      fetchScoresForCommunities(communities);
    }
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
    let t = ((safety - minSafe) / (maxSafe - minSafe));
    t = Math.max(0, Math.min(1, t));
    
    const k = 10.0;
    const center = 0.5;
    t = 1 / (1 + Math.exp(-k * (t - center)));
    
    const hue = t * 120.0;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const getSafetyDescription = (safety: number): string => {
    if (safety >= 8.1) return 'Extremely Safe 💚';
    if (safety >= 7.9) return 'Very Safe ✅';
    if (safety >= 7.8) return 'Safe 🟢';
    if (safety >= 7.6) return 'Moderately Safe ⚠️';
    if (safety >= 7.4) return 'Slightly Unsafe 🔶';
    if (safety >= 7.2) return 'Unsafe 🔴';
    return 'Very Unsafe 🚨';
  };

  const handleCommunityClick = async (community: Community) => {
    // If already has data, show immediately
    if (community.severity !== null && community.safety !== null) {
      setSelectedCommunity(community);
      setShowDetails(true);
      return;
    }

    // Otherwise fetch data for this specific community
    setSelectedCommunity({ ...community, severity: null, safety: null });
    setShowDetails(true);

    try {
      const apiUrl = 'https://aegis-api-sszj.onrender.com/predict';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Community_Area: community.areaNumber,
          Month: month,
          Hour: hour,
          Year: year,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const severity = parseFloat(data.severity_score);
        const safety = severityToSafety(severity);
        const color = safetyToColor(safety);

        const updatedCommunity = { ...community, severity, safety, color };
        setSelectedCommunity(updatedCommunity);

        // Update in communities array
        setCommunities((prev) =>
          prev.map((c) => (c.id === community.id ? updatedCommunity : c))
        );
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error fetching community data:', error);
      setError(`Failed to load data for area ${community.areaNumber}`);
      setShowDetails(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Aegis — Heatzones</h1>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-sm font-semibold text-gray-700">
          Heatzone Mapping: 🟢 Safe → 🔴 Unsafe
        </p>
      </div>

      {/* Controls Card */}
      <div className="max-w-7xl mx-auto px-4 mb-4">
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Month */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Hour */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Hour: {hour}
              </label>
              <input
                type="range"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF5A5F]"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Year</label>
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
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : fetchingScores ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
                <p className="text-gray-600">Fetching crime data...</p>
              </div>
            </div>
          ) : (
            <svg
              ref={svgRef}
              viewBox="0 0 1000 1200"
              className="w-full h-auto"
              style={{ minHeight: '500px' }}
            >
              {communities.map((community) => (
                <path
                  key={community.id}
                  d={community.path}
                  fill={community.color}
                  stroke="#ffffff"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleCommunityClick(community)}
                />
              ))}
            </svg>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedCommunity && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setShowDetails(false)}>
          <div 
            className="bg-white rounded-t-3xl w-full max-w-2xl p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Community {selectedCommunity.areaNumber}
              </h3>
              <div 
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{ 
                  backgroundColor: selectedCommunity.color + '20',
                  color: selectedCommunity.color 
                }}
              >
                {selectedCommunity.safety !== null
                  ? `Safety: ${selectedCommunity.safety.toFixed(2)} / 10`
                  : 'Loading...'}
              </div>
            </div>

            {selectedCommunity.severity !== null ? (
              <>
                <p className="text-gray-700 mb-2">
                  Severity Score: {selectedCommunity.severity.toFixed(3)}
                </p>
                {selectedCommunity.safety !== null && (
                  <p className="font-semibold mb-4" style={{ color: selectedCommunity.color }}>
                    {getSafetyDescription(selectedCommunity.safety)}
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF5A5F] mx-auto mb-3"></div>
                  <p className="text-gray-600">Loading crime data...</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowDetails(false)}
              className="w-full bg-red-400 text-white py-3 rounded-xl font-semibold hover:bg-red-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
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
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
