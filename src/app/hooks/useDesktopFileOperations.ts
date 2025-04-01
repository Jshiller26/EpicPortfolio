import { useState } from 'react';
import { FileSystemItem } from '@/app/types/fileSystem';
import { getInitialRenameName } from '@/app/utils/desktopUtils';

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

  // Open handlers
  const handleOpen = (itemId: string) => {
    if (appItems[itemId]) {
      if (itemId === 'vscode') {
        onOpenWindow('vscode-new');
      } else if (itemId === 'gameboy') {
        onOpenWindow('gameboy-PokemonEmerald');
      } else {
        onOpenWindow(itemId);
      }
    } else {
      handleOpenItem(itemId, items, onOpenWindow);
    }
  };

  const handleDelete = (itemId: string) => {
    deleteItem(itemId);
    // Remove the position data for the deleted item
    removeIconPosition(itemId);
  };

  const handleRename = (itemId: string) => {
    const item = items[itemId];
    if (!item) return;
    
    setIsRenaming(itemId);
    setNewName(getInitialRenameName(item));
  };

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleRenameComplete = () => {
    if (isRenaming && newName.trim()) {
      const item = items[isRenaming];
      
      if (item.type === 'file' && item.name.includes('.')) {
        // For files, preserve the extension
        const extension = item.name.substring(item.name.lastIndexOf('.'));
        renameItem(isRenaming, newName.trim() + extension);
      } else {
        renameItem(isRenaming, newName.trim());
      }
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
    // In the future, implement properties dialog
    console.log('Properties:', itemId);
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