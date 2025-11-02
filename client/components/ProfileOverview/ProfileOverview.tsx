import { FC, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { updateProfile } from "@/store/profileSlice";
import type { RootState } from "@/store/store";
import { customAuth } from "@/services/auth/custom-backend-auth";
import { customBackendAPI } from "@/services/api/custom-backend";

const SECTORS = [
  { id: "stock", label: "Stock Market" },
  { id: "crypto", label: "Crypto" },
  { id: "forex", label: "Forex" },
  { id: "commodities", label: "Commodities" },
  { id: "real-estate", label: "Real Estate" },
  { id: "nft", label: "NFT" },
];

const ROLES = [
  "Individual Investor",
  "Professional Trader",
  "Fund Manager",
  "Financial Analyst",
  "Portfolio Manager",
  "Crypto Trader",
  "Day Trader",
  "Swing Trader",
];

const ProfileOverview: FC = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.profile.currentUser);

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string>('');

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState(currentUser.username);
  const [location, setLocation] = useState(currentUser.location || "");
  const [website, setWebsite] = useState(currentUser.website || "");
  const [role, setRole] = useState(currentUser.role || "");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [bio, setBio] = useState(currentUser.bio);
  
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [usernameVerified] = useState(true);
  const [usernameChangesLeft, setUsernameChangesLeft] = useState<number | null>(null);
  const [nextUsernameChangeDate, setNextUsernameChangeDate] = useState<string | null>(null);
  const [originalUsername, setOriginalUsername] = useState(currentUser.username);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sectorDropdownRef = useRef<HTMLDivElement>(null);

  // Sync with Redux store when currentUser changes
  useEffect(() => {
    setUsername(currentUser.username);
    setOriginalUsername(currentUser.username);
    setBio(currentUser.bio);
    setLocation(currentUser.location || "");
    setWebsite(currentUser.website || "");
    if (currentUser.role) setRole(currentUser.role);
  }, [currentUser]);

  // Fetch username change status
  useEffect(() => {
    const fetchUsernameStatus = async () => {
      try {
        const response = await customBackendAPI.getMe();
        const changesCount = (response as any).username_changes_count || 0;
        const lastChangeAt = (response as any).last_username_change_at;
        
        if (changesCount < 3) {
          setUsernameChangesLeft(3 - changesCount);
          setNextUsernameChangeDate(null);
        } else {
          setUsernameChangesLeft(0);
          if (lastChangeAt) {
            const lastChange = new Date(lastChangeAt);
            const nextChange = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000);
            setNextUsernameChangeDate(nextChange.toISOString());
          }
        }
      } catch (error) {
        console.error("Failed to fetch username status:", error);
      }
    };
    
    fetchUsernameStatus();
  }, []);

  // Close sector dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(event.target as Node)) {
        setIsSectorDropdownOpen(false);
      }
    };
    
    if (isSectorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSectorDropdownOpen]);

  // Auto-save function
  const autoSave = async () => {
    try {
      setSaveStatus('saving');
      setSaveError('');
      
      // Prepare update data - only send fields that have values
      const updateData: any = {};
      
      // Include username if it changed
      if (username?.trim() && username !== originalUsername) {
        updateData.username = username.trim();
      }
      if (firstName?.trim()) updateData.first_name = firstName.trim();
      if (lastName?.trim()) updateData.last_name = lastName.trim();
      if (bio?.trim()) updateData.bio = bio.trim();
      if (location?.trim()) updateData.location = location.trim();
      if (website?.trim()) {
        // Auto-add https:// if no protocol specified
        let url = website.trim();
        if (!url.match(/^https?:\/\//i)) {
          url = `https://${url}`;
        }
        updateData.website = url;
        setWebsite(url); // Update local state with formatted URL
      }
      if (role) updateData.role = role;
      if (selectedSectors.length > 0) {
        updateData.sectors = JSON.stringify(selectedSectors);
      }
      
      // Only save if there's something to update
      if (Object.keys(updateData).length === 0) {
        setSaveStatus('idle');
        return;
      }
      
      // Send to backend using API service
      const response = await customBackendAPI.updateProfile(updateData);
      
      // Update Redux store with response - auto-generate display name from first+last
      const displayName = (response as any).first_name && (response as any).last_name 
        ? `${(response as any).first_name} ${(response as any).last_name}`.trim()
        : response.display_name;
      
      dispatch(updateProfile({
        name: displayName,
        username: response.username,
        bio: response.bio,
        role: response.role,
        location: response.location || undefined,
        website: response.website || undefined,
      }));
      
      // Update username tracking if username was changed
      if (username !== originalUsername) {
        setOriginalUsername(response.username);
        const changesCount = (response as any).username_changes_count || 0;
        if (changesCount < 3) {
          setUsernameChangesLeft(3 - changesCount);
          setNextUsernameChangeDate(null);
        } else {
          setUsernameChangesLeft(0);
          const lastChangeAt = (response as any).last_username_change_at;
          if (lastChangeAt) {
            const lastChange = new Date(lastChangeAt);
            const nextChange = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000);
            setNextUsernameChangeDate(nextChange.toISOString());
          }
        }
      }
      
      setSaveStatus('saved');
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error: any) {
      console.error("Failed to auto-save profile:", error);
      setSaveStatus('error');
      
      // Handle username change limit error
      if (error?.response?.data?.error && typeof error.response.data.error === 'object') {
        const errorData = error.response.data.error;
        if (errorData.message && errorData.days_left !== undefined) {
          setSaveError(`${errorData.message}. Next change in ${errorData.days_left} days and ${errorData.hours_left} hours.`);
        } else {
          setSaveError(errorData.message || 'Failed to save changes');
        }
      } else {
        setSaveError(error?.response?.data?.error || error?.message || 'Failed to save changes');
      }
      
      // Reset error after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveError('');
      }, 3000);
    }
  };

  // Auto-save when fields change (debounced)
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save (1.5 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1500);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [firstName, lastName, bio, location, website, role, selectedSectors]);

  const toggleSector = (sectorId: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sectorId)
        ? prev.filter((s) => s !== sectorId)
        : [...prev, sectorId]
    );
    // Auto-close dropdown after selection
    setIsSectorDropdownOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1059px] mx-auto">
      {/* First Name & Last Name */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <label
            className="text-xs font-bold text-[#B0B0B0] uppercase"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            First name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="flex px-4 py-3 items-center gap-2 rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] text-[15px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            placeholder="Enter first name"
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <label
            className="text-xs font-bold text-[#B0B0B0] uppercase"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Last name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="flex px-4 py-3 items-center gap-2 rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] text-[15px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            placeholder="Enter last name"
          />
        </div>
      </div>

      {/* Username */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label
            className="text-xs font-bold text-[#B0B0B0] uppercase"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            User name
          </label>
          {usernameChangesLeft !== null && (
            <span className="text-xs text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              {usernameChangesLeft > 0 ? (
                `${usernameChangesLeft} free ${usernameChangesLeft === 1 ? 'change' : 'changes'} left`
              ) : nextUsernameChangeDate ? (
                `Next change: ${new Date(nextUsernameChangeDate).toLocaleDateString()}`
              ) : (
                'Limited to 1 change per week'
              )}
            </span>
          )}
        </div>
        <div className="flex px-4 py-3 justify-between items-center rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)]">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 bg-transparent text-[15px] font-bold text-white focus:outline-none"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            placeholder="username"
          />
          {usernameVerified && (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4.1665 12.083C4.1665 12.083 5.4165 12.083 7.08317 14.9997C7.08317 14.9997 11.7155 7.36078 15.8332 5.83301"
                stroke="#2EBD85"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Location & Website */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <label
            className="text-xs font-bold text-[#B0B0B0] uppercase"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex px-4 py-3 items-center gap-2 rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] text-[15px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            placeholder="Your location"
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <label
            className="text-xs font-bold text-[#B0B0B0] uppercase"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Website / URL
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="flex px-4 py-3 items-center gap-2 rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] text-[15px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            placeholder="example.com"
          />
        </div>
      </div>

      {/* Role & Sector */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Role Dropdown */}
        <div className="flex flex-col gap-2 w-full md:w-[320px]">
          <label
            className="text-xs font-bold text-[#B0B0B0] uppercase"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Role
          </label>
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex w-full px-4 py-3 justify-between items-center rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-inset"
            >
              <span
                className="text-[15px] font-bold text-white"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                {role || "Select role"}
              </span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7.05856 8.9502L10.0002 11.8835L12.9419 8.9502"
                  stroke="#B0B0B0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            
            {isRoleDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 rounded-2xl border border-[#181B22] bg-black/95 shadow-lg backdrop-blur-[50px] max-h-60 overflow-y-auto">
                {ROLES.map((roleOption) => (
                  <button
                    key={roleOption}
                    onClick={() => {
                      setRole(roleOption);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left text-[15px] font-bold hover:bg-[#A06AFF]/10 transition-colors",
                      role === roleOption ? "text-[#A06AFF]" : "text-white"
                    )}
                    style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                  >
                    {roleOption}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sector Multi-select */}
        <div className="flex flex-col gap-2 flex-1">
          <label
            className="text-xs font-bold text-[#B0B0B0] uppercase"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Sector
          </label>
          <div className="relative" ref={sectorDropdownRef}>
            <button
              onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
              className="flex w-full px-4 py-3 justify-between items-center rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-inset"
            >
              <div className="flex flex-wrap gap-2">
                {selectedSectors.length === 0 ? (
                  <span
                    className="text-[15px] font-bold text-[#B0B0B0]"
                    style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                  >
                    Select sectors
                  </span>
                ) : (
                  selectedSectors.map((sectorId) => {
                    const sector = SECTORS.find((s) => s.id === sectorId);
                    return (
                      <span
                        key={sectorId}
                        className="px-2 py-1 rounded bg-[#A06AFF]/20 text-[13px] font-bold text-white"
                        style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                      >
                        {sector?.label}
                      </span>
                    );
                  })
                )}
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7.05856 8.9502L10.0002 11.8835L12.9419 8.9502"
                  stroke="#B0B0B0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isSectorDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 rounded-lg border border-[#181B22] bg-black/95 shadow-lg backdrop-blur-[50px]">
                {SECTORS.map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => toggleSector(sector.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#A06AFF]/10 transition-colors"
                  >
                    <div className="relative w-[18px] h-[18px]">
                      <div
                        className={cn(
                          "w-[18px] h-[18px] rounded border-2 transition-colors",
                          selectedSectors.includes(sector.id)
                            ? "bg-[#A06AFF] border-[#A06AFF]"
                            : "bg-transparent border-[#525252]"
                        )}
                      />
                      {selectedSectors.includes(sector.id) && (
                        <svg
                          className="absolute top-[3px] left-[4px]"
                          width="10"
                          height="8"
                          viewBox="0 0 12 8"
                          fill="none"
                        >
                          <path
                            d="M1 2.5L5 6.5L10.5 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-[15px] font-bold text-white"
                      style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                    >
                      {sector.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs font-bold text-[#B0B0B0] uppercase"
          style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
        >
          BIO
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          className="flex px-4 py-3 items-start gap-2 rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] text-[15px] text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
          style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          placeholder="Tell us about yourself..."
        />
      </div>

      {/* Save Status Indicator */}
      {saveStatus !== 'idle' && (
        <div className="flex items-center gap-2 text-sm">
          {saveStatus === 'saving' && (
            <>
              <div className="w-4 h-4 border-2 border-[#A06AFF] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#B0B0B0] font-medium">Saving changes...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4.1665 12.083C4.1665 12.083 5.4165 12.083 7.08317 14.9997C7.08317 14.9997 11.7155 7.36078 15.8332 5.83301"
                  stroke="#2EBD85"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[#2EBD85] font-medium">Changes saved</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 6.66699V10.0003M10 13.3337H10.0083M18.3333 10.0003C18.3333 14.6027 14.6024 18.3337 10 18.3337C5.39763 18.3337 1.66667 14.6027 1.66667 10.0003C1.66667 5.39795 5.39763 1.66699 10 1.66699C14.6024 1.66699 18.3333 5.39795 18.3333 10.0003Z"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[#EF4444] font-medium">{saveError || 'Failed to save'}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileOverview;
