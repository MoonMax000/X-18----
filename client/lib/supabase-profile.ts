import { supabase } from './supabase';

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar_url?: string;
  cover?: string;
  trading_style?: string;
  specialization?: string;
}

/**
 * Get current user profile by ID
 */
export async function getCurrentUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[Supabase] Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: ProfileUpdateData) {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error updating profile:', error);
    throw error;
  }

  return data;
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  try {
    // Create unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    console.log('[Supabase] Uploading avatar:', filePath);

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[Supabase] Avatar upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    console.log('[Supabase] Avatar uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('[Supabase] Failed to upload avatar:', error);
    return null;
  }
}

/**
 * Upload cover/banner image to Supabase Storage
 */
export async function uploadCoverImage(userId: string, file: File): Promise<string | null> {
  try {
    // Create unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    console.log('[Supabase] Uploading cover image:', filePath);

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[Supabase] Cover upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    console.log('[Supabase] Cover uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('[Supabase] Failed to upload cover:', error);
    return null;
  }
}

/**
 * Delete image from storage
 */
export async function deleteImage(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('profile-images')
      .remove([filePath]);

    if (error) {
      console.error('[Supabase] Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Supabase] Failed to delete image:', error);
    return false;
  }
}

/**
 * Update avatar and save to profile
 */
export async function updateAvatar(userId: string, file: File) {
  const avatarUrl = await uploadAvatar(userId, file);
  if (!avatarUrl) {
    throw new Error('Failed to upload avatar');
  }

  const updated = await updateUserProfile(userId, { avatar_url: avatarUrl });
  return updated;
}

/**
 * Update cover image and save to profile
 */
export async function updateCoverImage(userId: string, file: File) {
  const coverUrl = await uploadCoverImage(userId, file);
  if (!coverUrl) {
    throw new Error('Failed to upload cover image');
  }

  const updated = await updateUserProfile(userId, { cover: coverUrl });
  return updated;
}
