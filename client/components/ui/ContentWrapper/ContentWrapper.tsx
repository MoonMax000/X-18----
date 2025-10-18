import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
}

const ContentWrapper: FC<Props> = ({ children, className }) => {
  return (
    <div className={cn('container mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 w-full', className)}>
      {children}
    </div>
  );
};

export default ContentWrapper;
