import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MinimizedWindow {
  id: string;
  title: string;
  icon: string;
}

interface WindowState {
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMaximized: boolean;
}

interface WindowStore {
  minimizedWindows: MinimizedWindow[];
  windowStates: Record<string, WindowState>;
  addMinimizedWindow: (window: MinimizedWindow) => void;
  removeMinimizedWindow: (id: string) => void;
  storeWindowState: (id: string, state: WindowState) => void;
  getWindowState: (id: string) => WindowState | null;
  clearWindowState: (id: string) => void;
}

export const useWindowStore = create<WindowStore>()(
  persist(
    (set, get) => ({
      minimizedWindows: [],
      windowStates: {},
      
      addMinimizedWindow: (window) => {
        set((state) => ({
          minimizedWindows: [...state.minimizedWindows, window],
        }));
      },
      
      removeMinimizedWindow: (id) => {
        set((state) => ({
          minimizedWindows: state.minimizedWindows.filter((w) => w.id !== id),
        }));
      },
      
      storeWindowState: (id, state) => {
        const stateCopy = {
          position: { ...state.position },
          size: { ...state.size },
          isMaximized: state.isMaximized
        };
        
        set((prev) => ({
          windowStates: {
            ...prev.windowStates,
            [id]: stateCopy,
          },
        }));
      },
      
      getWindowState: (id) => {
        const state = get().windowStates[id];
        if (!state) return null;
        
        return {
          position: { ...state.position },
          size: { ...state.size },
          isMaximized: state.isMaximized
        };
      },
      
      clearWindowState: (id) => {
        set((prev) => {
          const newWindowStates = { ...prev.windowStates };
          delete newWindowStates[id];
          return { windowStates: newWindowStates };
        });
      },
    }),
    {
      name: 'window-store',
      partialize: (state) => ({ windowStates: state.windowStates }),
    }
  )
);