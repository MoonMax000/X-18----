// Централизованные иконки для меню
// Все иконки переиспользуются из одного места

interface IconProps {
  className?: string;
  size?: number;
}

export const DashboardIcon = ({ className = "w-5 h-5", size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <g clipPath="url(#clip0_61_285)">
      <path d="M10.0002 15V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M1.95957 11.0113C1.66539 9.09684 1.5183 8.1397 1.88022 7.29116C2.24214 6.44261 3.04511 5.86203 4.65103 4.70089L5.85091 3.83334C7.84866 2.3889 8.84752 1.66667 10.0001 1.66667C11.1526 1.66667 12.1515 2.3889 14.1493 3.83334L15.3491 4.70089C16.9551 5.86203 17.758 6.44261 18.1199 7.29116C18.4818 8.1397 18.3348 9.09684 18.0406 11.0113L17.7898 12.6437C17.3727 15.3574 17.1642 16.7143 16.1909 17.5238C15.2177 18.3333 13.7948 18.3333 10.9491 18.3333H9.0511C6.20536 18.3333 4.78251 18.3333 3.80925 17.5238C2.83599 16.7143 2.62747 15.3574 2.21044 12.6437L1.95957 11.0113Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </g>
  </svg>
);

export const ProfileIcon = ({ className = "w-5 h-5", size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M5.48131 12.9013C4.30234 13.6033 1.21114 15.0368 3.09389 16.8305C4.01359 17.7067 5.03791 18.3333 6.32573 18.3333H13.6743C14.9621 18.3333 15.9864 17.7067 16.9061 16.8305C18.7888 15.0368 15.6977 13.6033 14.5187 12.9013C11.754 11.2551 8.24599 11.2551 5.48131 12.9013Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.75 5.41666C13.75 7.48772 12.0711 9.16666 10 9.16666C7.92893 9.16666 6.25 7.48772 6.25 5.41666C6.25 3.34559 7.92893 1.66666 10 1.66666C12.0711 1.66666 13.75 3.34559 13.75 5.41666Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const SecurityIcon = ({ className = "w-5 h-5", size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M17.5 9.31941V6.90023C17.5 5.53356 17.5 4.85022 17.1632 4.4044C16.8265 3.95856 16.0651 3.74212 14.5423 3.30924C13.5018 3.01349 12.5847 2.65718 11.8519 2.3319C10.8528 1.88841 10.3533 1.66666 10 1.66666C9.64667 1.66666 9.14717 1.88841 8.14809 2.3319C7.41532 2.65718 6.4982 3.01348 5.45778 3.30924C3.93494 3.74212 3.17352 3.95856 2.83676 4.4044C2.5 4.85022 2.5 5.53356 2.5 6.90023V9.31941C2.5 14.0071 6.71897 16.8196 8.82833 17.9328C9.33425 18.1998 9.58717 18.3333 10 18.3333C10.4128 18.3333 10.6657 18.1998 11.1717 17.9328C13.281 16.8196 17.5 14.0071 17.5 9.31941Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const NotificationIcon = ({ className = "w-5 h-5", size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M2.10819 12.308C1.93098 13.4697 2.72325 14.276 3.69329 14.6778C7.41226 16.2185 12.5876 16.2185 16.3065 14.6778C17.2766 14.276 18.0688 13.4697 17.8917 12.308C17.7828 11.5941 17.2443 10.9996 16.8453 10.4191C16.3227 9.64941 16.2708 8.80982 16.2707 7.91666C16.2707 4.46487 13.4632 1.66666 9.99992 1.66666C6.53669 1.66666 3.72919 4.46487 3.72919 7.91666C3.72911 8.80982 3.67719 9.64941 3.15459 10.4191C2.75562 10.9996 2.21709 11.5941 2.10819 12.308Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.66675 15.8333C7.04882 17.271 8.39633 18.3333 10.0001 18.3333C11.6038 18.3333 12.9513 17.271 13.3334 15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BillingIcon = ({ className = "w-5 h-5", size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M1.66675 10C1.66675 7.05211 1.66675 5.57815 2.54408 4.59409C2.68441 4.4367 2.83906 4.29114 3.0063 4.15907C4.05186 3.33334 5.61793 3.33334 8.75008 3.33334H11.2501C14.3822 3.33334 15.9483 3.33334 16.9938 4.15907C17.1611 4.29114 17.3157 4.4367 17.4561 4.59409C18.3334 5.57815 18.3334 7.05211 18.3334 10C18.3334 12.9479 18.3334 14.4218 17.4561 15.4059C17.3157 15.5633 17.1611 15.7088 16.9938 15.8409C15.9483 16.6667 14.3822 16.6667 11.2501 16.6667H8.75008C5.61793 16.6667 4.05186 16.6667 3.0063 15.8409C2.83906 15.7088 2.68441 15.5633 2.54408 15.4059C1.66675 14.4218 1.66675 12.9479 1.66675 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.33325 13.3333H9.58325" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.0833 13.3333H14.9999" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.66675 7.5H18.3334" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

export const ReferralsIcon = ({ className = "w-5 h-5", size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M12.5 6.66666C12.5 8.04736 11.3807 9.16666 10 9.16666C8.61925 9.16666 7.5 8.04736 7.5 6.66666C7.5 5.28595 8.61925 4.16666 10 4.16666C11.3807 4.16666 12.5 5.28595 12.5 6.66666Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.3333 3.33334C14.7139 3.33334 15.8333 4.45264 15.8333 5.83334C15.8333 6.85259 15.2233 7.72937 14.3485 8.11859" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.4286 11.6667H8.57143C6.59898 11.6667 5 13.2657 5 15.2381C5 16.0271 5.63959 16.6667 6.42857 16.6667H13.5714C14.3604 16.6667 15 16.0271 15 15.2381C15 13.2657 13.401 11.6667 11.4286 11.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.762 10.8333C16.7344 10.8333 18.3334 12.4323 18.3334 14.4048C18.3334 15.1938 17.6938 15.8333 16.9048 15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.66675 3.33334C5.28604 3.33334 4.16675 4.45264 4.16675 5.83334C4.16675 6.85259 4.77669 7.72937 5.65148 8.11859" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.09532 15.8333C2.30634 15.8333 1.66675 15.1938 1.66675 14.4048C1.66675 12.4323 3.26573 10.8333 5.23817 10.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const APIIcon = ({ className = "w-5 h-5", size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M2.08325 10C2.08325 6.26806 2.08325 4.40209 3.24262 3.24271C4.40199 2.08334 6.26797 2.08334 9.99992 2.08334C13.7318 2.08334 15.5978 2.08334 16.7573 3.24271C17.9166 4.40209 17.9166 6.26806 17.9166 10C17.9166 13.7319 17.9166 15.5979 16.7573 16.7573C15.5978 17.9167 13.7318 17.9167 9.99992 17.9167C6.26797 17.9167 4.40199 17.9167 3.24262 16.7573C2.08325 15.5979 2.08325 13.7319 2.08325 10Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4.99992 11.25L6.24992 7.5L7.81242 11.25M4.99992 11.25L4.58325 12.5M4.99992 11.25H7.81242M7.81242 11.25L8.33325 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.4167 10V8.08333C10.4167 7.92822 10.4167 7.85068 10.4372 7.78791C10.4783 7.66106 10.5778 7.56161 10.7047 7.52039C10.7674 7.5 10.845 7.5 11.0001 7.5H12.0834C12.7737 7.5 13.3334 8.05964 13.3334 8.75C13.3334 9.44033 12.7737 10 12.0834 10H10.4167ZM10.4167 10V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.4167 7.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const KYCIcon = ({ className = "w-5 h-5", size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M12.0833 7.08335C12.0833 4.78217 10.2178 2.91669 7.91667 2.91669C5.61548 2.91669 3.75 4.78217 3.75 7.08335C3.75 9.38452 5.61548 11.25 7.91667 11.25C10.2178 11.25 12.0833 9.38452 12.0833 7.08335Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.7499 17.0833C13.7499 13.8617 11.1383 11.25 7.91659 11.25C4.69493 11.25 2.08325 13.8617 2.08325 17.0833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.5833 8.20515C14.5833 7.35548 15.3294 6.66669 16.2499 6.66669C17.1704 6.66669 17.9166 7.35548 17.9166 8.20515C17.9166 8.51144 17.8197 8.79677 17.6525 9.03652C17.1544 9.75102 16.2499 10.0158 16.2499 10.8654V11.25M16.2418 13.3334H16.2493" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LogoutIcon = ({ className = "w-5 h-5", size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M9.16675 2.5L8.61458 2.69487C6.46564 3.45333 5.39115 3.83257 4.77895 4.69785C4.16675 5.56313 4.16675 6.70258 4.16675 8.9815V11.0185C4.16675 13.2974 4.16675 14.4368 4.77895 15.3022C5.39115 16.1674 6.46564 16.5467 8.61458 17.3052L9.16675 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17.5001 10H9.16675M17.5001 10C17.5001 9.41652 15.8382 8.3263 15.4167 7.91669M17.5001 10C17.5001 10.5835 15.8382 11.6738 15.4167 12.0834" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
