import { useState } from 'react';
import { FileSystemItem } from '@/app/types/fileSystem';
import { getInitialRenameName, getFinalRenameName } from '@/app/utils/appUtils';
import { getAppInfo } from '@/app/config/appConfig';

interface UseDesktopFileOperationsProps {
  items: Record<string, FileSystemItem>;
  renameItem: (itemId: string, newName: string) => void;
  deleteItem: (itemId: string) => void;
  removeIconPosition: (itemId: string) => void;
  handleOpenItem: (itemId: string, items: Record<string, FileSystemItem>, onOpenWindow: (windowId: string) => void) => void;
  onOpenWindow: (windowId: string) => void;
  appItems: Record<string, FileSystemItem>;
}

export const useDesktopFileOperations = ({
  items,
  renameItem,
  deleteItem,
  removeIconPosition,
  handleOpenItem,
  onOpenWindow,
  appItems
}: UseDesktopFileOperationsProps) => {
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [lastCreatedItemId, setLastCreatedItemId] = useState<string | null>(null);

  const handleOpen = (itemId: string) => {
    if (appItems[itemId]) {
      onOpenWindow(itemId);
      return;
    }
    
    const item = items[itemId];
    if (!item) return;
    
    if (item.type === 'app' || 
        item.extension === 'exe' || 
        item.name.toLowerCase().endsWith('.exe')) {
      
      const appInfo = getAppInfo(item);
      if (appInfo) {
        onOpenWindow(appInfo.id);
        return;
      }
      
      if (item.appType) {
        onOpenWindow(item.appType);
        return;
      }
      
      if (item.type === 'file' && 'content' in item) {
        try {
          if (typeof item.content === 'string') {
            const content = JSON.parse(item.content);
            if (content.type === 'app' && content.appId) {
              onOpenWindow(content.appId);
              return;
            }
          }
        } catch {
        }
      }
    }
    
    handleOpenItem(itemId, items, onOpenWindow);
  };

  const handleDelete = (itemId: string) => {
    deleteItem(itemId);
    // Remove the position data for the deleted item
    removeIconPosition(itemId);
  };

  const handleRename = (itemId: string) => {
    const item = items[itemId] || appItems[itemId];
    if (!item) return;
    
    setIsRenaming(itemId);
    setNewName(getInitialRenameName(item));
  };

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit input to 15 characters
    const value = e.target.value;
    if (value.length <= 15) {
      setNewName(value);
    } else {
      setNewName(value.substring(0, 15));
    }
  };

  const handleRenameComplete = () => {
    if (isRenaming && newName.trim()) {
      const item = items[isRenaming] || appItems[isRenaming];
      if (!item) {
        setIsRenaming(null);
        setNewName('');
        return;
      }
      
      const finalName = getFinalRenameName(item, newName.trim());
      renameItem(isRenaming, finalName);
    }
    
    setIsRenaming(null);
    setNewName('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRenameComplete();
    } else if (e.key === 'Escape') {
      setIsRenaming(null);
      setNewName('');
    }
  };

  const handleProperties = () => {
  };

  return {
    isRenaming,
    newName,
    lastCreatedItemId,
    setLastCreatedItemId,
    setIsRenaming,
    setNewName,
    handleOpen,
    handleDelete,
    handleRename,
    handleRenameChange,
    handleRenameComplete,
    handleRenameKeyDown,
    handleProperties
  };
};