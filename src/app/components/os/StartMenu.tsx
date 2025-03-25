import React, { useRef, useEffect } from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { useWindowStore } from '@/app/stores/windowStore';
import { FileSystemItem } from '@/app/types/fileSystem';
import { getIconForItem } from '@/app/utils/iconUtils';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (windowId: string) => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  onItemClick,
}) => {
  const fileSystem = useFileSystemStore();
  const openWindow = useWindowStore(state => state.openWindow);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle clicking outside the menu to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle opening an app
  const handleAppClick = (appId: string) => {
    openWindow(appId);
    onClose();
  };

  // Handle opening a file or folder
  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      onItemClick(`explorer-${item.id}`);
    } else if (item.type === 'app') {
      openWindow(item.id);
    } else {
      // Handle file based on type
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
          onItemClick(`editor-${item.id}`);
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
          onItemClick(`image-${item.id}`);
          break;
        case 'pdf':
          onItemClick(`pdf-${item.id}`);
          break;
        case 'mp4':
        case 'webm':
        case 'mov':
          onItemClick(`video-${item.id}`);
          break;
        default:
          // Default file handler - go to parent folder
          if (item.parentId) {
            onItemClick(`explorer-${item.parentId}`);
          }
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  // Pinned apps
  const pinnedApps = [
    { id: 'edge-1', name: 'Microsoft Edge', icon: '/images/desktop/icons8-microsoft-edge.svg' },
    { id: 'chrome-1', name: 'Google Chrome', icon: '/images/desktop/icons8-chrome.svg' },
    { id: 'vscode-1', name: 'Visual Studio Code', icon: '/images/desktop/icons8-vscode.svg' },
    { id: 'explorer-1', name: 'File Explorer', icon: '/images/desktop/icons8-folder.svg' },
  ];

  // Important desktop folders
  const desktopFolders = [
    fileSystem.items['documents'],
    fileSystem.items['pictures'],
    fileSystem.items['downloads'],
  ].filter(Boolean);

  // Recently accessed projects/files
  const recentProjects = [
    fileSystem.items['my-projects'],
    fileSystem.items['emc'],
    fileSystem.items['knights'],
    fileSystem.items['idea'],
  ].filter(Boolean);

  return (
    <>
      {/* Background overlay to capture clicks outside menu */}
      <div 
        className="fixed inset-0 bg-transparent z-30"
        onClick={onClose}
      />
      
      {/* Start menu - explicitly centered */}
      <div 
        ref={menuRef}
        className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-lg shadow-lg overflow-hidden z-40 w-96 animate-start-menu"
        style={{ maxHeight: 'calc(100vh - 12rem)' }}
      >
        <div className="p-4">
          {/* Pinned */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Pinned
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {pinnedApps.map((app) => (
                <button
                  key={app.id}
                  className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-blue-100 transition-colors"
                  onClick={() => handleAppClick(app.id)}
                >
                  <img src={app.icon} alt={app.name} className="w-10 h-10 mb-1" />
                  <span className="text-xs text-gray-700 text-center">{app.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Recommended
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {recentProjects.map((item) => (
                <button
                  key={item.id}
                  className="flex items-center p-2 rounded-md hover:bg-blue-100 transition-colors"
                  onClick={() => handleItemClick(item)}
                >
                  <img src={getIconForItem(item)} alt={item.name} className="w-6 h-6 mr-3" />
                  <span className="text-sm text-gray-700 text-left truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick links / folders */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Folders
            </h3>
            <div className="space-y-1">
              {desktopFolders.map((item) => (
                <button
                  key={item.id}
                  className="flex items-center w-full p-2 rounded-md hover:bg-blue-100 transition-colors"
                  onClick={() => handleItemClick(item)}
                >
                  <img src={getIconForItem(item)} alt={item.name} className="w-5 h-5 mr-3" />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};