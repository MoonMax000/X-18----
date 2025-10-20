import { FC, useMemo, useState } from "react";

import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  title: string;
  thumbnail: string;
}

interface ActivityCardProps {
  title?: string;
  products?: Product[];
}

type ProductTab = "new" | "topSellers";

const ActivityCard: FC<ActivityCardProps> = ({
  title = "Jane's Products",
  products = [
    {
      id: "1",
      title: "RiskMaster - powerful tool for traders",
      thumbnail:
        "https://api.builder.io/api/v1/image/assets/TEMP/8543203b1a1113c95f70b9585dca067863022d78?width=168",
    },
    {
      id: "2",
      title: "Momentum Brealout: Signals with 65% accuracy",
      thumbnail:
        "https://api.builder.io/api/v1/image/assets/TEMP/3f5c80615ad603804c2775c67e4d43be32c7d542?width=168",
    },
    {
      id: "3",
      title: "BTC/USDT Grid-Bot HODL",
      thumbnail:
        "https://api.builder.io/api/v1/image/assets/TEMP/b0eab8630db70e8a9a1e1b9d22a223a811bc8fbe?width=168",
    },
    {
      id: "4",
      title: "RiskMaster - powerful tool for traders",
      thumbnail:
        "https://api.builder.io/api/v1/image/assets/TEMP/8543203b1a1113c95f70b9585dca067863022d78?width=168",
    },
    {
      id: "5",
      title: "P2P Crypto Arbitrage from Scratch! Author's training program.",
      thumbnail:
        "https://api.builder.io/api/v1/image/assets/TEMP/398f2f052884157dd032feb4fa540fbdf2aff5cc?width=168",
    },
  ],
}) => {
  const [activeTab, setActiveTab] = useState<ProductTab>("new");
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const visibleProducts = useMemo(() => {
    if (products.length === 0) {
      return [] as Product[];
    }

    if (activeTab === "new") {
      return products.slice(0, Math.max(3, products.length));
    }

    return products.slice(Math.max(products.length - 4, 0));
  }, [activeTab, products]);

  const handleShowAll = () => {
    toast({
      title: "Opening product catalogue",
      description: "Marketplace coming online shortly.",
    });
  };

  const handleFollowToggle = (product: Product) => {
    setFollowed((prev) => {
      const next = !prev[product.id];
      const updated = { ...prev, [product.id]: next };

      toast({
        title: next ? "Added to favourites" : "Removed from favourites",
        description: product.title,
      });

      return updated;
    });
  };

  const handleProductClick = (product: Product) => {
    toast({
      title: product.title,
      description: "Product details page will open soon.",
    });
  };

  return (
    <div className="flex w-full flex-col items-center gap-6 self-stretch rounded-3xl border border-[#16C784] bg-[rgba(12,16,20,0.50)] p-4 backdrop-blur-[50px]">
      <div className="flex items-baseline self-stretch pb-2">
        <div className="flex-1 text-2xl font-bold leading-normal text-white">
          {title}
        </div>
        <button
          type="button"
          onClick={handleShowAll}
          className="group inline-flex items-center gap-2 rounded-full border border-transparent bg-[#A06AFF]/10 px-3 py-1.5 text-[15px] font-semibold leading-normal text-[#E3D8FF] transition-all duration-200 hover:border-[#A06AFF] hover:bg-[#A06AFF]/20 hover:text-white hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF]/50 focus-visible:ring-offset-0"
        >
          Show all
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#A06AFF]/60 to-[#482090]/60 text-white transition-all duration-200 group-hover:from-[#A06AFF] group-hover:to-[#482090]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path
                d="M10.7402 15.53L14.2602 12L10.7402 8.46997"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      <div className="flex items-center gap-3 self-stretch">
        {(["new", "topSellers"] as ProductTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex h-10 items-center justify-center rounded-[32px] px-4 py-3 text-[15px] font-bold transition ${
              activeTab === tab
                ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_8px_20px_-8px_rgba(160,106,255,0.7)]"
                : "border border-[#16C784] bg-[rgba(12,16,20,0.50)] text-white/80 hover:border-[#2F3240] hover:bg-[rgba(18,22,28,0.8)]"
            }`}
          >
            {tab === "new" ? "New" : "Top Sellers"}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-start gap-3 self-stretch">
        {visibleProducts.map((product, index) => (
          <div
            key={product.id}
            className={`flex items-center gap-2 self-stretch ${
              index < visibleProducts.length - 1
                ? "border-b border-[#16C784] pb-3"
                : ""
            }`}
          >
            <button
              type="button"
              onClick={() => handleProductClick(product)}
              className="group relative flex h-11 w-[84px] overflow-hidden rounded-lg"
              style={{ aspectRatio: "21/11" }}
            >
              <img
                src={product.thumbnail}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
              />
            </button>
            <div className="flex w-full items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleProductClick(product)}
                className="flex-1 text-left text-[15px] font-bold leading-normal text-white transition hover:text-[#A06AFF]"
              >
                {product.title}
              </button>
              <button
                type="button"
                onClick={() => handleFollowToggle(product)}
                className={`min-w-[96px] rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide transition ${
                  followed[product.id]
                    ? "border border-[#A06AFF] text-white hover:bg-[#A06AFF]/10"
                    : "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white hover:opacity-90"
                }`}
              >
                {followed[product.id] ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityCard;
