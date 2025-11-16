'use client';

import { useState } from 'react';

interface FamilyMember {
  name: string;
  relation: string;
  phone: string;
  status: string;
  location: string;
  time: string;
  emergency: boolean;
}

export default function FamilyScreen() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      name: 'Sarah Johnson',
      relation: 'Spouse',
      phone: '+1 (555) 123-4567',
      status: 'Safe',
      location: 'Millennium Park, Chicago',
      time: '5 min ago',
      emergency: true,
    },
    {
      name: 'Mike Johnson',
      relation: 'Son',
      phone: '+1 (555) 987-6543',
      status: 'Safe',
      location: 'University of Chicago',
      time: '1 hr ago',
      emergency: false,
    },
    {
      name: 'Emma Johnson',
      relation: 'Daughter',
      phone: '+1 (555) 456-7890',
      status: 'Caution',
      location: 'Lincoln Park High School',
      time: '2 hr ago',
      emergency: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: '',
    phone: '',
    location: '',
    status: 'Safe',
    emergency: false,
  });

  const safeCount = familyMembers.filter((m) => m.status === 'Safe').length;
  const cautionCount = familyMembers.filter((m) => m.status !== 'Safe').length;
  const emergencyCount = familyMembers.filter((m) => m.emergency).length;

  const handleAddMember = () => {
    if (!newMember.name || !newMember.relation || !newMember.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setFamilyMembers([
      ...familyMembers,
      {
        ...newMember,
        time: 'Just now',
      },
    ]);

    setNewMember({
      name: '',
      relation: '',
      phone: '',
      location: '',
      status: 'Safe',
      emergency: false,
    });
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Glass Effect */}
      <div className="relative bg-gradient-to-br from-[#FF5A5F] to-[#e84850] rounded-b-[20px] shadow-lg overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-[#FF5A5F]/80"></div>
        <div className="relative px-4 py-6 text-center">
          <h1 className="text-white text-xl font-bold">Family Tracking</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-green-600 text-center">{safeCount}</p>
            <p className="text-xs text-center text-gray-700 mt-1">Safe</p>
          </div>

          <div className="bg-orange-50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-orange-600 text-center">{cautionCount}</p>
            <p className="text-xs text-center text-gray-700 mt-1">Caution</p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-7 h-7 text-[#FF5A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[#FF5A5F] text-center">{familyMembers.length}</p>
            <p className="text-xs text-center text-gray-700 mt-1">Total Members</p>
          </div>

          <div className="bg-pink-50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-pink-600 text-center">{emergencyCount}</p>
            <p className="text-xs text-center text-gray-700 mt-1">Emergency Contacts</p>
          </div>
        </div>
      </div>

      {/* Family Members Section */}
      <div className="px-4 mt-6 pb-24">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Family Members</h2>
        
        {familyMembers.map((member, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-4 mb-3 border border-gray-100"
          >
            <div className="flex items-start">
              <div className="w-14 h-14 bg-[#FF5A5F]/80 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {member.name[0]}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{member.name}</h3>
                    <p className="text-xs text-gray-500">{member.relation}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      member.status === 'Safe'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-xs text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {member.phone}
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {member.location}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {member.time}
                  </div>
                </div>

                {member.emergency && (
                  <div className="mt-2 flex items-center text-xs text-pink-600 font-semibold">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Emergency Contact
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-6 z-10">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#FF5A5F] text-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </button>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div 
            className="bg-white rounded-3xl w-full max-w-md p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Family Member</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              />
              
              <input
                type="text"
                placeholder="Relation *"
                value={newMember.relation}
                onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              />
              
              <input
                type="tel"
                placeholder="Phone Number *"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              />
              
              <input
                type="text"
                placeholder="Location"
                value={newMember.location}
                onChange={(e) => setNewMember({ ...newMember, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              />
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={newMember.emergency}
                  onChange={(e) => setNewMember({ ...newMember, emergency: e.target.checked })}
                  className="w-4 h-4 text-[#FF5A5F] border-gray-300 rounded focus:ring-[#FF5A5F]"
                />
                <label htmlFor="emergency" className="ml-2 text-sm text-gray-700">
                  Mark as Emergency Contact
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="flex-1 px-4 py-3 bg-[#FF5A5F] text-white rounded-xl font-semibold hover:bg-[#e84850] transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
