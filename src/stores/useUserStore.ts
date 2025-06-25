// stores/useUserStore.ts
import { create } from 'zustand';
import { UserResponseDTO } from '@/generated/api/models';

// Sử dụng UserResponseDTO làm kiểu cho user

type UserState = {
  user: UserResponseDTO | null;
  setUser: (user: UserResponseDTO | null) => void;
};

export const useUserStore = create<UserState>((set: (state: Partial<UserState>) => void) => ({
  user: null,
  setUser: (user: UserResponseDTO | null) => set({ user }),
}));