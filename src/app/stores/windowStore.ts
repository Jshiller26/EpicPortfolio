import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WindowState {
  id: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

interface WindowStore {
  windows: Record<string, WindowState>;
  activeWindowId: string | null;
  highestZIndex: number;
  
  // Core window management
  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  unmaximizeWindow: (id: string) => void;
  setActiveWindow: (id: string) => void;
  
  // Position and size management
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
}

const DEFAULT_WINDOW_SIZE = { width: 800, height: 600 };

export const useWindowStore = create<WindowStore>()(
  persist(
    (set, get) => ({
      windows: {},
      activeWindowId: null,
      highestZIndex: 100,
      
      openWindow: (id) => {
        const { windows, highestZIndex } = get();
        const existingWindow = windows[id];
        
        if (existingWindow) {
          // If window exists but is minimized, restore it
          if (existingWindow.isMinimized) {
            set({
              windows: {
                ...windows,
                [id]: {
                  ...existingWindow,
                  isMinimized: false,
                  zIndex: highestZIndex + 1
                }
              },
              activeWindowId: id,
              highestZIndex: highestZIndex + 1
            });
          } else {
            // Just make it active
            set({
              windows: {
                ...windows,
                [id]: {
                  ...existingWindow,
                  zIndex: highestZIndex + 1
                }
              },
              activeWindowId: id,
              highestZIndex: highestZIndex + 1
            });
          }
        } else {
          // Create new window with default values
          const screenWidth = window.innerWidth;
          const screenHeight = window.innerHeight - 48; // Subtract taskbar height
          
          const defaultPosition = {
            x: Math.max(0, screenWidth / 2 - DEFAULT_WINDOW_SIZE.width / 2),
            y: Math.max(0, screenHeight / 2 - DEFAULT_WINDOW_SIZE.height / 2)
          };
          
          set({
            windows: {
              ...windows,
              [id]: {
                id,
                isOpen: true,
                isMinimized: false,
                isMaximized: false,
                position: defaultPosition,
                size: DEFAULT_WINDOW_SIZE,
                zIndex: highestZIndex + 1
              }
            },
            activeWindowId: id,
            highestZIndex: highestZIndex + 1
          });
        }
      },
      
      closeWindow: (id) => {
        const { windows, activeWindowId } = get();
        const windowsCopy = { ...windows };
        delete windowsCopy[id];
        
        let newActiveId = activeWindowId;
        if (activeWindowId === id) {
          // Find next window to activate
          const openWindowIds = Object.keys(windowsCopy).filter(
            windowId => windowsCopy[windowId].isOpen && !windowsCopy[windowId].isMinimized
          );
          newActiveId = openWindowIds.length > 0 ? openWindowIds[0] : null;
        }
        
        set({
          windows: windowsCopy,
          activeWindowId: newActiveId
        });
      },
      
      minimizeWindow: (id) => {
        const { windows, activeWindowId } = get();
        const window = windows[id];
        
        if (!window) return;
        
        // Find next window to activate if this was active
        let newActiveId = activeWindowId;
        if (activeWindowId === id) {
          const openWindowIds = Object.keys(windows).filter(
            windowId => windowId !== id && windows[windowId].isOpen && !windows[windowId].isMinimized
          );
          newActiveId = openWindowIds.length > 0 ? openWindowIds[0] : null;
        }
        
        set({
          windows: {
            ...windows,
            [id]: {
              ...window,
              isMinimized: true
            }
          },
          activeWindowId: newActiveId
        });
      },
      
      restoreWindow: (id) => {
        const { windows, highestZIndex } = get();
        const window = windows[id];
        
        if (!window) return;
        
        set({
          windows: {
            ...windows,
            [id]: {
              ...window,
              isMinimized: false,
              zIndex: highestZIndex + 1
            }
          },
          activeWindowId: id,
          highestZIndex: highestZIndex + 1
        });
      },
      
      maximizeWindow: (id) => {
        const { windows } = get();
        const window = windows[id];
        
        if (!window) return;
        
        set({
          windows: {
            ...windows,
            [id]: {
              ...window,
              isMaximized: true
            }
          }
        });
      },
      
      unmaximizeWindow: (id) => {
        const { windows } = get();
        const window = windows[id];
        
        if (!window) return;
        
        set({
          windows: {
            ...windows,
            [id]: {
              ...window,
              isMaximized: false
            }
          }
        });
      },
      
      setActiveWindow: (id) => {
        const { windows, highestZIndex } = get();
        const window = windows[id];
        
        if (!window || window.isMinimized) return;
        
        set({
          windows: {
            ...windows,
            [id]: {
              ...window,
              zIndex: highestZIndex + 1
            }
          },
          activeWindowId: id,
          highestZIndex: highestZIndex + 1
        });
      },
      
      updateWindowPosition: (id, position) => {
        const { windows } = get();
        const window = windows[id];
        
        if (!window) return;
        
        set({
          windows: {
            ...windows,
            [id]: {
              ...window,
              position
            }
          }
        });
      },
      
      updateWindowSize: (id, size) => {
        const { windows } = get();
        const window = windows[id];
        
        if (!window) return;
        
        set({
          windows: {
            ...windows,
            [id]: {
              ...window,
              size
            }
          }
        });
      }
    }),
    {
      name: 'window-store',
      partialize: (state) => ({ windows: state.windows }),
    }
  )
);