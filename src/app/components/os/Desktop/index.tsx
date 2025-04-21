import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWindowStore } from '@/app/stores/windowStore';
import { Taskbar } from '../Taskbar';
import { DesktopIcons } from '../DesktopIcons';
import { Window } from '../Window';
import { BackButton } from '../BackButton';
import DialogBox from '../../DialogBox';
import { useAuth } from '@/app/contexts/AuthContext';

interface DesktopProps {
  onClose: () => void;
}

export const Desktop: React.FC<DesktopProps> = ({ onClose }) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [, setWidgetsOpen] = useState(false);
  const [showShutdownDialog, setShowShutdownDialog] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [fadeOpacity, setFadeOpacity] = useState('opacity-0');
  const router = useRouter();
  const { logout } = useAuth();
  
  // Get window information from the store
  const windows = useWindowStore(state => state.windows);
  const activeWindowId = useWindowStore(state => state.activeWindowId);
  const openWindow = useWindowStore(state => state.openWindow);
  const restoreWindow = useWindowStore(state => state.restoreWindow);
  const closeAllWindows = useWindowStore(state => state.closeAllWindows);
  
  // Get window IDs for rendering
  const windowIds = Object.keys(windows);
  
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

  const handleShutdown = () => {
    setShowShutdownDialog(true);
  };

  const handleLockScreen = () => {
    setStartMenuOpen(false);
    setSearchOpen(false);
    closeAllWindows();
    logout();
  };

  const handleDialogClose = () => {
    setShowShutdownDialog(false);
    setFadeOpacity('opacity-0');
    setIsFading(true);
    
    setTimeout(() => {
      setFadeOpacity('opacity-100');
    }, 50);
    
    setTimeout(() => {
      router.push('/home?from=desktop');
    }, 500);
  };

  const handleGlobalClick = () => {
    if (showShutdownDialog) {
      handleDialogClose();
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
      openWindow(windowId);
    } else if (window.isMinimized) {
      restoreWindow(windowId);
    } else if (activeWindowId === windowId) {
      useWindowStore.getState().minimizeWindow(windowId);
    } else {
      useWindowStore.getState().setActiveWindow(windowId);
    }
  };
  
  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden" onClick={handleGlobalClick}>
      {/* Windows 11 wallpaper background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/images/desktop/desktopWallpaper.jpg')",
          backgroundColor: "#0078D4" 
        }}
      />

      {/* Back Button */}
      <BackButton onClick={handleShutdown} />
      
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

        {/* Start Menu */}
        {startMenuOpen && (
          <div className="absolute bottom-16 left-0 w-96 h-[calc(100vh-5rem)] bg-white/95 backdrop-blur-md rounded-lg shadow-lg p-4 animate-slide-up">
            {/* Start Menu Content */}
          </div>
        )}

        {/* Search */}
        {searchOpen && (
          <div className="absolute bottom-16 left-16 w-[600px] h-[70vh] bg-white/95 backdrop-blur-md rounded-lg shadow-lg p-4 animate-slide-up">
            {/* Search Content */}
          </div>
        )}

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

        {/* Shutdown Dialog */}
        {showShutdownDialog && (
          <DialogBox 
            message="You shut down the PC."
            onClose={handleDialogClose}
          />
        )}

        {/* Fade Out Layer */}
        {isFading && (
          <div 
            className={`absolute inset-0 z-50 bg-black pointer-events-none transition-opacity duration-500 ${fadeOpacity}`}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};