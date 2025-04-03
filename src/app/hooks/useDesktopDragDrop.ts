import { useState, useRef } from 'react';
import { FileSystemItem } from '@/app/types/fileSystem';
import { isExeFile } from '@/app/utils/appUtils';

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
  handleDesktopAppMoved: (appId: string) => void;
}

export const useDesktopDragDrop = ({
  removeIconPosition,
  findNextAvailablePosition,
  isPositionOccupied,
  setIconPositions,
  moveItem,
  items,
  newItems
}: UseDesktopDragDropProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const draggedItemRef = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    
    // Store the current dragged item ID
    draggedItemRef.current = itemId;
    
    const item = items[itemId];
    
    const isExe = item && isExeFile(item);
    
    const dragData = {
      itemId: itemId,
      source: 'desktop',
      isExe: isExe
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

  const handleFolderDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      let itemId: string;
      
      if (jsonData) {
        const dragData = JSON.parse(jsonData);
        itemId = dragData.itemId;
      } else {
        itemId = e.dataTransfer.getData('text/plain');
      }
      
      if (!itemId || itemId === folderId) return;
      
      const targetFolder = items[folderId];
      if (!targetFolder || targetFolder.type !== 'folder') return;
      
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