import React, { useState, useEffect } from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { useWindowStore } from '@/app/stores/windowStore';
import { getIconForWindow} from '@/app/utils/iconUtils';
import { searchFileSystem } from '@/app/utils/searchUtils';
import { SearchResults } from './SearchResults';
import { FileSystemItem } from '@/app/types/fileSystem';

interface TaskbarProps {
  onWindowSelect: (windowId: string) => void;
  onClose: () => void;
  onStartClick: () => void;
  onSearchClick: () => void;
  isStartOpen: boolean;
  isSearchOpen: boolean;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  onWindowSelect,
  onStartClick,
  isStartOpen,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<FileSystemItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  
  const fileSystem = useFileSystemStore();
  const windows = useWindowStore(state => state.windows);
  const activeWindowId = useWindowStore(state => state.activeWindowId);
  const openWindow = useWindowStore(state => state.openWindow);
  
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

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    if (value.trim() !== '') {
      const results = searchFileSystem(fileSystem.items, value);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchText.trim() !== '') {
      setShowSearchResults(true);
    }
  };

  const openItem = (itemId: string) => {
    const item = fileSystem.items[itemId];
    if (!item) return;
    
    if (item.type === 'folder') {
      const windowId = `explorer-${itemId}`;
      onWindowSelect(windowId);
    } else if (item.type === 'app') {
      if (item.id === 'vscode') {
        openWindow('vscode-new');
      } else {
        openWindow(item.id);
      }
    } else {
      if (item.name.toLowerCase().includes('vs code') || item.name.toLowerCase() === 'vscode.exe') {
        openWindow('vscode-new');
        return;
      }
      
      const file = item as any;
      const extension = item.name.split('.').pop()?.toLowerCase() || '';
      
      switch (extension) {
        case 'txt':
        case 'md':
        case 'js':
        case 'ts':
        case 'html':
        case 'css':
        case 'py':
        case 'json':
          onWindowSelect(`editor-${itemId}`);
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
          onWindowSelect(`image-${itemId}`);
          break;
        case 'pdf':
          onWindowSelect(`pdf-${itemId}`);
          break;
        case 'mp4':
        case 'webm':
        case 'mov':
          onWindowSelect(`video-${itemId}`);
          break;
        case 'exe':
          if (file.name.toLowerCase().includes('vs code') || file.name.toLowerCase() === 'vscode.exe') {
            openWindow('vscode-new');
          }
          break;
        default:
          // Default file handler - go to parent folder
          if (item.parentId) {
            onWindowSelect(`explorer-${item.parentId}`);
          }
      }
    }
  };

  // Handle search result item click
  const handleSearchResultClick = (item: FileSystemItem) => {
    // Close search results
    setShowSearchResults(false);
    setSearchText('');
    setSearchResults([]);
    
    openItem(item.id);
  };

  // Close search results
  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
  };

  // Determine pinned apps and running apps for the taskbar
  const pinnedApps = ['edge-1', 'chrome-1', 'vscode-1', 'explorer-1'];
  const runningApps = openWindowIds.filter(id => !pinnedApps.includes(id));

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
        <div className="relative">
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
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="w-48 py-1.5 px-2 bg-transparent outline-none text-sm"
            />
            {searchText && (
              <button
                onClick={() => {
                  setSearchText('');
                  setShowSearchResults(false);
                }}
                className="p-1 mr-1 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && (
            <SearchResults
              results={searchResults}
              onItemClick={handleSearchResultClick}
              onClose={handleCloseSearchResults}
            />
          )}
        </div>

        {/* Pinned apps */}
        <div className="flex space-x-1">
          {pinnedApps.map((appId) => {
            const isOpen = openWindowIds.includes(appId);
            const isActive = activeWindowId === appId;            
            return (
              <div key={appId} className="relative">
                <button 
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
            
            return (
              <div key={windowId} className="relative">
                <button
                  onClick={() => onWindowSelect(windowId)}
                  className={`p-2 rounded-md hover:bg-black/10 transition-colors ${
                    isActive ? 'bg-black/10' : ''
                  }`}
                >
                  <img 
                    src={getIconForWindow(windowId)}
                    alt={windowId}
                    className="w-5 h-5 object-contain"
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