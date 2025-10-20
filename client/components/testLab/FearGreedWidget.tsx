import React, { useState, useEffect } from 'react';

interface FearGreedWidgetProps {
  score?: number;
}

export const FearGreedWidget: React.FC<FearGreedWidgetProps> = ({ score = 32 }) => {
  const [animatedScore, setAnimatedScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);

  // Repeating animation every 15 seconds
  useEffect(() => {
    const animateScore = () => {
      setIsAnimating(true);
      let currentScore = 0;
      const targetScore = score;
      const steps = 100; // Total animation steps (smoother)
      const increment = targetScore / steps;
      const stepDuration = 80; // ms per step (~8s total, slow & smooth)
      
      let step = 0;
      const interval = setInterval(() => {
        if (step < steps) {
          currentScore += increment;
          setAnimatedScore(Math.min(Math.round(currentScore), targetScore));
          step++;
        } else {
          setAnimatedScore(targetScore);
          setIsAnimating(false);
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    };

    // Initial animation
    animateScore();

    // Repeat every 15 seconds
    const repeatInterval = setInterval(() => {
      animateScore();
    }, 15000);

    return () => {
      clearInterval(repeatInterval);
    };
  }, [score]);

  // Arc configuration - the arc is the bottom half of a circle
  const centerX = 36;
  const centerY = 36;
  const radius = 29;
  
  // Top semicircle: parameterize with radians from π (left) to 0 (right)
  const t = Math.max(0, Math.min(1, animatedScore / 100));
  const angleRad = Math.PI * (1 - t); // t=0 => π (left), t=1 => 0 (right)

  // SVG Y grows downward, so subtract for top arc
  const indicatorX = centerX + radius * Math.cos(angleRad);
  const indicatorY = centerY - radius * Math.sin(angleRad);

  // Determine sentiment label and color based on score
  const getSentiment = () => {
    if (animatedScore < 25) return { label: 'Extreme Fear', color: '#EA3943' };
    if (animatedScore < 45) return { label: 'Fear', color: '#EA8C00' };
    if (animatedScore < 55) return { label: 'Neutral', color: '#F3D42F' };
    if (animatedScore < 75) return { label: 'Greed', color: '#93D900' };
    return { label: 'Extreme Greed', color: '#16C784' };
  };

  const sentiment = getSentiment();

  return (
    <div className="rounded-2xl border border-[rgba(40,44,52,1)] bg-black p-4">
      <div className="mb-4 text-lg font-bold text-white">Fear & Greed</div>
      
      <div className="flex flex-col items-center justify-center">
        <div className="w-[200px]">
          <svg
            width="200"
            height="110"
            viewBox="0 0 72 40"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Fear segment (Red) - Extreme Fear */}
            <path
              d="M 7 34.5 A 29 29 0 0 1 10.784647044348649 20.175685869057304"
              stroke="#EA3943"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Fear-Orange segment */}
            <path
              d="M 13.023600342699474 16.805790246863236 A 29 29 0 0 1 24.762047992889016 7.76596860393348"
              stroke="#EA8C00"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Neutral segment (Yellow) */}
            <path
              d="M 28.592073019862077 6.4621217304706775 A 29 29 0 0 1 43.40792698013793 6.4621217304706775"
              stroke="#F3D42F"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Greed segment (Lime) */}
            <path
              d="M 47.23795200711099 7.765968603933484 A 29 29 0 0 1 58.97639965730053 16.805790246863243"
              stroke="#93D900"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Extreme Greed segment (Green) */}
            <path
              d="M 61.215352955651355 20.175685869057304 A 29 29 0 0 1 65 34.5"
              stroke="#16C784"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Indicator dot positioned ON the arc */}
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r="2.25"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="1"
              style={{
                transition: isAnimating ? 'all 0.05s linear' : 'all 0.3s ease-out',
              }}
            >
              {/* Subtle pulsing animation */}
              <animate
                attributeName="r"
                values="2.25;2.75;2.25"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Center circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r="3"
              fill="#1F2937"
            />
          </svg>
          
          {/* Baseline under arc (score and label) */}
          <div className="mt-1 flex items-center justify-center gap-2">
            <div className="text-3xl font-bold text-white leading-none">{animatedScore}</div>
            <div
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: `${sentiment.color}20`,
                color: sentiment.color,
                border: `1px solid ${sentiment.color}40`
              }}
            >
              {sentiment.label}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};
