import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { getAuth } from '@/generated/api/endpoints/auth/auth';
import { persist } from 'zustand/middleware';

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  role: number;
  id: string;
  email: string;
}

export interface AuthState {
  accessToken: string | null;
  user: JwtPayload | null;
  isRefreshing: boolean;
  isTokenExpired: () => boolean;
  isTokenExpiringSoon: () => boolean;
  isValidToken: () => boolean;
  isAcceptRole: (roleId: number[]) => boolean;

  setTokens: (accessToken: string) => void;
  clearTokens: () => void;
  initAuth: () => void;
  refreshAccessToken: () => Promise<boolean>;
  getTokens: () => AuthState;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isRefreshing: false,

      setTokens: (accessToken) => {
        const user = jwtDecode<JwtPayload>(accessToken);
        set({ accessToken, user });
      },
      clearTokens: () => {
        set({
          accessToken: null,
          user: null,
        });
      },
      initAuth: () => {
        // không cần thiết nữa nếu dùng persist
      },
      refreshAccessToken: async () => {
        if (get().isRefreshing) return false;
        try {
          set({ isRefreshing: true });
          const auth = getAuth();
          // Không gửi refreshToken, backend sẽ lấy từ HttpOnly cookie
          const response = await auth.postApiV1AuthRefreshToken({ refreshToken: '' });
          const data = response.data;
          const newAccessToken = data?.accessToken;
          if (!newAccessToken) {
            set({ isRefreshing: false });
            get().clearTokens();
            return false;
          }
          const decoded = jwtDecode<JwtPayload>(newAccessToken);
          set({
            accessToken: newAccessToken,
            user: decoded,
            isRefreshing: false,
          });
          return true;
        } catch (err) {
          set({ isRefreshing: false });
          get().clearTokens();
          return false;
        }
      },
      isValidToken: () => {
        return true;
      },
      isTokenExpired: () => {
        const { user } = get();
        if (!user?.exp) return true;
        return Date.now() >= user.exp * 1000;
      },
      isTokenExpiringSoon: () => {
        const { user } = get();
        if (!user?.exp) return true;
        return Date.now() >= user.exp * 1000 - 5 * 60 * 1000;
      },
      isAcceptRole: (roleId: number[]) => {
        if (roleId.length == 0) return true;
        const { user } = get();
        if (!user || !user.role) return false;
        if (user.role == 1) return true;
        return roleId.includes(user.role);
      },
      getTokens: () => get(),
    }),
    {
      name: 'auth-storage', // key trong localStorage
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);