import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  role: string | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  avatarUrl: string | null;
  isLoading: boolean;
  setUser: (user: { role: string; userId: string; userEmail: string; userName?: string; avatarUrl?: string }) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      role: null,
      userId: null,
      userEmail: null,
      userName: null,
      avatarUrl: null,
      isLoading: true,
      
      setUser: (user) => set({
        role: user.role,
        userId: user.userId,
        userEmail: user.userEmail,
        userName: user.userName || null,
        avatarUrl: user.avatarUrl || null,
        isLoading: false,
      }),
      
      clearUser: () => set({
        role: null,
        userId: null,
        userEmail: null,
        userName: null,
        avatarUrl: null,
        isLoading: true,
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'edu-maysan-user',
    }
  )
);