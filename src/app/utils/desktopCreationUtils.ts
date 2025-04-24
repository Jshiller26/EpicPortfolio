import { Folder, FileSystemItem } from '@/app/types/fileSystem';
import { createUniqueFolder, createUniqueTextFile } from '@/app/utils/desktopUtils';

interface UseDesktopCreationProps {
  desktop: Folder;
  items: Record<string, FileSystemItem>;
  createFolder: (name: string, parentId: string) => string;
  createFile: (name: string, parentId: string, content: string, size: number) => string;
  findNextAvailablePosition: (startX: number, startY: number, excludeItemId?: string) => { x: number, y: number };
  isPositionOccupied: (x: number, y: number, excludeItemId?: string) => boolean;
  setIconPositions: React.Dispatch<React.SetStateAction<Record<string, { x: number, y: number }>>>;
  setLastCreatedItemId: (itemId: string | null) => void;
}

export const useDesktopCreation = ({
  desktop,
  items,
  createFolder,
  createFile,
  findNextAvailablePosition,
  isPositionOccupied,
  setIconPositions,
  setLastCreatedItemId
}: UseDesktopCreationProps) => {
  
  const createItem = (
    itemId: string | null, 
    contextPosition?: { x: number, y: number }
  ) => {
    if (!itemId) return;
    
    const position = contextPosition && !isPositionOccupied(contextPosition.x, contextPosition.y)
      ? contextPosition
      : findNextAvailablePosition(0, 0, itemId);
      
    setIconPositions(prev => ({
      ...prev,
      [itemId]: position
    }));
    
    setLastCreatedItemId(itemId);
  };
  
  const handleCreateNewFolder = (contextPosition?: { x: number, y: number }) => {    
    const folderId = createUniqueFolder(desktop, items, createFolder);
    if (folderId) {
      createItem(folderId, contextPosition);
    }
  };

  const handleCreateTextFile = (contextPosition?: { x: number, y: number }) => {
    const fileId = createUniqueTextFile(desktop, items, createFile);
    if (fileId) {
      createItem(fileId, contextPosition);
    }
  };

  return {
    handleCreateNewFolder,
    handleCreateTextFile
  };
};