import React, { useState, useEffect } from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { useClipboardStore } from '@/app/stores/clipboardStore';
import { Folder } from '@/app/types/fileSystem';
import { ContextMenuItem } from '@/app/types/ui/ContextMenu';
import useIconPositions from '@/app/hooks/useIconPositions';
import { ContextMenuState } from '../DesktopContextMenuHandler';
import {
  createUniqueFolder,
  createUniqueTextFile,
  getInitialRenameName,
  handleOpenItem} from '@/app/utils/desktopUtils';

interface DesktopIconsProps {
  onOpenWindow: (windowId: string) => void;
}

const GRID_SIZE = 76;

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onOpenWindow }) => {
  const fileSystem = useFileSystemStore();
  const desktop = fileSystem.items['desktop'] as Folder;
  const items = fileSystem.items;
  const createFolder = fileSystem.createFolder;
  const createFile = fileSystem.createFile;
  const deleteItem = fileSystem.deleteItem;
  const renameItem = fileSystem.renameItem;
  const clipboard = useClipboardStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    itemId: null
  });
  
  // Store the last created item ID for auto-renaming
  const [lastCreatedItemId, setLastCreatedItemId] = useState<string | null>(null);

  // Initialize icon positions with desktop children
  const { 
    iconPositions, 
    vsCodePosition, 
    setIconPositions,
    setVsCodePosition,
    newItems,
    findNextAvailablePosition,
    isPositionOccupied,
    removeIconPosition
  } = useIconPositions(desktop?.children || []);

  // This useEffect triggers the rename on the last created item
  useEffect(() => {
    if (lastCreatedItemId && !isRenaming) {
      const item = items[lastCreatedItemId];
      if (item) {
        console.log("Autoentering rename mode for:", lastCreatedItemId, item.name);
        setTimeout(() => {
          setIsRenaming(lastCreatedItemId);
          setNewName(getInitialRenameName(item));
          setLastCreatedItemId(null);
        }, 50);
      }
    }
  }, [lastCreatedItemId, isRenaming, items]);

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      itemId
    });
  };

  const handleVsCodeContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      itemId: 'vscode'
    });
  };

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    // Only show desktop context menu if we're right-clicking the desktop itself
    if (e.target === e.currentTarget) {
      e.preventDefault();
      
      const desktopRect = e.currentTarget.getBoundingClientRect();
      const desktopX = e.clientX - desktopRect.left;
      const desktopY = e.clientY - desktopRect.top;
      
      const gridX = Math.round(desktopX / GRID_SIZE) * GRID_SIZE;
      const gridY = Math.round(desktopY / GRID_SIZE) * GRID_SIZE;
      
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        itemId: null,
        desktopX: gridX,
        desktopY: gridY
      });
    }
  };

  // Open handlers
  const handleOpen = (itemId: string) => {
    handleOpenItem(itemId, items, onOpenWindow);
  };

  const handleOpenVsCode = () => {
    onOpenWindow('vscode-new');
  };

  // Clipboard operations
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

  const handlePaste = () => {
    if (!clipboard.item) return;

    if (clipboard.operation === 'cut') {
      // Move the item
      fileSystem.moveItem(clipboard.item.id, 'desktop');
      clipboard.clear();
    } else if (clipboard.operation === 'copy') {
      // Copy the item
      fileSystem.copyItem(clipboard.item.id, 'desktop');
      clipboard.clear();
    }
  };

  // File operations
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

  const handleCreateNewFolder = () => {    
    const folderId = createUniqueFolder(desktop, items, createFolder);
    
    if (contextMenu.desktopX !== undefined && contextMenu.desktopY !== undefined && folderId) {
      setIconPositions(prev => ({
        ...prev,
        [folderId]: { x: contextMenu.desktopX!, y: contextMenu.desktopY! }
      }));
    }
    
    setLastCreatedItemId(folderId);
  };

  const handleCreateTextFile = () => {
    const fileId = createUniqueTextFile(desktop, items, createFile);
    console.log(`Created new text file with ID: ${fileId}`);
    
    if (contextMenu.desktopX !== undefined && contextMenu.desktopY !== undefined && fileId) {
      setIconPositions(prev => ({
        ...prev,
        [fileId]: { x: contextMenu.desktopX!, y: contextMenu.desktopY! }
      }));
    }
    
    // Set this as the last created item for auto-rename
    setLastCreatedItemId(fileId);
  };

  const handleProperties = (itemId: string) => {
    // In the future, implement properties dialog
    console.log('Properties:', itemId);
  };

  // Context menu generator
  const getContextMenuItems = (itemId: string | null): ContextMenuItem[] =>