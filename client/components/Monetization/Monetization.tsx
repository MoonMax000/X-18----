import { FC, useState } from "react";
import { cn } from "@/lib/utils";

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
            Revenue trand
          </h2>
          <div className="flex items-center gap-2">
            {(["1M", "3M", "1Y"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setActiveTimeRange(range)}
                className={cn(
                  "flex h-8 items-center justify-center rounded px-4 text-xs font-bold uppercase",
                  activeTimeRange === range
                    ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
                    : "border border-[#181B22] bg-[rgba(11,14,17,0.5)] text-[#B0B0B0] backdrop-blur-[50px]"
                )}
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative h-[280px] w-full overflow-hidden sm:h-[320px]">
          <svg
            className="h-full w-full"
            viewBox="0 0 1009 331"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M20.6512 287.531L9 283.579V331H1000V40.8133L991.585 56.0567L985.76 82.0269L979.287 80.3332L976.05 85.9789L968.283 33.4738L965.694 40.8133L961.163 37.4258L951.453 43.6361L946.275 70.7355L942.391 63.9606C940.881 70.1709 937.86 82.4786 937.86 82.0269C937.86 81.5753 935.271 73.182 933.976 69.0418L930.093 82.5915L924.914 68.4772L918.442 64.5252L915.205 27.8281L905.496 45.8944H902.259L899.67 49.8464L897.728 43.0715L891.903 75.8166L889.961 66.7835L883.488 64.5252L879.604 74.1229L878.31 53.7984L875.073 64.5252L870.542 49.8464L866.658 57.7504L864.716 53.7984L862.775 56.0567L858.891 36.2967L855.654 78.6395L850.476 60.5732L845.298 56.0567L840.12 85.4143L831.705 102.351L825.232 98.964L824.585 113.078L821.348 101.787L816.17 117.03L812.286 151.469L807.755 153.163L803.224 155.421L800.635 177.439L797.398 180.262L789.631 177.439L779.922 165.019L776.685 181.956L768.27 188.166L765.034 185.908L763.739 191.554L755.325 181.956L754.03 186.472L744.968 183.65L737.201 195.506L736.553 203.974L732.669 201.716L728.138 210.184L724.902 203.974H717.135L715.84 206.797H713.251L708.72 213.572L700.952 207.926L697.069 196.07L692.538 196.635L688.007 210.184L684.77 205.668L682.828 211.878L679.592 207.926L668.588 211.878L663.409 226.557L655.642 222.605L653.053 233.332L647.227 228.815L642.696 239.542L639.46 242.93L635.576 243.494L630.398 235.59L627.161 237.284L624.572 227.122L621.336 230.509L613.568 222.605L610.979 224.863L608.39 222.605L605.153 207.926H597.386L593.502 220.911L592.855 218.088L590.913 225.428H588.324L585.088 233.332L580.557 226.557L576.673 234.461L571.494 221.476L566.316 225.428L565.669 234.461L563.08 227.686L559.196 228.815L557.901 225.428L554.665 246.882L550.781 244.623L547.545 251.963L543.661 231.638L540.425 228.815L537.188 218.088L534.599 221.476L527.479 207.926L525.537 209.62H521.653C520.79 212.819 519.064 219.33 519.064 219.782C519.064 220.234 512.16 209.432 508.707 203.974L501.587 209.62L498.351 216.395L493.82 211.878L490.583 227.686L479.579 238.978L477.637 234.461L473.754 240.107H469.87L467.928 233.332L464.044 237.848C461.024 232.955 454.853 222.831 454.335 221.476C453.817 220.121 448.078 227.686 445.273 231.638L438.153 223.17L434.916 228.815L429.738 211.878L423.912 214.701L420.676 224.299L416.792 206.232L406.436 207.926L401.905 199.458L399.315 203.974L394.137 195.506L392.195 199.458H389.606L384.428 190.989L379.249 199.458L370.835 200.587L367.598 197.199L366.304 202.845L361.773 201.716L356.594 197.199H352.711L351.416 199.458L347.532 198.328L339.118 187.602C338.47 192.683 337.176 203.523 337.176 206.232C337.176 208.942 332.86 202.092 330.703 198.328L327.466 205.103L325.524 201.716L322.935 216.959L320.346 211.878L316.462 216.959L312.579 218.088L310.637 207.926L306.106 218.088L296.396 206.232L292.513 209.62V221.476L287.334 223.17L282.156 203.974L278.272 211.878L272.447 203.974L268.563 205.103L263.385 195.506L261.443 202.845L258.854 199.458L253.028 203.974L250.439 211.878L248.497 201.716L242.671 205.103L241.377 199.458L238.14 205.103L231.668 183.65L227.137 189.295L225.842 182.52L221.311 195.506L215.485 192.118L211.602 201.716L204.481 182.52L199.303 188.166L196.067 183.65L193.477 189.295L187.005 184.779L179.237 207.926L173.411 194.376L170.175 213.572L167.586 198.328L164.997 192.118L162.408 202.845L159.818 190.989L154.64 180.827L152.698 186.472L148.814 184.779L146.873 194.376L141.694 195.506L134.574 209.62L129.396 193.247C127.238 199.269 122.923 211.765 122.923 213.572V212.443L119.039 217.524L113.861 212.443V228.251C113.861 228.702 109.977 238.978 108.035 244.059L104.152 242.365L99.6205 245.752L95.0895 242.365L92.5003 246.882L89.2639 244.059L86.0274 246.882L83.4383 242.365L75.0235 254.786L72.4344 253.092L53.663 277.933L47.8374 275.11L41.3645 279.627L36.1862 277.933L34.2443 282.45L27.7714 279.627L20.6512 287.531Z"
              fill="url(#paint0_linear)"
            />
            <path
              d="M9 265.867L20.6512 269.805L27.7714 261.929L34.2443 264.742L36.1862 260.241L41.3645 261.929L47.8374 257.428L53.663 260.241L72.4344 235.485L75.0235 237.173L83.4383 224.796L86.0274 229.297L89.2639 226.484L92.5003 229.297L95.0895 224.796L99.6205 228.171L104.152 224.796L108.035 226.484C109.977 221.42 113.861 211.18 113.861 210.73C113.861 210.28 113.861 200.04 113.861 194.977L119.039 200.04L122.923 194.977C122.923 196.102 122.923 197.902 122.923 196.102C122.923 194.302 127.238 181.849 129.396 175.848L134.574 192.164L141.694 178.098L146.873 176.973L148.814 167.408L152.698 169.096L154.64 163.47L159.818 173.597L162.408 185.412L164.997 174.722L167.586 180.911L170.175 196.102L173.411 176.973L179.237 190.476L187.005 167.408L193.477 171.909L196.067 166.283L199.303 170.784L204.481 165.158L211.602 184.287L215.485 174.722L221.311 178.098L225.842 165.158L227.137 171.909L231.668 166.283L238.14 187.663L241.377 182.037L242.671 187.663L248.497 184.287L250.439 194.414L253.028 186.538L258.854 182.037L261.443 185.412L263.385 178.098L268.563 187.663L272.447 186.538L278.272 194.414L282.156 186.538L287.334 205.667L292.513 203.979V192.164L296.396 188.788L306.106 200.603L310.637 190.476L312.579 200.603L316.462 199.478L320.346 194.414L322.935 199.478L325.524 184.287L327.466 187.663L330.703 180.911C332.86 184.662 337.176 191.489 337.176 188.788C337.176 186.087 338.47 175.285 339.118 170.222L347.532 180.911L351.416 182.037L352.711 179.786H356.594L361.773 184.287L366.304 185.412L367.598 179.786L370.835 183.162L379.249 182.037L384.428 173.597L389.606 182.037H392.195L394.137 178.098L399.315 186.538L401.905 182.037L406.436 190.476L416.792 188.788L420.676 206.792L423.912 197.227L429.738 194.414L434.916 211.293L438.153 205.667L445.273 214.106C448.078 210.168 453.817 202.628 454.335 203.979C454.853 205.329 461.024 215.419 464.044 220.295L467.928 215.794L469.87 222.545H473.754L477.637 216.919L479.579 221.42L490.583 210.168L493.82 194.414L498.351 198.915L501.587 192.164L508.707 186.538C512.16 191.976 519.064 202.741 519.064 202.291C519.064 201.841 520.79 195.352 521.653 192.164H525.537L527.479 190.476L534.599 203.979L537.188 200.603L540.425 211.293L543.661 214.106L547.545 234.36L550.781 227.046L554.665 229.297L557.901 207.917L559.196 211.293L563.08 210.168L565.669 216.919L566.316 207.917L571.494 203.979L576.673 216.919L580.556 209.042L585.088 215.794L588.324 207.917H590.913L592.855 200.603L593.502 203.416L597.386 190.476H605.153L608.39 205.104L610.979 207.354L613.568 205.104L621.336 212.981L624.572 209.605L627.161 219.732L630.398 218.044L635.576 225.921L639.46 225.358L642.696 221.983L647.227 211.293L653.053 215.794L655.642 205.104L663.409 209.042L668.588 194.414L679.592 190.476L682.828 194.414L684.77 188.225L688.007 192.726L692.538 179.223L697.069 178.661L700.952 190.476L708.72 196.102L713.251 189.351H715.84L717.135 186.538H724.902L728.138 192.726L732.67 184.287L736.553 186.538L737.201 178.098L744.968 166.283L754.03 169.096L755.325 164.595L763.739 174.16L765.034 168.534L768.27 170.784L776.685 164.595L779.922 147.717L789.631 160.094L797.398 162.907L800.635 160.094L803.224 138.152L807.755 135.902L812.286 134.214L816.17 99.894L821.348 84.7032L824.585 95.9557L825.232 81.8901L831.705 85.2659L840.119 68.3873L845.298 39.131L850.476 43.632L855.654 61.6358L858.891 19.4393L862.775 39.131L864.716 36.8805L866.658 40.8189L870.542 32.9422L875.073 47.5703L878.31 36.8805L879.604 57.1349L883.488 47.5703L889.961 49.8208L891.903 58.8227L897.728 26.1907L899.67 32.9422L902.259 29.0038H905.496L915.205 11L918.442 47.5703L924.914 51.5087L930.093 65.5742L933.976 52.0713C935.271 56.1972 937.86 64.5614 937.86 65.0115C937.86 65.4616 940.881 53.1965 942.391 47.0077L946.275 53.7591L951.453 26.7534L961.163 20.5645L965.694 23.9403L968.283 16.6262L976.05 68.9499L979.287 63.3237L985.76 65.0115L991.585 39.131L1000 23.9403"
              stroke="url(#paint1_linear)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient
                id="paint0_linear"
                x1="504.5"
                y1="27.8281"
                x2="504.5"
                y2="331"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#A06AFF" stopOpacity="0.32" />
                <stop offset="1" stopColor="#181A20" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint1_linear"
                x1="1000"
                y1="140.403"
                x2="9"
                y2="140.403"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#A06AFF" />
                <stop offset="1" stopColor="#482090" />
              </linearGradient>
            </defs>
          </svg>

          {/* Y-axis labels */}
          <div className="pointer-events-none absolute left-0 top-0 flex h-full flex-col justify-between py-4 text-xs font-bold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            {["$400", "$380", "$360", "$340", "$320", "$300", "$280", "$260", "$240", "$220", "$200"].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="pointer-events-none absolute bottom-0 left-0 flex w-full justify-between px-8 text-xs font-bold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <span key={day} className="hidden sm:inline">{day}</span>
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
                      className="h-2 rounded-lg bg-gradient-to-r from-[#A06AFF] to-[#482090]"
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
          <button className="flex h-[26px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 py-2.5 backdrop-blur-[50px]">
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
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
                <svg width="20" height="20" viewBox="0 0 21 20" fill="none">
                  <path d="M10.3333 18.3337C14.9357 18.3337 18.6667 14.6027 18.6667 10.0003C18.6667 5.39795 14.9357 1.66699 10.3333 1.66699C5.73096 1.66699 2 5.39795 2 10.0003C2 14.6027 5.73096 18.3337 10.3333 18.3337Z" stroke="white" strokeWidth="1.5"/>
                  <path d="M8.25 13.3337V6.66699" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9.5 6.66667V5M11.5833 6.66667V5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9.5 14.9997V13.333M11.5833 14.9997V13.333" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8.25 10H12.4167C13.107 10 13.6667 10.5597 13.6667 11.25V12.0833C13.6667 12.7737 13.107 13.3333 12.4167 13.3333H7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 6.66699H12.4167C13.107 6.66699 13.6667 7.22663 13.6667 7.91699V8.75033C13.6667 9.44066 13.107 10.0003 12.4167 10.0003H8.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
                <svg width="20" height="20" viewBox="0 0 21 20" fill="none">
                  <path d="M16.1666 10.0003L11.367 12.149C10.8574 12.3832 10.6026 12.5003 10.3333 12.5003C10.0641 12.5003 9.80922 12.3832 9.29964 12.149L4.5 10.0003M16.1666 10.0003C16.1666 9.55679 15.9121 9.16679 15.4028 8.38663L12.4831 3.91374C11.5053 2.41591 11.0165 1.66699 10.3333 1.66699C9.65023 1.66699 9.16131 2.41591 8.1836 3.91375L5.26386 8.38663C4.75462 9.16679 4.5 9.55679 4.5 10.0003M16.1666 10.0003C16.1666 10.4439 15.9121 10.8339 15.4028 11.614L12.4831 16.0869C11.5053 17.5847 11.0165 18.3336 10.3333 18.3336C9.65023 18.3336 9.16131 17.5847 8.18361 16.0869L5.26386 11.614C4.75462 10.8339 4.5 10.4439 4.5 10.0003" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
                <svg width="20" height="20" viewBox="0 0 21 20" fill="none">
                  <path d="M2 7.14122C2 6.1444 2.40198 5.53351 3.23386 5.07056L6.65822 3.16486C8.45258 2.16628 9.34975 1.66699 10.3333 1.66699C11.3169 1.66699 12.2141 2.16628 14.0084 3.16486L17.4328 5.07056C18.2647 5.53351 18.6667 6.14441 18.6667 7.14122C18.6667 7.41152 18.6667 7.54667 18.6372 7.65778C18.4821 8.24153 17.9531 8.33366 17.4423 8.33366H3.2244C2.71356 8.33366 2.1846 8.24153 2.02952 7.65778C2 7.54667 2 7.41152 2 7.14122Z" stroke="white" strokeWidth="1.5"/>
                  <path d="M10.3281 5.83301H10.3356" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.66406 8.33301V15.4163M6.9974 8.33301V15.4163" stroke="white" strokeWidth="1.5"/>
                  <path d="M13.6641 8.33301V15.4163M16.9974 8.33301V15.4163" stroke="white" strokeWidth="1.5"/>
                  <path d="M16.1667 15.417H4.5C3.11929 15.417 2 16.5362 2 17.917C2 18.1471 2.18655 18.3337 2.41667 18.3337H18.25C18.4801 18.3337 18.6667 18.1471 18.6667 17.917C18.6667 16.5362 17.5474 15.417 16.1667 15.417Z" stroke="white" strokeWidth="1.5"/>
                </svg>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
                <svg width="20" height="20" viewBox="0 0 21 20" fill="none">
                  <path d="M5.57538 4.02948L3.80166 14.7263C3.65228 15.6272 3.57759 16.0776 3.82596 16.3723C4.07432 16.667 4.52864 16.667 5.43727 16.667H5.77262C6.4583 16.667 6.80113 16.667 7.03491 16.4632C7.26868 16.2594 7.31716 15.9183 7.41413 15.236L7.80374 12.4948C7.83454 12.2781 7.84994 12.1697 7.87417 12.077C8.04774 11.4127 8.60899 10.9234 9.28781 10.8447C9.38256 10.8337 9.49148 10.8337 9.70931 10.8337H10.6776C13.2568 10.8337 15.4926 9.03974 16.0643 6.51186C16.6254 4.03013 14.7487 1.66699 12.2166 1.66699H8.35C7.42182 1.66699 6.95772 1.66699 6.59226 1.86266C6.38326 1.97455 6.20054 2.13013 6.05637 2.31895C5.80426 2.64913 5.72797 3.10924 5.57538 4.02948Z" stroke="white" strokeWidth="1.5"/>
                  <path d="M7.20262 16.25L7.01209 17.3606C6.92482 17.8692 7.3211 18.3333 7.84273 18.3333H9.5015C9.91342 18.3333 10.2649 18.0388 10.3326 17.637L10.9404 14.0297C11.0082 13.6279 11.3597 13.3333 11.7715 13.3333H13.2741C15.425 13.3333 17.2873 11.8557 17.7539 9.77891C18.0806 8.32519 17.3697 6.9251 16.1667 6.25098" stroke="white" strokeWidth="1.5"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="flex flex-col gap-4 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 backdrop-blur-[50px]">
          <div className="flex items-baseline justify-between pb-2">
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              Recent Transactions
            </h3>
            <a href="#" className="text-[15px] font-bold text-[#A06AFF] underline" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
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

export default Monetization;
