import { ReactNode } from "react";
import {
  Home as HomeIcon,
  UsersRound as SocialIcon,
  BadgeCheck as MarketIcon,
  CreditCard as BoxIcon,
  Compass as ExploreIcon,
  MessageSpark as MessageIcon,
  NotificationBell as NotificationIcon,
  QuillPen as ComposeIcon,
  Activity as ActivityIcon,
} from "./icons";
import DashboardNavIcon from "./DashboardNavIcon";

export interface NavElementProps {
  icon: ReactNode;
  title: string;
  route?: string;
  children?: NavElementProps[];
}

export const navElements: NavElementProps[] = [
  { icon: <DashboardNavIcon />, title: "Dashboard", route: "/profile?tab=dashboard" },
  {
    icon: <SocialIcon className="h-5 w-5" />,
    title: "Social Network",
    route: "/social",
    children: [
      {
        icon: <HomeIcon className="h-5 w-5" />,
        title: "Home",
        route: "/home",
      },
      {
        icon: <BoxIcon className="h-5 w-5" />,
        title: "My Profile",
        route: "/profile/tyrian_trade",
      },
      {
        icon: <BoxIcon className="h-5 w-5" />,
        title: "Other Profiles",
        route: "/profile/crypto_analyst",
      },
      {
        icon: <ExploreIcon className="h-5 w-5" />,
        title: "Explore",
        route: "/social/explore",
      },
      {
        icon: <NotificationIcon className="h-5 w-5" />,
        title: "Notifications",
        route: "/social/notifications",
      },
      {
        icon: <MessageIcon className="h-5 w-5" />,
        title: "Messages",
        route: "/social/messages",
      },
    ],
  },
  {
    icon: <MarketIcon className="h-5 w-5" />,
    title: "Marketplace",
    children: [
      {
        icon: <BoxIcon className="h-5 w-5" />,
        title: "My Products",
        route: "#",
      },
      { icon: <BoxIcon className="h-5 w-5" />, title: "Cart", route: "#" },
      {
        icon: <ExploreIcon className="h-5 w-5" />,
        title: "Test Home",
        route: "/marketplace/test-home",
      },
    ],
  },
];
