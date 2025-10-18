import { FC } from 'react';

interface Item {
  id: string;
  text: string;
  time: string;
}

interface Props {
  title: string;
  items: Item[];
}

const ActivityFeed: FC<Props> = ({ title, items }) => {
  return (
    <div className='container-card p-5 rounded-[16px]'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-white'>{title}</h3>
      </div>
      <ul className='space-y-3'>
        {items.map((i) => (
          <li key={i.id} className='flex items-start gap-3'>
            <span className='mt-1 inline-block h-2 w-2 rounded-full bg-primary' />
            <div>
              <p className='text-sm text-white'>{i.text}</p>
              <p className='text-xs text-webGray mt-1'>{i.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
