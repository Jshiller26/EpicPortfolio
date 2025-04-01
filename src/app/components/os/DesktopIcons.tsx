import React, { useState, useEffect, useRef } from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { Folder, FileSystemItem } from '@/app/types/fileSystem';
import useIconPositions from '@/app/hooks/useIconPositions';
import { handleOpenItem, getInitialRenameName } from '@/app/utils/desktopUtils';

// Import hooks
import { useDesktopContextMenu } from '@/app/hooks/useDesktopContextMenu';
import { useDesktopDragDrop } from '@/app/hooks/useDesktopDragDrop';
import { useDesktopFileOperations } from '@/app/hooks/useDesktopFileOperations';
import { useDesktopClipboard } from '@/app/hooks/useDesktopClipboard';
import { useDesktopCreation } from '@/app/utils/desktopCreationUtils';

// Import components
import { DesktopIcon } from './DesktopIcon';
import { VSCodeIcon } from './VSCodeIcon';
import { GameBoyIcon } from './GameBoyIcon';
import { DesktopContextMenuHandler } from './DesktopContextMenuHandler';

interface DesktopIconsProps {
  onOpenWindow: (windowId: string) => void;
}

const GRID_SIZE = 76;

const createAppItem = (appId: string, appName: string): FileSystemItem => {
  return {
    id: appId,
    name: appName,
    type: 'app',
    parentId: 'desktop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onOpenWindow }) => {
  const fileSystem = useFileSystemStore();
  const desktop = fileSystem.items['desktop'] as Folder;
  const items = fileSystem.items;
  const createFolder = fileSystem.createFolder;
  const createFile = fileSystem.createFile;
  const deleteItem = fileSystem.deleteItem;
  const renameItem = fileSystem.renameItem;
  const moveItem = fileSystem.moveItem;
  
  const [appItems] = useState<Record<string, FileSystemItem>>({
    'vscode': createAppItem('vscode', 'VS Code'),
    'gameboy': createAppItem('gameboy', 'GameBoy')
  });

  // Track any file system changes
  const desktopChildrenRef = useRef<string[]>([]);
  
  // Initialize icon positions with desktop children
  const { 
    iconPositions, 
    vsCodePosition,
    gameBoyPosition, 
    setIconPositions,
    setVsCodePosition,
    setGameBoyPosition,
    newItems,
    findNextAvailablePosition,
    isPositionOccupied,
    removeIconPosition  
  } = useIconPositions(desktop?.children || []);

  // File Operations Hook
  const fileOperations = useDesktopFileOperations({
    items,
    renameItem,
    deleteItem,
    removeIconPosition,
    handleOpenItem,
    onOpenWindow,
    appItems
  });

  // Clipboard Hook
  const clipboardOps = useDesktopClipboard({
    fileSystem,
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
    setVsCodePosition,
    setGameBoyPosition,
    moveItem,
    createFile,
    appItems,
    items,
    newItems
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

  const allItems = [
    ...Object.values(appItems), // App icons
    ...(desktop?.type === 'folder' 
      ? desktop.children.map(itemId => items[itemId]).filter(Boolean) 
      : [])
  ];

  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      onContextMenu={(e) => contextMenuOps.handleDesktopContextMenu(e, GRID_SIZE)}
      onDragOver={dragDropOps.handleDragOver}
      onDrop={(e) => dragDropOps.handleDrop(e, GRID_SIZE)}
    >
      {/* All Desktop Items */}
      {allItems.map((item) => {
        if (!item) return null;
        
        const itemId = item.id;
        const isApp = item.type === 'app';
        
        // Get the appropriate position for the item
        let position;
        if (isApp) {
          if (itemId === 'vscode') {
            position = vsCodePosition;
          } else if (itemId === 'gameboy') {
            position = gameBoyPosition;
          } else {
            position = iconPositions[itemId];
          }
        } else {
          position = iconPositions[itemId];
        }
        
        if (!position) {
          const newPosition = findNextAvailablePosition(0, 0, itemId);
          
          if (isApp) {
            if (itemId === 'vscode') {
              setVsCodePosition(newPosition);
            } else if (itemId === 'gameboy') {
              setGameBoyPosition(newPosition);
            } else {
              setIconPositions(prev => ({
                ...prev,
                [itemId]: newPosition
              }));
            }
          } else {
            setIconPositions(prev => ({
              ...prev,
              [itemId]: newPosition
            }));
          }
          
          position = newPosition;
        }
        
        const isNewItem = newItems.has(itemId);
        const isCut = clipboardOps.clipboard.operation === 'cut' && clipboardOps.clipboard.item?.id === itemId;
        
        if (isApp) {
          if (itemId === 'vscode') {
            return (
              <VSCodeIcon
                key={itemId}
                position={position}
                isDragging={dragDropOps.isDragging}
                onContextMenu={(e) => contextMenuOps.handleContextMenu(e, itemId)}
                onDragStart={(e) => dragDropOps.handleDragStart(e, itemId)}
                onDragEnd={dragDropOps.handleDragEnd}
                onDoubleClick={() => fileOperations.handleOpen(itemId)}
              />
            );
          } else if (itemId === 'gameboy') {
            return (
              <GameBoyIcon
                key={itemId}
                position={position}
                isDragging={dragDropOps.isDragging}
                onContextMenu={(e) => contextMenuOps.handleContextMenu(e, itemId)}
                onDragStart={(e) => dragDropOps.handleDragStart(e, itemId)}
                onDragEnd={dragDropOps.handleDragEnd}
                onDoubleClick={() => fileOperations.handleOpen(itemId)}
              />
            );
          }
        }
        
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
            onContextMenu={contextMenuOps.handleContextMenu}
            onDragStart={dragDropOps.handleDragStart}
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