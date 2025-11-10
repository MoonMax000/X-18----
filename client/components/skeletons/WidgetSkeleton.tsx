import { FC } from 'react';

interface WidgetSkeletonProps {
  /** Number of skeleton items to show */
  count?: number;
  /** Show header skeleton */
  showHeader?: boolean;
  /** Custom height for skeleton items */
  itemHeight?: string;
  /** Show avatar in items */
  showAvatar?: boolean;
  /** Show image in items */
  showImage?: boolean;
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

export const WidgetSkeleton: FC<WidgetSkeletonProps> = ({
  count = 3,
  showHeader = true,
  itemHeight = 'h-16',
  showAvatar = false,
  showImage = false,
  ariaLabel = 'Загрузка виджета...',
}) => {
  return (
    <section 
      className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <span className="sr-only">{ariaLabel}</span>
      {showHeader && (
        <header className="mb-4">
          <div className="shimmer h-6 w-32 rounded-lg bg-gray-800/50" />
        </header>
      )}
      
      <ul className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className={`flex items-center gap-3 rounded-lg p-3 ${itemHeight}`}>
            {showAvatar && (
              <div className="shimmer h-10 w-10 flex-shrink-0 rounded-full bg-gray-800/50" />
            )}
            
            <div className="flex-1 space-y-2">
              <div className="shimmer h-4 w-3/4 rounded bg-gray-800/50" />
              <div className="shimmer h-3 w-1/2 rounded bg-gray-800/50" />
            </div>
            
            {showImage && (
              <div className="shimmer h-16 w-16 flex-shrink-0 rounded-lg bg-gray-800/50" />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

interface NewsSkeletonProps {
  count?: number;
}

export const NewsSkeleton: FC<NewsSkeletonProps> = ({ count = 3 }) => {
  return (
    <section 
      className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Загрузка новостей..."
    >
      <span className="sr-only">Загрузка новостей...</span>
      <header className="mb-4">
        <div className="shimmer h-6 w-32 rounded-lg bg-gray-800/50" />
      </header>
      
      <ul className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="rounded-lg p-3">
            {/* Image placeholder */}
            <div className="shimmer mb-2 h-32 w-full rounded-lg bg-gray-800/50" />
            
            {/* Title */}
            <div className="shimmer mb-2 h-4 w-full rounded bg-gray-800/50" />
            <div className="shimmer mb-2 h-4 w-4/5 rounded bg-gray-800/50" />
            
            {/* Description */}
            <div className="shimmer mb-2 h-3 w-full rounded bg-gray-800/60" />
            <div className="shimmer mb-3 h-3 w-3/4 rounded bg-gray-800/60" />
            
            {/* Meta info */}
            <div className="flex items-center gap-2">
              <div className="shimmer h-3 w-16 rounded bg-gray-800/50" />
              <div className="shimmer h-1 w-1 rounded-full bg-gray-800/50" />
              <div className="shimmer h-3 w-20 rounded bg-gray-800/50" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

interface TickerSkeletonProps {
  count?: number;
}

export const TickerSkeleton: FC<TickerSkeletonProps> = ({ count = 5 }) => {
  return (
    <section 
      className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Загрузка тикеров..."
    >
      <span className="sr-only">Загрузка трендовых тикеров...</span>
      <header className="mb-4 flex items-center gap-2">
        <div className="shimmer h-5 w-5 rounded bg-gray-800/50" />
        <div className="shimmer h-6 w-40 rounded-lg bg-gray-800/50" />
      </header>
      
      <ul className="flex flex-col gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="flex items-center justify-between rounded-lg p-2">
            <div className="flex items-center gap-3">
              <div className="shimmer h-6 w-6 rounded-full bg-gray-800/50" />
              <div className="shimmer h-4 w-16 rounded bg-gray-800/50" />
            </div>
            <div className="shimmer h-4 w-24 rounded bg-gray-800/50" />
          </li>
        ))}
      </ul>
    </section>
  );
};

interface AuthorSkeletonProps {
  count?: number;
}

export const AuthorSkeleton: FC<AuthorSkeletonProps> = ({ count = 5 }) => {
  return (
    <section 
      className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Загрузка топ авторов..."
    >
      <span className="sr-only">Загрузка топ авторов...</span>
      <header className="mb-4">
        <div className="shimmer h-6 w-32 rounded-lg bg-gray-800/50" />
      </header>
      
      <ul className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 rounded-lg p-2">
            {/* Avatar */}
            <div className="shimmer h-12 w-12 flex-shrink-0 rounded-full bg-gray-800/50" />
            
            <div className="flex-1 space-y-2">
              {/* Name */}
              <div className="shimmer h-4 w-24 rounded bg-gray-800/50" />
              {/* Handle */}
              <div className="shimmer h-3 w-20 rounded bg-gray-800/60" />
            </div>
            
            {/* Follow button */}
            <div className="shimmer h-8 w-20 flex-shrink-0 rounded-full bg-gray-800/50" />
          </li>
        ))}
      </ul>
    </section>
  );
};

interface PostSkeletonProps {
  count?: number;
}

export const PostSkeleton: FC<PostSkeletonProps> = ({ count = 3 }) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Загрузка постов..."
    >
      <span className="sr-only">Загрузка постов...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-widget-border bg-[#000000] p-4 shadow-sm"
        >
          {/* Header */}
          <div className="mb-3 flex items-start gap-3">
            {/* Avatar */}
            <div className="shimmer h-12 w-12 flex-shrink-0 rounded-full bg-gray-800/50" />
            
            <div className="flex-1 space-y-2">
              {/* Name */}
              <div className="shimmer h-4 w-32 rounded bg-gray-800/50" />
              {/* Handle & time */}
              <div className="shimmer h-3 w-24 rounded bg-gray-800/60" />
            </div>
          </div>
          
          {/* Content */}
          <div className="mb-3 space-y-2">
            <div className="shimmer h-4 w-full rounded bg-gray-800/50" />
            <div className="shimmer h-4 w-5/6 rounded bg-gray-800/50" />
            <div className="shimmer h-4 w-4/6 rounded bg-gray-800/50" />
          </div>
          
          {/* Engagement */}
          <div className="flex items-center gap-4">
            <div className="shimmer h-3 w-12 rounded bg-gray-800/50" />
            <div className="shimmer h-3 w-12 rounded bg-gray-800/50" />
            <div className="shimmer h-3 w-12 rounded bg-gray-800/50" />
          </div>
        </div>
      ))}
    </div>
  );
};
