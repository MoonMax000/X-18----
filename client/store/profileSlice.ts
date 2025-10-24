import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileData {
  name: string;
  username: string;
  bio: string;
  role?: string;
  location?: string;
  website?: string;
  avatar?: string;
  cover?: string;
  joined?: string;
  stats?: {
    tweets: number;
    following: number;
    followers: number;
    likes?: number;
  };
  isVerified?: boolean;
  isPremium?: boolean;
  level?: number;
}

interface ProfileState {
  currentUser: ProfileData;
  isLoading: boolean;
  lastUpdated: number | null;
}

const initialState: ProfileState = {
  currentUser: {
    name: 'Jane Doe',
    username: 'beautydoe',
    bio: 'Designing Products that Users Love',
    role: 'Crypto Trader',
    location: 'United States',
    website: 'https://beautydoe.com',
    joined: 'November 2010',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/8dcd522167ed749bb95dadfd1a39f43e695d33a0?width=500',
    cover: 'https://api.builder.io/api/v1/image/assets/TEMP/df14e9248350a32d57d5b54a31308a2e855bb11e?width=2118',
    stats: {
      tweets: 0,
      following: 143,
      followers: 149,
      likes: 0,
    },
    isVerified: true,
    isPremium: false,
    level: 42,
  },
  isLoading: false,
  lastUpdated: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<ProfileData>>) => {
      state.currentUser = {
        ...state.currentUser,
        ...action.payload,
      };
      state.lastUpdated = Date.now();
    },
    setProfile: (state, action: PayloadAction<ProfileData>) => {
      state.currentUser = action.payload;
      state.lastUpdated = Date.now();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetProfile: (state) => {
      state.currentUser = initialState.currentUser;
      state.lastUpdated = Date.now();
    },
  },
});

export const { updateProfile, setProfile, setLoading, resetProfile } = profileSlice.actions;
export default profileSlice.reducer;
