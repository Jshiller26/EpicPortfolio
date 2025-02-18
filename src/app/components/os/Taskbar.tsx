import React, { useState } from 'react';
// import { StartMenu } from './StartMenu';

interface TaskbarProps {
  openWindows: string[];
  activeWindow: string | null;
  onWindowSelect: (windowId: string) => void;
  onClose: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  openWindows,
  activeWindow,
  onWindowSelect,
  onClose,
}) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-windows-taskbar flex items-center px-2">
      <button
        className="px-4 py-2 hover:bg-gray-700"
        onClick={() => setStartMenuOpen(!startMenuOpen)}
      >
        Start
      </button>
      <div className="flex-1 flex space-x-2">
        {openWindows.map((windowId) => (
          <button
            key={windowId}
            className={`px-4 py-2 ${
              activeWindow === windowId ? 'bg-gray-700' : 'hover:bg-gray-600'
            }`}
            onClick={() => onWindowSelect(windowId)}
          >
            {windowId}
          </button>
        ))}
      </div>
      <button
        className="px-4 py-2 hover:bg-red-600"
        onClick={onClose}
      >
        Exit
      </button>
      {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} />}
    </div>
  );
};