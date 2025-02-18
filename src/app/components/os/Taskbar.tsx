import React from 'react';

interface TaskbarProps {
  openWindows: string[];
  activeWindow: string | null;
  onWindowSelect: (windowId: string) => void;
  onClose: () => void;
  onStartClick: () => void;
  onSearchClick: () => void;
  onWidgetsClick: () => void;
  isStartOpen: boolean;
  isSearchOpen: boolean;
  isWidgetsOpen: boolean;
}

const iconMap: { [key: string]: string } = {
  chrome: '/images/desktop/icons8-chrome.svg',
  edge: '/images/desktop/icons8-microsoft-edge.svg',
  vscode: '/images/desktop/icons8-visual-studio-code-2019.svg',
  folder: '/images/desktop/icons8-folder.svg',
};

export const Taskbar: React.FC<TaskbarProps> = ({
  openWindows,
  activeWindow,
  onWindowSelect,
  onClose,
  onStartClick,
  onSearchClick,
  onWidgetsClick,
  isStartOpen,
  isSearchOpen,
  isWidgetsOpen,
}) => {
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="h-12 bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-between px-3">
      {/* Left section - Start, Search, etc. */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onStartClick}
          className={`p-2 rounded-md hover:bg-black/10 transition-colors ${
            isStartOpen ? 'bg-black/10' : ''
          }`}
        >
          <img 
            src="/images/desktop/icons8-windows-11.svg" 
            alt="Start" 
            className="w-5 h-5"
          />
        </button>

        {/* Pinned apps */}
        <div className="flex space-x-1">
          <button className="p-2 rounded-md hover:bg-black/10">
            <img 
              src={iconMap.edge}
              alt="Edge"
              className="w-5 h-5"
            />
          </button>
          <button className="p-2 rounded-md hover:bg-black/10">
            <img 
              src={iconMap.chrome}
              alt="Chrome"
              className="w-5 h-5"
            />
          </button>
          <button className="p-2 rounded-md hover:bg-black/10">
            <img 
              src={iconMap.vscode}
              alt="VS Code"
              className="w-5 h-5"
            />
          </button>
          <button className="p-2 rounded-md hover:bg-black/10">
            <img 
              src={iconMap.folder}
              alt="File Explorer"
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>

      {/* Center section - Running apps */}
      <div className="flex items-center space-x-1">
        {openWindows.map((windowId) => (
          <button
            key={windowId}
            onClick={() => onWindowSelect(windowId)}
            className={`p-2 rounded-md hover:bg-black/10 transition-colors ${
              activeWindow === windowId ? 'bg-black/10' : ''
            }`}
          >
            <img 
              src={iconMap[windowId] || iconMap.folder}
              alt={windowId}
              className="w-5 h-5"
            />
          </button>
        ))}
      </div>

      {/* Right section - System tray */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-sm">
          <button className="p-2 rounded-md hover:bg-black/10">
            <span className="text-xs">🔊</span>
          </button>
          <button className="p-2 rounded-md hover:bg-black/10">
            <span className="text-xs">📶</span>
          </button>
          <button className="p-2 rounded-md hover:bg-black/10">
            <span className="text-xs">🔋</span>
          </button>
        </div>
        <div className="text-sm font-medium px-2">
          {getCurrentTime()}
        </div>
        <button 
          className="ml-2 w-3 hover:bg-black/10 h-full"
          onClick={() => {/* Show desktop */}}
        />
      </div>
    </div>
  );
};