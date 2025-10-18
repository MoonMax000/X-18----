import { Calendar, Mail, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import type { SocialProfileData } from "@/data/socialProfile";

interface ProfileBioClassicProps {
  profile: SocialProfileData;
  isOwnProfile?: boolean;
}

const formatStringWithLink = (text?: string) => {
  if (!text) return "";
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
};

export default function ProfileBioClassic({ profile, isOwnProfile = false }: ProfileBioClassicProps) {
  const joinedDate = profile.joined || format(new Date(), "MMMM yyyy");
  const bio = formatStringWithLink(profile.bio);

  const actions = [
    { Icon: MoreHorizontal, id: 'more' },
    { Icon: Mail, id: 'message' },
  ];

  return (
    <div className="px-5 pb-5 relative">
      <div className="flex justify-between -mt-16">
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-black bg-[#444]">
          <img 
            src={profile.avatar} 
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {!isOwnProfile && (
          <div className="relative top-14 flex gap-2.5">
            {actions.map((action) => (
              <button 
                key={action.id}
                className="border border-[#777] w-[30px] h-[30px] rounded-full flex justify-center items-center hover:bg-white/10 transition"
              >
                <action.Icon className="text-white" size={21} />
              </button>
            ))}
            <button className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-sm hover:bg-gray-200 transition">
              Follow
            </button>
          </div>
        )}
      </div>

      <div className="text-[#888] mt-5">
        <span className="text-white font-bold block">{profile.name}</span>
        <span className="text-[15px] mt-0.5 block">@{profile.username}</span>
        
        <span 
          className="text-white mt-2.5 block"
          dangerouslySetInnerHTML={{ __html: bio }}
        />

        <div className="flex items-center mt-4 text-[15px]">
          <Calendar className="text-[#777]" size={20} />
          <span className="ml-1.5">Joined {joinedDate}</span>
        </div>

        <div className="flex text-[15px] mt-4">
          <span className="flex items-center">
            <b className="text-white">{profile.stats.following || 0}</b>
            <span className="ml-1">Following</span>
          </span>
          <span className="flex items-center ml-5">
            <b className="text-white">{profile.stats.followers || 0}</b>
            <span className="ml-1">Followers</span>
          </span>
        </div>

        <div className="text-[13px] mt-4">
          Not followed by anyone you are following
        </div>
      </div>
    </div>
  );
}
