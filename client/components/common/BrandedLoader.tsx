import { useEffect, useState } from 'react';

/**
 * Брендированный компонент загрузки с логотипом и легкой пульсацией
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
      {/* Simple loader content */}
      <div className="flex flex-col items-center gap-6">
        {/* Logo with gentle pulse */}
        <div className="relative">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-32 h-32 object-contain animate-gentle-pulse"
            onError={(e) => {
              // Fallback to favicon if logo.png doesn't exist
              (e.target as HTMLImageElement).src = '/favicon.ico';
            }}
          />
        </div>

        {/* Loading text */}
        <p className="text-base font-medium text-white/80">
          Loading{dots}
        </p>
      </div>

      {/* Simple pulse animation */}
      <style>{`
        @keyframes gentle-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(0.98);
          }
        }

        .animate-gentle-pulse {
          animation: gentle-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
