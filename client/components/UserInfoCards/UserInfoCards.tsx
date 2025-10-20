import { FC } from "react";

const UserInfoCards: FC = () => {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-2 rounded-2xl border border-[rgba(40,44,52,1)] bg-[rgba(12,16,20,0.55)] px-3 py-2.5 backdrop-blur-[50px] md:px-4 md:py-3">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
          <path
            d="M16.6663 18.3335V14.1668C16.6663 12.5955 16.6663 11.8098 16.1782 11.3217C15.69 10.8335 14.9043 10.8335 13.333 10.8335L9.99967 18.3335L6.66634 10.8335C5.09499 10.8335 4.30932 10.8335 3.82117 11.3217C3.33301 11.8098 3.33301 12.5955 3.33301 14.1668V18.3335"
            stroke="#8B98A5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.0003 12.5L9.58366 15.8333L10.0003 17.0833L10.417 15.8333L10.0003 12.5ZM10.0003 12.5L9.16699 10.8333H10.8337L10.0003 12.5Z"
            stroke="#8B98A5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.9163 5.41675V4.58342C12.9163 2.97259 11.6105 1.66675 9.99967 1.66675C8.38884 1.66675 7.08301 2.97259 7.08301 4.58342V5.41675C7.08301 7.02758 8.38884 8.3334 9.99967 8.3334C11.6105 8.3334 12.9163 7.02758 12.9163 5.41675Z"
            stroke="#8B98A5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm font-medium text-[#F7F9F9] md:text-[15px]">
          Individual Investor
        </span>
      </div>

      {/* Bio section - more compact */}
      <div className="rounded-2xl border border-[rgba(40,44,52,1)] bg-[rgba(12,16,20,0.55)] px-3 py-3 backdrop-blur-[50px] md:px-4 md:py-4">
        <p className="text-sm leading-relaxed text-[#F7F9F9] md:text-[15px]">
          Hi, I'm Jane Doe. I'm a self-taught investor exploring markets with
          curiosity and discipline. I focus on long-term value, smart
          risk-taking, and staying calm when the market isn't. Always learning,
          always adapting.
        </p>
      </div>
    </div>
  );
};

export default UserInfoCards;
