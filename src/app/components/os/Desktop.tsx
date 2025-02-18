import React, { useState } from 'react';
import { Taskbar } from './Taskbar';
import { DesktopIcons } from './DesktopIcons';
import { Window } from './Window';

interface DesktopProps {
  onClose: () => void;
}

export const Desktop: React.FC<DesktopProps> = ({ onClose }) => {
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [widgetsOpen, setWidgetsOpen] = useState(false);

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

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden">
      {/* Windows 11 wallpaper background */}
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

        {/* Widgets */}
        {widgetsOpen && (
          <div className="absolute bottom-16 left-32 w-[800px] h-[80vh] bg-white/95 backdrop-blur-md rounded-lg shadow-lg p-4 animate-slide-up">
            {/* Widgets Content */}
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
            onWidgetsClick={toggleWidgets}
            isStartOpen={startMenuOpen}
            isSearchOpen={searchOpen}
            isWidgetsOpen={widgetsOpen}
          />
        </div>
      </div>
    </div>
  );
};