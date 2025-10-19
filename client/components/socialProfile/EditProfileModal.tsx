import { type FC, useState, useEffect, useRef } from "react";
import { X, Camera } from "lucide-react";
import type { SocialProfileData } from "@/data/socialProfile";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SocialProfileData;
  onSave?: (updatedProfile: Partial<SocialProfileData>) => void;
  onAvatarUpload?: (file: File) => Promise<void>;
  onCoverUpload?: (file: File) => Promise<void>;
}

const EditProfileModal: FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  onAvatarUpload,
  onCoverUpload,
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio,
    location: profile.location || "",
    website: profile.website?.url || "",
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSave = () => {
    onSave?.({
      name: formData.name,
      bio: formData.bio,
      location: formData.location,
      website: formData.website
        ? { label: formData.website, url: formData.website }
        : undefined,
    });
    onClose();
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarUpload) {
      setUploading(true);
      try {
        await onAvatarUpload(file);
      } catch (error) {
        console.error('Failed to upload avatar:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onCoverUpload) {
      setUploading(true);
      try {
        await onCoverUpload(file);
      } catch (error) {
        console.error('Failed to upload cover:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-header"
    >
      <div
        className="relative my-8 w-full max-w-[600px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-[28px] border border-[#181B22] bg-[#000000] shadow-[0_24px_56px_rgba(2,6,18,0.8)] backdrop-blur-xl overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#181B22] bg-[#000000]/95 backdrop-blur-md px-4 py-3">
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#E5E7EB] transition-all duration-200 hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2
              id="modal-header"
              className="text-xl font-bold text-[#E7E9EA]"
            >
              Edit profile
            </h2>
            <button
              onClick={handleSave}
              className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_12px_32px_rgba(160,106,255,0.6)] hover:ring-2 hover:ring-[#A06AFF] hover:ring-offset-2 hover:ring-offset-black"
            >
              Save
            </button>
          </div>

          {/* Content */}
          <div className="px-0">
            {/* Banner Section */}
            <div className="relative">
              <div className="h-[200px] w-full overflow-hidden bg-gradient-to-br from-[#141923] to-[#0B0E13]">
                {profile.cover && (
                  <img
                    src={profile.cover}
                    alt="Profile cover"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-3">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
                <button
                  onClick={handleCoverClick}
                  disabled={uploading}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#181B22] bg-black/75 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/90 disabled:opacity-50"
                  aria-label="Add banner photo"
                >
                  <Camera className="h-5 w-5" />
                </button>
                {profile.cover && (
                  <button
                    disabled={uploading}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#181B22] bg-black/75 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/90 disabled:opacity-50"
                    aria-label="Remove photo"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Avatar Section */}
              <div className="absolute -bottom-16 left-4">
                <div className="relative h-[112px] w-[112px] overflow-hidden rounded-full border-4 border-[#000000] bg-[#121720]">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <button
                      onClick={handleAvatarClick}
                      disabled={uploading}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#181B22] bg-black/75 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/90 disabled:opacity-50"
                      aria-label="Add avatar photo"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="mt-20 space-y-6 px-4 pb-6">
              {/* Name */}
              <div className="rounded-xl border border-[#181B22] bg-transparent px-4 py-3 transition-all duration-200 focus-within:border-[#A06AFF] focus-within:ring-2 focus-within:ring-[#A06AFF]/20">
                <label className="block">
                  <div className="mb-1 text-xs font-medium text-[#71767B]">
                    Name
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    maxLength={50}
                    className="w-full bg-transparent text-[15px] text-[#E7E9EA] outline-none placeholder:text-[#71767B]"
                  />
                </label>
              </div>

              {/* Bio */}
              <div className="rounded-xl border border-[#181B22] bg-transparent px-4 py-3 transition-all duration-200 focus-within:border-[#A06AFF] focus-within:ring-2 focus-within:ring-[#A06AFF]/20">
                <label className="block">
                  <div className="mb-1 text-xs font-medium text-[#71767B]">
                    Bio
                  </div>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    maxLength={160}
                    rows={3}
                    className="w-full resize-none bg-transparent text-[15px] text-[#E7E9EA] outline-none placeholder:text-[#71767B]"
                  />
                </label>
              </div>

              {/* Location */}
              <div className="rounded-xl border border-[#181B22] bg-transparent px-4 py-3 transition-all duration-200 focus-within:border-[#A06AFF] focus-within:ring-2 focus-within:ring-[#A06AFF]/20">
                <label className="block">
                  <div className="mb-1 text-xs font-medium text-[#71767B]">
                    Location
                  </div>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    maxLength={30}
                    className="w-full bg-transparent text-[15px] text-[#E7E9EA] outline-none placeholder:text-[#71767B]"
                  />
                </label>
              </div>

              {/* Website */}
              <div className="rounded-xl border border-[#181B22] bg-transparent px-4 py-3 transition-all duration-200 focus-within:border-[#A06AFF] focus-within:ring-2 focus-within:ring-[#A06AFF]/20">
                <label className="block">
                  <div className="mb-1 text-xs font-medium text-[#71767B]">
                    Website
                  </div>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    maxLength={100}
                    className="w-full bg-transparent text-[15px] text-[#E7E9EA] outline-none placeholder:text-[#71767B]"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
