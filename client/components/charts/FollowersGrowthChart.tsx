import { FC } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FollowersGrowthChartProps {
  data: {
    date: string;
    followers: number;
  }[];
  period?: '7d' | '30d' | '90d' | '1y';
}

/**
 * График роста подписчиков
 */
export const FollowersGrowthChart: FC<FollowersGrowthChartProps> = ({ data, period = '30d' }) => {
  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
    }),
    datasets: [
      {
        label: 'Подписчики',
        data: data.map(d => d.followers),
        borderColor: '#A06AFF',
        backgroundColor: 'rgba(160, 106, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#A06AFF',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1A1D24',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#A06AFF',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y.toLocaleString('ru-RU')} подписчиков`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#6C7280',
          callback: function(value: any) {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6C7280',
          maxRotation: 0,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="w-full h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
};
