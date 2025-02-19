import React, { useState } from 'react';
import { Taskbar } from './Taskbar';
import { DesktopIcons } from './DesktopIcons';
import { Window } from './Window';
import { BackButton } from './BackButton';
import DialogBox from '../DialogBox';
import { useRouter } from 'next/navigation';

interface DesktopProps {
  onClose: () => void;
}

export const Desktop: React.FC<DesktopProps> = ({ onClose }) => {
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const [showShutdownDialog, setShowShutdownDialog] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [fadeOpacity, setFadeOpacity] = useState('opacity-0');
  const router = useRouter();

  const handleOpenWindow = (windowId: string) => {
    if (!openWindows.includes(windowId)) {
      setOpenWindows([...openWindows, windowId]);
    }
    setActiveWindow(windowId);
  };

  const handleCloseWindow = (windowId: string) => {
    setOpenWindows(openWindows.filter(id => id !== windowId));
    if (activeWindow === windowId) {
      setActiveWindow(null);
    }
  };

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

  const toggleWidgets = () => {
    setWidgetsOpen(!widgetsOpen);
    setStartMenuOpen(false);
    setSearchOpen(false);
  };

  const handleShutdown = () => {
    setShowShutdownDialog(true);
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
    if (showShutdownDialog) {
      handleDialogClose();
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
        <div className="p-4 grid grid-cols-auto-fit gap-4">
          <DesktopIcons onOpenWindow={handleOpenWindow} />
        </div>

        {/* Windows */}
        <div className="absolute inset-0 pointer-events-none">
          {openWindows.map((windowId) => (
            <div key={windowId} className="pointer-events-auto">
              <Window
                id={windowId}
                isActive={activeWindow === windowId}
                onClose={() => handleCloseWindow(windowId)}
                onFocus={() => setActiveWindow(windowId)}
              />
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
            openWindows={openWindows}
            activeWindow={activeWindow}
            onWindowSelect={setActiveWindow}
            onClose={onClose}
            onStartClick={toggleStartMenu}
            onSearchClick={toggleSearch}
            isStartOpen={startMenuOpen}
            isSearchOpen={searchOpen}
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