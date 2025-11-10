import { ReactNode } from "react";
import {
  Home as HomeIcon,
  UsersRound as SocialIcon,
  BadgeCheck as MarketIcon,
  Compass as ExploreIcon,
  NotificationBell as NotificationIcon,
  QuillPen as ComposeIcon,
  LayoutDashboard,
} from "./icons";
import { Newspaper, User, Telescope, Package, ShoppingCart } from "lucide-react";

export interface NavElementProps {
  icon: ReactNode;
  title: string;
  route?: string;
  children?: NavElementProps[];
}

export const navElements: NavElementProps[] = [
  { icon: <LayoutDashboard className="h-5 w-5" />, title: "Dashboard", route: "/profile" },
  {
    icon: <SocialIcon className="h-5 w-5" />,
    title: "Social Network",
    route: "/social",
    children: [
      {
        icon: <HomeIcon className="h-5 w-5" />,
        title: "Home",
        route: "/feedtest",
      },
      {
        icon: <User className="h-5 w-5" />,
        title: "Profile",
        route: "/profile-page",
      },
      {
        icon: <Telescope className="h-5 w-5" />,
        title: "Explore",
        route: "/social/explore",
      },
      {
        icon: <Newspaper className="h-5 w-5" />,
        title: "News",
        route: "/news",
      },
    ],
  },
  {
    icon: <MarketIcon className="h-5 w-5" />,
    title: "Marketplace",
    children: [
      {
        icon: <Package className="h-5 w-5" />,
        title: "My Products",
        route: "#",
      },
      { icon: <ShoppingCart className="h-5 w-5" />, title: "Cart", route: "#" },
    ],
  },
];
