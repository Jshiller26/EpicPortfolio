import { useState, useRef } from 'react';
import { FileSystemItem } from '@/app/types/fileSystem';
import { getAppInfo, APPS } from '@/app/config/appConfig';
import { v4 as uuidv4 } from 'uuid'; 

interface UseDesktopDragDropProps {
  removeIconPosition: (itemId: string) => void;
  findNextAvailablePosition: (startX: number, startY: number, excludeItemId?: string) => { x: number, y: number };
  isPositionOccupied: (x: number, y: number, excludeItemId?: string) => boolean;
  setIconPositions: React.Dispatch<React.SetStateAction<Record<string, { x: number, y: number }>>>;
  moveItem: (itemId: string, targetId: string, callback?: (movedItemId: string) => void) => void;
  createFile: (name: string, parentId: string, content: string, size: number) => string;
  appItems: Record<string, FileSystemItem>;
  items: Record<string, FileSystemItem>;
  newItems: Set<string>;
  handleDesktopAppMoved: (appId: string) => void; // New callback for handling app icon movement
}

export const useDesktopDragDrop = ({
  removeIconPosition,
  findNextAvailablePosition,
  isPositionOccupied,
  setIconPositions,
  moveItem,
  createFile,
  appItems,
  items,
  newItems,
  handleDesktopAppMoved
}: UseDesktopDragDropProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const draggedItemRef = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    
    // Store the current dragged item ID
    draggedItemRef.current = itemId;
    
    const item = items[itemId] || appItems[itemId];
    const isDesktopApp = appItems[itemId] !== undefined;
    const isApp = item?.type === 'app' || 
                 (item?.extension === 'exe') || 
                 (item?.name && item.name.toLowerCase().endsWith('.exe'));
    
    const dragData = {
      itemId: itemId,
      source: 'desktop',
      isApp: isApp,
      isDesktopApp: isDesktopApp,
      appType: item?.appType
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Reset dragged item
    draggedItemRef.current = null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if trying to drag a folder onto itself
    if (draggedItemRef.current === folderId) {
      e.dataTransfer.dropEffect = 'none';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  // Create a copy of an app file
  const createAppFileFromDesktopApp = (sourceId: string, targetFolderId: string): string | null => {
    const sourceItem = appItems[sourceId];
    if (!sourceItem) {
      console.error(`Source app not found: ${sourceId}`);
      return null;
    }
    
    const targetFolder = items[targetFolderId];
    if (!targetFolder || targetFolder.type !== 'folder') {
      console.error(`Target folder not found or invalid: ${targetFolderId}`);
      return null;
    }
    
    // Use direct access to APPS instead of getAppInfo
    const appInfo = APPS[sourceId];
    if (!appInfo) {
      console.error(`App info not found in APPS for: ${sourceId}`);
      return null;
    }
    
    const fileName = sourceItem.name;
    
    const appData = {
      type: 'app',
      appId: appInfo.id,
      appType: sourceItem.appType || appInfo.id
    };
    
    const newFileId = createFile(fileName, targetFolderId, JSON.stringify(appData), 0);
    
    handleDesktopAppMoved(sourceId);
    
    return newFileId;
  };

  const handleFolderDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      let itemId: string;
      let isAppItem = false;
      let isDesktopApp = false;
      
      if (jsonData) {
        const dragData = JSON.parse(jsonData);
        itemId = dragData.itemId;
        isAppItem = Boolean(dragData.isApp);
        isDesktopApp = Boolean(dragData.isDesktopApp);
      } else {
        itemId = e.dataTransfer.getData('text/plain');
        const item = items[itemId] || appItems[itemId];
        isAppItem = item?.type === 'app' || 
                    item?.extension === 'exe' || 
                    (item?.name && item.name.toLowerCase().endsWith('.exe'));
        isDesktopApp = appItems[itemId] !== undefined;
      }
      
      if (!itemId || itemId === folderId) return;
      
      const targetFolder = items[folderId];
      if (!targetFolder || targetFolder.type !== 'folder') return;
  
      if (isDesktopApp) {
        createAppFileFromDesktopApp(itemId, folderId);
        return;
      }
      
      moveItem(itemId, folderId, () => {
        removeIconPosition(itemId);
      });
    } catch (error) {
      console.error('Error processing folder drop:', error);
    }
  };

  const handleFileExplorerDrop = (itemId: string, e: React.DragEvent, gridSize: number) => {
    const desktopRect = e.currentTarget.getBoundingClientRect();
    
    const relativeX = Math.max(0, e.clientX - desktopRect.left);
    const relativeY = Math.max(0, e.clientY - desktopRect.top);
    
    const maxCols = Math.floor(desktopRect.width / gridSize) - 1;
    const maxRows = Math.floor(desktopRect.height / gridSize) - 1;
    
    const x = Math.min(maxCols * gridSize, Math.floor(relativeX / gridSize) * gridSize);
    const y = Math.min(maxRows * gridSize, Math.floor(relativeY / gridSize) * gridSize);
    
    moveItem(itemId, 'desktop', (movedItemId: string) => {
      const updatedNewItems = new Set(newItems);
      updatedNewItems.add(movedItemId);
      
      if (!isPositionOccupied(x, y, movedItemId)) {
        setIconPositions(prev => ({
          ...prev,
          [movedItemId]: { x, y }
        }));
      } else {
        const position = findNextAvailablePosition(0, 0, movedItemId);
        setIconPositions(prev => ({
          ...prev,
          [movedItemId]: position
        }));
      }
      
      setTimeout(() => {
        const finalNewItems = new Set(newItems);
        finalNewItems.delete(movedItemId);
      }, 500);
    });
  };

  const handleDrop = (e: React.DragEvent, gridSize: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      let itemId: string;
      
      // Parse the drag data
      if (jsonData) {
        const dragData = JSON.parse(jsonData);
        itemId = dragData.itemId;
        const source = dragData.source;
        
        if (source === 'fileExplorer') {
          handleFileExplorerDrop(itemId, e, gridSize);
          return;
        }
      } else {
        itemId = e.dataTransfer.getData('text/plain');
      }
      
      if (!itemId) return;
      
      // Get desktop dimensions for bounds checking
      const desktopRect = e.currentTarget.getBoundingClientRect();
      
      const relativeX = Math.max(0, e.clientX - desktopRect.left);
      const relativeY = Math.max(0, e.clientY - desktopRect.top);
      
      // Calculate max grid positions to ensure icons stay visible
      const maxCols = Math.floor(desktopRect.width / gridSize) - 1;
      const maxRows = Math.floor(desktopRect.height / gridSize) - 1;
      
      // Calculate grid position with bounds checking
      const x = Math.min(maxCols * gridSize, Math.floor(relativeX / gridSize) * gridSize);
      const y = Math.min(maxRows * gridSize, Math.floor(relativeY / gridSize) * gridSize);
      
      if (!isPositionOccupied(x, y, itemId)) {
        setIconPositions(prev => ({
          ...prev,
          [itemId]: { x, y }
        }));
      } else {
        const position = findNextAvailablePosition(0, 0, itemId);
        setIconPositions(prev => ({
          ...prev,
          [itemId]: position
        }));
      }
    } catch (error) {
      console.error('Error processing drop:', error);
    }
  };

  return {
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleFolderDragOver,
    handleFolderDrop,
    handleDrop
  };
};