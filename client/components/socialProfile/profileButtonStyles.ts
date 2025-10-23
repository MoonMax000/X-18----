/**
 * Shared button styles for profile components
 * Used in ProfileHero and other profile-related components
 */

export const profileButtonStyles = {
  /**
   * Icon button style (circular buttons with icons)
   * Used for: dots menu, message, etc.
   */
  icon: "flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent text-[#F7F9F9] transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset",

  /**
   * Primary action button style (Follow, Edit profile, etc.)
   * Used for: Follow/Unfollow, Edit profile buttons
   */
  primary: "flex items-center justify-center rounded-full border border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm md:text-[15px] font-medium text-white transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset",
} as const;
