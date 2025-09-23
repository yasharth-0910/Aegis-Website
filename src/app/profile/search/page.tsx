'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface User {
    id: string;
    fullname: string;
    email: string;
}

interface SearchResult {
    address: string;
    safetyScore: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    crimeTypes: string[];
    recommendation: string;
}

export default function SafetySearchPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([
        'Millennium Park, Chicago',
        'Navy Pier, Chicago',
        'Lincoln Park Zoo, Chicago'
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

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        setSearching(true);
        
        // Simulate API call with realistic data
        setTimeout(() => {
            const mockResult: SearchResult = {
                address: searchQuery,
                safetyScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
                riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
                crimeTypes: ['Theft', 'Burglary', 'Vandalism'].slice(0, Math.floor(Math.random() * 3) + 1),
                recommendation: 'This area is generally safe during daylight hours. Exercise normal precautions.'
            };
            
            setSearchResult(mockResult);
            
            // Add to recent searches
            setRecentSearches(prev => {
                const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)];
                return updated.slice(0, 5);
            });
            
            setSearching(false);
        }, 1500);
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Low': return 'text-green-600 bg-green-100';
            case 'Medium': return 'text-yellow-600 bg-yellow-100';
            case 'High': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading Safety Search...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                <Search className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-xl font-bold">Safety Search</h1>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                        User: {user?.fullname}
                    </Badge>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Search Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5 text-green-600" />
                            Search Chicago Locations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter address, landmark, or area in Chicago..."
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <Button 
                                onClick={handleSearch}
                                disabled={searching || !searchQuery.trim()}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            >
                                {searching ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Search any location in Chicago for real-time safety analysis and crime predictions.
                        </p>
                    </CardContent>
                </Card>

                {/* Search Results */}
                {searchResult && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-600" />
                                Safety Analysis Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">{searchResult.address}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className={`text-3xl font-bold ${getScoreColor(searchResult.safetyScore)}`}>
                                                {searchResult.safetyScore}
                                            </div>
                                            <div className="text-sm text-gray-600">Safety Score</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <Badge className={getRiskColor(searchResult.riskLevel)}>
                                                {searchResult.riskLevel} Risk
                                            </Badge>
                                            <div className="text-sm text-gray-600 mt-2">Risk Level</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-sm text-gray-600">Common Crimes</div>
                                            <div className="text-sm font-medium">
                                                {searchResult.crimeTypes.join(', ')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-blue-800">Safety Recommendation</h4>
                                            <p className="text-blue-700 text-sm mt-1">{searchResult.recommendation}</p>
                                            <p className="text-xs text-blue-600 mt-2">
                                                Analysis personalized for User ID: {user?.id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Searches & Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-green-600" />
                                Recent Searches
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSearchQuery(search)}
                                        className="w-full text-left p-2 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Your Search Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Searches</span>
                                    <span className="font-semibold">47</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">This Week</span>
                                    <span className="font-semibold">12</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Favorite Area</span>
                                    <span className="font-semibold">Loop District</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Avg Safety Score</span>
                                    <span className="font-semibold text-green-600">78</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}