import React, { useState, useEffect } from 'react';
import { useWindowStore } from '@/app/stores/windowStore';

interface TaskbarProps {
  onWindowSelect: (windowId: string) => void;
  onClose: () => void;
  onStartClick: () => void;
  onSearchClick: () => void;
  isStartOpen: boolean;
  isSearchOpen: boolean;
}

const iconMap: { [key: string]: string } = {
  chrome: '/images/desktop/icons8-chrome.svg',
  edge: '/images/desktop/icons8-microsoft-edge.svg',
  vscode: '/images/desktop/icons8-visual-studio-code-2019.svg',
  folder: '/images/desktop/icons8-folder.svg',
  text: '/images/desktop/icons8-text-file.svg',
  image: '/images/desktop/icons8-image.svg',
  pdf: '/images/desktop/icons8-pdf.svg',
  js: '/images/desktop/icons8-js.svg',
  html: '/images/desktop/icons8-html.svg',
  css: '/images/desktop/icons8-css.svg',
  json: '/images/desktop/icons8-json.svg',
  md: '/images/desktop/icons8-markdown.svg',
  file: '/images/desktop/icons8-file.svg',
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
  
  const openWindowIds = Object.keys(windows);

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

  const getIconForWindow = (windowId: string) => {
    if (windowId.startsWith('explorer-')) {
      return iconMap.folder;
    } else if (windowId.startsWith('editor-')) {
      return iconMap.text;
    } else if (windowId.startsWith('image-')) {
      return iconMap.image;
    } else if (windowId.startsWith('pdf-')) {
      return iconMap.pdf;
    } else if (windowId.startsWith('chrome-')) {
      return iconMap.chrome;
    } else if (windowId.startsWith('edge-')) {
      return iconMap.edge;
    } else if (windowId.startsWith('vscode-')) {
      return iconMap.vscode;
    }

    // Default icon
    return iconMap.file;
  };

  // Determine pinned apps and running apps for the taskbar
  const pinnedApps = ['edge-1', 'chrome-1', 'vscode-1', 'explorer-1'];
  const runningApps = openWindowIds.filter(id => !pinnedApps.includes(id));

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-white/80 backdrop-blur-md shadow-lg flex items-center px-3 z-50">
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
          {pinnedApps.map((appId) => {
            const isOpen = openWindowIds.includes(appId);
            const isActive = activeWindowId === appId;            
            return (
              <div key={appId} className="relative">
                <button 
                  data-taskbar-id={appId}
                  className={`p-2 rounded-md hover:bg-black/10 ${isActive ? 'bg-black/10' : ''}`}
                  onClick={() => onWindowSelect(appId)}
                >
                  <img 
                    src={getIconForWindow(appId)}
                    alt={appId}
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
          {runningApps.map((windowId) => {
            const isActive = activeWindowId === windowId;
            const iconSrc = getIconForWindow(windowId);
            
            return (
              <div key={windowId} className="relative">
                <button
                  data-taskbar-id={windowId}
                  onClick={() => onWindowSelect(windowId)}
                  className={`p-2 rounded-md hover:bg-black/10 transition-colors ${
                    isActive ? 'bg-black/10' : ''
                  }`}
                >
                  <img 
                    src={iconSrc}
                    alt={windowId}
                    className="w-5 h-5"
                  />
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