import { FC } from 'react';

interface GradientSpinnerProps {
  /** Размер спиннера в пикселях */
  size?: number;
  /** Толщина линии спиннера в пикселях */
  thickness?: number;
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Градиентный спиннер с эффектом затухания
 * Используется для единообразного отображения загрузки по всему приложению
 */
export const GradientSpinner: FC<GradientSpinnerProps> = ({ 
  size = 40, 
  thickness = 3,
  className = '' 
}) => {
  const uniqueId = `gradient-spinner-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <>
      <div 
        className={`gradient-spinner-ring ${className}`}
        data-spinner-id={uniqueId}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          '--spinner-thickness': `${thickness}px`
        } as React.CSSProperties}
      />

      <style>{`
        .gradient-spinner-ring[data-spinner-id="${uniqueId}"] {
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

        .gradient-spinner-ring[data-spinner-id="${uniqueId}"]::before {
          content: '';
          position: absolute;
          inset: var(--spinner-thickness, 3px);
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
    </>
  );
};

/**
 * Спиннер с центрированным контентом (например, для кнопок)
 */
export const InlineSpinner: FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <GradientSpinner size={size} thickness={2} />
    </div>
  );
};

/**
 * Полноэкранный спиннер для страниц
 */
export const FullPageSpinner: FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <GradientSpinner size={60} thickness={4} />
    </div>
  );
};
