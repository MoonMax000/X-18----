import { create } from 'zustand';
import { customBackendAPI } from '@/services/api/custom-backend';

interface LikeState {
  postId: string;
  isLiked: boolean;
  likesCount: number;
}

interface LikeStore {
  // Map postId -> like state
  likes: Map<string, LikeState>;
  
  // Get like state for a post
  getLikeState: (postId: string) => LikeState | null;
  
  // Initialize like state from post data
  initializeLike: (postId: string, isLiked: boolean, likesCount: number) => void;
  
  // Toggle like with optimistic update
  toggleLike: (postId: string) => Promise<void>;
  
  // Update like state (for external updates, e.g., from WebSocket)
  updateLikeState: (postId: string, isLiked: boolean, likesCount: number) => void;
}

export const useLikeStore = create<LikeStore>((set, get) => ({
  likes: new Map(),

  getLikeState: (postId: string) => {
    const likes = get().likes;
    return likes.get(postId) || null;
  },

  initializeLike: (postId: string, isLiked: boolean, likesCount: number) => {
    set((state) => {
      const likes = new Map(state.likes);
      // Only initialize if not already present
      if (!likes.has(postId)) {
        likes.set(postId, { postId, isLiked, likesCount });
      }
      return { likes };
    });
  },

  toggleLike: async (postId: string) => {
    const currentState = get().getLikeState(postId);
    
    if (!currentState) {
      console.error('Cannot toggle like: post state not initialized');
      return;
    }

    const previousIsLiked = currentState.isLiked;
    const previousCount = currentState.likesCount;
    
    // Optimistic update
    set((state) => {
      const likes = new Map(state.likes);
      likes.set(postId, {
        postId,
        isLiked: !previousIsLiked,
        likesCount: previousIsLiked ? previousCount - 1 : previousCount + 1,
      });
      return { likes };
    });

    try {
      // API call
      if (previousIsLiked) {
        await customBackendAPI.unlikePost(postId);
      } else {
        await customBackendAPI.likePost(postId);
      }
    } catch (error) {
      // Rollback on error
      set((state) => {
        const likes = new Map(state.likes);
        likes.set(postId, {
          postId,
          isLiked: previousIsLiked,
          likesCount: previousCount,
        });
        return { likes };
      });
      console.error('Failed to toggle like:', error);
      throw error; // Re-throw for component error handling
    }
  },

  updateLikeState: (postId: string, isLiked: boolean, likesCount: number) => {
    set((state) => {
      const likes = new Map(state.likes);
      likes.set(postId, { postId, isLiked, likesCount });
      return { likes };
    });
  },
}));
