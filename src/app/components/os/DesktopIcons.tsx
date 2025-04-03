import React, { useState, useEffect, useRef } from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { Folder, FileSystemItem, File } from '@/app/types/fileSystem';
import useIconPositions from '@/app/hooks/useIconPositions';
import { openItem, getInitialRenameName } from '@/app/utils/appUtils';
import { createAppItems, APPS } from '@/app/config/appConfig';

// Import hooks
import { useDesktopContextMenu } from '@/app/hooks/useDesktopContextMenu';
import { useDesktopDragDrop } from '@/app/hooks/useDesktopDragDrop';
import { useDesktopFileOperations } from '@/app/hooks/useDesktopFileOperations';
import { useDesktopClipboard } from '@/app/hooks/useDesktopClipboard';
import { useDesktopCreation } from '@/app/utils/desktopCreationUtils';

// Import components
import { DesktopIcon } from './DesktopIcon';
import { DesktopContextMenuHandler } from './DesktopContextMenuHandler';

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
  const moveItem = fileSystem.moveItem;
  
  // Track any file system changes
  const desktopChildrenRef = useRef<string[]>([]);
  
  // Initialize icon positions with desktop children
  const { 
    iconPositions, 
    setIconPositions,
    newItems,
    findNextAvailablePosition,
    isPositionOccupied,
    removeIconPosition  
  } = useIconPositions(desktop?.children || [], []);

  // Create default apps (VS Code and GameBoy) on the desktop
  useEffect(() => {
    if (!desktop) return; // Wait for desktop to be available
    
    // Get the app files configuration
    const appExeFiles = createAppItems();
    const requiredApps = ['vscode', 'gameboy']; // List of apps that should always be on desktop
    
    // Check for each required app
    requiredApps.forEach(appId => {
      const appFile = appExeFiles[appId];
      if (!appFile) return;
      
      // Check if this exe file already exists on desktop
      const exeExists = desktop.children.some(childId => {
        const child = items[childId];
        if (!child) return false;
        
        // Look for file with matching name
        if (child.type === 'file' && child.name === appFile.name) {
          return true;
        }
        
        return false;
      });
      
      // If exe doesn't exist, create it
      if (!exeExists) {
        console.log(`Creating ${appFile.name} on desktop`);
        createFile(
          appFile.name,
          'desktop',
          appFile.content,
          0
        );
      }
    });
  }, [desktop, items]);

  // Define handleOpenItem function for the file operations hook
  const handleOpenItem = (itemId: string, items: Record<string, FileSystemItem>, openWindow: (windowId: string) => void) => {
    const item = items[itemId];
    if (!item) return;
    
    // Use the new openItem utility
    openItem(item, openWindow);
  };

  // File Operations Hook
  const fileOperations = useDesktopFileOperations({
    items,
    renameItem,
    deleteItem,
    removeIconPosition,
    handleOpenItem,
    onOpenWindow,
    appItems: {}  // No longer need special app items
  });

  // Clipboard Hook
  const clipboardOps = useDesktopClipboard({
    fileSystem: {
      moveItem,
      copyItem: fileSystem.copyItem,
      createFile
    },
    findNextAvailablePosition,
    isPositionOccupied,
    setIconPositions,
    items,
    newItems
  });

  // Creation Hook
  const creationOps = useDesktopCreation({
    desktop,
    items,
    createFolder,
    createFile,
    findNextAvailablePosition,
    isPositionOccupied,
    setIconPositions,
    setLastCreatedItemId: fileOperations.setLastCreatedItemId
  });

  // Context Menu Hook
  const contextMenuOps = useDesktopContextMenu({
    handleCreateNewFolder: () => {
      const position = contextMenuOps.contextMenu.desktopX !== undefined && 
                      contextMenuOps.contextMenu.desktopY !== undefined
        ? { x: contextMenuOps.contextMenu.desktopX, y: contextMenuOps.contextMenu.desktopY }
        : undefined;
      creationOps.handleCreateNewFolder(position);
    },
    handleCreateTextFile: () => {
      const position = contextMenuOps.contextMenu.desktopX !== undefined && 
                      contextMenuOps.contextMenu.desktopY !== undefined
        ? { x: contextMenuOps.contextMenu.desktopX, y: contextMenuOps.contextMenu.desktopY }
        : undefined;
      creationOps.handleCreateTextFile(position);
    },
    handlePaste: () => {
      const position = contextMenuOps.contextMenu.desktopX !== undefined && 
                      contextMenuOps.contextMenu.desktopY !== undefined
        ? { x: contextMenuOps.contextMenu.desktopX, y: contextMenuOps.contextMenu.desktopY }
        : undefined;
      clipboardOps.handlePaste(position);
    },
    handleOpen: fileOperations.handleOpen,
    handleCut: clipboardOps.handleCut,
    handleCopy: clipboardOps.handleCopy,
    handleDelete: fileOperations.handleDelete,
    handleRename: fileOperations.handleRename,
    handleProperties: fileOperations.handleProperties,
    hasClipboardItem: !!clipboardOps.clipboard.item
  });

  // Drag and Drop Hook
  const dragDropOps = useDesktopDragDrop({
    removeIconPosition,
    findNextAvailablePosition,
    isPositionOccupied,
    setIconPositions,
    moveItem,
    createFile,
    appItems: {},  // No longer need special app items
    items,
    newItems,
    handleDesktopAppMoved: () => {} // No longer needed
  });

  // Monitor for file system changes
  useEffect(() => {
    if (desktop?.children) {
      const currentChildren = desktop.children;
      const prevChildren = desktopChildrenRef.current;
      
      const newItemsAdded = currentChildren.filter(id => !prevChildren.includes(id));
      
      if (newItemsAdded.length > 0) {
        console.log("New items added to desktop:", newItemsAdded);
        
        newItemsAdded.forEach(itemId => {
          if (!iconPositions[itemId]) {
            const nextPosition = findNextAvailablePosition(0, 0, itemId);
            setIconPositions(prev => ({
              ...prev,
              [itemId]: nextPosition
            }));
            
            const updatedNewItems = new Set(newItems);
            updatedNewItems.add(itemId);
            
            setTimeout(() => {
              const finalNewItems = new Set(newItems);
              finalNewItems.delete(itemId);
            }, 500);
          }
        });
      }
      
      desktopChildrenRef.current = [...currentChildren];
    }
  }, [desktop?.children, iconPositions, newItems, findNextAvailablePosition, setIconPositions]);

  // This useEffect triggers the rename on the last created item
  useEffect(() => {
    if (fileOperations.lastCreatedItemId && !fileOperations.isRenaming) {
      const item = items[fileOperations.lastCreatedItemId];
      if (item) {
        setTimeout(() => {
          fileOperations.setIsRenaming(fileOperations.lastCreatedItemId);
          fileOperations.setNewName(getInitialRenameName(item));
          fileOperations.setLastCreatedItemId(null);
        }, 50);
      }
    }
  }, [fileOperations.lastCreatedItemId, fileOperations.isRenaming, items]);

  // Handle keyboard shortcuts for copy/paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if we have selected items
      if (fileSystem.selectedItems.length === 0) return;
      
      // Copy: Ctrl+C
      if (e.ctrlKey && e.key === 'c') {
        const selectedItemId = fileSystem.selectedItems[0];
        if (selectedItemId) {
          const item = items[selectedItemId];
          if (item) {
            clipboardOps.handleCopy(selectedItemId);
            console.log('Copied item to clipboard:', item.name);
          }
        }
      }
      
      // Cut: Ctrl+X
      if (e.ctrlKey && e.key === 'x') {
        const selectedItemId = fileSystem.selectedItems[0];
        if (selectedItemId) {
          const item = items[selectedItemId];
          if (item) {
            clipboardOps.handleCut(selectedItemId);
            console.log('Cut item to clipboard:', item.name);
          }
        }
      }
      
      // Paste: Ctrl+V
      if (e.ctrlKey && e.key === 'v') {
        if (clipboardOps.clipboard.item) {
          clipboardOps.handlePaste();
          console.log('Pasted item from clipboard');
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    fileSystem.selectedItems, 
    items, 
    clipboardOps.handleCopy, 
    clipboardOps.handleCut, 
    clipboardOps.handlePaste,
    clipboardOps.clipboard.item
  ]);

  // Get all desktop items from file system
  const allItems = desktop?.type === 'folder' 
    ? desktop.children.map(itemId => items[itemId]).filter(Boolean) 
    : [];

  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      onContextMenu={(e) => contextMenuOps.handleDesktopContextMenu(e, GRID_SIZE)}
      onDragOver={dragDropOps.handleDragOver}
      onDrop={(e) => dragDropOps.handleDrop(e, GRID_SIZE)}
    >
      {/* Render all desktop items with a unified component */}
      {allItems.map((item) => {
        if (!item) return null;
        
        const itemId = item.id;
        
        // Get the position for this item
        let position = iconPositions[itemId];
        
        // If position doesn't exist, create a new one
        if (!position) {
          const newPosition = findNextAvailablePosition(0, 0, itemId);
          setIconPositions(prev => ({
            ...prev,
            [itemId]: newPosition
          }));
          position = newPosition;
        }
        
        const isNewItem = newItems.has(itemId);
        const isCut = clipboardOps.clipboard.operation === 'cut' && clipboardOps.clipboard.item?.id === itemId;
        
        return (
          <DesktopIcon
            key={itemId}
            item={item}
            itemId={itemId}
            position={position}
            isRenaming={fileOperations.isRenaming === itemId}
            newName={fileOperations.newName}
            isDragging={dragDropOps.isDragging}
            isNewItem={isNewItem}
            isCut={isCut}
            onContextMenu={(e) => contextMenuOps.handleContextMenu(e, itemId)}
            onDragStart={(e) => dragDropOps.handleDragStart(e, itemId)}
            onDragEnd={dragDropOps.handleDragEnd}
            onDoubleClick={() => fileOperations.handleOpen(itemId)}
            onDragOver={item.type === 'folder' ? (e) => dragDropOps.handleFolderDragOver(e, itemId) : undefined}
            onDrop={item.type === 'folder' ? (e) => dragDropOps.handleFolderDrop(e, itemId) : undefined}
            onRenameChange={fileOperations.handleRenameChange}
            onRenameKeyDown={fileOperations.handleRenameKeyDown}
            onRenameComplete={fileOperations.handleRenameComplete}
          />
        );
      })}

      {/* Context Menu */}
      <DesktopContextMenuHandler
        contextMenu={contextMenuOps.contextMenu}
        onClose={contextMenuOps.handleCloseContextMenu}
        getContextMenuItems={contextMenuOps.getContextMenuItems}
      />
    </div>
  );
};