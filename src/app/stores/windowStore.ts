import { create } from 'zustand';

interface MinimizedWindow {
  id: string;
  title: string;
  icon: string;
}

interface WindowStore {
  minimizedWindows: MinimizedWindow[];
  addMinimizedWindow: (window: MinimizedWindow) => void;
  removeMinimizedWindow: (id: string) => void;
}

export const useWindowStore = create<WindowStore>((set) => ({
  minimizedWindows: [],
  addMinimizedWindow: (window) =>
    set((state) => ({
      minimizedWindows: [...state.minimizedWindows, window],
    })),
  removeMinimizedWindow: (id) =>
    set((state) => ({
      minimizedWindows: state.minimizedWindows.filter((w) => w.id !== id),
    })),
}));