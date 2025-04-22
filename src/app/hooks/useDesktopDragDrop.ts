import { useState, useRef, useEffect } from 'react';
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
  const positionsRef = useRef<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
    const savePositionsOnDragEnd = () => {
      setTimeout(() => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('desktopIconPositions', JSON.stringify(positionsRef.current));
        }
      }, 100);
    };

    window.addEventListener('mouseup', savePositionsOnDragEnd);
    return () => {
      window.removeEventListener('mouseup', savePositionsOnDragEnd);
    };
  }, []);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    draggedItemRef.current = itemId;
    
    const item = items[itemId];
    const isExe = item && isExeFile(item);
    
    e.dataTransfer.setData('application/json', JSON.stringify({
      itemId,
      source: 'desktop',
      isExe
    }));
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    draggedItemRef.current = null;
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('desktopIconPositions', JSON.stringify(positionsRef.current));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = draggedItemRef.current === folderId ? 'none' : 'move';
  };

  const handleFolderDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      const itemId = jsonData 
        ? JSON.parse(jsonData).itemId 
        : e.dataTransfer.getData('text/plain');
      
      if (!itemId || itemId === folderId) return;
      
      const targetFolder = items[folderId];
      if (!targetFolder || targetFolder.type !== 'folder') return;
      
      moveItem(itemId, folderId, () => {
        removeIconPosition(itemId);
        setIconPositions(prev => {
          const updated = { ...prev };
          delete updated[itemId];
          positionsRef.current = updated;
          return updated;
        });
      });
    } catch (error) {
      console.error('Error processing folder drop:', error);
    }
  };

  const snapToGrid = (x: number, y: number, gridSize: number): { x: number, y: number } => {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  };

  const getDropPosition = (e: React.DragEvent, gridSize: number) => {
    const desktopRect = e.currentTarget.getBoundingClientRect();
    const relativeX = Math.max(0, e.clientX - desktopRect.left);
    const relativeY = Math.max(0, e.clientY - desktopRect.top);
    const snappedPosition = snapToGrid(relativeX, relativeY, gridSize);
    
    const maxCols = Math.floor(desktopRect.width / gridSize) - 1;
    const maxRows = Math.floor(desktopRect.height / gridSize) - 1;
    
    return {
      x: Math.min(maxCols * gridSize, snappedPosition.x),
      y: Math.min(maxRows * gridSize, snappedPosition.y)
    };
  };

  const applyIconPosition = (itemId: string, position: { x: number, y: number }) => {
    setIconPositions(prev => {
      const updated = {
        ...prev,
        [itemId]: position
      };
      positionsRef.current = updated;
      return updated;
    });
  };

  const handleFileExplorerDrop = (itemId: string, e: React.DragEvent, gridSize: number) => {
    const position = getDropPosition(e, gridSize);
    
    moveItem(itemId, 'desktop', (movedItemId: string) => {
      newItems.add(movedItemId);
      
      if (!isPositionOccupied(position.x, position.y, movedItemId)) {
        applyIconPosition(movedItemId, position);
      } else {
        applyIconPosition(movedItemId, findNextAvailablePosition(0, 0, movedItemId));
      }
      
      setTimeout(() => newItems.delete(movedItemId), 500);
      
      if (typeof localStorage !== 'undefined') {
        setTimeout(() => {
          localStorage.setItem('desktopIconPositions', JSON.stringify(positionsRef.current));
        }, 100);
      }
    });
  };

  const handleDrop = (e: React.DragEvent, gridSize: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      let itemId, source;
      
      if (jsonData) {
        const dragData = JSON.parse(jsonData);
        itemId = dragData.itemId;
        source = dragData.source;
        
        if (source === 'fileExplorer') {
          handleFileExplorerDrop(itemId, e, gridSize);
          return;
        }
      } else {
        itemId = e.dataTransfer.getData('text/plain');
      }
      
      if (!itemId) return;
      
      const position = getDropPosition(e, gridSize);
      
      if (!isPositionOccupied(position.x, position.y, itemId)) {
        applyIconPosition(itemId, position);
      } else {
        applyIconPosition(itemId, findNextAvailablePosition(0, 0, itemId));
      }
      
      if (typeof localStorage !== 'undefined') {
        setTimeout(() => {
          localStorage.setItem('desktopIconPositions', JSON.stringify(positionsRef.current));
        }, 100);
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