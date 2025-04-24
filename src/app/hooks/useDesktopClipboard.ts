import { useClipboardStore } from '@/app/stores/clipboardStore';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { FileSystemItem } from '@/app/types/fileSystem';
import { useState, useCallback } from 'react';

interface UseDesktopClipboardProps {
  findNextAvailablePosition: (startX: number, startY: number, excludeItemId?: string) => { x: number, y: number };
  isPositionOccupied: (x: number, y: number, excludeItemId?: string) => boolean;
  setIconPositions: React.Dispatch<React.SetStateAction<Record<string, { x: number, y: number }>>>;
  items: Record<string, FileSystemItem>;
  newItems: Set<string>;
}

const GRID_SIZE = 76;

export const useDesktopClipboard = ({
  findNextAvailablePosition,
  setIconPositions,
  items
}: UseDesktopClipboardProps) => {
  const clipboard = useClipboardStore();
  const fileSystem = useFileSystemStore();
  
  const [lastPaste, setLastPaste] = useState<{
    id: string | null;
    position: { x: number, y: number } | null;
    timestamp: number;
  }>({ id: null, position: null, timestamp: 0 });
  
  const snapToGrid = useCallback((position: { x: number, y: number }): { x: number, y: number } => {
    return {
      x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(position.y / GRID_SIZE) * GRID_SIZE
    };
  }, []);

  const handleCut = useCallback((itemId: string) => {
    const item = items[itemId];
    if (item) {
      clipboard.setClipboard(item, 'cut');
    }
  }, [clipboard, items]);

  const handleCopy = useCallback((itemId: string) => {
    const item = items[itemId];
    if (item) {
      clipboard.setClipboard(item, 'copy');
    }
  }, [clipboard, items]);
  
  const applyPositionToItem = useCallback((itemId: string, position: { x: number, y: number }) => {    
    setIconPositions(prev => {
      const newPositions = {
        ...prev,
        [itemId]: position
      };
      
      try {
        localStorage.setItem('desktopIconPositions', JSON.stringify(newPositions));
      } catch {}
      return newPositions;
    });
  }, [setIconPositions]);

  const handlePaste = useCallback((contextPosition?: { x: number, y: number }) => {
    if (!clipboard.item) return;
    
    if (!contextPosition) {      
      if (clipboard.operation === 'cut') {
        fileSystem.moveItem(clipboard.item.id, 'desktop', (movedItemId) => {
          const nextPosition = findNextAvailablePosition(0, 0, movedItemId);
          applyPositionToItem(movedItemId, nextPosition);
        });
      } else if (clipboard.operation === 'copy') {
        fileSystem.copyItem(clipboard.item.id, 'desktop', (newId) => {
          const nextPosition = findNextAvailablePosition(0, 0, newId);
          applyPositionToItem(newId, nextPosition);
        });
      }
      
      clipboard.clear();
      return;
    }
    
    const snappedPosition = snapToGrid(contextPosition);    
    const timestamp = Date.now();
    
    if (clipboard.operation === 'cut') {
      fileSystem.moveItem(clipboard.item.id, 'desktop', (movedItemId) => {
        setTimeout(() => {
          applyPositionToItem(movedItemId, snappedPosition);
          setLastPaste({
            id: movedItemId,
            position: snappedPosition,
            timestamp
          });
        }, 0);
      });
    } else if (clipboard.operation === 'copy') {
      fileSystem.copyItem(clipboard.item.id, 'desktop', (newId) => {
        setTimeout(() => {
          applyPositionToItem(newId, snappedPosition);
          setLastPaste({
            id: newId,
            position: snappedPosition,
            timestamp
          });
        }, 0);
      });
    }
    
    clipboard.clear();
  }, [
    clipboard, 
    fileSystem, 
    snapToGrid, 
    findNextAvailablePosition, 
    applyPositionToItem
  ]);

  return {
    clipboard,
    handleCut,
    handleCopy,
    handlePaste
  };
};