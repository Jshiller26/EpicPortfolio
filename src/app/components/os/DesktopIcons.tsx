import React, { useState, useEffect, useRef } from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { useClipboardStore } from '@/app/stores/clipboardStore';
import { Folder } from '@/app/types/fileSystem';
import { ContextMenuItem } from '@/app/types/ui/ContextMenu';
import useIconPositions from '@/app/hooks/useIconPositions';
import { ContextMenuState } from './DesktopContextMenuHandler';
import {
  createUniqueFolder,
  createUniqueTextFile,
  getInitialRenameName,
  handleOpenItem,
  getDesktopContextMenu,
  getVsCodeContextMenu,
  getItemContextMenu
} from '@/app/utils/desktopUtils';

// Import renamed components
import { DesktopIcon } from './DesktopIcon';
import { VSCodeIcon } from './VSCodeIcon';
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
    removeIconPosition  } = useIconPositions(desktop?.children || []);

  // Track any file system changes
  const desktopChildrenRef = useRef<string[]>([]);
  
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
      
      const gridX = Math.floor(desktopX / GRID_SIZE) * GRID_SIZE;
      const gridY = Math.floor(desktopY / GRID_SIZE) * GRID_SIZE;
      
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
  
    // Get the paste position from the context menu if available
    const pastePosition = contextMenu.desktopX !== undefined && contextMenu.desktopY !== undefined
      ? { x: contextMenu.desktopX, y: contextMenu.desktopY }
      : null;
  
    if (clipboard.operation === 'cut') {
      fileSystem.moveItem(clipboard.item.id, 'desktop', (movedItemId) => {
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
      // Copy the item with a callback to update the position
      fileSystem.copyItem(clipboard.item.id, 'desktop', (newId) => {
        if (newId) {
          // Add to newItems set to prevent transition
          const updatedNewItems = new Set(newItems);
          updatedNewItems.add(newId);
          
          // Set position to context menu location if available and not occupied
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
          
          // Remove the "new item" flag after a delay
          setTimeout(() => {
            const finalNewItems = new Set(newItems);
            finalNewItems.delete(newId);
          }, 500); // Give enough time for the DOM to update
        }
      });
      
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
    
    if (folderId) {
      if (contextMenu.desktopX !== undefined && contextMenu.desktopY !== undefined) {
        const position = { x: contextMenu.desktopX, y: contextMenu.desktopY };
        
        if (!isPositionOccupied(position.x, position.y)) {
          setIconPositions(prev => ({
            ...prev,
            [folderId]: position
          }));
        } else {
          const nextPosition = findNextAvailablePosition(0, 0, folderId);
          setIconPositions(prev => ({
            ...prev,
            [folderId]: nextPosition
          }));
        }
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

  const handleCreateTextFile = () => {
    const fileId = createUniqueTextFile(desktop, items, createFile);
    console.log(`Created new text file with ID: ${fileId}`);
    
    if (fileId) {
      if (contextMenu.desktopX !== undefined && contextMenu.desktopY !== undefined) {
        const position = { x: contextMenu.desktopX, y: contextMenu.desktopY };
        
        if (!isPositionOccupied(position.x, position.y)) {
          setIconPositions(prev => ({
            ...prev,
            [fileId]: position
          }));
        } else {
          const nextPosition = findNextAvailablePosition(0, 0, fileId);
          setIconPositions(prev => ({
            ...prev,
            [fileId]: nextPosition
          }));
        }
      } else {
        const nextPosition = findNextAvailablePosition(0, 0, fileId);
        setIconPositions(prev => ({
          ...prev,
          [fileId]: nextPosition
        }));
      }
      
      // Set this as the last created item for auto-rename
      setLastCreatedItemId(fileId);
    }
  };

  const handleProperties = (itemId: string) => {
    // In the future, implement properties dialog
    console.log('Properties:', itemId);
  };

  // Context menu generator
  const getContextMenuItems = (itemId: string | null): ContextMenuItem[] => {
    if (itemId === null) {
      return getDesktopContextMenu(
        handleCreateNewFolder,
        handleCreateTextFile,
        handlePaste,
        !!clipboard.item
      );
    }

    if (itemId === 'vscode') {
      return getVsCodeContextMenu(handleOpenVsCode);
    }

    return getItemContextMenu(
      itemId,
      handleOpen,
      handleCut,
      handleCopy,
      handleDelete,
      handleRename,
      handleProperties
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleVsCodeDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'vscode');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      let itemId;
      let source;
      
      if (jsonData) {
        const dragData = JSON.parse(jsonData);
        itemId = dragData.itemId;
        source = dragData.source;
      } else {
        itemId = e.dataTransfer.getData('text/plain');
        source = 'desktop';
      }
      
      if (!itemId) return;
      
      // Get desktop dimensions for bounds checking
      const desktopRect = e.currentTarget.getBoundingClientRect();
      
      const relativeX = Math.max(0, e.clientX - desktopRect.left);
      const relativeY = Math.max(0, e.clientY - desktopRect.top);
      
      // Calculate max grid positions to ensure icons stay visible
      const maxCols = Math.floor(desktopRect.width / GRID_SIZE) - 1;
      const maxRows = Math.floor(desktopRect.height / GRID_SIZE) - 1;
      
      // Calculate grid position with bounds checking
      const x = Math.min(maxCols * GRID_SIZE, Math.floor(relativeX / GRID_SIZE) * GRID_SIZE);
      const y = Math.min(maxRows * GRID_SIZE, Math.floor(relativeY / GRID_SIZE) * GRID_SIZE);
      
      if (source === 'fileExplorer') {
        // Move the item from file explorer to desktop
        fileSystem.moveItem(itemId, 'desktop', (movedItemId) => {
          // Add to newItems set to prevent transition
          const updatedNewItems = new Set(newItems);
          updatedNewItems.add(movedItemId);
          
          if (!isPositionOccupied(x, y, movedItemId)) {
            setIconPositions(prev => ({
              ...prev,
              [movedItemId]: { x, y }
            }));
          } else {
            const position = findNextAvailablePosition(0, 0, movedItemId);
            setIconPositions(prev => ({
              ...prev,
              [movedItemId]: position
            }));
          }
          
          // Remove from newItems set after a delay
          setTimeout(() => {
            const finalNewItems = new Set(newItems);
            finalNewItems.delete(movedItemId);
          }, 500);
        });
        
        return;
      }
      
      if (itemId === 'vscode') {
        if (!isPositionOccupied(x, y, 'vscode')) {
          setVsCodePosition({ x, y });
        } else {
          // Find next available position
          const position = findNextAvailablePosition(0, 0, 'vscode');
          setVsCodePosition(position);
        }
        return;
      }
      
      if (!isPositionOccupied(x, y, itemId)) {
        setIconPositions(prev => ({
          ...prev,
          [itemId]: { x, y }
        }));
      } else {
        const position = findNextAvailablePosition(0, 0, itemId);
        setIconPositions(prev => ({
          ...prev,
          [itemId]: position
        }));
      }
    } catch (error) {
      console.error('Error processing drop:', error);
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      onContextMenu={handleDesktopContextMenu}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* VS Code Icon */}
      <VSCodeIcon 
        position={vsCodePosition}
        isDragging={isDragging}
        onContextMenu={handleVsCodeContextMenu}
        onDragStart={handleVsCodeDragStart}
        onDragEnd={handleDragEnd}
        onDoubleClick={handleOpenVsCode}
      />

      {/* Desktop Items */}
      {desktop?.type === 'folder' && desktop.children.map((itemId) => {
        const item = items[itemId];
        if (!item) return null; // Skip rendering if item doesn't exist
        
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
        const isCut = clipboard.operation === 'cut' && clipboard.item?.id === itemId;
        
        return (
          <DesktopIcon
            key={itemId}
            item={item}
            itemId={itemId}
            position={position}
            isRenaming={isRenaming === itemId}
            newName={newName}
            isDragging={isDragging}
            isNewItem={isNewItem}
            isCut={isCut}
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDoubleClick={() => handleOpen(itemId)}
            onRenameChange={handleRenameChange}
            onRenameKeyDown={handleRenameKeyDown}
            onRenameComplete={handleRenameComplete}
          />
        );
      })}

      {/* Context Menu */}
      <DesktopContextMenuHandler
        contextMenu={contextMenu}
        onClose={handleCloseContextMenu}
        getContextMenuItems={getContextMenuItems}
      />
    </div>
  );
};