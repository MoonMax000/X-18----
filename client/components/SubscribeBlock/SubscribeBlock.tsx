import { FC } from 'react';

interface Props {
  isOwn?: boolean;
}

const SubscribeBlock: FC<Props> = ({ isOwn = true }) => {
  if (!isOwn) {
    return (
      <div className="container-card p-6">
        <button className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90">
          Subscribe
        </button>
      </div>
    );
  }
  return null;
};

export default SubscribeBlock;
