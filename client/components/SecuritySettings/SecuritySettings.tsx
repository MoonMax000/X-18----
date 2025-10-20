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
            className="flex justify-center items-center gap-2 px-4 py-3 min-w-[180px] h-[50px] rounded-lg bg-gradient-to-l from-[#A06AFF] to-[#482090] shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] backdrop-blur-[50px]"
          >
            <span
              className="text-[15px] font-bold text-white text-center"
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
            className="flex justify-center items-center gap-2 px-4 py-3 min-w-[180px] h-[50px] rounded-lg bg-gradient-to-l from-[#A06AFF] to-[#482090] shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] backdrop-blur-[50px]"
          >
            <span
              className="text-[15px] font-bold text-white text-center"
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
            className="flex justify-center items-center gap-2 px-4 py-3 min-w-[180px] h-[50px] rounded-lg bg-gradient-to-l from-[#A06AFF] to-[#482090] shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] backdrop-blur-[50px]"
          >
            <span
              className="text-[15px] font-bold text-white text-center"
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
            className="flex justify-center items-center gap-2 px-4 py-3 min-w-[180px] h-[50px] rounded-lg bg-gradient-to-l from-[#A06AFF] to-[#482090] shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] backdrop-blur-[50px]"
          >
            <span
              className="text-[15px] font-bold text-white text-center"
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
