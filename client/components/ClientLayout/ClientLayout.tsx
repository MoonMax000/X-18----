import { FC, ReactNode, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppBackground } from "../ui/AppBackground/AppBackground";
import { Header } from "../ui/Header/Header";
import ContentWrapper from "../ui/ContentWrapper/ContentWrapper";
import Footer from "../ui/Footer/Footer";
import Footer2 from "../ui/Footer/Footer2";
import Newsletter from "../ui/Newsletter/Newsletter";
import { LayoutVariant } from "../ui/AppBackground/AppBackground";
import NewNavBar from "../ui/Navbar/NewNavBar";
import { RightMenu } from "../ui/RightMenu/RightMenu";
import CreatePostModal from "../CreatePostBox/CreatePostModal";
import BottomNav from "../ui/BottomNav/BottomNav";

const PagesBg: Record<LayoutVariant, string[]> = {
  primal: [""],
  secondary: [
    "settings",
    "dashboard",
    "security",
    "notifications",
    "kyc",
    "billing",
    "referrals",
    "api",
    "profile_settings",
  ],
};

interface Props {
  children: ReactNode;
  contentWrapperClassname?: string;
}

export const ClientLayout: FC<Props> = ({
  children,
  contentWrapperClassname,
}) => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const currentPage = segments[segments.length - 1] || "";
  const layoutVariant: LayoutVariant = PagesBg.secondary.includes(currentPage)
    ? "secondary"
    : "primal";
  const [rightMenuOpen, setRightMenuOpen] = useState(false);
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);

  return (
    <AppBackground variant={layoutVariant}>
      <Header
        rightMenuOpen={rightMenuOpen}
        setRightMenuOpen={setRightMenuOpen}
        leftMenuOpen={leftMenuOpen}
        setLeftMenuOpen={setLeftMenuOpen}
      />
      <div className="flex justify-start mb-24 lg:mb-60">
        <NewNavBar
          variant={layoutVariant}
          isOpen={leftMenuOpen}
          onClose={() => setLeftMenuOpen(false)}
        />
        <main className="flex-1 min-w-0">
          <ContentWrapper className={contentWrapperClassname}>
            {children}
          </ContentWrapper>
        </main>
        <RightMenu
          isCollapsed={rightMenuOpen}
          onClose={() => setRightMenuOpen(false)}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onTweetClick={() => setIsPostComposerOpen(true)} />

      <CreatePostModal
        isOpen={isPostComposerOpen}
        onClose={() => setIsPostComposerOpen(false)}
      />

      {/* Current Footer */}
      <Footer />

      {/* Alternative Footer with Newsletter - for comparison */}
      <div className="mt-12">
        <Newsletter />
        <Footer2 />
      </div>
    </AppBackground>
  );
};
