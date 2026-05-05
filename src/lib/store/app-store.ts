import { create } from "zustand";

interface AppState {
  // Session state
  activeAcademicYear: string | null;
  activeRole: string | null;
  isLoading: boolean;
  
  // Actions
  setAcademicYear: (year: string) => void;
  setRole: (role: string) => void;
  setLoading: (loading: boolean) => void;
  
  // UI State (persisted)
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  activeAcademicYear: null,
  activeRole: null,
  isLoading: false,
  sidebarCollapsed: false,
  
  // Actions
  setAcademicYear: (year) => set({ activeAcademicYear: year }),
  setRole: (role) => set({ activeRole: role }),
  setLoading: (loading) => set({ isLoading: loading }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

// Selectors for optimized re-renders
export const selectSidebarCollapsed = (state: AppState) => state.sidebarCollapsed;
export const selectRole = (state: AppState) => state.activeRole;
export const selectAcademicYear = (state: AppState) => state.activeAcademicYear;