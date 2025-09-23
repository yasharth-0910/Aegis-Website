'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Plus, MapPin, AlertTriangle, Shield, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface User {
    id: string;
    fullname: string;
    email: string;
}

interface FamilyMember {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    lastLocation: {
        address: string;
        timestamp: string;
        safetyStatus: 'Safe' | 'Caution' | 'Alert';
    };
    emergencyContact: boolean;
}

export default function FamilyTrackingPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
        {
            id: '1',
            name: 'Sarah Johnson',
            relationship: 'Spouse',
            phone: '+1 (555) 123-4567',
            lastLocation: {
                address: 'Millennium Park, Chicago',
                timestamp: '5 minutes ago',
                safetyStatus: 'Safe'
            },
            emergencyContact: true
        },
        {
            id: '2',
            name: 'Mike Johnson',
            relationship: 'Son',
            phone: '+1 (555) 987-6543',
            lastLocation: {
                address: 'University of Chicago',
                timestamp: '1 hour ago',
                safetyStatus: 'Safe'
            },
            emergencyContact: false
        },
        {
            id: '3',
            name: 'Emma Johnson',
            relationship: 'Daughter',
            phone: '+1 (555) 456-7890',
            lastLocation: {
                address: 'Lincoln Park High School',
                timestamp: '2 hours ago',
                safetyStatus: 'Caution'
            },
            emergencyContact: false
        }
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Safe': return 'bg-green-100 text-green-800';
            case 'Caution': return 'bg-yellow-100 text-yellow-800';
            case 'Alert': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Safe': return <Shield className="w-4 h-4" />;
            case 'Caution': return <AlertTriangle className="w-4 h-4" />;
            case 'Alert': return <AlertTriangle className="w-4 h-4" />;
            default: return <MapPin className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading Family Tracking...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-xl font-bold">Family Tracking</h1>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        User: {user?.fullname}
                    </Badge>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Safe</p>
                                    <p className="text-2xl font-bold">
                                        {familyMembers.filter(m => m.lastLocation.safetyStatus === 'Safe').length}
                                    </p>
                                </div>
                                <Shield className="w-8 h-8 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 text-sm">Caution</p>
                                    <p className="text-2xl font-bold">
                                        {familyMembers.filter(m => m.lastLocation.safetyStatus === 'Caution').length}
                                    </p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-yellow-200" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Total Members</p>
                                    <p className="text-2xl font-bold">{familyMembers.length}</p>
                                </div>
                                <Users className="w-8 h-8 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-pink-100 text-sm">Emergency Contacts</p>
                                    <p className="text-2xl font-bold">
                                        {familyMembers.filter(m => m.emergencyContact).length}
                                    </p>
                                </div>
                                <Phone className="w-8 h-8 text-pink-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Add Family Member Button */}
                <div className="mb-6">
                    <Button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Family Member
                    </Button>
                </div>

                {/* Add Family Member Form */}
                {showAddForm && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Add New Family Member</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Family member name..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                                        <option>Spouse</option>
                                        <option>Child</option>
                                        <option>Parent</option>
                                        <option>Sibling</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="emergency" className="rounded" />
                                    <label htmlFor="emergency" className="text-sm text-gray-700">
                                        Emergency Contact
                                    </label>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                                    Add Member
                                </Button>
                                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Family Members List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {familyMembers.map((member) => (
                        <Card key={member.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{member.name}</CardTitle>
                                    {member.emergencyContact && (
                                        <Badge className="bg-red-100 text-red-800">
                                            <Phone className="w-3 h-3 mr-1" />
                                            Emergency
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">{member.relationship}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">{member.phone}</span>
                                    </div>
                                    
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={getStatusColor(member.lastLocation.safetyStatus)}>
                                                {getStatusIcon(member.lastLocation.safetyStatus)}
                                                {member.lastLocation.safetyStatus}
                                            </Badge>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">{member.lastLocation.address}</p>
                                                <p className="text-xs text-gray-500">{member.lastLocation.timestamp}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            View Location
                                        </Button>
                                        <Button size="sm" variant="outline" className="flex-1">
                                            <Phone className="w-3 h-3 mr-1" />
                                            Call
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Safety Tips */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            Family Safety Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h4 className="font-medium text-purple-800 mb-2">Emergency Protocols</h4>
                                <ul className="text-sm text-purple-700 space-y-1">
                                    <li>• Establish check-in times with family members</li>
                                    <li>• Share live location during travel</li>
                                    <li>• Keep emergency contacts updated</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-pink-50 rounded-lg">
                                <h4 className="font-medium text-pink-800 mb-2">Safe Practices</h4>
                                <ul className="text-sm text-pink-700 space-y-1">
                                    <li>• Travel in well-lit, populated areas</li>
                                    <li>• Trust your instincts about unsafe situations</li>
                                    <li>• Keep phones charged and accessible</li>
                                </ul>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-4">
                            Family tracking personalized for User ID: {user?.id}. All location data is encrypted and private.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}