import React, { useState, useEffect } from 'react';

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
  isStartOpen,
  isSearchOpen,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
      
      setCurrentDate(now.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-12 bg-white/80 backdrop-blur-md shadow-lg flex items-center px-3">
      {/* Centered container for Start, Search, and icons */}
      <div className="flex-1 flex justify-center items-center space-x-2">
        {/* Start button */}
        <button
          onClick={onStartClick}
          className={`p-2 rounded-md hover:bg-black/10 transition-colors ${
            isStartOpen ? 'bg-black/10' : ''
          }`}
        >
          <img 
            src="/images/desktop/icons8-windows-11.svg" 
            alt="Start" 
            className="w-6 h-6"
          />
        </button>

        {/* Search bar */}
        <div className="relative group">
          <div className="flex items-center bg-black/5 rounded-md hover:bg-black/10 transition-colors">
            <div className="flex items-center pl-3">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Type here to search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-48 py-1.5 px-2 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        {/* Pinned apps */}
        <div className="flex space-x-1">
          <button className="p-3 rounded-md hover:bg-black/10">
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

        {/* Running apps */}
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
      </div>

      {/* Right section - System tray */}
      <div className="flex items-center">
        <div className="flex flex-col items-end px-3 cursor-default">
          <div className="text-xs font-medium">{currentTime}</div>
          <div className="text-xs">{currentDate}</div>
        </div>
        <button 
          className="ml-1 w-3 hover:bg-black/10 h-full"
          onClick={() => {/* Show desktop */}}
        />
      </div>
    </div>
  );
};