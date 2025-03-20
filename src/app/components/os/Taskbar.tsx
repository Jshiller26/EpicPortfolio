import React, { useState, useEffect } from 'react';
import { useWindowStore } from '@/app/stores/windowStore';
import { getIconForWindow } from '@/app/utils/iconUtils';

interface TaskbarProps {
  onWindowSelect: (windowId: string) => void;
  onClose: () => void;
  onStartClick: () => void;
  onSearchClick: () => void;
  isStartOpen: boolean;
  isSearchOpen: boolean;
}

const getWindowType = (windowId: string) => {
  const parts = windowId.split('-');
  if (parts.length < 2) return windowId;
  
  if (windowId.startsWith('vscode-')) {
    return 'vscode-new';
  }
  
  const windowType = parts[0];
  return windowType;
};

const groupWindowsByType = (windows: Record<string, any>) => {
  const groupedWindows: Record<string, string[]> = {};
  
  Object.keys(windows).forEach(windowId => {
    const baseId = getWindowType(windowId);
    if (!groupedWindows[baseId]) {
      groupedWindows[baseId] = [];
    }
    groupedWindows[baseId].push(windowId);
  });
  
  return groupedWindows;
};

export const Taskbar: React.FC<TaskbarProps> = ({
  onWindowSelect,
  onStartClick,
  isStartOpen,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const windows = useWindowStore(state => state.windows);
  const activeWindowId = useWindowStore(state => state.activeWindowId);  
  const groupedWindows = groupWindowsByType(windows);

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

  const pinnedApps = ['edge', 'chrome', 'vscode-new', 'explorer-desktop'];
  
  const runningAppTypes = Object.keys(groupedWindows).filter(type => !pinnedApps.includes(type));

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-white/80 backdrop-blur-md shadow-lg flex items-center px-3 z-50">
      <div className="flex-1 flex items-center justify-center space-x-2">
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
          {pinnedApps.map((appType) => {
            const isOpen = groupedWindows[appType] && groupedWindows[appType].length > 0;
            const isActive = isOpen && groupedWindows[appType].some(id => id === activeWindowId);
            
            const handlePinnedAppClick = () => {
              onWindowSelect(appType);
            };
            
            return (
              <div key={appType} className="relative">
                <button 
                  className={`p-2 rounded-md hover:bg-black/10 ${isActive ? 'bg-black/10' : ''}`}
                  onClick={handlePinnedAppClick}
                >
                  <img 
                    src={getIconForWindow(appType + "-1")}
                    alt={appType}
                    className="w-5 h-5"
                  />
                </button>
                {isOpen && (
                  <div 
                    className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 ${
                      isActive ? 'bg-blue-500' : 'bg-gray-500'
                    } rounded-full`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Running apps (that aren't pinned) */}
        <div className="flex items-center space-x-1">
          {runningAppTypes.map((appType) => {
            const instanceIds = groupedWindows[appType];
            const isActive = instanceIds.some(id => id === activeWindowId);
            
            const handleRunningAppClick = () => {
              if (instanceIds.length > 0) {
                onWindowSelect(instanceIds[0]);
              }
            };
            
            return (
              <div key={appType} className="relative">
                <button
                  onClick={handleRunningAppClick}
                  className={`p-2 rounded-md hover:bg-black/10 transition-colors ${
                    isActive ? 'bg-black/10' : ''
                  }`}
                >
                  <img 
                    src={getIconForWindow(instanceIds[0])}
                    alt={appType}
                    className="w-5 h-5 object-contain"
                  />
                  {instanceIds.length > 1 && (
                    <span className="absolute -right-1 -bottom-1 bg-gray-200 text-gray-700 rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                      {instanceIds.length}
                    </span>
                  )}
                </button>
                <div 
                  className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 ${
                    isActive ? 'bg-blue-500' : 'bg-gray-500'
                  } rounded-full`}
                />
              </div>
            );
          })}
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