import { useEffect, useState } from 'react';

interface BrandedLoaderProps {
  /** Задержка перед показом спиннера в мс (по умолчанию 300ms) */
  delay?: number;
}

/**
 * Брендированный компонент загрузки с градиентным спиннером
 * Включает задержку показа для предотвращения мелькания при быстрых загрузках
 */
export const BrandedLoader = ({ delay = 300 }: BrandedLoaderProps) => {
  const [dots, setDots] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Задержка перед показом спиннера
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Анимация точек для Loading текста
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Не показываем ничего до истечения задержки
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6">
        {/* Gradient spinner ring */}
        <div className="gradient-spinner" />

        {/* Loading text */}
        <p className="text-base font-medium text-white/80">
          Loading{dots}
        </p>
      </div>

      {/* Градиентный спиннер с затуханием */}
      <style>{`
        .gradient-spinner {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 45deg,
            #A06AFF 90deg,
            #7C3AED 180deg,
            #A06AFF 270deg,
            transparent 315deg,
            transparent 360deg
          );
          animation: gradient-spin 1.5s linear infinite;
          position: relative;
        }

        .gradient-spinner::before {
          content: '';
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background: black;
        }

        @keyframes gradient-spin {
          0% {
            transform: rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: rotate(360deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
