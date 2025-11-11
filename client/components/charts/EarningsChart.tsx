import { FC } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EarningsChartProps {
  data: {
    date: string;
    earnings: number;
    subscriptions?: number;
    postSales?: number;
  }[];
  period?: '7d' | '30d' | '90d' | '1y';
}

/**
 * График заработков (общий + разбивка по источникам)
 */
export const EarningsChart: FC<EarningsChartProps> = ({ data, period = '30d' }) => {
  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
    }),
    datasets: [
      {
        label: 'Подписки',
        data: data.map(d => d.subscriptions || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Продажи постов',
        data: data.map(d => d.postSales || 0),
        backgroundColor: 'rgba(160, 106, 255, 0.8)',
        borderColor: 'rgb(160, 106, 255)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#fff',
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: '#1A1D24',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#A06AFF',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: $${value.toFixed(2)}`;
          },
          footer: function(tooltipItems: any[]) {
            let sum = 0;
            tooltipItems.forEach(item => {
              sum += item.parsed.y;
            });
            return `Всего: $${sum.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#6C7280',
          callback: function(value: any) {
            return '$' + value;
          }
        },
      },
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6C7280',
          maxRotation: 0,
        },
      },
    },
  };

  return (
    <div className="w-full h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
};
