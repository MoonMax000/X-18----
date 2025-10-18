import { FC, ReactNode } from "react";
import { AppBackground } from "../ui/AppBackground/AppBackground";
import Footer from "../ui/Footer/Footer";
import { AnimatedLogo } from "../ui/AnimatedLogo/AnimatedLogo";
import { AvatarDropdown } from "../ui/AvatarDropdown/AvatarDropdown";

interface Props {
  children: ReactNode;
}

export const PricingLayout: FC<Props> = ({ children }) => {
  return (
    <AppBackground variant="primal">
      {/* Header for Pricing page */}
      <header className="pb-1 pt-3 w-full pl-[30px] pr-[24px] flex justify-between bg-background items-center gap-2 mb-6">
        {/* Animated Logo */}
        <div className="min-w-[230px]">
          <AnimatedLogo />
        </div>

        {/* Center: Search + Assistant (desktop) */}
        <div className="hidden md:flex items-center gap-4 w-full max-w-[800px]">
          <div className="relative w-full max-w-[540px]">
            <input
              className="h-11 w-full rounded-[12px] border border-[#181B22] bg-[#0C101480] px-4 text-white placeholder:text-webGray outline-none"
              placeholder="Search"
            />
          </div>
          <a
            href={"https://aihelp.tyriantrade.com/"}
            target="_blank"
            rel="noreferrer"
            className="flex gap-[6px] items-center"
            aria-label="Open AI Assistant"
          >
            <div className="p-[0.5px] rounded-[4px] bg-gradient-to-r from-[#A06AFF] via-[#A06AFF] to-transparent size-[32px] flex items-center justify-center">
              <div className="p-[2px] bg-black rounded-[4px] size-[29px]">
                <div className="size-[26px] rounded-[4px] bg-background p-[5px] text-white flex items-center justify-center">
                  AI
                </div>
              </div>
            </div>
            <span className="font-medium text-[15px] text-white">
              Assistant
            </span>
          </a>
        </div>

        {/* Right: Avatar Dropdown */}
        <div className="flex items-center justify-end max-w-[350px] gap-4">
          <AvatarDropdown />
        </div>
      </header>

      {/* Main content without side menus */}
      <main className="min-h-[calc(100vh-200px)] mb-60">{children}</main>

      <Footer />
    </AppBackground>
  );
};
