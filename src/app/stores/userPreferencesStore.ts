import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'large' | 'medium' | 'small';
export type SortBy = 'name' | 'size' | 'type' | 'modified';
export type SortDirection = 'asc' | 'desc';

interface UserPreferencesState {
  fileExplorerViewMode: ViewMode;
  setFileExplorerViewMode: (mode: ViewMode) => void;
  
  sortBy: SortBy;
  sortDirection: SortDirection;
  setSorting: (sortBy: SortBy, sortDirection?: SortDirection) => void;
  toggleSortDirection: () => void;
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      fileExplorerViewMode: 'medium', // Default to medium icons
      setFileExplorerViewMode: (mode: ViewMode) => set({ fileExplorerViewMode: mode }),
      
      sortBy: 'name',
      sortDirection: 'asc',
      
      setSorting: (sortBy: SortBy, sortDirection?: SortDirection) => set((state) => {
        if (sortBy === state.sortBy && !sortDirection) {
          return { sortBy, sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc' };
        }
        return { sortBy, sortDirection: sortDirection || 'asc' };
      }),
      
      toggleSortDirection: () => set((state) => ({
        sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc'
      })),
    }),
    {
      name: 'user-preferences',
    }
  )
);
