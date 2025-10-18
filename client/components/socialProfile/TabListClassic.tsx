import { useState } from "react";
import { LayoutGrid, Lightbulb, MessageCircle, BarChart3, Code, Heart } from "lucide-react";

const tabs = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "ideas", label: "Ideas", icon: Lightbulb },
  { id: "opinions", label: "Opinions", icon: MessageCircle },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "soft", label: "Soft", icon: Code },
  { id: "liked", label: "Liked", icon: Heart },
];

interface TabListClassicProps {
  onTabChange?: (tabId: string) => void;
}

export default function TabListClassic({ onTabChange }: TabListClassicProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="sticky top-0 z-20 -mx-6 px-6 bg-background/95 backdrop-blur-md">
      <div className="mb-3 flex items-center overflow-x-auto rounded-full border border-[#181B22] bg-[#000000] p-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isAllTab = tab.id === 'all';
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleTabClick(tab.id)}
              className={`${isAllTab ? 'flex-none min-w-[60px]' : 'flex-1 min-w-[120px]'} px-3 py-0.75 text-xs font-semibold leading-tight transition-all duration-300 sm:px-4 sm:py-1 sm:text-sm relative group ${
                isActive
                  ? "rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)] hover:shadow-[0_16px_40px_-12px_rgba(160,106,255,1),inset_0_0_12px_rgba(0,0,0,0.3)]"
                  : "rounded-full text-[#9CA3AF] hover:text-white hover:bg-gradient-to-r hover:from-[#A06AFF]/20 hover:to-[#482090]/20 hover:shadow-[0_8px_20px_-12px_rgba(160,106,255,0.5)]"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Icon className={`h-4 w-4 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`} />
                <span className={isAllTab ? "inline" : "hidden sm:inline"}>{tab.label}</span>
              </span>
              {/* Underline animation for inactive tabs - fade from center */}
              {!isActive && (
                <div className="absolute bottom-0 left-1/2 h-0.5 w-0 rounded-full transform -translate-x-1/2 group-hover:w-3/4 transition-all duration-300"
                     style={{
                       background: 'linear-gradient(90deg, transparent 0%, #A06AFF 50%, transparent 100%)'
                     }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
