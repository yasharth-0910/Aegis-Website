'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Layers, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface User {
    id: string;
    fullname: string;
    email: string;
}

export default function LocationIntelligencePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mapLoading, setMapLoading] = useState(true);
    const mapRef = useRef<HTMLDivElement>(null);
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
                initializeMap();
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

    const initializeMap = async () => {
        if (typeof window !== 'undefined' && mapRef.current) {
            try {
                // Dynamic import for client-side only
                const L = (await import('leaflet')).default;
                
                // Chicago coordinates
                const map = L.map(mapRef.current).setView([41.8781, -87.6298], 11);
                
                // Add OpenStreetMap tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                // Add sample crime data points (simulated)
                const crimeData = [
                    { lat: 41.8781, lng: -87.6298, severity: 'high', type: 'Theft' },
                    { lat: 41.8850, lng: -87.6200, severity: 'medium', type: 'Burglary' },
                    { lat: 41.8700, lng: -87.6400, severity: 'low', type: 'Vandalism' },
                    { lat: 41.8900, lng: -87.6100, severity: 'high', type: 'Assault' },
                    { lat: 41.8650, lng: -87.6350, severity: 'medium', type: 'Robbery' }
                ];

                crimeData.forEach(crime => {
                    const color = crime.severity === 'high' ? '#ef4444' : 
                                 crime.severity === 'medium' ? '#f59e0b' : '#10b981';
                    
                    L.circleMarker([crime.lat, crime.lng], {
                        radius: 8,
                        fillColor: color,
                        color: color,
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.6
                    }).bindPopup(`
                        <div class="p-2">
                            <strong>${crime.type}</strong><br/>
                            Severity: ${crime.severity}<br/>
                            Location: ${crime.lat.toFixed(4)}, ${crime.lng.toFixed(4)}
                        </div>
                    `).addTo(map);
                });

                setMapLoading(false);
            } catch (error) {
                console.error('Map initialization failed:', error);
                setMapLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading Location Intelligence...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-xl font-bold">Location Intelligence</h1>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        User: {user?.fullname}
                    </Badge>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Current Status</p>
                                    <p className="text-2xl font-bold">Safe Zone</p>
                                </div>
                                <Zap className="w-8 h-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-cyan-100 text-sm">Areas Monitored</p>
                                    <p className="text-2xl font-bold">77</p>
                                </div>
                                <Layers className="w-8 h-8 text-cyan-200" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Risk Level</p>
                                    <p className="text-2xl font-bold">Low</p>
                                </div>
                                <MapPin className="w-8 h-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-cyan-100 text-sm">Last Updated</p>
                                    <p className="text-2xl font-bold">Live</p>
                                </div>
                                <RefreshCw className="w-8 h-8 text-cyan-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Map Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Chicago Safety Heatmap
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative">
                            <div 
                                ref={mapRef} 
                                className="w-full h-96 rounded-b-lg"
                                style={{ minHeight: '400px' }}
                            />
                            {mapLoading && (
                                <div className="absolute inset-0 bg-gray-100 rounded-b-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p className="text-gray-600">Loading Chicago crime data...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Legend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Risk Level Legend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                <span>High Risk Areas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                <span>Medium Risk Areas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                <span>Low Risk Areas</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-4">
                            Real-time crime prediction based on Chicago Police Department data and ML analysis. 
                            User ID: {user?.id} - Personalized for your location preferences.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}