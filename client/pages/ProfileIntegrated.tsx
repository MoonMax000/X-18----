import { FC, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader/UserHeader";
import EditProfileModal from "@/components/socialProfile/EditProfileModal";
import NotificationsSettings from "@/components/NotificationsSettings/NotificationsSettings";
import BillingSettings from "@/components/BillingSettings/BillingSettings";
import ReferralsSettings from "@/components/ReferralsSettings/ReferralsSettings";
import KycSettings from "@/components/KycSettings/KycSettings";
import { cn } from "@/lib/utils";
import { 
  getCurrentUserProfile, 
  updateUserProfile, 
  uploadAvatar,
  uploadCoverImage,
  ProfileUpdateData
} from "@/lib/supabase-profile";
import type { SocialProfileData } from "@/data/socialProfile";

type ProfileSubTab =
  | "profile"
  | "security"
  | "notifications"
  | "billing"
  | "referrals"
  | "api"
  | "kyc";

const profileSubTabs = [
  {
    id: "profile" as ProfileSubTab,
    label: "Profile",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M5.48131 12.9017C4.30234 13.6037 1.21114 15.0371 3.09389 16.8308C4.01359 17.707 5.03791 18.3337 6.32573 18.3337H13.6743C14.9621 18.3337 15.9864 17.707 16.9061 16.8308C18.7888 15.0371 15.6977 13.6037 14.5187 12.9017C11.754 11.2554 8.24599 11.2554 5.48131 12.9017Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.75 5.41699C13.75 7.48806 12.0711 9.16699 10 9.16699C7.92893 9.16699 6.25 7.48806 6.25 5.41699C6.25 3.34593 7.92893 1.66699 10 1.66699C12.0711 1.66699 13.75 3.34593 13.75 5.41699Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: "security" as ProfileSubTab,
    label: "Security",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M15.5907 2.91311C14.0137 2.12851 12.0841 1.66699 10 1.66699C7.91592 1.66699 5.98625 2.12851 4.4093 2.91311C3.63598 3.29788 3.24932 3.49026 2.87467 4.09514C2.5 4.70003 2.5 5.28573 2.5 6.45711V9.36458C2.5 14.1007 6.2853 16.734 8.4775 17.8618C9.08892 18.1764 9.39458 18.3337 10 18.3337C10.6054 18.3337 10.9111 18.1764 11.5224 17.8618C13.7147 16.734 17.5 14.1007 17.5 9.36458V6.45711C17.5 5.28573 17.5 4.70004 17.1253 4.09514C16.7507 3.49025 16.364 3.29788 15.5907 2.91311Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "notifications" as ProfileSubTab,
    label: "Notifications",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M2.10892 12.3083C1.93171 13.47 2.72399 14.2763 3.69403 14.6782C7.41299 16.2188 12.5883 16.2188 16.3072 14.6782C17.2773 14.2763 18.0696 13.47 17.8924 12.3083C17.7835 11.5944 17.245 10.9999 16.846 10.4194C16.3234 9.64974 16.2715 8.81016 16.2714 7.91699C16.2714 4.46521 13.4639 1.66699 10.0007 1.66699C6.53743 1.66699 3.72993 4.46521 3.72993 7.91699C3.72984 8.81016 3.67792 9.64974 3.15533 10.4194C2.75635 10.9999 2.21783 11.5944 2.10892 12.3083Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "billing" as ProfileSubTab,
    label: "Billing",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M1.66602 9.99967C1.66602 7.05177 1.66602 5.57782 2.54335 4.59376C2.68367 4.43637 2.83833 4.2908 3.00557 4.15873C4.05112 3.33301 5.6172 3.33301 8.74935 3.33301H11.2493C14.3815 3.33301 15.9476 3.33301 16.9931 4.15873C17.1603 4.2908 17.315 4.43637 17.4553 4.59376C18.3327 5.57782 18.3327 7.05177 18.3327 9.99967C18.3327 12.9476 18.3327 14.4215 17.4553 15.4056C17.315 15.563 17.1603 15.7085 16.9931 15.8406C15.9476 16.6663 14.3815 16.6663 11.2493 16.6663H8.74935C5.6172 16.6663 4.05112 16.6663 3.00557 15.8406C2.83833 15.7085 2.68367 15.563 2.54335 15.4056C1.66602 14.4215 1.66602 12.9476 1.66602 9.99967Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "referrals" as ProfileSubTab,
    label: "Referrals",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M12.9173 9.16667C12.9173 7.55583 11.6115 6.25 10.0007 6.25C8.38982 6.25 7.08398 7.55583 7.08398 9.16667C7.08398 10.7775 8.38982 12.0833 10.0007 12.0833C11.6115 12.0833 12.9173 10.7775 12.9173 9.16667Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "api" as ProfileSubTab,
    label: "API",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M2.08398 9.99967C2.08398 6.26772 2.08398 4.40175 3.24335 3.24237C4.40273 2.08301 6.2687 2.08301 10.0007 2.08301C13.7326 2.08301 15.5986 2.08301 16.758 3.24237C17.9173 4.40175 17.9173 6.26772 17.9173 9.99967C17.9173 13.7316 17.9173 15.5976 16.758 16.757C15.5986 17.9163 13.7326 17.9163 10.0007 17.9163C6.2687 17.9163 4.40273 17.9163 3.24335 16.757C2.08398 15.5976 2.08398 13.7316 2.08398 9.99967Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: "kyc" as ProfileSubTab,
    label: "KYC",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M1.66602 10C1.66602 6.46447 1.66602 4.6967 2.88641 3.59835C4.10679 2.5 6.07098 2.5 9.99935 2.5C13.9277 2.5 15.8919 2.5 17.1123 3.59835C18.3327 4.6967 18.3327 6.46447 18.3327 10C18.3327 13.5355 18.3327 15.3033 17.1123 16.4017C15.8919 17.5 13.9277 17.5 9.99935 17.5C6.07098 17.5 4.10679 17.5 2.88641 16.4017C1.66602 15.3033 1.66602 13.5355 1.66602 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const ProfileIntegrated: FC = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>("profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from Supabase
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const profile = await getCurrentUserProfile(user.id);
      if (profile) {
        setProfileData(profile);
      }
      setLoading(false);
    }

    loadProfile();
  }, [user]);

  const handleSaveProfile = async (updatedProfile: Partial<SocialProfileData>) => {
    if (!user?.id) return;

    try {
      const updateData: ProfileUpdateData = {};

      // Map SocialProfileData to ProfileUpdateData
      if (updatedProfile.name) {
        const [firstName, ...lastNameParts] = updatedProfile.name.split(' ');
        updateData.first_name = firstName;
        updateData.last_name = lastNameParts.join(' ');
      }

      if (updatedProfile.bio) updateData.bio = updatedProfile.bio;
      if (updatedProfile.location) updateData.location = updatedProfile.location;
      if (updatedProfile.website?.url) updateData.website = updatedProfile.website.url;

      const updated = await updateUserProfile(user.id, updateData);
      if (updated) {
        setProfileData(updated);
        // Update user in AuthContext
        updateUser({
          username: updated.username,
          email: updated.email,
        });
        console.log('[ProfileIntegrated] Profile updated successfully');
      }
    } catch (error) {
      console.error('[ProfileIntegrated] Failed to save profile:', error);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return;

    try {
      const avatarUrl = await uploadAvatar(user.id, file);
      if (avatarUrl) {
        const updated = await updateUserProfile(user.id, { avatar_url: avatarUrl });
        if (updated) {
          setProfileData(updated);
          console.log('[ProfileIntegrated] Avatar updated successfully');
        }
      }
    } catch (error) {
      console.error('[ProfileIntegrated] Failed to upload avatar:', error);
    }
  };

  const handleCoverUpload = async (file: File) => {
    if (!user?.id) return;

    try {
      const coverUrl = await uploadCoverImage(user.id, file);
      if (coverUrl) {
        const updated = await updateUserProfile(user.id, { cover: coverUrl });
        if (updated) {
          setProfileData(updated);
          console.log('[ProfileIntegrated] Cover updated successfully');
        }
      }
    } catch (error) {
      console.error('[ProfileIntegrated] Failed to upload cover:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Загрузка профиля...</div>
      </div>
    );
  }

  if (!isAuthenticated || !profileData) {
    return (
      <div className="flex w-full items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Please login to view your profile</div>
      </div>
    );
  }

  // Transform Supabase data to SocialProfileData format for EditProfileModal
  const socialProfileData: SocialProfileData = {
    id: profileData.id,
    name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.username,
    username: profileData.username,
    bio: profileData.bio || '',
    location: profileData.location || '',
    website: profileData.website ? { label: profileData.website, url: profileData.website } : undefined,
    joined: new Date(profileData.created_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' }),
    avatar: profileData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.username}`,
    cover: profileData.cover || '',
    stats: {
      tweets: profileData.posts_count || 0,
      following: profileData.following_count || 0,
      followers: profileData.followers_count || 0,
      likes: 0,
    },
    isVerified: profileData.verified,
    isPremium: profileData.premium,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* User Header */}
      <div className="flex justify-center">
        <div className="w-full max-w-[720px]">
          <UserHeader
            isOwn={true}
            onEditProfile={() => setIsEditModalOpen(true)}
            profileData={{
              name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.username,
              username: profileData.username,
              bio: profileData.bio || '',
              location: profileData.location || '',
              website: profileData.website || '',
              joined: profileData.joined_date
                ? new Date(profileData.joined_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                : new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
              avatar: profileData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.username}`,
              cover: profileData.cover || '',
              stats: {
                tweets: profileData.posts_count || 0,
                following: profileData.following_count || 0,
                followers: profileData.followers_count || 0,
              },
              isVerified: profileData.verified || false,
              isPremium: profileData.premium || false,
              tradingStyle: profileData.trading_style,
            }}
            onAvatarUpload={handleAvatarUpload}
            onCoverUpload={handleCoverUpload}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col items-center gap-4">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1 rounded-[36px] border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
          {profileSubTabs.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id)}
              className={cn(
                "flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-[32px] text-xs md:text-sm font-bold transition-all whitespace-nowrap",
                activeSubTab === subTab.id
                  ? "bg-gradient-to-r from-primary to-[#482090] text-white backdrop-blur-[58.33px]"
                  : "border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-webGray hover:text-white backdrop-blur-[58.33px]",
              )}
            >
              <span
                className={
                  activeSubTab === subTab.id
                    ? "text-white"
                    : "text-webGray"
                }
              >
                {subTab.icon}
              </span>
              {subTab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeSubTab === "profile" && (
          <div className="flex flex-col gap-6">
            <div className="container-card p-6">
              <h2 className="text-xl font-semibold text-white">Personal Details</h2>
              <div className="mt-4 flex flex-col gap-4 text-sm text-white/80">
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-webGray">Full Name</span>
                  <span className="mt-1 font-medium">
                    {profileData.first_name} {profileData.last_name}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-webGray">Username</span>
                  <span className="mt-1 font-medium">@{profileData.username}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-webGray">Email</span>
                  <span className="mt-1 font-medium">{profileData.email}</span>
                </div>
                {profileData.location && (
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-webGray">Location</span>
                    <span className="mt-1 font-medium">{profileData.location}</span>
                  </div>
                )}
                {profileData.trading_style && (
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-webGray">Trading Style</span>
                    <span className="mt-1 font-medium">{profileData.trading_style}</span>
                  </div>
                )}
                {profileData.specialization && (
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-webGray">Specialization</span>
                    <span className="mt-1 font-medium">{profileData.specialization}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="container-card p-6">
              <h2 className="text-xl font-semibold text-white">Trading Stats</h2>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-webGray">Followers</span>
                  <span className="mt-1 text-lg font-bold text-white">
                    {profileData.followers_count?.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-webGray">Following</span>
                  <span className="mt-1 text-lg font-bold text-white">
                    {profileData.following_count?.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-webGray">Posts</span>
                  <span className="mt-1 text-lg font-bold text-white">
                    {profileData.posts_count?.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-webGray">Accuracy Rate</span>
                  <span className="mt-1 text-lg font-bold text-green">
                    {profileData.accuracy_rate}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-webGray">Win Rate</span>
                  <span className="mt-1 text-lg font-bold text-green">
                    {profileData.win_rate}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-webGray">Total Trades</span>
                  <span className="mt-1 text-lg font-bold text-white">
                    {profileData.total_trades?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "notifications" && <NotificationsSettings />}
        {activeSubTab === "billing" && <BillingSettings />}
        {activeSubTab === "referrals" && <ReferralsSettings />}
        {activeSubTab === "kyc" && <KycSettings />}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={socialProfileData}
        onSave={handleSaveProfile}
        onAvatarUpload={handleAvatarUpload}
        onCoverUpload={handleCoverUpload}
      />
    </div>
  );
};

export default ProfileIntegrated;
