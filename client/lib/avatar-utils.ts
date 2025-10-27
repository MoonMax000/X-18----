/**
 * Avatar utility functions for consistent avatar display across the application
 */

interface UserWithAvatar {
  avatar?: string;
  avatar_url?: string;
  username?: string;
  display_name?: string;
  name?: string;
}

/**
 * Get avatar URL with fallback to generated placeholder
 * Ensures consistent avatar display across all components
 */
export function getAvatarUrl(user?: UserWithAvatar | null): string {
  if (!user) {
    return generatePlaceholderAvatar('User');
  }

  // Check for avatar in different possible field names
  const avatarUrl = user.avatar_url || user.avatar;
  
  // If avatar exists and is not empty string
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }

  // Generate placeholder based on username or display name
  const name = user.username || user.display_name || user.name || 'User';
  return generatePlaceholderAvatar(name);
}

/**
 * Generate a placeholder avatar using ui-avatars.com
 * Uses app's primary color (#A06AFF) for consistency
 */
export function generatePlaceholderAvatar(name: string): string {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=500&background=A06AFF&color=fff&bold=true`;
}

/**
 * Get cover/banner URL with fallback to placeholder
 */
export function getCoverUrl(coverUrl?: string | null): string {
  if (coverUrl && coverUrl.trim() !== '') {
    return coverUrl;
  }
  
  // Default beautiful cover from Unsplash
  return 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=2118&h=600&fit=crop&q=80';
}

/**
 * Check if a URL string is empty or invalid
 */
export function isEmptyUrl(url?: string | null): boolean {
  return !url || url.trim() === '';
}
