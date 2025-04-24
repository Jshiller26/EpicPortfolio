import React, { useState, useRef, useMemo } from 'react';
import { FileSystemItem } from '../../../types/fileSystem';
import FileListItem from './FileListItem';
import FileExplorerContextMenu from './ContextMenu';
import { createPortal } from 'react-dom';
import { useFileSystemStore } from '../../../stores/fileSystemStore';
import { APPS } from '../../../config/appConfig';
import { useUserPreferencesStore } from '@/app/stores/userPreferencesStore';

const AppMovedEvent = 'desktopAppMoved';

interface FileListProps {
  items: FileSystemItem[];
  onItemDoubleClick: (item: FileSystemItem) => void;
  currentFolderId?: string;
}

const FileList: React.FC<FileListProps> = ({ items, onItemDoubleClick, currentFolderId }) => {
  const fileListRef = useRef<HTMLDivElement>(null);
  const fileSystem = useFileSystemStore();
  const { fileExplorerViewMode, sortBy, sortDirection } = useUserPreferencesStore();
  
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    item?: FileSystemItem;
  }>({
    show: false,
    x: 0,
    y: 0
  });

  const sortedItems = useMemo(() => {
    const itemsCopy = [...items];
    
    return itemsCopy.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') {
        return -1;
      }
      if (a.type !== 'folder' && b.type === 'folder') {
        return 1;
      }
      
      let compareResult = 0;
      
      switch (sortBy) {
        case 'name':
          compareResult = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          break;
        
        case 'size':
          // Only files have sizes
          if (a.type === 'file' && b.type === 'file') {
            compareResult = a.size - b.size;
          }
          break;
        
        case 'type':
          if (a.type === 'file' && b.type === 'file') {
            const aExt = a.extension || '';
            const bExt = b.extension || '';
            compareResult = aExt.localeCompare(bExt, undefined, { sensitivity: 'base' });
          }
          if (compareResult === 0) {
            compareResult = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          }
          break;
        
        case 'modified':
          const aDate = a.modified ? new Date(a.modified).getTime() : 0;
          const bDate = b.modified ? new Date(b.modified).getTime() : 0;
          compareResult = aDate - bDate;
          break;
        
        default:
          compareResult = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }
      
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }, [items, sortBy, sortDirection]);

  const handleContextMenu = (e: React.MouseEvent, item?: FileSystemItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, show: false }));
  };

  // Handle drag over for the file list
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Create app file from desktop app
  const createAppFileFromDesktopApp = (appId: string, targetFolderId: string) => {
    // Get direct app info from APPS object
    const appInfo = APPS[appId];
    if (!appInfo) {
      console.error('Could not get app info for:', appId);
      return;
    }
    
    // Create file with app data
    const fileName = `${appInfo.name}.exe`;
    const appData = {
      type: 'app',
      appId: appInfo.id,
      appType: appInfo.id
    };
    
    // Create the file in the target folder
    fileSystem.createFile(fileName, targetFolderId, JSON.stringify(appData), 0);
    
    // Dispatch event to notify the desktop that an app has been moved
    const event = new CustomEvent(AppMovedEvent, { 
      detail: { appId }
    });
    window.dispatchEvent(event);
  };

  // Handle drop for the file list
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentFolderId) return;
    
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      const textData = e.dataTransfer.getData('text/plain');
      
      let itemId = textData;
      let source = 'unknown';
      let isDesktopApp = false;
      
      if (jsonData) {
        try {
          const dragData = JSON.parse(jsonData);
          itemId = dragData.itemId || textData;
          source = dragData.source || 'unknown';
          isDesktopApp = Boolean(dragData.isDesktopApp);
        } catch (err) {
          console.error('Error parsing drag data JSON:', err);
        }
      }
      
      if (!itemId) return;
      
      if (source === 'desktop' && isDesktopApp) {
        createAppFileFromDesktopApp(itemId, currentFolderId);
        return;
      }
      if (itemId) {
        const item = fileSystem.items[itemId];
        if (item && item.parentId === currentFolderId) {
          return;
        }
        fileSystem.moveItem(itemId, currentFolderId);
      }
    } catch (error) {
      console.error('Error processing drop:', error);
    }
  };

  return (
    <div 
      ref={fileListRef}
      className="flex-1 overflow-auto relative"
      onContextMenu={(e) => handleContextMenu(e)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="font-normal text-left px-4 py-1 text-gray-600">Name</th>
            <th className="font-normal text-left px-4 py-1 text-gray-600">Date modified</th>
            <th className="font-normal text-left px-4 py-1 text-gray-600">Type</th>
            <th className="font-normal text-left px-4 py-1 text-gray-600">Size</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => (
            <FileListItem 
              key={item.id} 
              item={item} 
              onDoubleClick={onItemDoubleClick} 
              onContextMenu={(e) => handleContextMenu(e, item)}
              currentFolderId={currentFolderId || ''}
              viewMode={fileExplorerViewMode}
            />
          ))}
          {sortedItems.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                This folder is empty
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {contextMenu.show && createPortal(
        <FileExplorerContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          currentFolder={currentFolderId || ''}
          selectedItem={contextMenu.item}
          onClose={handleCloseContextMenu}
        />,
        document.body
      )}
    </div>
  );
};

export default FileList;