'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Route, Navigation, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface User {
    id: string;
    fullname: string;
    email: string;
}

interface RouteResult {
    from: string;
    to: string;
    distance: number;
    duration: number;
    safetyScore: number;
    riskAreas: number;
    waypoints: { lat: number; lng: number; instruction: string }[];
}

export default function SafeRouteGuidePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [calculating, setCalculating] = useState(false);
    const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
    const [recentRoutes] = useState([
        { from: 'Navy Pier', to: 'Millennium Park', time: '2 hours ago' },
        { from: 'Union Station', to: 'Lincoln Park Zoo', time: '1 day ago' },
        { from: 'Willis Tower', to: 'Art Institute', time: '2 days ago' }
    ]);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const userData = await response.json();
                setUser(userData.user);
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const calculateRoute = async () => {
        if (!fromLocation.trim() || !toLocation.trim()) return;
        
        setCalculating(true);
        
        // Simulate route calculation
        setTimeout(() => {
            const mockResult: RouteResult = {
                from: fromLocation,
                to: toLocation,
                distance: Math.round((Math.random() * 10 + 2) * 10) / 10, // 2-12 km
                duration: Math.floor(Math.random() * 45 + 15), // 15-60 minutes
                safetyScore: Math.floor(Math.random() * 30) + 70, // 70-100
                riskAreas: Math.floor(Math.random() * 3), // 0-2 risk areas
                waypoints: [
                    { lat: 41.8781, lng: -87.6298, instruction: 'Head north on Michigan Avenue' },
                    { lat: 41.8850, lng: -87.6200, instruction: 'Turn right onto Lake Street' },
                    { lat: 41.8900, lng: -87.6100, instruction: 'Continue straight for 0.5 miles' },
                    { lat: 41.8950, lng: -87.6050, instruction: 'Arrive at destination' }
                ]
            };
            
            setRouteResult(mockResult);
            setCalculating(false);
        }, 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading Safe Route Guide...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <Route className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-xl font-bold">Safe Route Guide</h1>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        User: {user?.fullname}
                    </Badge>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Route Planning Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-orange-600" />
                            Plan Your Safe Route
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                                    <input
                                        type="text"
                                        placeholder="Starting location..."
                                        value={fromLocation}
                                        onChange={(e) => setFromLocation(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                                    <input
                                        type="text"
                                        placeholder="Destination..."
                                        value={toLocation}
                                        onChange={(e) => setToLocation(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                            <Button 
                                onClick={calculateRoute}
                                disabled={calculating || !fromLocation.trim() || !toLocation.trim()}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                            >
                                {calculating ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                        Calculating safest route...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Route className="w-4 h-4" />
                                        Calculate Safe Route
                                    </div>
                                )}
                            </Button>
                            <p className="text-sm text-gray-600">
                                Our AI analyzes real-time crime data to suggest the safest path between your locations.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Route Results */}
                {routeResult && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-600" />
                                Recommended Safe Route
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">{routeResult.from} → {routeResult.to}</h3>
                                        <p className="text-sm text-gray-600">Optimized for safety</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-bold ${getScoreColor(routeResult.safetyScore)}`}>
                                            {routeResult.safetyScore}
                                        </div>
                                        <div className="text-sm text-gray-600">Safety Score</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-bold text-orange-600">{routeResult.distance} km</div>
                                        <div className="text-sm text-gray-600">Distance</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-bold text-orange-600">{routeResult.duration} min</div>
                                        <div className="text-sm text-gray-600">Estimated Time</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-bold text-orange-600">{routeResult.riskAreas}</div>
                                        <div className="text-sm text-gray-600">Risk Areas</div>
                                    </div>
                                </div>

                                {routeResult.riskAreas > 0 && (
                                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-yellow-800">Safety Notice</h4>
                                                <p className="text-yellow-700 text-sm mt-1">
                                                    This route passes through {routeResult.riskAreas} moderate risk area(s). 
                                                    Stay alert and consider traveling during daylight hours.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">Turn-by-Turn Directions</h4>
                                    <div className="space-y-2">
                                        {routeResult.waypoints.map((point, index) => (
                                            <div key={index} className="flex items-start gap-3 text-sm">
                                                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </div>
                                                <p className="text-blue-700">{point.instruction}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-blue-600 mt-3">
                                        Route personalized for User ID: {user?.id}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Routes & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-600" />
                                Recent Routes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentRoutes.map((route, index) => (
                                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="font-medium text-sm">{route.from} → {route.to}</div>
                                        <div className="text-xs text-gray-500">{route.time}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Route className="w-5 h-5 text-orange-600" />
                                Route Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Routes</span>
                                    <span className="font-semibold">23</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">This Week</span>
                                    <span className="font-semibold">5</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Avg Safety Score</span>
                                    <span className="font-semibold text-green-600">84</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Distance Saved</span>
                                    <span className="font-semibold">12.4 km</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}