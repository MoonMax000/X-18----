import { FC } from "react";

export interface CompactPostCardProps {
  author?: {
    name: string;
    avatar: string;
  };
  category?: string;
  timestamp?: string;
  title?: string;
  image?: string;
  sentiment?: "bullish" | "bearish";
  likes?: number;
  comments?: number;
}

const CompactPostCard: FC<CompactPostCardProps> = ({
  author = { name: "John Smith", avatar: "/placeholder.svg" },
  category = "Idea",
  timestamp = "January 31, 5:10 PM",
  title = "AI Constructs Threaten Emerging Economies",
  image,
  sentiment = "bullish",
  likes = 1500,
  comments = 563,
}) => {
  return (
    <button
      type="button"
      className="group flex w-full sm:min-w-[280px] sm:max-w-[380px] flex-shrink-0 cursor-pointer items-center gap-3 rounded-2xl border border-[#181B22] bg-black p-3 backdrop-blur-[50px] transition-all duration-200 hover:border-[#2F3240] hover:bg-[#482090]/10"
    >
      {/* Left: Image preview (if available) */}
      {image && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Center: Main content */}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        {/* Author info */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
            <img
              src={author.avatar}
              alt={author.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <div className="truncate text-sm font-semibold text-white">
              {author.name}
            </div>
            <div className="text-xs font-medium text-[#808283]">
              {timestamp}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="line-clamp-2 w-full text-left text-sm font-bold leading-snug text-white transition-colors group-hover:text-[#E3D8FF]">
          {title}
        </div>

        {/* Footer: Category, Sentiment, and Metrics */}
        <div className="flex w-full items-center gap-2">
          {/* Category badge */}
          <div className="flex items-center gap-1 rounded bg-[#4FC3F7] px-1.5 py-0.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.667 6.41383C12.667 8.13331 11.8205 9.45684 10.5325 10.3278C10.2325 10.5307 10.0825 10.6322 10.0085 10.7475C9.93446 10.8628 9.90919 11.0143 9.85873 11.3172L9.81946 11.5526C9.73079 12.0847 9.68646 12.3507 9.49993 12.5087C9.31346 12.6667 9.04373 12.6667 8.50426 12.6667H6.76326C6.22385 12.6667 5.95412 12.6667 5.76763 12.5087C5.58113 12.3507 5.53679 12.0847 5.4481 11.5526L5.40887 11.3172C5.35855 11.0153 5.3334 10.8644 5.26011 10.7496C5.18683 10.6348 5.03651 10.532 4.73587 10.3265C3.46159 9.45551 2.66699 8.13244 2.66699 6.41383C2.66699 3.60797 4.90557 1.33337 7.66699 1.33337C8.00946 1.33337 8.34386 1.36836 8.66699 1.435"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.0003 1.33337L11.1723 1.79806C11.3977 2.40739 11.5105 2.71205 11.7327 2.9343C11.955 3.15655 12.2597 3.26929 12.869 3.49476L13.3337 3.66671L12.869 3.83865C12.2597 4.06413 11.955 4.17687 11.7327 4.39911C11.5105 4.62136 11.3977 4.92603 11.1723 5.53535L11.0003 6.00004L10.8284 5.53535C10.6029 4.92603 10.4902 4.62136 10.2679 4.39911C10.0457 4.17687 9.74099 4.06413 9.13166 3.83865L8.66699 3.66671L9.13166 3.49476C9.74099 3.26929 10.0457 3.15655 10.2679 2.9343C10.4902 2.71205 10.6029 2.40739 10.8284 1.79806L11.0003 1.33337Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M8.99967 12.6666V13.3333C8.99967 13.9618 8.99967 14.2761 8.80441 14.4714C8.60914 14.6666 8.29487 14.6666 7.66634 14.6666C7.03781 14.6666 6.72354 14.6666 6.52827 14.4714C6.33301 14.2761 6.33301 13.9618 6.33301 13.3333V12.6666"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-xs font-semibold text-white">{category}</div>
          </div>

          {/* Sentiment badge */}
          <div
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 ${sentiment === "bullish" ? "bg-[#1C3430]" : "bg-[#3A1E1F]"}`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {sentiment === "bullish" ? (
                <>
                  <path
                    d="M13.3333 8.66671V5.33337H10"
                    stroke="#2EBD85"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.3337 5.33337L10.0003 8.66671C9.41193 9.25511 9.11779 9.54924 8.75673 9.58177C8.69699 9.58717 8.63699 9.58717 8.57726 9.58177C8.21619 9.54924 7.92206 9.25511 7.33366 8.66671C6.74526 8.07831 6.45109 7.78417 6.09004 7.75164C6.03035 7.74624 5.9703 7.74624 5.91061 7.75164C5.54956 7.78417 5.25537 8.07831 4.66699 8.66671L2.66699 10.6667"
                    stroke="#2EBD85"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M13.3333 7.33337V10.6667H10"
                    stroke="#EF454A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.3337 10.6667L10.0003 7.33337C9.41193 6.74497 9.11779 6.45081 8.75673 6.41829C8.69699 6.41291 8.63699 6.41291 8.57726 6.41829C8.21619 6.45081 7.92206 6.74497 7.33366 7.33337C6.74526 7.92177 6.45109 8.21591 6.09004 8.24844C6.03035 8.25384 5.9703 8.25384 5.91061 8.24844C5.54956 8.21591 5.25537 7.92177 4.66699 7.33337L2.66699 5.33337"
                    stroke="#EF454A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>
            <div
              className={`text-xs font-semibold ${sentiment === "bullish" ? "text-[#2EBD85]" : "text-[#EF454A]"}`}
            >
              {sentiment === "bullish" ? "Bull" : "Bear"}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Metrics */}
          <div className="flex items-center gap-2">
            {/* Likes */}
            <div className="flex items-center gap-1">
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.2192 3.32846C13.9844 1.95769 12.034 2.51009 10.8623 3.39001C10.3818 3.7508 10.1417 3.93119 10.0003 3.93119C9.85899 3.93119 9.61882 3.7508 9.13832 3.39001C7.96667 2.51009 6.01623 1.95769 3.78152 3.32846C0.848716 5.12745 0.185092 11.0624 6.94993 16.0695C8.23842 17.0232 8.88266 17.5 10.0003 17.5C11.118 17.5 11.7622 17.0232 13.0507 16.0695C19.8156 11.0624 19.1519 5.12745 16.2192 3.32846Z"
                  fill="url(#paint0_linear_compact)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_compact"
                    x1="18.3337"
                    y1="10"
                    x2="1.66699"
                    y2="10"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#A06AFF" />
                    <stop offset="1" stopColor="#482090" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-xs font-semibold text-[#A06AFF]">
                {likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : likes}
              </div>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-1">
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_compact)">
                  <path
                    d="M18.3337 9.63875C18.3337 14.0414 14.6022 17.611 10.0003 17.611C9.45924 17.6118 8.91966 17.5617 8.38816 17.4619C8.0056 17.39 7.81431 17.3541 7.68077 17.3745C7.54722 17.3949 7.35798 17.4955 6.97948 17.6968C5.90878 18.2663 4.66028 18.4673 3.45958 18.244C3.91594 17.6827 4.22762 17.0092 4.36514 16.2872C4.44848 15.8455 4.24199 15.4165 3.93273 15.1024C2.5281 13.6761 1.66699 11.7541 1.66699 9.63875C1.66699 5.23615 5.39848 1.6665 10.0003 1.6665C14.6022 1.6665 18.3337 5.23615 18.3337 9.63875Z"
                    stroke="#808283"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.99658 10H10.0041M13.3262 10H13.3337M6.66699 10H6.67447"
                    stroke="#808283"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_compact">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <div className="text-xs font-semibold text-[#808283]">
                {comments}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default CompactPostCard;
