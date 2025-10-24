import { FC } from "react";

const TabLoader: FC = () => {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#181B22]" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#A06AFF]" />
        </div>
        <p className="text-sm font-medium text-[#6C7280]">Loading...</p>
      </div>
    </div>
  );
};

export default TabLoader;
