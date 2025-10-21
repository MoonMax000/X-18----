import { FC, useState } from "react";
import { cn } from "@/lib/utils";

const pricingData = {
  momentum: {
    monthly: { price: "$44.00", annual: "$528.00", savings: "$0.00" },
    yearly: { price: "$35.20", annual: "$422.40", savings: "$105.60" },
  },
  platinum: {
    monthly: { price: "$112.00", annual: "$1,344.00", savings: "$0.00" },
    yearly: { price: "$89.60", annual: "$1,075.20", savings: "$268.80" },
  },
  imperium: {
    monthly: { price: "$244.00", annual: "$2,928.00", savings: "$0.00" },
    yearly: { price: "$195.20", annual: "$2,342.40", savings: "$585.60" },
  },
};

const momentumFeatures = [
  "Access to analytical articles:Unlimited",
  "Advanced access to the neural network:Ability to ask more complex questions",
  "Advanced access to the neural network:Receive educational materials and consultations",
  "Advanced access to the neural network:Technical and fundamental analysis",
  "Extended access to the broker marketplace:View broker profiles and contact them — 50 connections per month",
  "Trading terminal connection for real trades:Number of connected brokers — up to 1",
  "Access to the section with paid ideas from traders:View up to 3 ideas per month for free within a certain price range",
  "Support:Priority support via chat and email (Response within 24 hours)",
];

const platinumFeatures = [
  "Access to analytical articles:Unlimited",
  "Expert-level access to the neural network:Engage in complex conversations about strategies, market analysis, and deep learning",
  "Expert-level access to the neural network:Receive educational materials and consultations",
  "Expert-level access to the neural network:Technical and fundamental analysis",
  "Extended access to the broker marketplace:Search filters by rating, commissions, and broker specializations",
  "Trading terminal connection for real trades:Number of connected brokers — up to 3",
  "Access to the section with paid ideas from traders:View up to 3 ideas per month for free within a certain price range",
  "Exclusive access:To private webinars and masterclasses from market professionals",
  "Support:Priority support via chat and email (Response within 4 hours)",
];

const imperiumFeatures = [
  "Full access:To all platform content without limitations",
  "Premium neural network mode:Personalized consultations",
  "Premium neural network mode:Tailored investment strategy development",
  "Premium neural network mode:Technical and fundamental analysis",
  "Premium neural network mode:Broker selection based on client needs",
  "Premium neural network mode:Monthly portfolio rebalancing",
  "Premium neural network mode:Access to internal investment ideas",
  "Premium neural network mode:Exclusive profile design",
  "Premium neural network mode:VIP status on the platform, with expedited request processing",
  "Full access to the broker marketplace:Reliability ratings",
  "Full access to the broker marketplace:Client reviews",
  "Full access to the broker marketplace:Service condition comparison",
  "Full access to the broker marketplace:Consulting to help choose the right broker",
  "Trading terminal connection:No limits on the number of connected brokers",
  "Trading terminal connection:Ability to create custom terminal interfaces to suit your needs",
  "Access to paid trading ideas:Unlimited",
  "Personal manager 24/7:Assists in optimizing the terminal and working on the platform",
  "Personal manager 24/7:Consultations on any financial questions",
  "Exclusive access:Participation in private investor clubs and premium events",
  "Exclusive access:Webinars with well-known investors and analysts",
  "Exclusive access:Offline meetups and masterclasses in premium locations",
  "Client investment passport:Analysis of current portfolio (structure, performance, risks)",
  "Client investment passport:Recommendations to improve the investment strategy",
  "Client investment passport:Personalized forecasts for returns and risks based on client data",
];

interface PricingCardProps {
  title: string;
  planKey: "momentum" | "platinum" | "imperium";
  features: string[];
  isPopular?: boolean;
  isGold?: boolean;
  buttonText?: string;
  billingPeriod: "monthly" | "yearly";
}

const PricingCard: FC<PricingCardProps> = ({
  title,
  planKey,
  features,
  isPopular,
  isGold,
  buttonText = "Free for 7 days",
  billingPeriod,
}) => {
  const titleClasses = isGold
    ? "text-gradient-gold"
    : isPopular
      ? "text-gradient-purple"
      : "text-white";
  const borderClasses = isGold
    ? "border-4 border-primary glow-intense"
    : isPopular
      ? "border-4 border-primary"
      : "border-2 border-widget-border";
  const cardClasses = isGold
    ? "bg-gradient-to-br from-[#482090]/20 to-[#0C1014]/95"
    : "bg-[#0C101480] backdrop-blur-[100px]";

  const planData = pricingData[planKey][billingPeriod];
  const periodText = billingPeriod === "monthly" ? "per month" : "per year";

  return (
    <div
      className={cn(
        "relative flex w-full flex-col h-full items-start gap-4 md:gap-6 rounded-3xl p-4 md:p-5 pb-4 pt-6 md:pt-8 transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/60 group",
        cardClasses,
        borderClasses,
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 md:-top-6 right-8 md:right-12 animate-bounce">
          <div className="w-6 h-8 md:w-7 md:h-10 bg-gradient-to-t from-primary to-primary/60 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">🔥</span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 md:gap-6 flex-1 self-stretch">
        <h3
          className={cn(
            "text-center text-xl md:text-3xl font-bold leading-[100%] transition-all duration-300 group-hover:scale-105 tracking-wide",
            titleClasses,
          )}
        >
          {title.toUpperCase()}
        </h3>

        <div className="flex flex-col items-center gap-4 self-stretch">
          <div className="flex flex-col justify-center items-center gap-1 self-stretch">
            <div className="flex items-baseline gap-2 group-hover:scale-110 transition-transform duration-300">
              <span className="text-primary text-xl md:text-3xl font-bold leading-[100%]">
                {planData.price}
              </span>
              <span className="text-webGray text-xs md:text-sm font-bold">
                {periodText}
              </span>
            </div>
            <div className="text-webGray text-center text-xs md:text-sm font-bold self-stretch">
              Annual Total: {planData.annual}
            </div>
          </div>

          {billingPeriod === "yearly" && planData.savings !== "$0.00" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#181B22] bg-[#0C101480] hover:border-primary/40 hover:bg-[#0C1014]/70 transition-all duration-300">
              <span className="text-white text-xs font-bold uppercase">
                Save {planData.savings}/year
              </span>
            </div>
          )}
        </div>

        <button className="flex h-[26px] py-[15px] px-8 md:px-16 justify-center items-center gap-2 self-stretch rounded-lg bg-gradient-to-r from-primary to-[#482090] relative overflow-hidden group/btn transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 active:scale-95">
          <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300" />
          <span className="text-white text-xs md:text-sm font-bold relative z-10">
            {buttonText}
          </span>
        </button>

        <div className="flex p-2.5 flex-col items-start gap-2.5 md:gap-3 flex-1 rounded-xl bg-[#0C101480] hover:bg-purple-900/40 transition-colors duration-300 border border-[#181B22]/30">
          {features.slice(0, 12).map((feature, index) => (
            <div
              key={index}
              className="group/feature flex items-start gap-2.5 w-full hover:bg-[#0C1014]/40 rounded-lg p-2 transition-all duration-300 transform hover:translate-x-1 hover:scale-[1.01] border border-transparent hover:border-primary/20"
            >
              <div className="flex-shrink-0 mt-0.5 group-hover/feature:scale-110 group-hover/feature:rotate-12 transition-all duration-300">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-[#482090] flex items-center justify-center shadow-lg shadow-primary/30 group-hover/feature:shadow-primary/50">
                  <svg
                    width="10"
                    height="8"
                    viewBox="0 0 12 9"
                    fill="none"
                    className="text-white"
                  >
                    <path
                      d="M1 4.5L4.5 8L11 1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <h4 className="text-white text-xs md:text-sm font-bold group-hover/feature:text-primary transition-colors duration-300">
                  {feature.split(":")[0]}
                </h4>
                <p className="text-webGray text-[11px] md:text-xs font-medium leading-relaxed group-hover/feature:text-white transition-colors duration-300">
                  {feature.split(":")[1] || "Unlimited"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Pricing: FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );

  return (
    <div className="flex flex-col gap-8 py-8 px-4 max-w-[1400px] mx-auto">
      <div className="flex flex-col items-center gap-6">
        <h1 className="relative text-4xl md:text-5xl font-bold text-center">
          <span className="relative inline-block">
            <span
              className="absolute inset-0 bg-gradient-to-r from-primary via-[#6AA5FF] to-[#482090] bg-clip-text text-transparent animate-gradient-xy"
              style={{ backgroundSize: "200% 200%" }}
            >
              Choose Your Plan
            </span>
            <span className="relative bg-gradient-to-r from-primary via-[#6AA5FF] to-[#482090] bg-clip-text text-transparent">
              Choose Your Plan
            </span>
            <span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent bg-clip-text text-transparent animate-shine"
              style={{ backgroundSize: "200% 100%" }}
            />
          </span>
        </h1>

        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <span className="absolute -top-6 right-0 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green text-white shadow-lg shadow-green/30">
              Save 20%
            </span>
          </div>
          <div className="relative inline-flex p-[3px] rounded-full border-2 border-[#181B22]/50 bg-gradient-to-br from-[#181B22]/80 to-[#0C1014]/90 backdrop-blur-[100px] shadow-2xl shadow-black/50 w-[320px] max-w-full">
            <div
              className={cn(
                "absolute top-[3px] bottom-[3px] rounded-full bg-gradient-to-r from-primary to-[#482090] shadow-xl shadow-primary/50 transition-all duration-500 ease-out",
                billingPeriod === "monthly"
                  ? "left-[3px] w-[calc(50%-3px)]"
                  : "left-[calc(50%)] w-[calc(50%-3px)]",
              )}
              style={{
                backdropFilter: "blur(20px)",
                boxShadow:
                  "0 0 20px rgba(160, 106, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            />
            <div className="relative grid grid-cols-2 w-full z-10">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                  billingPeriod === "monthly"
                    ? "text-white"
                    : "text-webGray/70 hover:text-white",
                )}
                aria-pressed={billingPeriod === "monthly"}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                  billingPeriod === "yearly"
                    ? "text-white"
                    : "text-webGray/70 hover:text-white",
                )}
                aria-pressed={billingPeriod === "yearly"}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 items-stretch max-w-[1300px] mx-auto">
        <PricingCard
          title="Momentum"
          planKey="momentum"
          features={momentumFeatures}
          billingPeriod={billingPeriod}
        />
        <PricingCard
          title="Platinum"
          planKey="platinum"
          features={platinumFeatures}
          isPopular
          billingPeriod={billingPeriod}
        />
        <PricingCard
          title="Imperium"
          planKey="imperium"
          features={imperiumFeatures}
          isGold
          billingPeriod={billingPeriod}
        />
      </div>
    </div>
  );
};

export default Pricing;
