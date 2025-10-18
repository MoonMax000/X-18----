import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { SocialProfileData } from "@/data/socialProfile";

interface ProfileHeaderClassicProps {
  profile: SocialProfileData;
  tweetsCount?: number;
}

export default function ProfileHeaderClassic({ profile, tweetsCount = 0 }: ProfileHeaderClassicProps) {
  const navigate = useNavigate();

  const navigateBack = () => {
    navigate(-1);
  };

  return (
    <header>
      <div className="flex items-center p-3 sm:p-4 text-white w-full backdrop-blur-sm bg-black/50">
        <button onClick={navigateBack} className="hover:bg-white/10 rounded-full p-1.5 sm:p-2 transition">
          <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
        </button>
        <div className="ml-4 sm:ml-8">
          <h1 className="text-lg sm:text-xl font-bold">{profile.name}</h1>
          <span className="text-xs sm:text-sm text-[#888] mt-0.5 block">{tweetsCount} Tweets</span>
        </div>
      </div>
      <div className="w-full bg-[#555] h-[120px] sm:h-[160px] md:h-[200px] overflow-hidden">
        <img 
          src={profile.cover || "https://picsum.photos/500/300"} 
          alt={`${profile.name} cover`}
          className="w-full h-full object-cover object-center"
        />
      </div>
    </header>
  );
}
