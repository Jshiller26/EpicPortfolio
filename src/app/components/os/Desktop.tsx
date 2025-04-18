import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWindowStore } from '@/app/stores/windowStore';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { Taskbar } from './Taskbar';
import { DesktopIcons } from './DesktopIcons';
import { Window } from './Window';
import { BackButton } from './BackButton';
import DialogBox from '../DialogBox';
import { initDragCursorFix } from '@/app/utils/dragCursorFix';
import { useAuth } from '@/app/contexts/AuthContext';
import LoginScreen from '../LoginScreen';
import LoadingScreen from '../LoadingScreen';

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
  const [showLockScreen, setShowLockScreen] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loginKey, setLoginKey] = useState(0); // Add a key to force re-render
  const router = useRouter();
  const fileSystem = useFileSystemStore();
  const { logout } = useAuth();
  
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
  
  // Clear window state when logged out
  useEffect(() => {
    if (showLockScreen) {
      // Clear all windows when logged out
      useWindowStore.getState().closeAllWindows();
    }
  }, [showLockScreen]);
  
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
    setShowLockScreen(true);
    logout(); // Log out the user
    // Increment the key to force re-renders of child components
    setLoginKey(prev => prev + 1);
  };

  const handleLogin = () => {
    // Hide lock screen and show loading screen
    setShowLockScreen(false);
    setShowLoadingScreen(true);
  };
  
  const handleLoadingComplete = () => {
    // Hide loading screen and show desktop
    setShowLoadingScreen(false);
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

  const handleGlobalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      fileSystem.selectItems([]);
    }
    
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
  
  // If loading screen is showing after login, render it
  if (showLoadingScreen) {
    return <LoadingScreen key={`loading-${loginKey}`} onComplete={handleLoadingComplete} />;
  }
  
  // If lock screen is showing, render it instead of desktop
  if (showLockScreen) {
    return (
      <LoginScreen 
        key={`login-${loginKey}`}
        onLogin={handleLogin} 
        backgroundImage="/images/desktop/desktopWallpaper.jpg" 
      />
    );
  }
  
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