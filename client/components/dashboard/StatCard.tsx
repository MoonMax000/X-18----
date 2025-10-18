import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  value: string | number;
  delta?: string;
  icon?: ReactNode;
  className?: string;
}

const StatCard: FC<Props> = ({ title, value, delta, icon, className }) => {
  return (
    <div className={cn('container-card p-5 rounded-[16px]', className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-webGray text-sm font-semibold uppercase tracking-wide">{title}</div>
          <div className="mt-1 text-2xl font-extrabold text-white">{value}</div>
          {delta && (
            <div className="mt-1 text-sm text-green">{delta}</div>
          )}
        </div>
        {icon && <div className="text-white/70">{icon}</div>}
      </div>
    </div>
  );
};

export default StatCard;
