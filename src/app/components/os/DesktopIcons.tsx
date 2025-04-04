import React, { useEffect, useRef } from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { Folder, FileSystemItem} from '@/app/types/fileSystem';
import useIconPositions from '@/app/hooks/useIconPositions';
import { openItem, getInitialRenameName } from '@/app/utils/appUtils';
import { createAppItems } from '@/app/config/appConfig';

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

  useEffect(() => {
    if (!desktop) return;
    
    setTimeout(() => {
      const myProjectsId = Object.values(items).find(
        item => item.name === 'My Projects' && item.parentId === 'desktop'
      )?.id;
      
      const readmeId = Object.values(items).find(
        item => item.name === 'README.txt' && item.parentId === 'desktop'
      )?.id;
      
      const vsCodeId = Object.values(items).find(
        item => item.name === 'VS Code.exe' && item.parentId === 'desktop'
      )?.id;
      
      const gameBoyId = Object.values(items).find(
        item => item.name === 'GameBoy.exe' && item.parentId === 'desktop'
      )?.id;

      const updatedPositions: Record<string, { x: number, y: number }> = {};
      
      if (myProjectsId) {
        updatedPositions[myProjectsId] = { x: 0, y: 0 };
      }
      
      if (vsCodeId) {
        updatedPositions[vsCodeId] = { x: 0, y: GRID_SIZE };
      }
      
      if (readmeId) {
        updatedPositions[readmeId] = { x: 0, y: GRID_SIZE * 2 };
      }
      
      if (gameBoyId) {
        updatedPositions[gameBoyId] = { x: 0, y: GRID_SIZE * 3 };
      }
      
      if (Object.keys(updatedPositions).length > 0) {
        setIconPositions(prev => ({
          ...prev,
          ...updatedPositions
        }));
      }
    }, 100);
  }, [desktop, items, setIconPositions]);

  useEffect(() => {
    if (!desktop) return;
    
    const exeFiles = createAppItems();
    const requiredExeFiles = ['vscode', 'gameboy'];

    const existingExeIds = new Set<string>();
    
    Object.values(items).forEach(item => {
      if (item.type === 'file') {
        requiredExeFiles.forEach(requiredId => {
          const exeFile = exeFiles[requiredId];
          if (exeFile && item.name === exeFile.name) {
            existingExeIds.add(requiredId);
          }
        });
      }
    });
    
    requiredExeFiles.forEach(exeId => {
      if (existingExeIds.has(exeId)) {
        return;
      }
      
      const exeFile = exeFiles[exeId];
      if (!exeFile) return;
      
      console.log(`Creating ${exeFile.name} on desktop`);
      createFile(
        exeFile.name,
        'desktop',
        exeFile.content,
        0
      );
      
    });
  }, [desktop, items, createFile]);

  // Define handleOpenItem function for the file operations hook
  const handleOpenItem = (itemId: string, items: Record<string, FileSystemItem>, openWindow: (windowId: string) => void) => {
    const item = items[itemId];
    if (!item) return;
    
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
    appItems: {}
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
    appItems: {},
    items,
    newItems,
    handleDesktopAppMoved: () => {}
  });

  // Monitor for file system changes
  useEffect(() => {
    if (desktop?.children) {
      const currentChildren = desktop.children;
      const prevChildren = desktopChildrenRef.current;
      
      const newItemsAdded = currentChildren.filter(id => !prevChildren.includes(id));
      
      if (newItemsAdded.length > 0) {
        console.log("New items added to desktop:", newItemsAdded);
        
        const occupiedPositions = new Set(
          Object.values(iconPositions).map(pos => `${pos.x},${pos.y}`)
        );
        
        const startIndex = Object.keys(iconPositions).length;
        
        newItemsAdded.forEach((itemId, index) => {
          if (!iconPositions[itemId]) {
            const maxColumns = Math.floor(window.innerWidth / GRID_SIZE) - 1; 
            
            const col = (startIndex + index) % maxColumns;
            const row = Math.floor((startIndex + index) / maxColumns);
            
            const x = col * GRID_SIZE;
            const y = row * GRID_SIZE;
            
            const posKey = `${x},${y}`;
            
            if (!occupiedPositions.has(posKey)) {
              setIconPositions(prev => ({
                ...prev,
                [itemId]: { x, y }
              }));
              occupiedPositions.add(posKey);
            } else {
              const nextPosition = findNextAvailablePosition(0, 0, itemId);
              setIconPositions(prev => ({
                ...prev,
                [itemId]: nextPosition
              }));
              occupiedPositions.add(`${nextPosition.x},${nextPosition.y}`);
            }
            
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
        let position = iconPositions[itemId];
        
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