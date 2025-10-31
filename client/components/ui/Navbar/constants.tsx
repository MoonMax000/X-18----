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
import { Newspaper } from "lucide-react";

export interface NavElementProps {
  icon: ReactNode;
  title: string;
  route?: string;
  children?: NavElementProps[];
}

export const navElements: NavElementProps[] = [
  { icon: <DashboardNavIcon />, title: "Dashboard", route: "/profile" },
  {
    icon: <SocialIcon className="h-5 w-5" />,
    title: "Social Network",
    route: "/social",
    children: [
      {
        icon: <ActivityIcon className="h-5 w-5" />,
        title: "Home",
        route: "/feedtest",
      },
      {
        icon: <BoxIcon className="h-5 w-5" />,
        title: "Profile",
        route: "/profile-page",
      },
      {
        icon: <ExploreIcon className="h-5 w-5" />,
        title: "Explore",
        route: "/social/explore",
      },
      {
        icon: <Newspaper className="h-5 w-5" />,
        title: "News",
        route: "/news",
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
    ],
  },
];
