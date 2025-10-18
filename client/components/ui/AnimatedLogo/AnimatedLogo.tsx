import { FC } from "react";
import { Link } from "react-router-dom";

export const AnimatedLogo: FC = () => {
  return (
    <Link to="/" className="flex gap-[10px] items-center group">
      <svg
        className="w-[18px] h-[22px] shrink-0 transition-transform duration-300 group-hover:rotate-[6deg] group-hover:scale-110"
        width="18"
        height="23"
        viewBox="0 0 18 23"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 11.4935L0.000836009 11.5607C1.99496 11.1253 3.99971 10.6706 6.00816 10.215L6.01186 21.0231L12.7689 22.5C12.7689 20.1266 12.7479 13.4405 12.77 11.0677L8.04193 10.0343L7.41266 9.89685C10.9481 9.0969 14.49 8.30751 18 7.62785L17.9988 0.5C12.0625 1.79714 5.95525 3.33041 0 4.43313L0 11.4935Z"
          fill="url(#paint0_linear)"
        />
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="4.37143"
            y1="24.15"
            x2="13.044"
            y2="2.25457"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#A06AFF"/>
            <stop offset="1" stopColor="#7F57FF"/>
          </linearGradient>
        </defs>
      </svg>

      <span className="hidden md:block text-2xl font-bold text-white transition-colors duration-300">
        Tyrian Trade
      </span>
    </Link>
  );
};
