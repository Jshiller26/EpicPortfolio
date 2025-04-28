import { useState } from 'react';
import { FileSystemItem } from '@/app/types/fileSystem';
import { getInitialRenameName, getFinalRenameName } from '@/app/utils/appUtils';
import { getAppInfo } from '@/app/config/appConfig';
import { useWindowStore } from '@/app/stores/windowStore';

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
  const windowStore = useWindowStore();

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

  const handleProperties = (itemId: string) => {
    const item = items[itemId] || appItems[itemId];
    if (!item) return;
    
    const windowId = `properties-${itemId}`;
    
    if (windowStore.windows[windowId]) {
      windowStore.setActiveWindow(windowId);
      return;
    }
    
    windowStore.createWindow({
      id: windowId,
      title: `${item.name} Properties`,
      content: {
        type: 'properties-dialog',
        props: {
          itemId: itemId,
          onClose: () => windowStore.closeWindow(windowId)
        }
      },
      width: 370,
      height: 450,
      x: Math.max(0, (window.innerWidth - 370) / 2),
      y: Math.max(0, (window.innerHeight - 450) / 2),
      resizable: false,
      minimizable: true,
      maximizable: false,
      showInTaskbar: true,
    });
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