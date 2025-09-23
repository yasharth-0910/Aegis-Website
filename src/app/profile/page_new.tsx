'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, MapPin, Search, Route, Users, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface User {
    id: string;
    fullname: string;
    email: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [signingOut, setSigningOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const userData = await response.json();
                setUser(userData.user);
            } else {
                // Not authenticated, redirect to login
                router.push('/login');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        setSigningOut(true);
        
        try {
            const response = await fetch('/api/auth/signout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                router.push('/login');
            } else {
                alert('Error signing out. Please try again.');
            }
        } catch (error) {
            console.error('Signout error:', error);
            alert('Error signing out. Please try again.');
        } finally {
            setSigningOut(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading your safety dashboard...</p>
                </div>
            </div>
        );
    }

    const features = [
        {
            id: 'location',
            title: 'Location Intelligence',
            description: 'View real-time safety heatmap of Chicago',
            icon: MapPin,
            color: 'from-blue-500 to-cyan-500',
            href: '/profile/location'
        },
        {
            id: 'search',
            title: 'Safety Search',
            description: 'Search any Chicago location for safety score',
            icon: Search,
            color: 'from-green-500 to-emerald-500',
            href: '/profile/search'
        },
        {
            id: 'guide',
            title: 'Safe Route Guide',
            description: 'Find safest routes between two locations',
            icon: Route,
            color: 'from-orange-500 to-red-500',
            href: '/profile/guide'
        },
        {
            id: 'family',
            title: 'Family Tracking',
            description: 'Monitor family members in danger zones',
            icon: Users,
            color: 'from-purple-500 to-pink-500',
            href: '/profile/family'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header with Navigation */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <img 
                            src="/logo.png" 
                            alt="AEGIS Logo" 
                            width={40} 
                            height={40} 
                            className="rounded-lg"
                        />
                        <span className="font-bold text-xl bg-gradient-to-r from-[#ff5a5f] to-purple-600 bg-clip-text text-transparent">
                            AEGIS
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                            <Home className="w-5 h-5" />
                        </Link>
                        {features.map((feature) => (
                            <Link
                                key={feature.id}
                                href={feature.href}
                                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                            >
                                <feature.icon className="w-5 h-5" />
                                <span className="hidden lg:inline">{feature.title}</span>
                            </Link>
                        ))}
                        <Button
                            onClick={handleSignOut}
                            disabled={signingOut}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-1" />
                            {signingOut ? 'Signing out...' : 'Sign Out'}
                        </Button>
                    </nav>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-2">
                                        <img 
                                            src="/logo.png" 
                                            alt="AEGIS Logo" 
                                            width={32} 
                                            height={32} 
                                            className="rounded-md"
                                        />
                                        AEGIS Dashboard
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 space-y-4">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <Home className="w-5 h-5 text-gray-600" />
                                        <span>Home</span>
                                    </Link>
                                    {features.map((feature) => (
                                        <Link
                                            key={feature.id}
                                            href={feature.href}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <feature.icon className="w-5 h-5 text-gray-600" />
                                            <div>
                                                <div className="font-medium">{feature.title}</div>
                                                <div className="text-sm text-gray-600">{feature.description}</div>
                                            </div>
                                        </Link>
                                    ))}
                                    <Button
                                        onClick={handleSignOut}
                                        disabled={signingOut}
                                        variant="outline"
                                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        {signingOut ? 'Signing out...' : 'Sign Out'}
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-[#ff5a5f] to-purple-600 rounded-2xl p-6 text-white">
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, {user?.fullname || 'User'}! 👋
                        </h1>
                        <p className="text-white/90 mb-4">
                            Your personal safety intelligence dashboard is ready. Chicago's predictive safety data at your fingertips.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                                <div className="text-2xl font-bold">77</div>
                                <div className="text-sm text-white/80">Community Areas Monitored</div>
                            </div>
                            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                                <div className="text-2xl font-bold">24/7</div>
                                <div className="text-sm text-white/80">Real-Time Predictions</div>
                            </div>
                            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                                <div className="text-2xl font-bold">1M+</div>
                                <div className="text-sm text-white/80">Crime Records Analyzed</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {features.map((feature) => (
                        <Link key={feature.id} href={feature.href}>
                            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 shadow-md">
                                <CardHeader className={`bg-gradient-to-r ${feature.color} text-white rounded-t-lg`}>
                                    <CardTitle className="flex items-center gap-3">
                                        <feature.icon className="w-6 h-6" />
                                        {feature.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 bg-white">
                                    <p className="text-gray-600 mb-4">{feature.description}</p>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="bg-gray-100">
                                            User ID: {user?.id}
                                        </Badge>
                                        <div className="text-sm text-gray-500">Click to explore →</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Quick Stats for User */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-700">Safe</div>
                            <div className="text-sm text-blue-600">Current Location Status</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-700">12</div>
                            <div className="text-sm text-green-600">Searches This Week</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-700">5</div>
                            <div className="text-sm text-orange-600">Routes Calculated</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-700">3</div>
                            <div className="text-sm text-purple-600">Family Members Tracked</div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}