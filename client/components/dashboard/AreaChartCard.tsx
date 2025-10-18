import { FC } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  title: string;
  data: { name: string; value: number }[];
}

const AreaChartCard: FC<Props> = ({ title, data }) => {
  return (
    <div className='container-card p-5 rounded-[16px]'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-white'>{title}</h3>
      </div>
      <div className='h-64'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id='colorPrimary' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#A06AFF' stopOpacity={0.6} />
                <stop offset='100%' stopColor='#A06AFF' stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke='#181B22' vertical={false} />
            <XAxis dataKey='name' stroke='#808283' tickLine={false} axisLine={false} />
            <YAxis stroke='#808283' tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#0C1014', border: '1px solid #181B22', borderRadius: 12, color: '#fff' }} />
            <Area type='monotone' dataKey='value' stroke='#A06AFF' fill='url(#colorPrimary)' strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AreaChartCard;
