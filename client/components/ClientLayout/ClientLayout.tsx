import { FC, ReactNode, useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { useWebSocket } from "@/hooks/useWebSocket";
import { toast } from "sonner";
import { AppBackground } from "../ui/AppBackground/AppBackground";
import { Header } from "../ui/Header/Header";
import ContentWrapper from "../ui/ContentWrapper/ContentWrapper";
import Footer from "../ui/Footer/Footer";
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
  contentWrapperClassname?: string;
}

export const ClientLayout: FC<Props> = ({
  contentWrapperClassname,
}) => {
  const location = useLocation();
  const { isConnected, lastMessage } = useWebSocket();
  
  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;
    
    switch (lastMessage.type) {
      case 'notification':
        toast.success('Новое уведомление', {
          description: lastMessage.payload?.message || 'У вас новое уведомление',
        });
        break;
      case 'like':
        toast('💜 Новый лайк', {
          description: 'Кому-то понравился ваш пост',
        });
        break;
      case 'comment':
        toast('💬 Новый комментарий', {
          description: 'Кто-то прокомментировал ваш пост',
        });
        break;
      case 'follow':
        toast('👤 Новый подписчик', {
          description: `${lastMessage.payload?.username || 'Кто-то'} подписался на вас`,
        });
        break;
    }
  }, [lastMessage]);
  
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
            <Outlet />
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

      {/* Footer */}
      <Footer />
    </AppBackground>
  );
};
