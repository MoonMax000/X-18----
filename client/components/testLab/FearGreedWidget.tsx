import React, { useState, useEffect } from 'react';

interface FearGreedWidgetProps {
  score?: number;
  onScoreChange?: (score: number) => void;
}

export const FearGreedWidget: React.FC<FearGreedWidgetProps> = ({
  score = 32,
  onScoreChange,
}) => {
  const [animatedScore, setAnimatedScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = React.useRef<number | null>(null);
  const repeatRef = React.useRef<number | null>(null);

  useEffect(() => {
    // Update animated score immediately when score prop changes
    setAnimatedScore(score);
    onScoreChange?.(score);
  }, [score, onScoreChange]);

  useEffect(() => {
    // Function to animate the score from 0 up to target score
    const animateScore = () => {
      setIsAnimating(true);
      let currentScore = 0;
      const targetScore = score;
      const steps = 100;
      const increment = targetScore / steps;
      const stepDuration = 80;

      // Clear any existing interval to avoid overlap
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      let step = 0;
      intervalRef.current = window.setInterval(() => {
        if (step < steps) {
          currentScore += increment;
          setAnimatedScore(Math.min(Math.round(currentScore), targetScore));
          step++;
        } else {
          // Animation complete
          setAnimatedScore(targetScore);
          setIsAnimating(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, stepDuration);
    };

    // Start the initial animation and also set up a repeating interval (every 15s)
    animateScore();
    repeatRef.current = window.setInterval(() => {
      animateScore();
    }, 15000);

    // Cleanup on unmount or before re-running (clear intervals)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (repeatRef.current) clearInterval(repeatRef.current);
    };
  }, [score]);

  // SVG configuration for the gauge
  const centerX = 36;
  const centerY = 36;
  const radius = 29;

  // Calculate the indicator dot position based on animatedScore
  const t = Math.max(0, Math.min(1, animatedScore / 100));
  const angleRad = Math.PI * (1 - t);
  const indicatorX = centerX + radius * Math.cos(angleRad);
  const indicatorY = centerY - radius * Math.sin(angleRad);

  // Define the sentiment categories with their ranges and colors
  const categories = [
    { label: 'Extreme Fear', color: '#EA3943', range: [0, 25] },
    { label: 'Fear',        color: '#EA8C00', range: [25, 45] },
    { label: 'Neutral',     color: '#F3D42F', range: [45, 55] },
    { label: 'Greed',       color: '#93D900', range: [55, 75] },
    { label: 'Extreme Greed', color: '#16C784', range: [75, 100] },
  ];

  // Determine current sentiment based on score
  const getCurrentSentiment = () => {
    if (animatedScore < 25) return categories[0];
    if (animatedScore < 45) return categories[1];
    if (animatedScore < 55) return categories[2];
    if (animatedScore < 75) return categories[3];
    return categories[4];
  };

  const currentSentiment = getCurrentSentiment();

  // Precompute label positions (at midpoints of each range)
  const categoryLabels = categories.map(cat => {
    const [minVal, maxVal] = cat.range;
    const midVal = (minVal + maxVal) / 2;
    const frac = midVal / 100;                   // fraction of full scale
    const theta = Math.PI * (1 - frac);          // angle in radians for midpoint
    const labelRadius = 22;                      // radius for label placement (inside arc)
    const x = centerX + labelRadius * Math.cos(theta);
    const y = centerY - labelRadius * Math.sin(theta);
    // Determine horizontal alignment: leftmost label flush right, rightmost label flush left
    let anchor: 'start' | 'middle' | 'end' = 'middle';
    if (minVal === 0) anchor = 'start';         // Extreme Fear at far left
    if (maxVal === 100) anchor = 'end';         // Extreme Greed at far right
    return { ...cat, x, y, anchor };
  });

  // Define tick mark values (including boundaries)
  const ticks = [0, 25, 45, 55, 75, 100];
  const tickPositions = ticks.map(value => {
    const frac = value / 100;
    const theta = Math.PI * (1 - frac);
    const tickRadius = 27;                     // radius for tick mark placement (near arc)
    const x = centerX + tickRadius * Math.cos(theta);
    const y = centerY - tickRadius * Math.sin(theta);
    return { value, x, y };
  });

  return (
    <div className="rounded-2xl border border-widget-border bg-black p-4">
      {/* Title */}
      <div className="mb-4 text-lg font-bold text-white">Fear &amp; Greed</div>

      {/* Gauge Container */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-[200px]">
          <svg 
            width="200" 
            height="110" 
            viewBox="0 0 72 40" 
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Arc segments for each category (colored arcs) */}
            <path d="M 7 34.5 A 29 29 0 0 1 10.7846 20.1757"
                  stroke="#EA3943" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M 13.0236 16.8058 A 29 29 0 0 1 24.7620 7.7660"
                  stroke="#EA8C00" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M 28.5921 6.4621 A 29 29 0 0 1 43.4079 6.4621"
                  stroke="#F3D42F" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M 47.2380 7.7660 A 29 29 0 0 1 58.9764 16.8058"
                  stroke="#93D900" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M 61.2154 20.1757 A 29 29 0 0 1 65 34.5"
                  stroke="#16C784" strokeWidth="3" strokeLinecap="round" fill="none"/>

            {/* Category Labels on the arc */}
            {categoryLabels.map(cat => (
              <text 
                key={cat.label}
                x={cat.x} 
                y={cat.y}
                textAnchor={cat.anchor} 
                alignmentBaseline="middle"
                fontSize="4" fontWeight="600" fill={cat.color}
              >
                {cat.label}
              </text>
            ))}

            {/* Numeric Tick Marks (range boundaries) */}
            {tickPositions.map(tick => (
              <text 
                key={tick.value}
                x={tick.x} 
                y={tick.y}
                textAnchor="middle" 
                alignmentBaseline="middle"
                fontSize="3" fill="#FFFFFF"
              >
                {tick.value}
              </text>
            ))}

            {/* Indicator Dot showing current value position */}
            <circle 
              cx={indicatorX} cy={indicatorY} r="2.25" 
              fill="#FFFFFF" stroke="#000000" strokeWidth="1"
              style={{ transition: isAnimating ? 'all 0.05s linear' : 'all 0.3s ease-out' }}
            >
              <animate 
                attributeName="r" 
                values="2.25;2.75;2.25" 
                dur="2s" 
                repeatCount="indefinite" 
              />
            </circle>

            {/* Centered current score value */}
            <text 
              x={centerX} y={centerY}
              textAnchor="middle" alignmentBaseline="middle"
              fontSize="8" fontWeight="bold" fill="#FFFFFF"
            >
              {animatedScore}
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
