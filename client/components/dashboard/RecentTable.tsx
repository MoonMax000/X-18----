import { FC } from 'react';

interface Row {
  id: string;
  name: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
  date: string;
}

interface Props {
  title: string;
  rows: Row[];
}

const badgeColor = {
  Paid: 'text-green',
  Pending: 'text-orange',
  Failed: 'text-red',
} as const;

const RecentTable: FC<Props> = ({ title, rows }) => {
  return (
    <div className='container-card p-5 rounded-[16px]'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-white'>{title}</h3>
      </div>
      <div className='overflow-x-auto'>
        <table className='min-w-full text-left'>
          <thead>
            <tr className='text-webGray text-sm'>
              <th className='py-2 pr-4 font-medium'>Name</th>
              <th className='py-2 pr-4 font-medium'>Amount</th>
              <th className='py-2 pr-4 font-medium'>Status</th>
              <th className='py-2 pr-4 font-medium'>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className='border-t border-[#181B22] text-sm'>
                <td className='py-3 pr-4 text-white'>{r.name}</td>
                <td className='py-3 pr-4 text-white'>{r.amount}</td>
                <td className={`py-3 pr-4 ${badgeColor[r.status]}`}>{r.status}</td>
                <td className='py-3 pr-4 text-webGray'>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTable;
