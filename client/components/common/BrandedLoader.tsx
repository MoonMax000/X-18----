import { useEffect, useState } from 'react';

/**
 * Брендированный компонент загрузки с логотипом и анимацией
 */
export const BrandedLoader = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      {/* Gradient background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-[#A06AFF]/20 via-transparent to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-[#482090]/20 via-transparent to-transparent blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main loader content */}
      <div className="relative flex flex-col items-center gap-8 animate-fade-in">
        {/* Logo with glow effect */}
        <div className="relative">
          {/* Glow rings */}
          <div className="absolute inset-0 -m-4">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] opacity-20 blur-2xl animate-ping" />
          </div>
          <div className="absolute inset-0 -m-2">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] opacity-30 blur-xl animate-pulse" />
          </div>
          
          {/* Logo image */}
          <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#A06AFF] to-[#482090] p-1 shadow-2xl shadow-[#A06AFF]/50 animate-float">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <img 
                src="/favicon.ico" 
                alt="Logo" 
                className="w-16 h-16 object-contain animate-pulse-slow"
              />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg font-bold text-white tracking-wide">
            Loading{dots}
          </p>
          
          {/* Progress bar */}
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#A06AFF] to-[#482090] rounded-full animate-progress" />
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};
