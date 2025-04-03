import { useClipboardStore } from '@/app/stores/clipboardStore';
import { FileSystemItem } from '@/app/types/fileSystem';
import { getAppInfo } from '@/app/config/appConfig';

interface UseDesktopClipboardProps {
  fileSystem: {
    moveItem: (itemId: string, targetId: string, callback?: (movedItemId: string) => void) => void;
    copyItem: (itemId: string, targetId: string, callback?: (newId: string) => void) => void;
    createFile: (name: string, parentId: string, content?: string, size?: number) => string;
  };
  findNextAvailablePosition: (startX: number, startY: number, excludeItemId?: string) => { x: number, y: number };
  isPositionOccupied: (x: number, y: number, excludeItemId?: string) => boolean;
  setIconPositions: React.Dispatch<React.SetStateAction<Record<string, { x: number, y: number }>>>;
  items: Record<string, FileSystemItem>;
  newItems: Set<string>;
}

export const useDesktopClipboard = ({
  fileSystem,
  findNextAvailablePosition,
  isPositionOccupied,
  setIconPositions,
  items,
  newItems
}: UseDesktopClipboardProps) => {
  const clipboard = useClipboardStore();

  const handleCut = (itemId: string) => {
    const item = items[itemId];
    if (item) {
      clipboard.setClipboard(item, 'cut');
    }
  };

  const handleCopy = (itemId: string) => {
    const item = items[itemId];
    if (item) {
      clipboard.setClipboard(item, 'copy');
    }
  };

  const copyAppItem = (item: FileSystemItem, targetId: string, callback?: (newId: string) => void) => {
    const appInfo = getAppInfo(item);
    if (!appInfo) {
      console.error('Could not get app info for item:', item);
      return;
    }
    
    const fileName = item.name.endsWith('.exe') ? item.name : `${item.name}.exe`;
    
    const appData = {
      type: 'app',
      appId: appInfo.id,
      appType: appInfo.id
    };
    
    const newFileId = fileSystem.createFile(
      fileName, 
      targetId, 
      JSON.stringify(appData), 
      0
    );
    
    if (callback && newFileId) {
      callback(newFileId);
    }
  };

  const handlePaste = (contextPosition?: { x: number, y: number }) => {
    if (!clipboard.item) return;
  
    // Get the paste position from the context menu if available
    const pastePosition = contextPosition || null;
  
    if (clipboard.operation === 'cut') {
      fileSystem.moveItem(clipboard.item.id, 'desktop', (movedItemId: string) => {
        const updatedNewItems = new Set(newItems);
        updatedNewItems.add(movedItemId);
        
        if (pastePosition && !isPositionOccupied(pastePosition.x, pastePosition.y)) {
          setIconPositions(prev => ({
            ...prev,
            [movedItemId]: pastePosition
          }));
        } else {
          // Find next available position
          const nextPosition = findNextAvailablePosition(0, 0, movedItemId);
          setIconPositions(prev => ({
            ...prev,
            [movedItemId]: nextPosition
          }));
        }
        
        setTimeout(() => {
          const finalNewItems = new Set(newItems);
          finalNewItems.delete(movedItemId);
        }, 500);
      });
      
      clipboard.clear();
    } else if (clipboard.operation === 'copy') {
      const item = clipboard.item;
      const isApp = item.type === 'app' || 
                   item.extension === 'exe' || 
                   item.name.toLowerCase().endsWith('.exe');
      
      if (isApp) {
        // Handle app copying
        copyAppItem(item, 'desktop', (newId: string) => {
          if (newId) {
            const updatedNewItems = new Set(newItems);
            updatedNewItems.add(newId);
            
            if (pastePosition && !isPositionOccupied(pastePosition.x, pastePosition.y)) {
              setIconPositions(prev => ({
                ...prev,
                [newId]: pastePosition
              }));
            } else {
              const nextPosition = findNextAvailablePosition(0, 0, newId);
              setIconPositions(prev => ({
                ...prev,
                [newId]: nextPosition
              }));
            }
            
            setTimeout(() => {
              const finalNewItems = new Set(newItems);
              finalNewItems.delete(newId);
            }, 500);
          }
        });
      } else {
        // Normal file/folder copying
        fileSystem.copyItem(clipboard.item.id, 'desktop', (newId: string) => {
          if (newId) {
            const updatedNewItems = new Set(newItems);
            updatedNewItems.add(newId);
            
            if (pastePosition && !isPositionOccupied(pastePosition.x, pastePosition.y)) {
              setIconPositions(prev => ({
                ...prev,
                [newId]: pastePosition
              }));
            } else {
              const nextPosition = findNextAvailablePosition(0, 0, newId);
              setIconPositions(prev => ({
                ...prev,
                [newId]: nextPosition
              }));
            }
            
            setTimeout(() => {
              const finalNewItems = new Set(newItems);
              finalNewItems.delete(newId);
            }, 500);
          }
        });
      }
      
      clipboard.clear();
    }
  };

  return {
    clipboard,
    handleCut,
    handleCopy,
    handlePaste
  };
};