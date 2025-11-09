/**
 * Centralized utilities for profile styling
 * Used across ProfileHero, EditProfileModal, and UserHeader
 */

/**
 * Get avatar border class based on user level
 * @param level - User level (1-100+)
 * @returns Tailwind CSS class string for border styling
 */
export const getAvatarBorderClass = (level: number = 1): string => {
  if (level >= 76) return "ring-4 ring-offset-2 ring-offset-[#0B0E13] ring-yellow-400 animate-pulse";
  if (level >= 51) return "border-4 border-yellow-400";
  if (level >= 26) return "border-4 border-purple-500";
  if (level >= 11) return "border-4 border-blue-500";
  return "border-3 sm:border-4 border-[#0B0E13]";
};

/**
 * Get avatar glow effect class based on user level
 * @param level - User level (1-100+)
 * @returns Tailwind CSS class string for glow effect
 */
export const getAvatarGlowClass = (level: number = 1): string => {
  if (level >= 76) return "shadow-[0_0_30px_rgba(250,204,21,0.6)]";
  if (level >= 51) return "shadow-[0_0_20px_rgba(250,204,21,0.4)]";
  if (level >= 26) return "shadow-[0_0_20px_rgba(168,85,247,0.4)]";
  if (level >= 11) return "shadow-[0_0_20px_rgba(59,130,246,0.4)]";
  return "";
};
