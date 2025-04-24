import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'large' | 'medium' | 'small';

interface UserPreferencesState {
  fileExplorerViewMode: ViewMode;
  setFileExplorerViewMode: (mode: ViewMode) => void;
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      fileExplorerViewMode: 'medium', // Default to medium icons
      
      setFileExplorerViewMode: (mode: ViewMode) => set({ fileExplorerViewMode: mode }),
    }),
    {
      name: 'user-preferences',
    }
  )
);
