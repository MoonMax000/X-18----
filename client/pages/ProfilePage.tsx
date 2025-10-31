import ProfileContentClassic from "@/components/socialProfile/ProfileContentClassic";
import SuggestedProfilesWidget from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import { DEFAULT_SUGGESTED_PROFILES } from "@/components/SocialFeedWidgets/sidebarData";

export default function ProfilePage() {
  return (
    <div className="flex w-full gap-2 sm:gap-4 md:gap-8">
      <div className="flex-1 w-full sm:max-w-[720px]">
        <ProfileContentClassic />
      </div>
      <aside className="hidden w-full max-w-[360px] xl:max-w-[380px] flex-shrink-0 flex-col gap-5 lg:flex">
        <div className="sticky top-28 flex flex-col gap-5 bg-background">
          <SuggestedProfilesWidget profiles={DEFAULT_SUGGESTED_PROFILES} />
        </div>
      </aside>
    </div>
  );
}
