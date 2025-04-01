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
  
  const handleCreateNewFolder = (contextPosition?: { x: number, y: number }) => {    
    const folderId = createUniqueFolder(desktop, items, createFolder);
    
    if (folderId) {
      if (contextPosition && !isPositionOccupied(contextPosition.x, contextPosition.y)) {
        setIconPositions(prev => ({
          ...prev,
          [folderId]: contextPosition
        }));
      } else {
        const nextPosition = findNextAvailablePosition(0, 0, folderId);
        setIconPositions(prev => ({
          ...prev,
          [folderId]: nextPosition
        }));
      }
      
      setLastCreatedItemId(folderId);
    }
  };

  const handleCreateTextFile = (contextPosition?: { x: number, y: number }) => {
    const fileId = createUniqueTextFile(desktop, items, createFile);
    console.log(`Created new text file with ID: ${fileId}`);
    
    if (fileId) {
      if (contextPosition && !isPositionOccupied(contextPosition.x, contextPosition.y)) {
        setIconPositions(prev => ({
          ...prev,
          [fileId]: contextPosition
        }));
      } else {
        const nextPosition = findNextAvailablePosition(0, 0, fileId);
        setIconPositions(prev => ({
          ...prev,
          [fileId]: nextPosition
        }));
      }
      
      setLastCreatedItemId(fileId);
    }
  };

  return {
    handleCreateNewFolder,
    handleCreateTextFile
  };
};