import React, { useState, useEffect } from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { useWindowStore } from '@/app/stores/windowStore';
import { getIconForWindow} from '@/app/utils/iconUtils';
import { searchFileSystem } from '@/app/utils/searchUtils';
import { FileSystemItem, File } from '@/app/types/fileSystem';
import { getIconForItem } from '@/app/utils/iconUtils';
import { StartMenu } from './StartMenu'; // Import the new StartMenu component

interface TaskbarProps {
  onWindowSelect: (windowId: string) => void;
  onClose: () => void;
  onStartClick: () => void;
  onSearchClick: () => void;
  isStartOpen: boolean;
  isSearchOpen: boolean;
}

interface WindowState {
  id: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  baseId: string;
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

const groupWindowsByType = (windows: Record<string, WindowState>) => {
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
  const [searchResults, setSearchResults] = useState<FileSystemItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);  
  const fileSystem = useFileSystemStore();
  const windows = useWindowStore(state => state.windows);
  const activeWindowId = useWindowStore(state => state.activeWindowId);
  const openWindow = useWindowStore(state => state.openWindow);    
  const groupedWindows = groupWindowsByType(windows);
  const runningAppTypes = Object.keys(groupedWindows).filter(type => 
    !['edge-1', 'chrome-1', 'vscode-1', 'explorer-1'].includes(type)
  );

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      // Use 12-hour format with AM/PM
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      
      setCurrentTime(`${hours12}:${minutes} ${ampm}`);
      setCurrentDate(now.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      }));
    };

    updateDateTime();
    // Update every second instead of every minute
    const interval = setInterval(updateDateTime, 1000);
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
      
      const file = item as File;
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

  const handleCloseStartMenu = () => {
    onStartClick();
  };

  // Determine pinned apps and running apps for the taskbar
  const pinnedApps = ['edge-1', 'chrome-1', 'vscode-1', 'explorer-1'];

  return (
    <>
      {/* Start Menu */}
      <StartMenu 
        isOpen={isStartOpen} 
        onClose={handleCloseStartMenu} 
        onItemClick={onWindowSelect} 
      />
      
      {/* Search results */}
      {showSearchResults && (
        <>
          <div 
            className="fixed inset-0 bg-transparent z-30"
            onClick={handleCloseSearchResults}
          />
          
          {/* Centered search results panel */}
          <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg overflow-hidden animate-search-results w-96">
              <div className="p-4">
                {searchResults.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <div className="text-sm">No results found</div>
                    <div className="text-xs mt-1">Try a different search term</div>
                  </div>
                ) : (
                  <div className="max-h-[50vh] overflow-y-auto">
                    {/* Apps section */}
                    {searchResults.filter(item => item.type === 'app').length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                          Apps
                        </h3>
                        <div className="space-y-1">
                          {searchResults.filter(item => item.type === 'app').map(item => (
                            <div
                              key={item.id}
                              className="flex items-center px-3 py-2 hover:bg-blue-100 rounded-md cursor-pointer"
                              onClick={() => handleSearchResultClick(item)}
                            >
                              <img
                                src={getIconForItem(item)}
                                alt={item.name}
                                className="w-5 h-5 mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500">
                                  {item.path || `C:\\${item.name}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Folders section */}
                    {searchResults.filter(item => item.type === 'folder').length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                          Folders
                        </h3>
                        <div className="space-y-1">
                          {searchResults.filter(item => item.type === 'folder').map(item => (
                            <div
                              key={item.id}
                              className="flex items-center px-3 py-2 hover:bg-blue-100 rounded-md cursor-pointer"
                              onClick={() => handleSearchResultClick(item)}
                            >
                              <img
                                src={getIconForItem(item)}
                                alt={item.name}
                                className="w-5 h-5 mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500">
                                  {item.path || `C:\\${item.name}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Files section */}
                    {searchResults.filter(item => item.type === 'file').length > 0 && (
                      <div className="mb-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                          Files
                        </h3>
                        <div className="space-y-1">
                          {searchResults.filter(item => item.type === 'file').map(item => (
                            <div
                              key={item.id}
                              className="flex items-center px-3 py-2 hover:bg-blue-100 rounded-md cursor-pointer"
                              onClick={() => handleSearchResultClick(item)}
                            >
                              <img
                                src={getIconForItem(item)}
                                alt={item.name}
                                className="w-5 h-5 mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500">
                                  {item.path || `C:\\${item.name}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Windows 11 Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-white/80 backdrop-blur-md shadow-lg z-[1000]">
        <div className="h-full flex items-center justify-between px-3">
          {/* Empty space on left side bc centering issues*/}
          <div className="w-24"></div>
          {/* Center section with taskbar items */}
          <div className="flex items-center justify-center space-x-2">
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

            {/* Search bar with fixed width */}
            <div className="relative">
              <div className="flex items-center bg-black/5 rounded-md hover:bg-black/10 transition-colors w-48">
                <div className="flex items-center pl-3 flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={searchText ? "" : "Type here to search"}
                  value={searchText}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  className="py-1.5 px-2 bg-transparent outline-none text-sm w-full"
                />
                {searchText && (
                  <button
                    onClick={() => {
                      setSearchText('');
                      setShowSearchResults(false);
                    }}
                    className="p-1 mr-1 text-gray-500 hover:text-gray-700 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
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
                        src={getIconForWindow(appType)}
                        alt={appType}
                        className="w-5 h-5 object-contain"
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
          <div className="flex items-center w-24 justify-end">
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
      </div>
    </>
  );
};