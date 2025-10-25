import { FC, useState, memo, lazy, Suspense } from "react";
import { cn } from "@/lib/utils";
import TabLoader from "@/components/common/TabLoader";

const StripeConnectSettings = lazy(() => import("./StripeConnectSettings"));

interface StatCardProps {
  title: string;
  amount: string;
  change: string;
  changePercent: string;
}

const StatCard: FC<StatCardProps> = ({ title, amount, change, changePercent }) => (
  <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 backdrop-blur-[50px]">
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold uppercase text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
        {title}
      </span>
      <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
        {amount}
      </span>
    </div>
    <div className="flex items-baseline gap-1">
      <div className="flex items-center gap-1 rounded bg-[#1C3430] px-1 py-0.5">
        <span className="text-xs font-bold text-[#2EBD85]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
          {changePercent}
        </span>
      </div>
      <span className="text-xs font-bold uppercase text-[#A06AFF]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
        {change}
      </span>
    </div>
  </div>
);

const Monetization: FC = () => {
  const [activeTimeRange, setActiveTimeRange] = useState<"1M" | "3M" | "1Y">("1M");

  return (
    <div className="space-y-6">
      {/* Stripe Connect - Primary payment method */}
      <Suspense fallback={<TabLoader />}>
        <StripeConnectSettings />
      </Suspense>

      {/* Rest of monetization UI (stats, charts, etc.) */}
      <MonetizationStats activeTimeRange={activeTimeRange} setActiveTimeRange={setActiveTimeRange} />
    </div>
  );
};

const MonetizationStats: FC<{ activeTimeRange: "1M" | "3M" | "1Y"; setActiveTimeRange: (val: "1M" | "3M" | "1Y") => void }> = ({ activeTimeRange, setActiveTimeRange }) => {

  const revenueChartData = {
    "1M": [280, 320, 290, 350, 310, 380, 340, 360, 330, 370, 350, 400, 380, 390, 360, 410, 390, 420, 400, 430, 410, 440, 420, 450, 430, 460, 440, 470, 450, 480],
    "3M": [200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420],
    "1Y": [150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480],
  };

  const currentChartData = revenueChartData[activeTimeRange];
  const maxValue = Math.max(...currentChartData);
  const minValue = Math.min(...currentChartData);

  const revenueData = [
    { label: "Subscription", amount: "$4,500", percentage: 53 },
    { label: "Referrals", amount: "$1.200", percentage: 14 },
    { label: "Consulting", amount: "$3,750", percentage: 33 },
  ];

  const transactions = [
    { date: "06.06.25", amount: "$1,000", status: "completed" },
    { date: "01.06.25", amount: "$750", status: "completed" },
    { date: "26.05.25", amount: "$500", status: "pending" },
    { date: "19.05.25", amount: "$1,200", status: "completed" },
    { date: "12.05.25", amount: "$850", status: "completed" },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Top Stats Cards */}
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <StatCard
          title="Total Revenue"
          amount="$8,450"
          change="vs last month"
          changePercent="+12.5%"
        />
        <StatCard
          title="Referral Income"
          amount="$1,200"
          change="vs last month"
          changePercent="+8.3%"
        />
        <StatCard
          title="Consulting fees"
          amount="$3,750"
          change="vs last month"
          changePercent="+25.0%"
        />
      </div>

      {/* Revenue Trend Chart */}
      <div className="flex w-full flex-col gap-6 rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 backdrop-blur-[50px]">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            Revenue trend
          </h2>
          <div className="flex items-center gap-2">
            {(["1M", "3M", "1Y"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setActiveTimeRange(range)}
                className={cn(
                  "flex h-8 items-center justify-center rounded px-4 text-xs font-bold uppercase transition-all duration-200",
                  activeTimeRange === range
                    ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
                    : "border border-[#181B22] bg-[rgba(11,14,17,0.5)] text-[#B0B0B0] hover:border-[#A06AFF]/50 hover:text-white backdrop-blur-[50px]"
                )}
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative h-[280px] w-full sm:h-[320px]">
          <div className="flex h-full items-end gap-1 px-12">
            {currentChartData.map((value, index) => {
              const heightPercent = ((value - minValue) / (maxValue - minValue)) * 100;
              return (
                <div
                  key={index}
                  className="group relative flex flex-1 flex-col items-center gap-1"
                >
                  <div
                    className="relative w-full rounded-t-lg bg-gradient-to-t from-[#A06AFF] to-[#482090] transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${heightPercent}%` }}
                    title={`$${value}`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/90 border border-[#A06AFF] rounded px-2 py-1 text-xs font-bold text-white whitespace-nowrap z-10">
                      ${value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Y-axis labels */}
          <div className="pointer-events-none absolute left-0 top-0 flex h-full flex-col justify-between py-4 text-xs font-bold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            {Array.from({ length: 11 }, (_, i) => {
              const value = maxValue - (i * (maxValue - minValue) / 10);
              return <span key={i}>${Math.round(value)}</span>;
            })}
          </div>

          {/* X-axis labels */}
          <div className="pointer-events-none absolute bottom-0 left-0 flex w-full justify-between px-12 text-xs font-bold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            {activeTimeRange === "1M" && Array.from({ length: 30 }, (_, i) => {
              if ((i + 1) % 5 === 0 || i === 0) return <span key={i}>{i + 1}</span>;
              return <span key={i} className="opacity-0">{i + 1}</span>;
            })}
            {activeTimeRange === "3M" && ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (
              <span key={month}>{month}</span>
            ))}
            {activeTimeRange === "1Y" && ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map((month, i) => (
              <span key={i}>{month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: 3 columns */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Breakdown by Source */}
        <div className="flex flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 backdrop-blur-[50px]">
          <h3 className="pb-2 text-2xl font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            Breakdown by Source
          </h3>
          <div className="flex flex-col gap-6">
            {revenueData.map((item) => (
              <div key={item.label} className="flex flex-col gap-3">
                <span className="text-[15px] font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                  {item.label}
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                      {item.amount}
                    </span>
                    <span className="text-xs font-bold uppercase text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded bg-gradient-to-r from-[#0B0E11] to-[#23252D]">
                    <div
                      className="h-2 rounded-lg bg-gradient-to-r from-[#A06AFF] to-[#482090] transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payouts & Balance */}
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 backdrop-blur-[50px]">
          <h3 className="pb-2 text-2xl font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            Payouts & Balance
          </h3>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              Wallet Balance
            </span>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              $2,100
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              Pending Payouts
            </span>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              $500
            </span>
          </div>
          <button className="flex h-[26px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 py-2.5 backdrop-blur-[50px] transition-opacity hover:opacity-90">
            <svg width="20" height="20" viewBox="0 0 21 20" fill="none">
              <path d="M12.1667 2.5H4.66667C3.74619 2.5 3 3.24619 3 4.16667C3 5.08714 3.74619 5.83333 4.66667 5.83333H15.5C15.5 5.05836 15.5 4.67087 15.4148 4.35295C15.1837 3.49022 14.5097 2.81635 13.6471 2.58518C13.3292 2.5 12.9417 2.5 12.1667 2.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 4.16699V12.5003C3 14.8573 3 16.0358 3.73223 16.7681C4.46447 17.5003 5.64297 17.5003 8 17.5003H13C15.357 17.5003 16.5355 17.5003 17.2677 16.7681C18 16.0358 18 14.8573 18 12.5003V10.8337C18 8.47666 18 7.29813 17.2677 6.56589C16.5355 5.83366 15.357 5.83366 13 5.83366H6.33333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.0013 10H16.3346C15.9471 10 15.7534 10 15.5945 10.0426C15.1631 10.1582 14.8261 10.4951 14.7106 10.9265C14.668 11.0854 14.668 11.2792 14.668 11.6667C14.668 12.0542 14.668 12.2479 14.7106 12.4068C14.8261 12.8382 15.1631 13.1752 15.5945 13.2908C15.7534 13.3333 15.9471 13.3333 16.3346 13.3333H18.0013" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[15px] font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              Request Payout
            </span>
          </button>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              Payout methods
            </span>
            <div className="flex items-center justify-center gap-4">
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] transition-colors hover:border-[#A06AFF]/50" title="USD">
                <svg width="20" height="20" viewBox="0 0 21 20" fill="none">
                  <path d="M10.3333 18.3337C14.9357 18.3337 18.6667 14.6027 18.6667 10.0003C18.6667 5.39795 14.9357 1.66699 10.3333 1.66699C5.73096 1.66699 2 5.39795 2 10.0003C2 14.6027 5.73096 18.3337 10.3333 18.3337Z" stroke="white" strokeWidth="1.5"/>
                  <path d="M8.25 13.3337V6.66699" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9.5 6.66667V5M11.5833 6.66667V5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9.5 14.9997V13.333M11.5833 14.9997V13.333" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8.25 10H12.4167C13.107 10 13.6667 10.5597 13.6667 11.25V12.0833C13.6667 12.7737 13.107 13.3333 12.4167 13.3333H7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 6.66699H12.4167C13.107 6.66699 13.6667 7.22663 13.6667 7.91699V8.75033C13.6667 9.44066 13.107 10.0003 12.4167 10.0003H8.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] transition-colors hover:border-[#A06AFF]/50" title="ETH">
                <svg width="20" height="20" viewBox="0 0 21 20" fill="none">
                  <path d="M16.1666 10.0003L11.367 12.149C10.8574 12.3832 10.6026 12.5003 10.3333 12.5003C10.0641 12.5003 9.80922 12.3832 9.29964 12.149L4.5 10.0003M16.1666 10.0003C16.1666 9.55679 15.9121 9.16679 15.4028 8.38663L12.4831 3.91374C11.5053 2.41591 11.0165 1.66699 10.3333 1.66699C9.65023 1.66699 9.16131 2.41591 8.1836 3.91375L5.26386 8.38663C4.75462 9.16679 4.5 9.55679 4.5 10.0003M16.1666 10.0003C16.1666 10.4439 15.9121 10.8339 15.4028 11.614L12.4831 16.0869C11.5053 17.5847 11.0165 18.3336 10.3333 18.3336C9.65023 18.3336 9.16131 17.5847 8.18361 16.0869L5.26386 11.614C4.75462 10.8339 4.5 10.4439 4.5 10.0003" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] transition-colors hover:border-[#A06AFF]/50" title="Bank">
                <svg width="20" height="20" viewBox="0 0 21 20" fill="none">
                  <path d="M2 7.14122C2 6.1444 2.40198 5.53351 3.23386 5.07056L6.65822 3.16486C8.45258 2.16628 9.34975 1.66699 10.3333 1.66699C11.3169 1.66699 12.2141 2.16628 14.0084 3.16486L17.4328 5.07056C18.2647 5.53351 18.6667 6.14441 18.6667 7.14122C18.6667 7.41152 18.6667 7.54667 18.6372 7.65778C18.4821 8.24153 17.9531 8.33366 17.4423 8.33366H3.2244C2.71356 8.33366 2.1846 8.24153 2.02952 7.65778C2 7.54667 2 7.41152 2 7.14122Z" stroke="white" strokeWidth="1.5"/>
                  <path d="M10.3281 5.83301H10.3356" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.66406 8.33301V15.4163M6.9974 8.33301V15.4163" stroke="white" strokeWidth="1.5"/>
                  <path d="M13.6641 8.33301V15.4163M16.9974 8.33301V15.4163" stroke="white" strokeWidth="1.5"/>
                  <path d="M16.1667 15.417H4.5C3.11929 15.417 2 16.5362 2 17.917C2 18.1471 2.18655 18.3337 2.41667 18.3337H18.25C18.4801 18.3337 18.6667 18.1471 18.6667 17.917C18.6667 16.5362 17.5474 15.417 16.1667 15.417Z" stroke="white" strokeWidth="1.5"/>
                </svg>
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] transition-colors hover:border-[#A06AFF]/50" title="PayPal">
                <svg width="20" height="20" viewBox="0 0 21 20" fill="none">
                  <path d="M5.57538 4.02948L3.80166 14.7263C3.65228 15.6272 3.57759 16.0776 3.82596 16.3723C4.07432 16.667 4.52864 16.667 5.43727 16.667H5.77262C6.4583 16.667 6.80113 16.667 7.03491 16.4632C7.26868 16.2594 7.31716 15.9183 7.41413 15.236L7.80374 12.4948C7.83454 12.2781 7.84994 12.1697 7.87417 12.077C8.04774 11.4127 8.60899 10.9234 9.28781 10.8447C9.38256 10.8337 9.49148 10.8337 9.70931 10.8337H10.6776C13.2568 10.8337 15.4926 9.03974 16.0643 6.51186C16.6254 4.03013 14.7487 1.66699 12.2166 1.66699H8.35C7.42182 1.66699 6.95772 1.66699 6.59226 1.86266C6.38326 1.97455 6.20054 2.13013 6.05637 2.31895C5.80426 2.64913 5.72797 3.10924 5.57538 4.02948Z" stroke="white" strokeWidth="1.5"/>
                  <path d="M7.20262 16.25L7.01209 17.3606C6.92482 17.8692 7.3211 18.3333 7.84273 18.3333H9.5015C9.91342 18.3333 10.2649 18.0388 10.3326 17.637L10.9404 14.0297C11.0082 13.6279 11.3597 13.3333 11.7715 13.3333H13.2741C15.425 13.3333 17.2873 11.8557 17.7539 9.77891C18.0806 8.32519 17.3697 6.9251 16.1667 6.25098" stroke="white" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="flex flex-col gap-4 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 backdrop-blur-[50px]">
          <div className="flex items-baseline justify-between pb-2">
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              Recent Transactions
            </h3>
            <a href="#" className="text-[15px] font-bold text-[#A06AFF] underline transition-colors hover:text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              View All
            </a>
          </div>
          <div className="flex flex-col gap-4">
            {transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[15px] font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                    Payout
                  </span>
                  <span className="text-xs font-bold text-[#A06AFF]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                    {tx.date}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[15px] font-normal text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                    {tx.amount}
                  </span>
                  <div
                    className={cn(
                      "flex items-center justify-center rounded px-1 py-0.5",
                      tx.status === "completed" ? "bg-[#1C3430]" : "bg-[#2E2744]"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-bold",
                        tx.status === "completed" ? "text-[#2EBD85]" : "text-[#A06AFF]"
                      )}
                      style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                    >
                      {tx.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Monetization);
