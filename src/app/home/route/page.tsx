'use client';

import { useState, useEffect, useRef } from 'react';

interface RoutePoint {
  areaNumber: number;
  name: string;
  severity: number | null;
  safety: number | null;
  color: string;
  distance: number;
}

interface RouteOption {
  id: number;
  name: string;
  points: RoutePoint[];
  totalDistance: number;
  avgSafety: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface Community {
  id: string;
  areaNumber: number;
  path: string;
  color: string;
}

// Chicago Community Area Adjacency Map (based on official Chicago map)
// This represents which community areas share borders and are directly connected
const COMMUNITY_NEIGHBORS: Record<number, number[]> = {
  1: [2, 77],
  2: [1, 3, 76, 77],
  3: [2, 4, 77],
  4: [3, 13, 14, 77],
  5: [6, 7, 21],
  6: [3, 5, 7, 21, 22],
  7: [5, 6, 21, 22],
  8: [24, 28, 32, 33],
  9: [10, 11],
  10: [9, 11, 12, 13, 14],
  11: [9, 10, 27, 28, 29],
  12: [10, 13, 14, 15, 16, 17],
  13: [4, 10, 12, 14],
  14: [4, 10, 12, 13, 15, 16],
  15: [12, 14, 16, 17],
  16: [12, 14, 15, 17, 18, 19, 20],
  17: [12, 15, 16, 18],
  18: [16, 17, 19, 25],
  19: [16, 18, 20, 25],
  20: [16, 19, 21, 22],
  21: [5, 6, 7, 20, 22, 23],
  22: [6, 7, 20, 21, 23],
  23: [21, 22, 24, 27, 28],
  24: [8, 23, 28, 32],
  25: [18, 19, 27, 29, 30],
  26: [27, 29],
  27: [11, 23, 25, 26, 28, 29, 30],
  28: [8, 11, 23, 24, 27, 32, 33],
  29: [11, 25, 26, 27, 30, 31, 58, 59],
  30: [25, 27, 29, 31, 57, 58],
  31: [29, 30, 32, 38, 58, 59],
  32: [8, 24, 28, 31, 33, 34, 38],
  33: [8, 28, 32, 34, 60],
  34: [32, 33, 35, 60],
  35: [34, 60, 61],
  36: [37, 38, 39, 60],
  37: [36, 38, 40],
  38: [31, 32, 36, 37, 39, 40],
  39: [36, 38, 40, 41, 42],
  40: [37, 38, 39, 41],
  41: [39, 40, 42, 43],
  42: [39, 41, 43, 60, 61, 69],
  43: [41, 42, 44, 61, 67],
  44: [43, 45, 62, 67, 68],
  45: [44, 46, 68],
  46: [45, 47, 48, 68, 69],
  47: [46, 48, 69],
  48: [46, 47, 49, 69, 70],
  49: [48, 50, 70],
  50: [49, 51, 54, 70],
  51: [50, 52, 53, 54, 55],
  52: [51, 53, 55],
  53: [51, 52, 54, 55],
  54: [50, 51, 53, 70, 74, 75],
  55: [51, 52, 53],
  56: [57, 62, 63, 64],
  57: [30, 55, 56, 58, 63],
  58: [29, 30, 31, 57, 59, 63, 64],
  59: [29, 31, 58, 60, 64, 65],
  60: [33, 34, 35, 36, 39, 42, 59, 61, 66],
  61: [35, 42, 43, 60, 62, 66, 67],
  62: [44, 56, 61, 63, 67],
  63: [56, 57, 58, 62, 64, 67, 68],
  64: [56, 58, 59, 63, 65, 68],
  65: [59, 64, 68, 69],
  66: [60, 61, 67, 71],
  67: [43, 44, 61, 62, 63, 66, 68],
  68: [44, 45, 46, 63, 64, 65, 67, 69],
  69: [42, 46, 47, 48, 65, 68, 70, 72, 73],
  70: [48, 49, 50, 54, 69, 73],
  71: [66, 72, 74, 75],
  72: [69, 71, 73, 74, 75],
  73: [69, 70, 72, 74],
  74: [54, 71, 72, 73, 75],
  75: [54, 71, 72, 74],
  76: [2, 77],
  77: [1, 2, 3, 4, 76]
};

export default function RoutePlanningScreen() {
  const [startArea, setStartArea] = useState(1);
  const [endArea, setEndArea] = useState(10);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [hour, setHour] = useState(new Date().getHours());
  const [year, setYear] = useState(new Date().getFullYear());
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Cache for API responses
  const apiCache = useRef<Map<string, { severity: number; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    loadSvgMap();
  }, []);

  const loadSvgMap = async () => {
    try {
      const response = await fetch('/chicago_communities.svg');
      
      if (!response.ok) {
        throw new Error('Failed to load Chicago map');
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
            color: '#e0e0e0',
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
            color: '#e0e0e0',
          });
        }
      });
      
      setCommunities(parsedCommunities);
      setLoadingMap(false);
    } catch (error: any) {
      console.error('Error loading SVG:', error);
      setError(error.message || 'Failed to load map data');
      setLoadingMap(false);
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
    let t = (safety - minSafe) / (maxSafe - minSafe);
    t = Math.max(0, Math.min(1, t));
    const k = 10.0;
    const center = 0.5;
    t = 1 / (1 + Math.exp(-k * (t - center)));
    const hue = t * 120.0;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const getCacheKey = (area: number, month: number, hour: number, year: number): string => {
    return `${area}-${month}-${hour}-${year}`;
  };

  const getCachedData = (cacheKey: string): number | null => {
    const cached = apiCache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.severity;
    }
    return null;
  };

  const setCachedData = (cacheKey: string, severity: number): void => {
    apiCache.current.set(cacheKey, { severity, timestamp: Date.now() });
  };

  const findPath = (start: number, end: number, preference: 'shortest' | 'alternative1' | 'alternative2' = 'shortest'): number[] => {
    // BFS to find shortest path
    interface QueueItem {
      area: number;
      path: number[];
      distance: number;
    }
    
    const queue: QueueItem[] = [{ area: start, path: [start], distance: 0 }];
    const visited = new Set<string>();
    const allPaths: number[][] = [];

    while (queue.length > 0 && allPaths.length < 10) {
      // Sort by distance (BFS with priority)
      queue.sort((a, b) => a.distance - b.distance);
      const current = queue.shift()!;
      const { area, path, distance } = current;

      if (area === end) {
        allPaths.push(path);
        if (allPaths.length >= 3) break; // Found enough paths
        continue;
      }

      const stateKey = `${area}-${path.length}`;
      if (visited.has(stateKey)) continue;
      visited.add(stateKey);

      const neighbors = COMMUNITY_NEIGHBORS[area] || [];
      
      // Sort neighbors by distance to destination for better pathfinding
      const sortedNeighbors = neighbors
        .filter(n => !path.includes(n))
        .sort((a, b) => Math.abs(a - end) - Math.abs(b - end));

      for (const neighbor of sortedNeighbors) {
        queue.push({
          area: neighbor,
          path: [...path, neighbor],
          distance: distance + 1
        });
      }
    }

    if (allPaths.length === 0) {
      return [start, end]; // Fallback if no path found
    }

    // Return different paths based on preference
    if (preference === 'shortest') {
      return allPaths[0];
    } else if (preference === 'alternative1' && allPaths.length > 1) {
      return allPaths[1];
    } else if (preference === 'alternative2' && allPaths.length > 2) {
      return allPaths[2];
    }
    
    return allPaths[Math.min(allPaths.length - 1, 1)];
  };

  const generateRoutes = async () => {
    if (startArea === endArea) {
      setError('Start and end locations must be different');
      return;
    }

    if (!COMMUNITY_NEIGHBORS[startArea] || !COMMUNITY_NEIGHBORS[endArea]) {
      setError('Invalid community area selected (1-77)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate 3 different connected paths using BFS
      const path1 = findPath(startArea, endArea, 'shortest');
      const path2 = findPath(startArea, endArea, 'alternative1');
      const path3 = findPath(startArea, endArea, 'alternative2');

      console.log('Generated paths:', { path1, path2, path3 });

      const route1 = await generateRoute(path1, 'Direct Route');
      const route2 = await generateRoute(path2, 'Safe Route');
      const route3 = await generateRoute(path3, 'Alternative Route');

      const allRoutes = [route1, route2, route3].filter(r => r !== null) as RouteOption[];
      
      // Remove duplicate routes (same path)
      const uniqueRoutes = allRoutes.filter((route, index, self) => 
        index === self.findIndex(r => 
          r.points.map(p => p.areaNumber).join(',') === route.points.map(p => p.areaNumber).join(',')
        )
      );

      uniqueRoutes.sort((a, b) => b.avgSafety - a.avgSafety);

      setRoutes(uniqueRoutes);
      if (uniqueRoutes.length > 0) {
        setSelectedRoute(0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate routes');
    } finally {
      setLoading(false);
    }
  };

  const generateRoute = async (areas: number[], name: string): Promise<RouteOption | null> => {
    try {
      const points: RoutePoint[] = [];
      
      for (const area of areas) {
        try {
          const cacheKey = getCacheKey(area, month, hour, year);
          let severity: number;
          
          // Check cache first
          const cachedSeverity = getCachedData(cacheKey);
          if (cachedSeverity !== null) {
            severity = cachedSeverity;
          } else {
            // Fetch from API if not cached
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
              severity = parseFloat(data.severity_score);
              setCachedData(cacheKey, severity);
            } else {
              continue;
            }
          }
          
          const safety = severityToSafety(severity);
          const color = safetyToColor(safety);

          points.push({
            areaNumber: area,
            name: `Area ${area}`,
            severity,
            safety,
            color,
            distance: Math.abs(area - startArea) * 2,
          });
        } catch (error) {
          console.error(`Error fetching data for area ${area}:`, error);
        }
      }

      if (points.length === 0) return null;

      const avgSafety = points.reduce((sum, p) => sum + (p.safety || 0), 0) / points.length;
      const totalDistance = points[points.length - 1]?.distance || 0;
      
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (avgSafety < 7.5) riskLevel = 'high';
      else if (avgSafety < 8.0) riskLevel = 'medium';

      return {
        id: areas[0],
        name,
        points,
        totalDistance,
        avgSafety,
        riskLevel,
      };
    } catch (error) {
      return null;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'low': return 'Low Risk';
      case 'medium': return 'Medium Risk';
      case 'high': return 'High Risk';
      default: return 'Unknown';
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
          <h1 className="text-2xl font-bold text-gray-800">Safety Route Planner</h1>
          <p className="text-sm text-gray-600 mt-1">Find the safest path to your destination</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Start Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Area</label>
              <select
                value={startArea}
                onChange={(e) => setStartArea(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              >
                {Array.from({ length: 77 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>Area {n}</option>
                ))}
              </select>
            </div>

            {/* End Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Area</label>
              <select
                value={endArea}
                onChange={(e) => setEndArea(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              >
                {Array.from({ length: 77 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>Area {n}</option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>

            {/* Hour */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hour: {hour}:00</label>
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
          </div>

          <button
            onClick={generateRoutes}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF5A5F] to-[#e84850] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Finding Routes...
              </span>
            ) : (
              'Find Safest Routes'
            )}
          </button>
        </div>
      </div>

      {/* Routes Results */}
      {routes.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {routes.map((route, index) => (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(index)}
                className={`bg-white rounded-2xl shadow-md p-6 cursor-pointer transition-all ${
                  selectedRoute === index ? 'ring-4 ring-[#FF5A5F] transform scale-105' : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{route.name}</h3>
                  {index === 0 && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Safety Score</span>
                    <span className="text-2xl font-bold" style={{ color: safetyToColor(route.avgSafety) }}>
                      {route.avgSafety.toFixed(1)}/10
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Risk Level</span>
                    <span className={`px-3 py-1 ${getRiskLevelColor(route.riskLevel)} text-white text-xs font-semibold rounded-full`}>
                      {getRiskLevelText(route.riskLevel)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Waypoints</span>
                    <span className="text-sm font-semibold text-gray-800">{route.points.length} areas</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Est. Distance</span>
                    <span className="text-sm font-semibold text-gray-800">{route.totalDistance} km</span>
                  </div>
                </div>

                {/* Safety Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(route.avgSafety / 10) * 100}%`,
                        backgroundColor: safetyToColor(route.avgSafety),
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Route View */}
          {selectedRoute !== null && routes[selectedRoute] && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map Visualization */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Route Map</h3>
                
                {loadingMap ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative bg-gray-50 rounded-xl overflow-hidden" style={{ height: '500px' }}>
                    <svg
                      ref={svgRef}
                      viewBox="0 0 800 1000"
                      className="w-full h-full"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Render all communities */}
                      {communities.map((community) => {
                        const isInRoute = routes[selectedRoute].points.some(
                          (p) => p.areaNumber === community.areaNumber
                        );
                        const routePoint = routes[selectedRoute].points.find(
                          (p) => p.areaNumber === community.areaNumber
                        );
                        
                        return (
                          <path
                            key={community.id}
                            d={community.path}
                            fill={isInRoute && routePoint ? routePoint.color : community.color}
                            stroke={isInRoute ? '#FF5A5F' : '#999'}
                            strokeWidth={isInRoute ? 3 : 1}
                            opacity={isInRoute ? 1 : 0.3}
                            className="transition-all duration-300"
                          />
                        );
                      })}
                      
                      {/* Labels for route points */}
                      {routes[selectedRoute].points.map((point, idx) => {
                        const community = communities.find(c => c.areaNumber === point.areaNumber);
                        if (!community) return null;
                        
                        // Calculate approximate center of the path (simplified)
                        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        pathEl.setAttribute('d', community.path);
                        const bbox = pathEl.getBBox ? pathEl.getBBox() : { x: 0, y: 0, width: 0, height: 0 };
                        const x = bbox.x + bbox.width / 2;
                        const y = bbox.y + bbox.height / 2;
                        
                        return (
                          <g key={`label-${point.areaNumber}`}>
                            {/* Circle background */}
                            <circle
                              cx={x}
                              cy={y}
                              r={20}
                              fill="white"
                              stroke={point.color}
                              strokeWidth={3}
                              className="drop-shadow-lg"
                            />
                            {/* Number */}
                            <text
                              x={x}
                              y={y + 6}
                              textAnchor="middle"
                              className="text-sm font-bold"
                              fill={point.color}
                            >
                              {idx === 0 ? '🏁' : idx === routes[selectedRoute].points.length - 1 ? '🎯' : idx + 1}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                    
                    {/* Legend */}
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Route Safety</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(120, 70%, 50%)' }}></div>
                          <span className="text-xs text-gray-600">Safe (8+)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(60, 70%, 50%)' }}></div>
                          <span className="text-xs text-gray-600">Moderate (7.5-8)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0, 70%, 50%)' }}></div>
                          <span className="text-xs text-gray-600">Unsafe (&lt;7.5)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Route Details */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Route Details: {routes[selectedRoute].name}</h3>
                
                <div className="relative">
                  {/* Route Timeline */}
                  <div className="space-y-4">
                    {routes[selectedRoute].points.map((point, index) => (
                      <div key={index} className="flex items-start gap-4">
                        {/* Connector Line */}
                        {index < routes[selectedRoute].points.length - 1 && (
                          <div className="absolute left-[15px] w-0.5 h-16 bg-gray-300" style={{ top: `${index * 80 + 40}px` }}></div>
                        )}

                        {/* Point Icon */}
                        <div
                          className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                          style={{ backgroundColor: point.color }}
                        >
                          {index === 0 ? '🏁' : index === routes[selectedRoute].points.length - 1 ? '🎯' : index + 1}
                        </div>

                        {/* Point Details */}
                        <div className="flex-1 bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">{point.name}</h4>
                            <span className="text-sm font-semibold" style={{ color: point.color }}>
                              Safety: {point.safety?.toFixed(1)}/10
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Severity:</span> {point.severity?.toFixed(2)}
                            </div>
                            <div>
                              <span className="font-medium">Distance:</span> {point.distance} km
                            </div>
                          </div>

                          {/* Mini Safety Bar */}
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${((point.safety || 0) / 10) * 100}%`,
                                  backgroundColor: point.color,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
