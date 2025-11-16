'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF5A5F] to-[#e84850] flex items-center justify-center relative overflow-hidden">
      {/* Background Shield Icons */}
      <div className="absolute top-[-30px] left-[-20px] opacity-10 transform -rotate-12">
        <svg className="w-[180px] h-[180px] text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        </svg>
      </div>
      <div className="absolute bottom-[-50px] right-[-40px] opacity-10 transform rotate-[17deg]">
        <svg className="w-[200px] h-[200px] text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        </svg>
      </div>
      <div className="absolute top-[150px] right-[-30px] opacity-10 transform -rotate-6">
        <svg className="w-[100px] h-[100px] text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        </svg>
      </div>

      {/* Center Content */}
      <div className="text-center z-10">
        <div className="animate-scale-bounce mb-5">
          <Image 
            src="/logo.png" 
            alt="Aegis Logo" 
            width={200} 
            height={200}
            className="mx-auto"
            priority
          />
        </div>
        <div className="animate-fade-in-up">
          <h1 className="text-[40px] font-bold tracking-[2px] text-white mb-2">
            AEGIS
          </h1>
          <p className="text-white/80 text-lg font-medium">
            Your Safety Companion
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-scale-bounce {
          animation: scale-bounce 2s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-in 0.5s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
