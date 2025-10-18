import ProfileContentClassic from "@/components/socialProfile/ProfileContentClassic";
import SocialRightSidebar from "@/components/SocialFeedWidgets/SocialRightSidebar";
import {
  DEFAULT_SUGGESTED_PROFILES,
  DEFAULT_NEWS_ITEMS,
} from "@/components/SocialFeedWidgets/sidebarData";

export default function OtherProfilePage() {
  return (
    <div className="flex w-full gap-2 sm:gap-4 md:gap-8">
      <div className="flex-1 w-full sm:max-w-[720px]">
        <ProfileContentClassic isOwnProfile={false} />
      </div>
      <SocialRightSidebar
        profiles={DEFAULT_SUGGESTED_PROFILES}
        newsItems={DEFAULT_NEWS_ITEMS}
      />
    </div>
  );
}
