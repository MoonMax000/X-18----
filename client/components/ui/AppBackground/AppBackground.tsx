import { FC, ReactNode } from 'react';

export type LayoutVariant = 'primal' | 'secondary';

interface Props {
  children: ReactNode;
  variant?: LayoutVariant;
}

export const AppBackground: FC<Props> = ({ children, variant = 'primal' }) => {
  return (
    <div
      className={`min-h-screen ${
        variant === 'primal'
          ? 'bg-background'
          : 'bg-gradient-to-b from-richBlack to-background'
      }`}
    >
      {children}
    </div>
  );
};
