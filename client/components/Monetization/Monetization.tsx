import { FC } from "react";

const Monetization: FC = () => {
  return (
    <div className="flex flex-col gap-6 max-w-[1059px] mx-auto">
      <div className="p-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
        <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
          Монетизация
        </h3>
        <p className="text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
          Здесь будут настройки монетизации вашего контента.
        </p>
      </div>
    </div>
  );
};

export default Monetization;
