import { FC, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { updateProfile } from "@/store/profileSlice";
import type { RootState } from "@/store/store";
import { customAuth } from "@/services/auth/custom-backend-auth";

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
  const [isSaving, setIsSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [location, setLocation] = useState(currentUser.location || "");
  const [website, setWebsite] = useState(currentUser.website || "");
  const [role, setRole] = useState(currentUser.role || "");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [bio, setBio] = useState(currentUser.bio);
  
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [usernameVerified] = useState(true);

  // Sync with Redux store when currentUser changes
  useEffect(() => {
    setDisplayName(currentUser.name);
    setUsername(currentUser.username);
    setBio(currentUser.bio);
    setLocation(currentUser.location || "");
    setWebsite(currentUser.website || "");
    if (currentUser.role) setRole(currentUser.role);
  }, [currentUser]);

  // Auto-save to Redux (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(updateProfile({
        name: displayName,
        username,
        bio,
        role,
        location: location || undefined,
        website: website || undefined,
      }));
    }, 800);

    return () => clearTimeout(timer);
  }, [displayName, username, bio, role, location, website, dispatch]);

  const handleReset = () => {
    setFirstName("");
    setLastName("");
    setDisplayName("");
    setLocation("");
    setWebsite("");
    setRole("");
    setSelectedSectors([]);
    setBio("");
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Prepare update data
      const updateData: any = {};
      
      if (firstName) updateData.first_name = firstName;
      if (lastName) updateData.last_name = lastName;
      if (displayName) updateData.display_name = displayName;
      if (bio) updateData.bio = bio;
      if (location) updateData.location = location;
      if (website) updateData.website = website;
      if (role) updateData.role = role;
      if (selectedSectors.length > 0) {
        updateData.sectors = JSON.stringify(selectedSectors);
      }
      
      // Send to backend
      const token = customAuth.getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('http://localhost:8080/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      
      // Update Redux store
      dispatch(updateProfile({
        name: updatedUser.display_name,
        username: updatedUser.username,
        bio: updatedUser.bio,
        role: updatedUser.role,
        location: updatedUser.location || undefined,
        website: updatedUser.website || undefined,
      }));
      
      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      alert(`Failed to save profile: ${error?.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSector = (sectorId: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sectorId)
        ? prev.filter((s) => s !== sectorId)
        : [...prev, sectorId]
    );
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

      {/* Display Name & Username */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <label
            className="text-xs font-bold text-[#B0B0B0] uppercase"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Display name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="flex px-4 py-3 items-center gap-2 rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] text-[15px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            placeholder="Enter display name"
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <label
            className="text-xs font-bold text-[#B0B0B0] uppercase"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            User name
          </label>
          <div className="flex px-4 py-3 justify-between items-center rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)]">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 bg-transparent text-[15px] font-bold text-white focus:outline-none"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              placeholder="username"
              disabled
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
            placeholder="https://"
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
          <div className="relative">
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

      {/* Action Buttons */}
      <div className="flex gap-6">
        <button
          onClick={handleReset}
          disabled={isSaving}
          className="group relative flex justify-center items-center gap-2 px-6 py-3 min-w-[180px] overflow-hidden rounded-full border border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent text-sm font-medium transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-inset disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span
            className="relative z-10 text-[15px] font-bold text-white text-center"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Reset
          </span>
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="group relative flex justify-center items-center gap-2 px-6 py-3 min-w-[180px] overflow-hidden rounded-full border border-[#525252] bg-gradient-to-r from-[#A06AFF]/20 via-[#A06AFF]/10 to-transparent text-sm font-medium transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/30 hover:via-[#A06AFF]/15 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-inset disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span
            className="relative z-10 text-[15px] font-bold text-white text-center"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProfileOverview;
