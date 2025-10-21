import React from "react";
import type { Post } from "../../types";

interface PostFooterProps {
  post: Post;
}

export function PostFooter({ post }: PostFooterProps) {
  const formatNumber = (num: number) => (num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num);

  return (
    <footer className="relative flex w-full items-center pt-1.5 sm:pt-2 md:pt-3">
      <div className="flex w-[2.75rem] sm:w-12" aria-hidden="true" />
      <div className="flex flex-1 items-center justify-between pr-2 text-[11px] sm:text-xs font-normal text-[#6D6D6D]">
        <button className="flex items-center gap-1.5 transition-colors hover:text-[#4D7CFF]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M1.94043 9.84328C1.94043 5.61993 5.36497 2.19922 9.58927 2.19922H13.761C18.0512 2.19922 21.5283 5.67727 21.5283 9.96749C21.5283 12.7958 19.9928 15.3948 17.519 16.7612L9.82337 21.0227V17.4969H9.75935C5.46912 17.5924 1.94043 14.1431 1.94043 9.84328ZM9.58927 4.11023C6.41985 4.11023 3.85144 6.68055 3.85144 9.84328C3.85144 13.0633 6.4982 15.6528 9.71635 15.5859L10.0517 15.5763H11.7344V17.774L16.595 15.089C18.4592 14.0571 19.6173 12.0983 19.6173 9.96749C19.6173 6.72832 16.9954 4.11023 13.761 4.11023H9.58927Z"
              fill="currentColor"
            />
          </svg>
          <span>{formatNumber(post.comments)}</span>
        </button>

        <button className="flex items-center gap-1.5 transition-colors hover:text-[#00BA7C]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M4.70502 3.99561L8.93983 7.95141L7.63652 9.34645L5.66053 7.50232V15.5764C5.66053 16.6274 6.51667 17.4874 7.57155 17.4874H12.8268V19.3984H7.57155C5.46083 19.3984 3.74952 17.688 3.74952 15.5764V7.50232L1.77353 9.34645L0.470215 7.95141L4.70502 3.99561ZM16.1711 6.02128H10.9158V4.11027H16.1711C18.2818 4.11027 19.9931 5.82062 19.9931 7.9323V16.0063L21.9691 14.1622L23.2724 15.5572L19.0376 19.513L14.8028 15.5572L16.1061 14.1622L18.0821 16.0063V7.9323C18.0821 6.88124 17.226 6.02128 16.1711 6.02128Z"
              fill="currentColor"
            />
          </svg>
          <span>{formatNumber(post.reposts)}</span>
        </button>

        <button className="flex items-center gap-1.5 transition-colors hover:text-[#F91880]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M16.498 5.54308C15.3303 5.48575 13.9382 6.03039 12.7811 7.60698L12.0119 8.64848L11.2417 7.60698C10.0837 6.03039 8.69053 5.48575 7.5229 5.54308C6.3352 5.60997 5.27841 6.28838 4.74237 7.3681C4.21493 8.43827 4.13753 10.0244 5.20006 11.9736C6.22627 13.856 8.31214 16.0537 12.0119 18.2895C15.7097 16.0537 17.7946 13.856 18.8208 11.9736C19.8824 10.0244 19.805 8.43827 19.2766 7.3681C18.7406 6.28838 17.6847 5.60997 16.498 5.54308Z"
              fill="currentColor"
            />
          </svg>
          <span>{formatNumber(post.likes)}</span>
        </button>

        <button className="flex items-center gap-1.5 transition-colors hover:text-[#4D7CFF]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M9.04257 20.3539V3.15479H10.9536V20.3539H9.04257ZM17.881 20.3539V8.41008H19.792V20.3539H17.881ZM4.50391 20.3539L4.50773 10.7988H6.41874L6.41492 20.3539H4.50391ZM13.3404 20.3539V13.6654H15.2515V20.3539H13.3404Z"
              fill="currentColor"
            />
          </svg>
          <span>{formatNumber(post.views)}</span>
        </button>

        <button className="flex h-5 w-5 items-center justify-center text-[#B0B0B0] hover:text-white">
          <svg className="w-[14px] h-[14px]" viewBox="0 0 20 20" fill="none">
            <path
              d="M3.33301 14.9838V8.08945C3.33301 5.06164 3.33301 3.54774 4.30932 2.60712C5.28563 1.6665 6.85697 1.6665 9.99967 1.6665C13.1423 1.6665 14.7138 1.6665 15.69 2.60712C16.6663 3.54774 16.6663 5.06164 16.6663 8.08945V14.9838C16.6663 16.9054 16.6663 17.8662 16.0223 18.2101C14.7751 18.876 12.4357 16.6542 11.3247 15.9852C10.6803 15.5972 10.3582 15.4032 9.99967 15.4032C9.64117 15.4032 9.31901 15.5972 8.67467 15.9852C7.56367 16.6542 5.22423 18.876 3.97705 18.2101C3.33301 17.8662 3.33301 16.9054 3.33301 14.9838Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </div>
    </footer>
  );
}
