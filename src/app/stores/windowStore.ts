import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import React from 'react';

// Define a custom content type for properties dialog
export interface PropertiesDialogContent {
  type: string;
  props: {
    itemId: string;
    onClose: () => void;
  };
}

// Union type for all possible content types
type WindowContent = React.ReactNode | PropertiesDialogContent;

interface WindowState {
  id: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  baseId: string;
  content?: WindowContent;
  title?: string;
  showInTaskbar?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  resizable?: boolean;
}

interface WindowCreateOptions {
  id: string;
  title?: string;
  content?: WindowContent;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  showInTaskbar?: boolean;
}

interface WindowStore {
  windows: Record<string, WindowState>;
  activeWindowId: string | null;
  highestZIndex: number;
  instanceCounters: Record<string, number>;
  
  // Core window management
  openWindow: (id: string) => void;
  createWindow: (options: WindowCreateOptions) => void;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;
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

const getOffsetPosition = (existingPosition: { x: number; y: number }) => {
  return {
    x: existingPosition.x + 20,
    y: existingPosition.y + 20
  };
};

// Get cascading postiion when opening new windwos
const getCascadingPosition = (windows: Record<string, WindowState>, width: number, height: number) => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight - 48; // Subtract taskbar height
  
  const defaultPosition = {
    x: Math.max(0, screenWidth / 2 - width / 2),
    y: Math.max(0, screenHeight / 2 - height / 2)
  };
  
  const openWindows = Object.values(windows).filter(w => w.isOpen && !w.isMinimized);
  if (openWindows.length === 0) {
    return defaultPosition;
  }
  
  const topWindow = openWindows.reduce((highest, current) => 
    current.zIndex > highest.zIndex ? current : highest, openWindows[0]);
  
  const newPosition = getOffsetPosition(topWindow.position);
  
  if (newPosition.x + width > screenWidth) {
    newPosition.x = 50;
  }
  if (newPosition.y + height > screenHeight) {
    newPosition.y = 50;
  }
  
  return newPosition;
};

export const useWindowStore = create<WindowStore>()(
  persist(
    (set, get) => ({
      windows: {},
      activeWindowId: null,
      highestZIndex: 100,
      instanceCounters: {},
      
      createWindow: (options) => {
        const { windows, highestZIndex } = get();
        const { 
          id, 
          title, 
          content, 
          width = DEFAULT_WINDOW_SIZE.width, 
          height = DEFAULT_WINDOW_SIZE.height, 
          x, 
          y,
          resizable = true,
          minimizable = true,
          maximizable = true,
          showInTaskbar = true
        } = options;
        
        const position = (x !== undefined && y !== undefined) 
          ? { x, y }
          : getCascadingPosition(windows, width, height);
        
        set({
          windows: {
            ...windows,
            [id]: {
              id,
              baseId: id.split('-')[0],
              isOpen: true,
              isMinimized: false,
              isMaximized: false,
              position,
              size: { width, height },
              zIndex: highestZIndex + 1,
              content,
              title,
              showInTaskbar,
              minimizable,
              maximizable,
              resizable
            }
          },
          activeWindowId: id,
          highestZIndex: highestZIndex + 1
        });
      },
      
      openWindow: (baseId) => {
        const { windows, highestZIndex, instanceCounters } = get();
        
        if (windows[baseId]) {
          if (windows[baseId].isMinimized) {
            set({
              windows: {
                ...windows,
                [baseId]: {
                  ...windows[baseId],
                  isMinimized: false,
                  zIndex: highestZIndex + 1
                }
              },
              activeWindowId: baseId,
              highestZIndex: highestZIndex + 1
            });
          } else {
            set({
              windows: {
                ...windows,
                [baseId]: {
                  ...windows[baseId],
                  zIndex: highestZIndex + 1
                }
              },
              activeWindowId: baseId,
              highestZIndex: highestZIndex + 1
            });
          }
          return baseId;
        }
        
        if (baseId.startsWith('gameboy')) {
          const existingGameBoyWindow = Object.values(windows).find(
            window => window.baseId.startsWith('gameboy') && window.isOpen
          );
          
          if (existingGameBoyWindow) {
            if (existingGameBoyWindow.isMinimized) {
              set({
                windows: {
                  ...windows,
                  [existingGameBoyWindow.id]: {
                    ...existingGameBoyWindow,
                    isMinimized: false,
                    zIndex: highestZIndex + 1
                  }
                },
                activeWindowId: existingGameBoyWindow.id,
                highestZIndex: highestZIndex + 1
              });
            } else {
              set({
                windows: {
                  ...windows,
                  [existingGameBoyWindow.id]: {
                    ...existingGameBoyWindow,
                    zIndex: highestZIndex + 1
                  }
                },
                activeWindowId: existingGameBoyWindow.id,
                highestZIndex: highestZIndex + 1
              });
            }
            
            return existingGameBoyWindow.id;
          }
        }
        
        const counter = (instanceCounters[baseId] || 0) + 1;
        const uniqueId = `${baseId}-${counter}`;
        
        const position = getCascadingPosition(windows, DEFAULT_WINDOW_SIZE.width, DEFAULT_WINDOW_SIZE.height);
        
        set({
          windows: {
            ...windows,
            [uniqueId]: {
              id: uniqueId,
              baseId: baseId,
              isOpen: true,
              isMinimized: false,
              isMaximized: false,
              position,
              size: DEFAULT_WINDOW_SIZE,
              zIndex: highestZIndex + 1,
              showInTaskbar: true,
              minimizable: true,
              maximizable: true,
              resizable: true
            }
          },
          activeWindowId: uniqueId,
          highestZIndex: highestZIndex + 1,
          instanceCounters: {
            ...instanceCounters,
            [baseId]: counter
          }
        });
        
        return uniqueId;
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
      
      closeAllWindows: () => {
        set({
          windows: {},
          activeWindowId: null
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
      partialize: (state) => ({ 
        windows: Object.entries(state.windows).reduce((acc, [key, value]) => {
          if (value.content) {
            return acc;
          }
          return { ...acc, [key]: value };
        }, {}),
        instanceCounters: state.instanceCounters
      }),
    }
  )
);