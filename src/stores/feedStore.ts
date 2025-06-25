import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeedState {
  posts: any[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  setPosts: (posts: any[] | ((prev: any[]) => any[])) => void;
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
          posts: typeof posts === 'function' ? (posts as (prev: any[]) => any[])(state.posts) : posts,
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