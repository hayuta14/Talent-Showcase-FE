import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define a Post type (customize as needed)
export interface Post {
  id: number;
  username: string;
  content: string;
  likeCount?: number;
  likedByCurrentUser?: boolean;
  commentCount?: number;
  userImageUrl?: string;
  uploadedAt?: string;
  userId?: number;
  description?: string;
  image?: string;
  videoUrl?: string;
  categoryId?: number;
  isPublic?: boolean;
  // Add other fields as needed
}

interface FeedState {
  posts: Post[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  setPosts: (posts: Post[] | ((prev: Post[]) => Post[])) => void;
  setPage: (page: number | ((prev: number) => number)) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      posts: [],
      page: 1,
      hasMore: true,
      loading: false,
      setPosts: (posts) =>
        set((state) => ({
          posts: typeof posts === 'function' ? (posts as (prev: Post[]) => Post[])(state.posts) : posts,
        })),
      setPage: (page) =>
        set((state) => ({
          page: typeof page === 'function' ? (page as (prev: number) => number)(state.page) : page,
        })),
      setHasMore: (hasMore) => set({ hasMore }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'feed-storage',
      partialize: (state) => ({
        posts: state.posts,
        page: state.page,
        hasMore: state.hasMore,
        loading: state.loading,
      }),
    }
  )
); 