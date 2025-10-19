import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common queries

/**
 * Get top authors sorted by followers
 */
export async function getTopAuthors(limit = 10) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, first_name, last_name, avatar_url, followers_count, verified, bio')
    .order('followers_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top authors:', error);
    return [];
  }

  return data || [];
}

/**
 * Get suggested profiles (random users)
 */
export async function getSuggestedProfiles(limit = 5) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, first_name, last_name, avatar_url, bio, verified')
    .limit(limit * 3); // Get more to randomize

  if (error) {
    console.error('Error fetching suggested profiles:', error);
    return [];
  }

  // Randomize and limit
  const shuffled = (data || []).sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

/**
 * Get verified traders
 */
export async function getVerifiedTraders(limit = 20) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('verified', true)
    .order('followers_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching verified traders:', error);
    return [];
  }

  return data || [];
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

/**
 * Search users by username or name
 */
export async function searchUsers(query: string, limit = 10) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, first_name, last_name, avatar_url, verified')
    .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return data || [];
}
