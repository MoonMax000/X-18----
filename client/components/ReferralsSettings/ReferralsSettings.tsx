import { FC, useState } from "react";
import { cn } from "@/lib/utils";

const ReferralsSettings: FC = () => {
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");

  const handleCopy = () => {
    navigator.clipboard.writeText("https://trading.example.com/ref/beautydoe");
    // Could add a toast notification here
  };

  return (
    <div className="flex w-full max-w-[1059px] flex-col items-center gap-8">
      {/* Header Section */}
      <section className="w-full">
        <div className="flex w-full flex-col gap-8 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Refer & Earn Big!
            </h1>
            <p className="text-sm font-normal text-white sm:text-[15px]">
              Share your unique referral link with friends and earn rewards for
              each successful referral. Both you and your friend will receive
              bonuses when they join our platform.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex h-[116px] flex-col justify-between gap-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]">
              <span className="text-xs font-bold uppercase text-webGray">
                Invites Sent
              </span>
              <span className="text-2xl font-bold text-white">0</span>
            </div>
            <div className="flex h-[116px] flex-col justify-between gap-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]">
              <span className="text-xs font-bold uppercase text-webGray">
                Successful Referrals
              </span>
              <span className="text-2xl font-bold text-white">0</span>
            </div>
            <div className="flex h-[116px] flex-col justify-between gap-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]">
              <span className="text-xs font-bold uppercase text-webGray">
                Total Earnings
              </span>
              <span className="text-2xl font-bold text-white">$0</span>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Link Section */}
      <section className="w-full">
        <div className="flex w-full flex-col gap-4 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
          <h2 className="text-lg font-bold text-white sm:text-[19px]">
            Your unique referral link
          </h2>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] px-4 py-3 shadow-[0_4px_8px_rgba(0,0,0,0.24)] backdrop-blur-[50px]">
              <span className="flex-1 truncate text-sm font-bold text-white sm:text-[15px]">
                https://trading.example.com/ref/beautydoe
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#482090] px-3 text-xs font-bold text-white backdrop-blur-[50px] transition-opacity hover:opacity-90 sm:w-auto sm:text-sm"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <g clipPath="url(#clip0_copy)">
                  <path
                    d="M14.1365 7.48466C14.1345 5.02621 14.0973 3.75279 13.3815 2.88086C13.2434 2.71247 13.089 2.55808 12.9206 2.41989C12.0007 1.66504 10.6341 1.66504 7.90077 1.66504C5.16746 1.66504 3.8008 1.66504 2.88095 2.41989C2.71255 2.55807 2.55814 2.71247 2.41994 2.88086C1.66504 3.80066 1.66504 5.16722 1.66504 7.90035C1.66504 10.6335 1.66504 12 2.41994 12.9198C2.55813 13.0882 2.71255 13.2426 2.88095 13.3808C3.75293 14.0964 5.02644 14.1336 7.48506 14.1356"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.6903 7.52087L14.1617 7.48535M11.6786 18.3348L14.15 18.2992M18.3097 11.6855L18.2864 14.1519M7.50866 11.6968L7.48535 14.1632M9.5728 7.52087C8.8788 7.64517 7.76489 7.77302 7.50866 9.20774M16.2456 18.2992C16.9414 18.1857 18.0571 18.0749 18.3355 16.6442M16.2456 7.52087C16.9396 7.64517 18.0535 7.77302 18.3097 9.20774M9.58338 18.2982C8.88938 18.1742 7.77538 18.047 7.51836 16.6124"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_copy">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              Copy
            </button>
          </div>

          <p className="text-sm font-bold text-white sm:text-[15px]">
            Your friends have until 11:00 AM on June 30 to:
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]">
              <h3 className="text-lg font-bold text-white sm:text-[19px]">
                Create an Account
              </h3>
              <p className="text-sm font-normal text-webGray sm:text-[15px]">
                Users must use your referral link
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]">
              <h3 className="text-lg font-bold text-white sm:text-[19px]">
                Verify Identity
              </h3>
              <p className="text-sm font-normal text-webGray sm:text-[15px]">
                Users must complete identity verification for you to receive the
                reward
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]">
              <h3 className="text-lg font-bold text-white sm:text-[19px]">
                Buy a Subscription
              </h3>
              <p className="text-sm font-normal text-webGray sm:text-[15px]">
                Users must deposit at least 50 USDT
              </p>
            </div>
          </div>

          <p className="text-sm font-bold text-green sm:text-[15px]">
            Done! You will recieve BTC worth 10 USDT
          </p>
        </div>
      </section>

      {/* Reward Tiers Section */}
      <section className="w-full">
        <div className="flex w-full flex-col gap-4 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
          <h2 className="text-lg font-bold text-white sm:text-[19px]">
            Reward Tiers
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Tier 1 */}
            <div className="flex flex-col gap-6 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]">
              <div className="flex items-center gap-2">
                <div className="relative h-5 w-[18px]">
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                    <path
                      d="M18 9.1833V6.28029C18 4.64029 18 3.82028 17.5959 3.28529C17.1918 2.75029 16.2781 2.49056 14.4507 1.9711C13.2022 1.6162 12.1016 1.18863 11.2223 0.79829C10.0234 0.2661 9.424 0 9 0C8.576 0 7.9766 0.2661 6.77771 0.79829C5.89839 1.18863 4.79784 1.61619 3.54933 1.9711C1.72193 2.49056 0.80822 2.75029 0.40411 3.28529C0 3.82028 0 4.64029 0 6.28029V9.1833C0 14.8085 5.06277 18.1835 7.594 19.5194C8.2011 19.8398 8.5046 20 9 20C9.4954 20 9.7989 19.8398 10.406 19.5194C12.9372 18.1835 18 14.8085 18 9.1833Z"
                      fill="url(#paint0_tier1)"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_tier1"
                        x1="0"
                        y1="10"
                        x2="18"
                        y2="10"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#734E2B" />
                        <stop offset="1" stopColor="#D99351" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute left-[5px] top-[2px] h-4 w-2 text-xs font-bold uppercase text-white">
                    1
                  </span>
                </div>
                <span className="text-sm font-bold text-webGray sm:text-[15px]">
                  TIER 1
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-white sm:text-[19px]">
                  1-5 Referrals
                </h3>
                <p className="text-sm font-normal text-primary sm:text-[15px]">
                  $10 credit each
                </p>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="flex flex-col gap-6 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]">
              <div className="flex items-center gap-2">
                <div className="relative h-5 w-[18px]">
                  <svg width="19" height="20" viewBox="0 0 19 20" fill="none">
                    <path
                      d="M18.667 9.1833V6.28029C18.667 4.64029 18.667 3.82028 18.2629 3.28529C17.8588 2.75029 16.9451 2.49056 15.1177 1.9711C13.8692 1.6162 12.7686 1.18863 11.8893 0.79829C10.6904 0.2661 10.091 0 9.66699 0C9.24299 0 8.64359 0.2661 7.4447 0.79829C6.56538 1.18863 5.46483 1.61619 4.21632 1.9711C2.38892 2.49056 1.47521 2.75029 1.0711 3.28529C0.666992 3.82028 0.666992 4.64029 0.666992 6.28029V9.1833C0.666992 14.8085 5.72976 18.1835 8.26099 19.5194C8.86809 19.8398 9.17159 20 9.66699 20C10.1624 20 10.4659 19.8398 11.073 19.5194C13.6042 18.1835 18.667 14.8085 18.667 9.1833Z"
                      fill="url(#paint0_tier2)"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_tier2"
                        x1="18.667"
                        y1="10"
                        x2="0.666992"
                        y2="10"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#9BE4FF" />
                        <stop offset="1" stopColor="#5D8999" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute left-[5px] top-[2px] h-4 w-2 text-xs font-bold uppercase text-white">
                    2
                  </span>
                </div>
                <span className="text-sm font-bold text-webGray sm:text-[15px]">
                  TIER 2
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-white sm:text-[19px]">
                  6-10 Referrals
                </h3>
                <p className="text-sm font-normal text-primary sm:text-[15px]">
                  $15 credit each
                  <br />
                  1-month free Essential plan
                </p>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="flex flex-col gap-6 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]">
              <div className="flex items-center gap-2">
                <div className="relative h-5 w-[18px]">
                  <svg width="19" height="20" viewBox="0 0 19 20" fill="none">
                    <path
                      d="M18.333 9.1833V6.28029C18.333 4.64029 18.333 3.82028 17.9289 3.28529C17.5248 2.75029 16.6111 2.49056 14.7837 1.9711C13.5352 1.6162 12.4346 1.18863 11.5553 0.79829C10.3564 0.2661 9.75701 0 9.33301 0C8.90901 0 8.30961 0.2661 7.11072 0.79829C6.2314 1.18863 5.13085 1.61619 3.88234 1.9711C2.05494 2.49056 1.14123 2.75029 0.737118 3.28529C0.333008 3.82028 0.333008 4.64029 0.333008 6.28029V9.1833C0.333008 14.8085 5.39578 18.1835 7.92701 19.5194C8.53411 19.8398 8.83761 20 9.33301 20C9.82841 20 10.1319 19.8398 10.739 19.5194C13.2702 18.1835 18.333 14.8085 18.333 9.1833Z"
                      fill="url(#paint0_tier3)"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_tier3"
                        x1="18.333"
                        y1="10"
                        x2="0.333008"
                        y2="10"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#DCB99D" />
                        <stop offset="1" stopColor="#766354" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute left-[5px] top-[2px] h-4 w-2 text-xs font-bold uppercase text-white">
                    3
                  </span>
                </div>
                <span className="text-sm font-bold text-webGray sm:text-[15px]">
                  TIER 3
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-white sm:text-[19px]">
                  11+ Referrals
                </h3>
                <p className="text-sm font-normal text-primary sm:text-[15px]">
                  $20 credit each
                  <br />
                  Exclusive badge
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Invitations Section */}
      <section className="w-full">
        <div className="flex w-full flex-col gap-4 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-lg font-bold text-white sm:text-[19px]">
              Your Invitations
            </h2>
            <span className="text-lg font-bold text-primary sm:text-[19px]">
              0 USDT
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("active")}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-[32px] px-4 text-sm font-bold backdrop-blur-[58.33px] transition-all sm:text-[15px]",
                activeTab === "active"
                  ? "bg-gradient-to-r from-primary to-[#482090] text-white"
                  : "border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-webGray",
              )}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("inactive")}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-[32px] px-4 text-sm font-bold backdrop-blur-[58.33px] transition-all sm:text-[15px]",
                activeTab === "inactive"
                  ? "bg-gradient-to-r from-primary to-[#482090] text-white"
                  : "border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-webGray",
              )}
            >
              Inactive
            </button>
          </div>

          {/* Empty State */}
          <div className="flex h-48 flex-col items-center justify-center gap-2">
            <svg width="48" height="48" viewBox="0 0 49 48" fill="none">
              <path
                d="M44.5 24C44.5 12.9543 35.5456 4 24.5 4C13.4543 4 4.5 12.9543 4.5 24C4.5 35.0456 13.4543 44 24.5 44C35.5456 44 44.5 35.0456 44.5 24Z"
                stroke="#B0B0B0"
                strokeWidth="1.5"
              />
              <path
                d="M24.9844 34V24C24.9844 23.0572 24.9844 22.5858 24.6914 22.2928C24.3986 22 23.9272 22 22.9844 22"
                stroke="#B0B0B0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M24.4844 16H24.5024"
                stroke="#B0B0B0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3 className="text-lg font-bold text-white sm:text-[19px]">
              Nothing Found
            </h3>
            <p className="text-center text-sm font-normal text-webGray sm:text-[15px]">
              You haven't invited anyone yet.
              <br />
              Invite friends and earn rewards.
            </p>
          </div>
        </div>
      </section>

      {/* Terms & Conditions Section */}
      <section className="w-full">
        <div className="flex w-full flex-col gap-4 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
          <h2 className="text-lg font-bold text-white sm:text-[19px]">
            Terms & Conditions
          </h2>
          <p className="text-sm font-normal text-white sm:text-[15px]">
            Referred friends must sign up using your unique link and subscribe
            to a paid plan for you to receive the reward. Rewards are credited
            to your account within 14 days after your friend's subscription is
            confirmed. The referral program is subject to change at any time.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ReferralsSettings;
