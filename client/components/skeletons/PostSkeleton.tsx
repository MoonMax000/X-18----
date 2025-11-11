import { cn } from "@/lib/utils";

interface PostSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Skeleton loader для постов в ленте
 * Показывается во время загрузки новых постов
 */
export function PostSkeleton({ count = 3, className }: PostSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex w-full flex-col gap-3 sm:gap-4 md:gap-6 bg-black p-2.5 sm:p-3 md:p-6 backdrop-blur-[50px] animate-pulse min-w-0 overflow-x-hidden",
            className
          )}
          style={{
            borderBottom: "1px solid transparent",
            backgroundImage: `linear-gradient(to right, transparent 0%, #181B22 20%, #181B22 80%, transparent 100%)`,
            backgroundPosition: "0 100%",
            backgroundSize: "100% 1px",
            backgroundRepeat: "no-repeat"
          }}
        >
          {/* Header skeleton */}
          <div className="flex w-full items-start justify-between gap-2 sm:gap-3 md:gap-4">
            <div className="flex flex-1 items-start gap-2 sm:gap-2.5 md:gap-3">
              {/* Avatar skeleton */}
              <div className="flex-shrink-0 h-11 w-11 sm:w-12 sm:h-12 rounded-full bg-[#1F2937]" />
              
              <div className="flex flex-1 flex-col gap-2 min-w-0">
                {/* Name skeleton */}
                <div className="h-4 bg-[#1F2937] rounded w-32" />
                
                {/* Handle skeleton */}
                <div className="h-3 bg-[#1F2937] rounded w-24" />
                
                {/* Badges skeleton */}
                <div className="flex gap-2 mt-1">
                  <div className="h-5 w-16 bg-[#1F2937] rounded" />
                  <div className="h-5 w-20 bg-[#1F2937] rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="ml-[48px] sm:ml-[52px] md:ml-[56px] pr-[40px] sm:pr-[44px] md:pr-[48px] space-y-2">
            <div className="h-4 bg-[#1F2937] rounded w-full" />
            <div className="h-4 bg-[#1F2937] rounded w-5/6" />
            <div className="h-4 bg-[#1F2937] rounded w-4/6" />
          </div>

          {/* Footer skeleton */}
          <div className="flex w-full items-center pt-1.5 sm:pt-2 md:pt-3">
            <div className="flex w-[2.75rem] sm:w-12" />
            <div className="flex flex-1 items-center justify-between gap-4">
              <div className="h-4 w-12 bg-[#1F2937] rounded" />
              <div className="h-4 w-12 bg-[#1F2937] rounded" />
              <div className="h-4 w-12 bg-[#1F2937] rounded" />
              <div className="h-4 w-12 bg-[#1F2937] rounded" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
