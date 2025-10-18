import { useParams } from "react-router-dom";
import ProfileContentClassic from "@/components/socialProfile/ProfileContentClassic";
import SocialRightSidebar from "@/components/SocialFeedWidgets/SocialRightSidebar";
import {
  DEFAULT_SUGGESTED_PROFILES,
  DEFAULT_NEWS_ITEMS,
} from "@/components/SocialFeedWidgets/sidebarData";
import { getUserByUsername } from "@/data/users";
import { useAuth } from "@/contexts/AuthContext";
import NotFound from "./NotFound";

export default function ProfileDynamic() {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();

  if (!username) {
    return <NotFound />;
  }

  const profileUser = getUserByUsername(username);

  if (!profileUser) {
    return <NotFound />;
  }

  const isOwnProfile = currentUser.username === username;

  return (
    <div className="flex w-full gap-2 sm:gap-4 md:gap-8">
      <div className="flex-1 w-full sm:max-w-[720px]">
        <ProfileContentClassic
          profile={profileUser}
          isOwnProfile={isOwnProfile}
        />
      </div>
      <SocialRightSidebar
        profiles={DEFAULT_SUGGESTED_PROFILES}
        newsItems={DEFAULT_NEWS_ITEMS}
      />
    </div>
  );
}
