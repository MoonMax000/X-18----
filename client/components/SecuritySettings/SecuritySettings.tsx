import { FC, useState } from "react";
import { cn } from "@/lib/utils";

const SecuritySettings: FC = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [userEmail] = useState("example@gmail.com");

  // Mock session data
  const sessions = [
    {
      id: 1,
      device: "Device 1",
      isCurrent: true,
      ip: "95.24.157.83",
      country: "Russian Federation",
      flag: (
        <svg width="24" height="16" viewBox="0 0 25 16" fill="none">
          <g clipPath="url(#clip0_ru)">
            <path d="M24.4004 0H0.400391V8H24.4004V0Z" fill="white" />
            <path d="M24.4004 8H0.400391V16H24.4004V8Z" fill="#D52B1E" />
            <path d="M24.4004 5.33301H0.400391V10.6663H24.4004V5.33301Z" fill="#0039A6" />
          </g>
          <defs>
            <clipPath id="clip0_ru">
              <rect width="24" height="16" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      createdAt: "12.09.25 at 00:00",
      expiresAt: "12.10.25 at 00:00",
      status: "Active",
    },
    {
      id: 2,
      device: "Device 2",
      isCurrent: false,
      ip: "2.75.143.219",
      country: "Kazakhstan",
      flag: (
        <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
          <rect width="24" height="16" fill="#00AFCA" />
        </svg>
      ),
      createdAt: "11.09.25 at 12:00",
      expiresAt: "11.10.25 at 12:00",
      status: "Active",
    },
  ];

  return (
    <div className="flex flex-col gap-4 max-w-[1059px] mx-auto">
      {/* Account Section */}
      <div className="flex flex-col gap-4 p-4 rounded-3xl border border-[#181B22] bg-black/50 backdrop-blur-[50px]">
        <div className="flex items-center gap-2.5 pb-2">
          <h2
            className="flex-1 text-2xl font-bold text-white"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Account
          </h2>
        </div>

        {/* Email */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="text-[15px] font-bold text-white"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                Email:
              </span>
              <span
                className="text-[15px] font-bold text-white"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                {userEmail}
              </span>
            </div>
            <span
              className="text-[15px] text-[#B0B0B0]"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              You can update your email address
            </span>
          </div>
          <button
            className="group relative flex justify-center items-center gap-2 px-6 py-3 min-w-[180px] overflow-hidden rounded-full border border-[#525252] bg-gradient-to-r from-[#A06AFF]/20 via-[#A06AFF]/10 to-transparent text-sm font-medium transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/30 hover:via-[#A06AFF]/15 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
          >
            <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <svg className="relative z-10 w-4 h-4 text-white" viewBox="0 0 20 20" fill="none">
              <path d="M14.1663 2.49993C14.3854 2.28106 14.6452 2.10744 14.9312 1.98899C15.2171 1.87054 15.5236 1.80957 15.8333 1.80957C16.1429 1.80957 16.4494 1.87054 16.7353 1.98899C17.0213 2.10744 17.2811 2.28106 17.5002 2.49993C17.719 2.71904 17.8927 2.97887 18.0111 3.26481C18.1296 3.55075 18.1905 3.85724 18.1905 4.16693C18.1905 4.47662 18.1296 4.78311 18.0111 5.06905C17.8927 5.35499 17.719 5.61481 17.5002 5.83393L6.24984 17.0833L1.66650 18.3333L2.91650 13.7499L14.1663 2.49993Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span
              className="relative z-10 text-[15px] font-bold text-white text-center"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Change
            </span>
          </button>
        </div>

        {/* Password */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <span
              className="text-[15px] font-bold text-white"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Password
            </span>
            <span
              className="text-[15px] text-[#B0B0B0]"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Change your password to update & protect your account
            </span>
          </div>
          <button
            className="group relative flex justify-center items-center gap-2 px-6 py-3 min-w-[180px] overflow-hidden rounded-full border border-[#525252] bg-gradient-to-r from-[#A06AFF]/20 via-[#A06AFF]/10 to-transparent text-sm font-medium transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/30 hover:via-[#A06AFF]/15 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
          >
            <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <svg className="relative z-10 w-4 h-4 text-white" viewBox="0 0 20 20" fill="none">
              <path d="M14.1663 2.49993C14.3854 2.28106 14.6452 2.10744 14.9312 1.98899C15.2171 1.87054 15.5236 1.80957 15.8333 1.80957C16.1429 1.80957 16.4494 1.87054 16.7353 1.98899C17.0213 2.10744 17.2811 2.28106 17.5002 2.49993C17.719 2.71904 17.8927 2.97887 18.0111 3.26481C18.1296 3.55075 18.1905 3.85724 18.1905 4.16693C18.1905 4.47662 18.1296 4.78311 18.0111 5.06905C17.8927 5.35499 17.719 5.61481 17.5002 5.83393L6.24984 17.0833L1.66650 18.3333L2.91650 13.7499L14.1663 2.49993Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span
              className="relative z-10 text-[15px] font-bold text-white text-center"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Change
            </span>
          </button>
        </div>

        {/* Phone number */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <span
              className="text-[15px] font-bold text-white"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Phone number
            </span>
            <span
              className="text-[15px] text-[#B0B0B0]"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Add your mobile phone number.
            </span>
          </div>
          <button
            className="group relative flex justify-center items-center gap-2 px-6 py-3 min-w-[180px] overflow-hidden rounded-full border border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent text-sm font-medium transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
          >
            <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <svg className="relative z-10 w-4 h-4 text-[#E5E7EB]" viewBox="0 0 20 20" fill="none">
              <path d="M10 4.16699V15.8337M4.16667 10.0003H15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span
              className="relative z-10 text-[15px] font-bold text-[#E5E7EB] text-center"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Add
            </span>
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication Section */}
      <div className="flex flex-col gap-4 p-4 rounded-3xl border border-[#181B22] bg-black/50 backdrop-blur-[50px]">
        <div className="flex items-center gap-2.5 pb-2">
          <h2
            className="flex-1 text-2xl font-bold text-white"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Two-Factor Authentication
          </h2>
        </div>

        {/* Enable Authentication Toggle */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <span
              className="text-[15px] font-bold text-white"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Enable Authentication
            </span>
            <span
              className="text-[15px] text-[#B0B0B0]"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Enable Two-Factor Authentication to enchance the security
            </span>
          </div>
          <button
            onClick={() => setIs2FAEnabled(!is2FAEnabled)}
            className={cn(
              "relative flex items-center w-[50px] h-6 p-0.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black",
              is2FAEnabled
                ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] shadow-lg shadow-[#A06AFF]/30 focus:ring-[#A06AFF]"
                : "bg-[#525252] focus:ring-gray-500"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300",
                is2FAEnabled ? "translate-x-[26px]" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Current Method */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="text-[15px] font-bold text-white"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                Current Method:
              </span>
              <span
                className="text-[15px] font-bold text-white"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                Email
              </span>
            </div>
            <span
              className="text-[15px] text-[#B0B0B0]"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Manage your preffered method of receiving verification odes
            </span>
          </div>
          <button
            className="group relative flex justify-center items-center gap-2 px-6 py-3 min-w-[180px] overflow-hidden rounded-full border border-[#525252] bg-gradient-to-r from-[#A06AFF]/20 via-[#A06AFF]/10 to-transparent text-sm font-medium transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/30 hover:via-[#A06AFF]/15 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
          >
            <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <svg className="relative z-10 w-4 h-4 text-white" viewBox="0 0 20 20" fill="none">
              <path d="M10.0003 12.5003C11.381 12.5003 12.5003 11.381 12.5003 10.0003C12.5003 8.61961 11.381 7.50033 10.0003 7.50033C8.61961 7.50033 7.50033 8.61961 7.50033 10.0003C7.50033 11.381 8.61961 12.5003 10.0003 12.5003Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.1663 12.5003C16.0551 12.7527 16.0225 13.0344 16.0732 13.3066C16.124 13.5788 16.2557 13.8289 16.4497 14.0253L16.4913 14.067C16.6464 14.222 16.7695 14.4062 16.8537 14.6091C16.9379 14.812 16.9815 15.0296 16.9815 15.2495C16.9815 15.4693 16.9379 15.687 16.8537 15.8899C16.7695 16.0928 16.6464 16.277 16.4913 16.432C16.3363 16.5871 16.1521 16.7101 15.9492 16.7944C15.7463 16.8786 15.5286 16.9222 15.3088 16.9222C15.0889 16.9222 14.8713 16.8786 14.6684 16.7944C14.4655 16.7101 14.2813 16.5871 14.1263 16.432L14.0847 16.3903C13.8882 16.1963 13.6381 16.0647 13.366 16.0139C13.0938 15.9631 12.8121 15.9957 12.5597 16.107C12.3119 16.2134 12.1033 16.3912 11.9608 16.6185C11.8183 16.8459 11.7488 17.1124 11.7613 17.382V17.5003C11.7613 17.9424 11.5857 18.3664 11.2731 18.679C10.9606 18.9915 10.5365 19.167 10.0945 19.167C9.65243 19.167 9.22839 18.9915 8.91583 18.679C8.60327 18.3664 8.42773 17.9424 8.42773 17.5003V17.4337C8.40998 17.1551 8.30616 16.8886 8.13062 16.6703C7.95509 16.4521 7.71568 16.2925 7.44441 16.2128C7.19201 16.1016 6.91031 16.069 6.63815 16.1198C6.36598 16.1706 6.1159 16.3022 5.91941 16.4962L5.87774 16.5378C5.72272 16.6929 5.53854 16.816 5.33562 16.9002C5.13271 16.9844 4.91505 17.028 4.69524 17.028C4.47542 17.028 4.25776 16.9844 4.05485 16.9002C3.85193 16.816 3.66775 16.6929 3.51274 16.5378C3.35768 16.3828 3.2346 16.1986 3.15039 15.9957C3.06619 15.7928 3.02258 15.5752 3.02258 15.3553C3.02258 15.1355 3.06619 14.9179 3.15039 14.715C3.2346 14.512 3.35768 14.3279 3.51274 14.1728L3.55441 14.1312C3.74839 13.9347 3.88005 13.6846 3.93082 13.4124C3.98159 13.1403 3.94898 12.8586 3.83774 12.6062C3.7313 12.3583 3.55354 12.1498 3.32617 12.0073C3.0988 11.8648 2.83227 11.7953 2.56191 11.8078H2.44358C2.00152 11.8078 1.57747 11.6323 1.26491 11.3197C0.952352 11.0072 0.776814 10.5831 0.776814 10.1411C0.776814 9.69902 0.952352 9.27498 1.26491 8.96242C1.57747 8.64986 2.00152 8.47433 2.44358 8.47433H2.51024C2.78888 8.45658 3.0554 8.35276 3.27364 8.17722C3.49188 8.00169 3.65143 7.76228 3.73108 7.49099C3.84232 7.23859 3.87493 6.95689 3.82416 6.68473C3.77339 6.41256 3.64173 6.16248 3.44774 5.96599L3.40608 5.92433C3.25101 5.76931 3.12793 5.58513 3.04373 5.38222C2.95952 5.1793 2.91591 4.96164 2.91591 4.74183C2.91591 4.52202 2.95952 4.30436 3.04373 4.10144C3.12793 3.89853 3.25101 3.71435 3.40608 3.55933C3.56109 3.40426 3.74527 3.28119 3.94819 3.19698C4.1511 3.11277 4.36876 3.06916 4.58858 3.06916C4.80839 3.06916 5.02605 3.11277 5.22896 3.19698C5.43188 3.28119 5.61606 3.40426 5.77108 3.55933L5.81274 3.60099C6.00923 3.79498 6.25931 3.92664 6.53148 3.97741C6.80364 4.02818 7.08534 3.99557 7.33774 3.88433H7.44358C7.69143 3.77789 7.89995 3.60013 8.04246 3.37276C8.18497 3.14539 8.25447 2.87886 8.24191 2.60849V2.49016C8.24191 2.04809 8.41745 1.62405 8.73001 1.31149C9.04257 0.998931 9.46662 0.823395 9.90868 0.823395C10.3507 0.823395 10.7748 0.998931 11.0873 1.31149C11.3999 1.62405 11.5754 2.04809 11.5754 2.49016V2.55683C11.563 2.8272 11.6325 3.09373 11.775 3.3211C11.9175 3.54847 12.126 3.72623 12.3739 3.83266C12.6263 3.9439 12.908 3.97651 13.1801 3.92574C13.4523 3.87497 13.7024 3.74331 13.8989 3.54933L13.9405 3.50766C14.0956 3.35259 14.2797 3.22952 14.4826 3.14531C14.6856 3.0611 14.9032 3.01749 15.123 3.01749C15.3429 3.01749 15.5605 3.0611 15.7634 3.14531C15.9664 3.22952 16.1505 3.35259 16.3055 3.50766C16.4606 3.66268 16.5837 3.84686 16.6679 4.04977C16.7521 4.25269 16.7957 4.47035 16.7957 4.69016C16.7957 4.90997 16.7521 5.12763 16.6679 5.33055C16.5837 5.53346 16.4606 5.71764 16.3055 5.87266L16.2639 5.91433C16.0699 6.11082 15.9382 6.3609 15.8875 6.63306C15.8367 6.90523 15.8693 7.18693 15.9805 7.43933V7.54516C16.087 7.79301 16.2647 8.00153 16.4921 8.14404C16.7195 8.28655 16.986 8.35605 17.2564 8.34349H17.3747C17.8168 8.34349 18.2408 8.51903 18.5534 8.83159C18.8659 9.14415 19.0415 9.56819 19.0415 10.0103C19.0415 10.4523 18.8659 10.8764 18.5534 11.1889C18.2408 11.5015 17.8168 11.677 17.3747 11.677H17.308C17.0377 11.6646 16.7711 11.7341 16.5438 11.8766C16.3164 12.0191 16.1387 12.2277 16.0322 12.4755V12.5003Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span
              className="relative z-10 text-[15px] font-bold text-white text-center"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Edit
            </span>
          </button>
        </div>
      </div>

      {/* Recovery Section */}
      <div className="flex flex-col gap-4 p-4 rounded-3xl border border-[#181B22] bg-black/50 backdrop-blur-[50px]">
        <div className="flex items-center gap-2.5 pb-2">
          <h2
            className="flex-1 text-2xl font-bold text-white"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Recovery
          </h2>
        </div>

        {/* Recovery email */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="text-[15px] font-bold text-white"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                Recovery email address:
              </span>
              <span
                className="text-[15px] font-bold text-white"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                None
              </span>
            </div>
            <span
              className="text-[15px] text-[#B0B0B0]"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Setup Recovery email to secure your account
            </span>
          </div>
          <button
            className="group relative flex justify-center items-center gap-2 px-6 py-3 min-w-[180px] overflow-hidden rounded-full border border-[#525252] bg-gradient-to-r from-[#A06AFF]/20 via-[#A06AFF]/10 to-transparent text-sm font-medium transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/30 hover:via-[#A06AFF]/15 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
          >
            <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <svg className="relative z-10 w-4 h-4 text-white" viewBox="0 0 20 20" fill="none">
              <path d="M15.5907 2.91311C14.0137 2.12851 12.0841 1.66699 10 1.66699C7.91592 1.66699 5.98625 2.12851 4.4093 2.91311C3.63598 3.29788 3.24932 3.49026 2.87467 4.09514C2.5 4.70003 2.5 5.28573 2.5 6.45711V9.36458C2.5 14.1007 6.2853 16.734 8.4775 17.8618C9.08892 18.1764 9.39458 18.3337 10 18.3337C10.6054 18.3337 10.9111 18.1764 11.5224 17.8618C13.7147 16.734 17.5 14.1007 17.5 9.36458V6.45711C17.5 5.28573 17.5 4.70004 17.1253 4.09514C16.7507 3.49025 16.364 3.29788 15.5907 2.91311Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 7.5V12.5M7.5 10H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span
              className="relative z-10 text-[15px] font-bold text-white text-center"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Setup
            </span>
          </button>
        </div>

        {/* Recovery phone */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="text-[15px] font-bold text-white"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                Recovery phone number:
              </span>
              <span
                className="text-[15px] font-bold text-white"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                None
              </span>
            </div>
            <span
              className="text-[15px] text-[#B0B0B0]"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Add phone number to setup SMS Recovery for your account
            </span>
          </div>
          <button
            className="group relative flex justify-center items-center gap-2 px-6 py-3 min-w-[180px] overflow-hidden rounded-full border border-[#525252] bg-gradient-to-r from-[#A06AFF]/20 via-[#A06AFF]/10 to-transparent text-sm font-medium transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/30 hover:via-[#A06AFF]/15 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
          >
            <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <svg className="relative z-10 w-4 h-4 text-white" viewBox="0 0 20 20" fill="none">
              <path d="M15.5907 2.91311C14.0137 2.12851 12.0841 1.66699 10 1.66699C7.91592 1.66699 5.98625 2.12851 4.4093 2.91311C3.63598 3.29788 3.24932 3.49026 2.87467 4.09514C2.5 4.70003 2.5 5.28573 2.5 6.45711V9.36458C2.5 14.1007 6.2853 16.734 8.4775 17.8618C9.08892 18.1764 9.39458 18.3337 10 18.3337C10.6054 18.3337 10.9111 18.1764 11.5224 17.8618C13.7147 16.734 17.5 14.1007 17.5 9.36458V6.45711C17.5 5.28573 17.5 4.70004 17.1253 4.09514C16.7507 3.49025 16.364 3.29788 15.5907 2.91311Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 7.5V12.5M7.5 10H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span
              className="relative z-10 text-[15px] font-bold text-white text-center"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Setup
            </span>
          </button>
        </div>
      </div>

      {/* User Sessions Section */}
      <div className="flex flex-col gap-6 p-4 rounded-3xl border border-[#181B22] bg-black/50 backdrop-blur-[50px]">
        <div className="flex justify-end items-center pb-2">
          <div className="flex flex-col gap-2 flex-1">
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              User Sessions
            </h2>
            <p
              className="text-[15px] text-white"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Here you can see all active sessions on your account. Each session shows the device and login time. If you don't recognize a session, you can end it to protect your account.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Table Header */}
          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center flex-1">
              <span
                className="text-xs font-bold text-[#B0B0B0] uppercase"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                Device
              </span>
            </div>
            <div className="flex items-center flex-1">
              <span
                className="text-xs font-bold text-[#B0B0B0] uppercase"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                IP Address
              </span>
            </div>
            <div className="flex items-center flex-1">
              <span
                className="text-xs font-bold text-[#B0B0B0] uppercase"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                create at
              </span>
            </div>
            <div className="flex items-center flex-1">
              <span
                className="text-xs font-bold text-[#B0B0B0] uppercase"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                Expired at
              </span>
            </div>
            <div className="flex items-center flex-1">
              <span
                className="text-xs font-bold text-[#B0B0B0] uppercase"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                Status
              </span>
            </div>
            <div className="flex justify-center items-center w-[120px]">
              <span
                className="text-xs font-bold text-[#B0B0B0] uppercase"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                Actions
              </span>
            </div>
          </div>

          {/* Session Rows */}
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className={cn(
                "flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0",
                index > 0 && "pt-4 border-t border-[#181B22]"
              )}
            >
              {/* Device */}
              <div className="flex flex-col gap-0.5 flex-1">
                <span
                  className="text-[15px] font-bold text-white"
                  style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                >
                  {session.device}
                </span>
                {session.isCurrent && (
                  <span
                    className="text-xs font-bold text-[#A06AFF]"
                    style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                  >
                    Current session
                  </span>
                )}
              </div>

              {/* IP Address */}
              <div className="flex items-center gap-2 flex-1">
                {session.flag}
                <span
                  className="text-[15px] font-bold text-white"
                  style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                >
                  {session.ip}
                </span>
              </div>

              {/* Created At */}
              <div className="flex items-center flex-1">
                <span
                  className="text-[15px] font-bold text-white"
                  style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                >
                  {session.createdAt}
                </span>
              </div>

              {/* Expires At */}
              <div className="flex items-center flex-1">
                <span
                  className="text-[15px] font-bold text-white"
                  style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                >
                  {session.expiresAt}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center flex-1">
                <div className="flex justify-center items-center gap-1 px-1 py-0.5 rounded bg-[#1C3430]">
                  <span
                    className="text-xs font-bold text-[#2EBD85]"
                    style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                  >
                    {session.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center items-center gap-2 w-full md:w-[120px]">
                <button className="p-1">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M16.25 4.58301L15.7336 12.9373C15.6016 15.0717 15.5357 16.1389 15.0007 16.9063C14.7361 17.2856 14.3956 17.6058 14.0006 17.8463C13.2017 18.333 12.1325 18.333 9.99392 18.333C7.8526 18.333 6.78192 18.333 5.98254 17.8454C5.58733 17.6044 5.24667 17.2837 4.98223 16.9037C4.4474 16.1352 4.38287 15.0664 4.25384 12.929L3.75 4.58301"
                      stroke="#EF454A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M2.5 4.58366H17.5M13.3797 4.58366L12.8109 3.4101C12.433 2.63054 12.244 2.24076 11.9181 1.99767C11.8458 1.94374 11.7693 1.89578 11.6892 1.85424C11.3283 1.66699 10.8951 1.66699 10.0287 1.66699C9.14067 1.66699 8.69667 1.66699 8.32973 1.86209C8.24842 1.90533 8.17082 1.95524 8.09774 2.0113C7.76803 2.26424 7.58386 2.66828 7.21551 3.47638L6.71077 4.58366"
                      stroke="#EF454A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path d="M7.91699 13.75V8.75" stroke="#EF454A" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12.083 13.75V8.75" stroke="#EF454A" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deactivate or Delete Account Section */}
      <div className="flex flex-col gap-4 p-4 rounded-3xl border border-[#181B22] bg-black/50 backdrop-blur-[50px]">
        <div className="flex items-center gap-2.5 pb-2">
          <h2
            className="flex-1 text-2xl font-bold text-white"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Deactivate or Delete Account
          </h2>
        </div>

        {/* Deactivate Account */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <span
              className="text-[15px] font-bold text-white"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Deactivate Account
            </span>
            <span
              className="text-[15px] text-[#B0B0B0]"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Temporarily hide your profile and pause notifications. You can reactivate at any time by logging in.
            </span>
          </div>
          <button
            className="group relative flex justify-center items-center gap-2 px-6 py-3 min-w-[180px] overflow-hidden rounded-full border border-[#523A83] bg-gradient-to-r from-[#A06AFF]/20 via-[#A06AFF]/10 to-transparent text-sm font-medium transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/30 hover:via-[#A06AFF]/15 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
          >
            <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <svg className="relative z-10 w-4 h-4 text-white" viewBox="0 0 20 20" fill="none">
              <path d="M10 18.3337C14.6024 18.3337 18.3333 14.6027 18.3333 10.0003C18.3333 5.39795 14.6024 1.66699 10 1.66699C5.39763 1.66699 1.66667 5.39795 1.66667 10.0003C1.66667 14.6027 5.39763 18.3337 10 18.3337Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.33333 7.5V12.5M11.6667 7.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span
              className="relative z-10 text-[15px] font-bold text-white text-center"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Deactivate
            </span>
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <span
              className="text-[15px] font-bold text-white"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Delete Account
            </span>
            <span
              className="text-[15px] text-[#B0B0B0]"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Permanently remove your profile and all related data. This action is irreversible.
            </span>
          </div>
          <button
            className="group relative flex justify-center items-center gap-2 px-6 py-3 min-w-[180px] overflow-hidden rounded-full border border-[#3A2127] bg-gradient-to-r from-[#EF454A]/10 via-[#EF454A]/5 to-transparent text-sm font-medium transition-all duration-300 hover:border-[#EF454A] hover:from-[#EF454A]/20 hover:via-[#EF454A]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#EF454A]/30 focus:outline-none focus:ring-2 focus:ring-[#EF454A] focus:ring-inset"
          >
            <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <svg className="relative z-10 w-4 h-4 text-[#EF454A]" viewBox="0 0 20 20" fill="none">
              <path d="M16.25 4.58301L15.7336 12.9373C15.6016 15.0717 15.5357 16.1389 15.0007 16.9063C14.7361 17.2856 14.3956 17.6058 14.0006 17.8463C13.2017 18.333 12.1325 18.333 9.99392 18.333C7.8526 18.333 6.78192 18.333 5.98254 17.8454C5.58733 17.6044 5.24667 17.2837 4.98223 16.9037C4.4474 16.1352 4.38287 15.0664 4.25384 12.929L3.75 4.58301" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M2.5 4.58366H17.5M13.3797 4.58366L12.8109 3.4101C12.433 2.63054 12.244 2.24076 11.9181 1.99767C11.8458 1.94374 11.7693 1.89578 11.6892 1.85424C11.3283 1.66699 10.8951 1.66699 10.0287 1.66699C9.14067 1.66699 8.69667 1.66699 8.32973 1.86209C8.24842 1.90533 8.17082 1.95524 8.09774 2.0113C7.76803 2.26424 7.58386 2.66828 7.21551 3.47638L6.71077 4.58366" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7.91699 13.75V8.75M12.083 13.75V8.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span
              className="relative z-10 text-[15px] font-bold text-[#EF454A] text-center"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
