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

  return (
    <div className="fixed inset-0 bg-windows-desktop">
      <div className="h-full w-full relative">
        <DesktopIcons onOpenWindow={handleOpenWindow} />
        {openWindows.map((windowId) => (
          <Window
            key={windowId}
            id={windowId}
            isActive={activeWindow === windowId}
            onClose={() => handleCloseWindow(windowId)}
            onFocus={() => setActiveWindow(windowId)}
          />
        ))}
        <Taskbar
          openWindows={openWindows}
          activeWindow={activeWindow}
          onWindowSelect={setActiveWindow}
          onClose={onClose}
        />
      </div>
    </div>
  );
};