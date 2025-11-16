import { FC, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { updateProfile } from "@/store/profileSlice";
import type { RootState } from "@/store/store";
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

type FieldStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

interface FieldStatusIndicatorProps {
  status: FieldStatus;
  error?: string;
}

const FieldStatusIndicator: FC<FieldStatusIndicatorProps> = ({ status, error }) => {
  if (status === 'idle') return null;

  return (
    <span className="text-xs font-medium flex items-center gap-1">
      {status === 'loading' && (
        <div className="w-3 h-3 border-2 border-[#A06AFF] border-t-transparent rounded-full animate-spin" />
      )}
      {status === 'saving' && (
        <>
          <div className="w-3 h-3 border-2 border-[#A06AFF] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#B0B0B0]">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M4.1665 12.083C4.1665 12.083 5.4165 12.083 7.08317 14.9997C7.08317 14.9997 11.7155 7.36078 15.8332 5.83301"
              stroke="#2EBD85"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[#2EBD85]">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 6.66699V10.0003M10 13.3337H10.0083M18.3333 10.0003C18.3333 14.6027 14.6024 18.3337 10 18.3337C5.39763 18.3337 1.66667 14.6027 1.66667 10.0003C1.66667 5.39795 5.39763 1.66699 10 1.66699C14.6024 1.66699 18.3333 5.39795 18.3333 10.0003Z"
              stroke="#EF4444"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[#EF4444]">{error || 'Error'}</span>
        </>
      )}
    </span>
  );
};

const ProfileOverview: FC = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.profile.currentUser);

  // Field values
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState(currentUser.username);
  const [location, setLocation] = useState(currentUser.location || "");
  const [website, setWebsite] = useState(currentUser.website || "");
  const [role, setRole] = useState(currentUser.role || "");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [bio, setBio] = useState(currentUser.bio);
  const [isProfilePrivate, setIsProfilePrivate] = useState(false);

  // Field statuses
  const [fieldStatus, setFieldStatus] = useState<Record<string, FieldStatus>>({
    firstName: 'idle',
    lastName: 'idle',
    username: 'idle',
    location: 'idle',
    website: 'idle',
    role: 'idle',
    sectors: 'idle',
                bio: 'idle',
            privateProfile: 'idle',
          });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // UI state
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [usernameVerified] = useState(true);
  const [usernameChangesLeft, setUsernameChangesLeft] = useState<number | null>(null);
  const [nextUsernameChangeDate, setNextUsernameChangeDate] = useState<string | null>(null);
  const [originalUsername, setOriginalUsername] = useState(currentUser.username);

  // Refs for debouncing
  const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const sectorDropdownRef = useRef<HTMLDivElement>(null);

  // Load user data from API on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Set loading status for all fields
        setFieldStatus({
          firstName: 'loading',
          lastName: 'loading',
          username: 'loading',
          location: 'loading',
          website: 'loading',
          role: 'loading',
          sectors: 'loading',
          bio: 'loading',
        });

        const response = await customBackendAPI.getMe();
        
        // Initialize all fields from API
        setFirstName(response.first_name || "");
        setLastName(response.last_name || "");
        setUsername(response.username);
        setOriginalUsername(response.username);
        setLocation(response.location || "");
        setWebsite(response.website || "");
        setRole(response.role || "");
        setBio(response.bio || "");
        setIsProfilePrivate(response.is_profile_private || false);
        
        // Parse sectors from JSON string
        if (response.sectors) {
          try {
            const sectorsData = JSON.parse(response.sectors);
            setSelectedSectors(Array.isArray(sectorsData) ? sectorsData : []);
          } catch (e) {
            console.warn("Failed to parse sectors:", e);
            setSelectedSectors([]);
          }
        } else {
          setSelectedSectors([]);
        }

        // Reset all statuses to idle after loading
        setFieldStatus({
          firstName: 'idle',
          lastName: 'idle',
          username: 'idle',
          location: 'idle',
          website: 'idle',
          role: 'idle',
          sectors: 'idle',
          bio: 'idle',
          privateProfile: 'idle',
        });
        
        // Update Redux store with real data
        dispatch(updateProfile({
          first_name: response.first_name,
          last_name: response.last_name,
          name: response.first_name && response.last_name 
            ? `${response.first_name} ${response.last_name}`.trim()
            : response.display_name,
          username: response.username,
          bio: response.bio,
          role: response.role,
          location: response.location,
          website: response.website,
        }));
        
        // Username change tracking
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
        console.error("Failed to load user data:", error);
      }
    };

    loadUserData();
  }, []); // Load once on mount

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

  // Auto-save function for a specific field
  const autoSaveField = async (fieldName: string, value: any) => {
    try {
      // Set saving status
      setFieldStatus(prev => ({ ...prev, [fieldName]: 'saving' }));
      setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));

      // Prepare update data
      const updateData: any = {};

      switch (fieldName) {
        case 'firstName':
          if (value?.trim()) updateData.first_name = value.trim();
          break;
        case 'lastName':
          if (value?.trim()) updateData.last_name = value.trim();
          break;
        case 'username':
          if (value?.trim() && value !== originalUsername) {
            updateData.username = value.trim();
          }
          break;
        case 'location':
          if (value?.trim()) updateData.location = value.trim();
          break;
        case 'website':
          if (value?.trim()) {
            let url = value.trim();
            if (!url.match(/^https?:\/\//i)) {
              url = `https://${url}`;
            }
            updateData.website = url;
            setWebsite(url);
          }
          break;
        case 'role':
          if (value) updateData.role = value;
          break;
        case 'sectors':
          if (value && value.length > 0) {
            updateData.sectors = JSON.stringify(value);
          }
          break;
        case 'bio':
          if (value?.trim()) updateData.bio = value.trim();
          break;
        case 'privateProfile':
          updateData.is_profile_private = value;
          break;
      }

      // Only save if there's something to update
      if (Object.keys(updateData).length === 0) {
        setFieldStatus(prev => ({ ...prev, [fieldName]: 'idle' }));
        return;
      }

      // Send to backend
      const response = await customBackendAPI.updateProfile(updateData);

      // Update Redux store
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
      if (fieldName === 'username' && username !== originalUsername) {
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

      // Set saved status
      setFieldStatus(prev => ({ ...prev, [fieldName]: 'saved' }));

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setFieldStatus(prev => ({ ...prev, [fieldName]: 'idle' }));
      }, 2000);
    } catch (error: any) {
      console.error(`Failed to save ${fieldName}:`, error);

      // Handle username change limit error
      let errorMessage = 'Failed to save';
      if (error?.response?.data?.error && typeof error.response.data.error === 'object') {
        const errorData = error.response.data.error;
        if (errorData.message && errorData.days_left !== undefined) {
          errorMessage = `Next change in ${errorData.days_left}d ${errorData.hours_left}h`;
        } else {
          errorMessage = errorData.message || 'Failed to save';
        }
      } else {
        errorMessage = error?.response?.data?.error || error?.message || 'Failed to save';
      }

      setFieldStatus(prev => ({ ...prev, [fieldName]: 'error' }));
      setFieldErrors(prev => ({ ...prev, [fieldName]: errorMessage }));

      // Reset error after 5 seconds
      setTimeout(() => {
        setFieldStatus(prev => ({ ...prev, [fieldName]: 'idle' }));
        setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
      }, 5000);
    }
  };

  // Debounced save for a field
  const debouncedSave = (fieldName: string, value: any, delay: number = 1500) => {
    // Clear existing timeout
    if (saveTimeouts.current[fieldName]) {
      clearTimeout(saveTimeouts.current[fieldName]);
    }

    // Set new timeout
    saveTimeouts.current[fieldName] = setTimeout(() => {
      autoSaveField(fieldName, value);
    }, delay);
  };

  // Field change handlers
  useEffect(() => {
    if (firstName !== (currentUser.first_name || "")) {
      debouncedSave('firstName', firstName);
    }
  }, [firstName]);

  useEffect(() => {
    if (lastName !== (currentUser.last_name || "")) {
      debouncedSave('lastName', lastName);
    }
  }, [lastName]);

  useEffect(() => {
    if (username !== originalUsername) {
      debouncedSave('username', username);
    }
  }, [username]);

  useEffect(() => {
    if (location !== (currentUser.location || "")) {
      debouncedSave('location', location);
    }
  }, [location]);

  useEffect(() => {
    if (website !== (currentUser.website || "")) {
      debouncedSave('website', website);
    }
  }, [website]);

  useEffect(() => {
    if (role && role !== currentUser.role) {
      debouncedSave('role', role);
    }
  }, [role]);

  useEffect(() => {
    if (selectedSectors.length > 0) {
      debouncedSave('sectors', selectedSectors);
    }
  }, [selectedSectors]);

  useEffect(() => {
    if (bio !== currentUser.bio) {
      debouncedSave('bio', bio);
    }
  }, [bio]);

  useEffect(() => {
    if (isProfilePrivate !== (currentUser.is_profile_private || false)) {
      debouncedSave('privateProfile', isProfilePrivate, 500);
    }
  }, [isProfilePrivate]);

  const toggleSector = (sectorId: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sectorId)
        ? prev.filter((s) => s !== sectorId)
        : [...prev, sectorId]
    );
    setIsSectorDropdownOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1059px] mx-auto">
      {/* First Name & Last Name */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex justify-between items-center">
            <label
              className="text-xs font-bold text-[#B0B0B0] uppercase"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              First name
            </label>
            <FieldStatusIndicator status={fieldStatus.firstName} error={fieldErrors.firstName} />
          </div>
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
          <div className="flex justify-between items-center">
            <label
              className="text-xs font-bold text-[#B0B0B0] uppercase"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Last name
            </label>
            <FieldStatusIndicator status={fieldStatus.lastName} error={fieldErrors.lastName} />
          </div>
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

      {/* Username & Location */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex justify-between items-center">
            <label
              className="text-xs font-bold text-[#B0B0B0] uppercase"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              User name
            </label>
            <div className="flex items-center gap-2">
              <FieldStatusIndicator status={fieldStatus.username} error={fieldErrors.username} />
              {usernameChangesLeft !== null && fieldStatus.username === 'idle' && (
                <span className="text-xs text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                  {usernameChangesLeft > 0 ? (
                    `${usernameChangesLeft} free ${usernameChangesLeft === 1 ? 'change' : 'changes'} left`
                  ) : nextUsernameChangeDate ? (
                    `Next: ${new Date(nextUsernameChangeDate).toLocaleDateString()}`
                  ) : (
                    '1 change/week'
                  )}
                </span>
              )}
            </div>
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex px-4 py-3 items-center gap-2 rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] text-[15px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            placeholder="username"
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <div className="flex justify-between items-center">
            <label
              className="text-xs font-bold text-[#B0B0B0] uppercase"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Location
            </label>
            <FieldStatusIndicator status={fieldStatus.location} error={fieldErrors.location} />
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex px-4 py-3 items-center gap-2 rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] text-[15px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            placeholder="Your location"
          />
        </div>
      </div>

      {/* Website, Role & Sector */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex justify-between items-center">
            <label
              className="text-xs font-bold text-[#B0B0B0] uppercase"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Website / URL
            </label>
            <FieldStatusIndicator status={fieldStatus.website} error={fieldErrors.website} />
          </div>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="flex px-4 py-3 items-center gap-2 rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] text-[15px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            placeholder="example.com"
          />
        </div>

        <div className="flex flex-col gap-2 w-full md:w-[240px]">
          <div className="flex justify-between items-center">
            <label
              className="text-xs font-bold text-[#B0B0B0] uppercase"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Role
            </label>
            <FieldStatusIndicator status={fieldStatus.role} error={fieldErrors.role} />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex w-full px-4 py-3 justify-between items-center rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-inset"
            >
              <span
                className="text-[15px] font-bold text-white truncate"
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                {role || "Select role"}
              </span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
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

        <div className="flex flex-col gap-2 w-full md:w-[240px]">
          <div className="flex justify-between items-center">
            <label
              className="text-xs font-bold text-[#B0B0B0] uppercase"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              Sector
            </label>
            <FieldStatusIndicator status={fieldStatus.sectors} error={fieldErrors.sectors} />
          </div>
          <div className="relative" ref={sectorDropdownRef}>
            <button
              onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
              className="flex w-full px-4 py-3 justify-between items-center rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-inset"
            >
              <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                {selectedSectors.length === 0 ? (
                  <span
                    className="text-[15px] font-bold text-[#B0B0B0]"
                    style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                  >
                    Select
                  </span>
                ) : (
                  selectedSectors.slice(0, 2).map((sectorId) => {
                    const sector = SECTORS.find((s) => s.id === sectorId);
                    return (
                      <span
                        key={sectorId}
                        className="px-2 py-1 rounded bg-[#A06AFF]/20 text-[11px] font-bold text-white truncate"
                        style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                      >
                        {sector?.label}
                      </span>
                    );
                  })
                )}
                {selectedSectors.length > 2 && (
                  <span className="text-[11px] font-bold text-[#B0B0B0]">+{selectedSectors.length - 2}</span>
                )}
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 ml-2">
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

      {/* Private Profile Toggle */}
      <div className="flex flex-col gap-4 p-4 rounded-xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                🔒 Private Profile
              </h3>
              {isProfilePrivate && (
                <span className="px-2 py-0.5 rounded-full bg-[#A06AFF]/20 text-[10px] font-bold text-[#A06AFF] uppercase" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              {isProfilePrivate 
                ? "Your profile is private. Only subscribers can see your posts."
                : "Your profile is public. Anyone can see your posts."}
            </p>
            {isProfilePrivate && (
              <div className="mt-3 p-3 rounded-lg bg-[#2E2744] border border-[#A06AFF]/30">
                <p className="text-xs text-[#A06AFF] font-medium" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                  💡 Tip: Set your subscription price in the Monetization tab to start earning!
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <FieldStatusIndicator status={fieldStatus.privateProfile} error={fieldErrors.privateProfile} />
            <button
              type="button"
              onClick={() => setIsProfilePrivate(!isProfilePrivate)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-offset-2 focus:ring-offset-black ${
                isProfilePrivate ? 'bg-[#A06AFF]' : 'bg-[#2F3336]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isProfilePrivate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label
            className="text-xs font-bold text-[#B0B0B0] uppercase"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            BIO
          </label>
          <FieldStatusIndicator status={fieldStatus.bio} error={fieldErrors.bio} />
        </div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          className="flex px-4 py-3 items-start gap-2 rounded-xl border border-[#181B22] bg-black shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] text-[15px] text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
          style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );
};

export default ProfileOverview;
