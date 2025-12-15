import React, { useState, useEffect } from 'react';
import { useWindowStore } from '@/app/stores/windowStore';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { Taskbar } from './Taskbar';
import { DesktopIcons } from './DesktopIcons';
import { Window } from './Window';
import { initDragCursorFix } from '@/app/utils/dragCursorFix';
import { useAuth } from '@/app/contexts/AuthContext';

interface DesktopProps {
  onClose: () => void;
  onLogout?: () => void;
}

export const Desktop: React.FC<DesktopProps> = ({ onClose, onLogout }) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [, setWidgetsOpen] = useState(false);
  const fileSystem = useFileSystemStore();
  const { logout } = useAuth();
  const closeAllWindows = useWindowStore(state => state.closeAllWindows);
  
  // Get window information from the store
  const windows = useWindowStore(state => state.windows);
  const activeWindowId = useWindowStore(state => state.activeWindowId);
  const openWindow = useWindowStore(state => state.openWindow);
  const restoreWindow = useWindowStore(state => state.restoreWindow);
  
  // Get window IDs for rendering
  const windowIds = Object.keys(windows);
  
  useEffect(() => {
    initDragCursorFix();
  }, []);
  
  const toggleStartMenu = () => {
    setStartMenuOpen(!startMenuOpen);
    setSearchOpen(false);
    setWidgetsOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    setStartMenuOpen(false);
    setWidgetsOpen(false);
  };

  const handleLockScreen = () => {
    setStartMenuOpen(false);
    setSearchOpen(false);
    closeAllWindows();
    logout();
    
    if (onLogout) {
      onLogout();
    }
  };

  const handleGlobalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      fileSystem.selectItems([]);
    }
  };
  
  // Handle opening a desktop icon
  const handleOpenIcon = (windowId: string) => {
    openWindow(windowId);
  };
  
  // Handle taskbar icon click
  const handleTaskbarClick = (windowId: string) => {
    const window = windows[windowId];
    
    if (!window) {
      // Window doesn't exist, create it
      openWindow(windowId);
    } else if (window.isMinimized) {
      // Window is minimized, restore it
      restoreWindow(windowId);
    } else if (activeWindowId === windowId) {
      // Window is active, minimize it
      useWindowStore.getState().minimizeWindow(windowId);
    } else {
      // Window exists but isn't active, make it active
      useWindowStore.getState().setActiveWindow(windowId);
    }
  };
  
  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden animate-desktop-appear" onClick={handleGlobalClick}>
      <img 
        src="/images/desktop/desktopWallpaper.jpg" 
        alt="Preload Wallpaper" 
        className="hidden" 
      />
      
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/images/desktop/desktopWallpaper.jpg')",
          backgroundColor: "#0078D4" 
        }}
      />
      
      {/* Desktop Content */}
      <div className="h-full w-full relative">
        {/* Desktop Icons Grid */}
        <DesktopIcons onOpenWindow={handleOpenIcon} />

        {/* Windows */}
        <div className="absolute inset-0 pointer-events-none">
          {windowIds.map((windowId) => (
            <div key={windowId} className="pointer-events-auto">
              <Window id={windowId} />
            </div>
          ))}
        </div>

        {/* Taskbar */}
        <div className="absolute bottom-0 left-0 right-0">
          <Taskbar
            onWindowSelect={handleTaskbarClick}
            onClose={onClose}
            onStartClick={toggleStartMenu}
            onSearchClick={toggleSearch}
            isStartOpen={startMenuOpen}
            isSearchOpen={searchOpen}
            onLockScreen={handleLockScreen}
          />
        </div>
      </div>
    </div>
  );
};