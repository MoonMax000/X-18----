/**
 * Converters for GoToSocial API data to internal formats
 * Centralizes conversion logic to avoid duplication
 */

import type { GTSAccount } from "@/services/api/gotosocial";
import { getAvatarUrl, getCoverUrl } from "./avatar-utils";

/**
 * Convert GTSAccount to a simple user object for avatar/cover display
 * This is the canonical conversion that ensures consistency across the app
 */
export function convertGTSAccountToUser(account: GTSAccount) {
  return {
    id: account.id,
    username: account.username,
    acct: account.acct || account.username,
    display_name: account.display_name || account.username,
    note: account.note.replace(/<[^>]*>/g, ''), // Strip HTML tags
    bio: account.note.replace(/<[^>]*>/g, ''),
    
    // Use centralized avatar utilities for consistency
    avatar: getAvatarUrl({ 
      avatar_url: account.avatar, 
      username: account.username 
    }),
    avatar_url: getAvatarUrl({ 
      avatar_url: account.avatar, 
      username: account.username 
    }),
    avatar_static: getAvatarUrl({ 
      avatar_url: account.avatar_static || account.avatar, 
      username: account.username 
    }),
    
    // Use centralized cover utilities
    header: getCoverUrl(account.header),
    header_url: getCoverUrl(account.header),
    header_static: getCoverUrl(account.header_static || account.header),
    cover: getCoverUrl(account.header),
    
    locked: account.locked,
    bot: account.bot,
    discoverable: account.discoverable,
    
    followers_count: account.followers_count,
    following_count: account.following_count,
    statuses_count: account.statuses_count,
    posts_count: account.statuses_count,
    
    created_at: account.created_at,
    fields: account.fields || [],
    emojis: account.emojis || [],
    url: account.url,
    
    // Additional useful fields
    location: account.fields?.find(f => f.name.toLowerCase() === 'location')?.value,
    website: account.fields?.find(f => f.name.toLowerCase() === 'website')?.value,
  };
}

/**
 * Convert GTSAccount to SocialProfileData format
 * Used by ProfileContentClassic
 */
export function convertGTSAccountToSocialProfile(account: GTSAccount) {
  const baseUser = convertGTSAccountToUser(account);
  
  return {
    id: baseUser.id,
    name: baseUser.display_name,
    username: baseUser.username,
    bio: baseUser.bio,
    location: baseUser.location,
    website: baseUser.website 
      ? { label: baseUser.website, url: account.url }
      : undefined,
    joined: new Date(account.created_at).toLocaleDateString('ru-RU', { 
      month: 'long', 
      year: 'numeric' 
    }),
    avatar: baseUser.avatar,
    cover: baseUser.cover,
    stats: {
      tweets: account.statuses_count,
      following: account.following_count,
      followers: account.followers_count,
      likes: 0, // Not available in GoToSocial
    },
  };
}
