import React, { useEffect, useRef } from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { Folder, FileSystemItem} from '@/app/types/fileSystem';
import useIconPositions from '@/app/hooks/useIconPositions';
import { openItem, getInitialRenameName } from '@/app/utils/appUtils';
import { createAppItems } from '@/app/config/appConfig';

import { useDesktopContextMenu } from '@/app/hooks/useDesktopContextMenu';
import { useDesktopDragDrop } from '@/app/hooks/useDesktopDragDrop';
import { useDesktopFileOperations } from '@/app/hooks/useDesktopFileOperations';
import { useDesktopClipboard } from '@/app/hooks/useDesktopClipboard';
import { useDesktopCreation } from '@/app/utils/desktopCreationUtils';

import { DesktopIcon } from './DesktopIcon';
import { DesktopContextMenuHandler } from './DesktopContextMenuHandler';
import { PasswordDialog } from './PasswordDialog';
import { useWindowStore } from '@/app/stores/windowStore';

interface DesktopIconsProps {
  onOpenWindow: (windowId: string) => void;
}

const GRID_SIZE = 76;

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onOpenWindow }) => {
  const fileSystem = useFileSystemStore();
  const desktop = fileSystem.items['desktop'] as Folder;
  const items = fileSystem.items;
  const windowStore = useWindowStore();
  
  const desktopChildrenRef = useRef<string[]>([]);
  const appInitializedRef = useRef<boolean>(false);
  
  const { 
    iconPositions, 
    setIconPositions,
    newItems,
    findNextAvailablePosition,
    isPositionOccupied,
    removeIconPosition 
  } = useIconPositions(desktop?.children || [], []);

  const handlePasswordProtectedItem = (itemId: string) => {
    const item = items[itemId];
    if (!item) return;
    
    if (fileSystem.isUnlocked(itemId)) {
      openItem(item, onOpenWindow);
      return;
    }
    
    const passwordWindowId = `password-dialog-${itemId}`;
    
    if (windowStore.windows[passwordWindowId]) {
      windowStore.setActiveWindow(passwordWindowId);
      return;
    }
    
    windowStore.createWindow({
      id: passwordWindowId,
      title: 'Enter password',
      content: (
        <PasswordDialog
          folderId={itemId}
          folderName={item.name}
          onClose={() => windowStore.closeWindow(passwordWindowId)}
          onSuccess={() => {
            fileSystem.unlockFolder(itemId);
            windowStore.closeWindow(passwordWindowId);
            openItem(item, onOpenWindow);
          }}
        />
      ),
      width: 400,
      height: 320,
      x: Math.max(0, (window.innerWidth - 400) / 2),
      y: Math.max(0, (window.innerHeight - 320) / 2),
      resizable: false,
      minimizable: false,
      maximizable: false,
      showInTaskbar: true,
    });
  };

  const handleOpenItem = (itemId: string, items: Record<string, FileSystemItem>, openWindow: (windowId: string) => void) => {
    const item = items[itemId];
    if (!item) return;
    
    if (item.type === 'folder' && (item as Folder).isPasswordProtected) {
      handlePasswordProtectedItem(itemId);
      return;
    }
    
    openItem(item, openWindow);
  };

  const fileOperations = useDesktopFileOperations({
    items,
    renameItem: (itemId, newName) => {
      const position = iconPositions[itemId];
      fileSystem.renameItem(itemId, newName);
      
      if (position) {
        setTimeout(() => {
          setIconPositions(prev => {
            const updated = { ...prev, [itemId]: position };
            localStorage.setItem('desktopIconPositions', JSON.stringify(updated));
            return updated;
          });
        }, 0);
      }
    },
    deleteItem: fileSystem.deleteItem,
    removeIconPosition,
    handleOpenItem,
    onOpenWindow,
    appItems: {}
  });

  const clipboardOps = useDesktopClipboard({
    fileSystem: {
      moveItem: (itemId: string, targetId: string, callback?: (movedItemId: string) => void) => {
        fileSystem.moveItem(itemId, targetId, callback);
      },
      copyItem: (itemId: string, targetId: string, callback?: (newId: string) => void) => {
        const originalPosition = iconPositions[itemId];
        
        fileSystem.copyItem(itemId, targetId, (newId: string) => {
          if (newId && originalPosition && callback) {
            const offsetPosition = {
              x: originalPosition.x + 20,
              y: originalPosition.y + 20
            };
            
            const newPosition = isPositionOccupied(offsetPosition.x, offsetPosition.y)
              ? findNextAvailablePosition(0, 0, newId)
              : offsetPosition;
              
            setTimeout(() => {
              setIconPositions(prev => {
                const updated = { ...prev, [newId]: newPosition };
                localStorage.setItem('desktopIconPositions', JSON.stringify(updated));
                return updated;
              });
            }, 0);
            
            callback(newId);
          }
        });

        return '';
      },
      createFile: fileSystem.createFile
    },
    findNextAvailablePosition,
    isPositionOccupied,
    setIconPositions,
    items,
    newItems
  });

  const creationOps = useDesktopCreation({
    desktop,
    items,
    createFolder: (name, parentId) => {
      const newFolderId = fileSystem.createFolder(name, parentId);
      
      if (newFolderId) {
        const newPosition = findNextAvailablePosition(0, 0, newFolderId);
        setTimeout(() => {
          setIconPositions(prev => {
            const updated = { ...prev, [newFolderId]: newPosition };
            localStorage.setItem('desktopIconPositions', JSON.stringify(updated));
            return updated;
          });
        }, 0);
      }
      
      return newFolderId;
    },
    createFile: (name, parentId, content, size) => {
      const newFileId = fileSystem.createFile(name, parentId, content, size);
      
      if (newFileId) {
        const newPosition = findNextAvailablePosition(0, 0, newFileId);
        setTimeout(() => {
          setIconPositions(prev => {
            const updated = { ...prev, [newFileId]: newPosition };
            localStorage.setItem('desktopIconPositions', JSON.stringify(updated));
            return updated;
          });
        }, 0);
      }
      
      return newFileId;
    },
    findNextAvailablePosition,
    isPositionOccupied,
    setIconPositions,
    setLastCreatedItemId: fileOperations.setLastCreatedItemId
  });

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

  const dragDropOps = useDesktopDragDrop({
    removeIconPosition,
    findNextAvailablePosition,
    isPositionOccupied,
    setIconPositions,
    moveItem: (itemId: string, targetId: string, callback?: (movedItemId: string) => void) => {
      fileSystem.moveItem(itemId, targetId, callback);
    },
    createFile: fileSystem.createFile,
    appItems: {},
    items,
    newItems,
    handleDesktopAppMoved: () => {}
  });

  const getFixedPositionForItem = (item: FileSystemItem) => {
    if (item.parentId !== 'desktop') return null;
    
    const fixedPositions: Record<string, { x: number, y: number }> = {
      'My Projects': { x: 0, y: 0 },
      'README.txt': { x: 0, y: GRID_SIZE },
      'VS Code.exe': { x: 0, y: GRID_SIZE * 2 },
      'GameBoy.exe': { x: 0, y: GRID_SIZE * 3 },
      'Paint.exe': { x: 0, y: GRID_SIZE * 4 }
    };
    
    return fixedPositions[item.name] || null;
  };

  // Initialize fixed positions
  useEffect(() => {
    if (!desktop) return;
    
    const storageKey = 'fixed-positions-applied';
    const positionsApplied = localStorage.getItem(storageKey);
    
    if (positionsApplied) return;
    
    const updatedPositions: Record<string, { x: number, y: number }> = {};
    let otherItemsCount = 0;
    
    Object.values(items).forEach(item => {
      if (item.parentId === 'desktop') {
        const fixedPosition = getFixedPositionForItem(item);
        
        if (fixedPosition) {
          updatedPositions[item.id] = fixedPosition;
        } else {
          const col = 1 + (Math.floor(otherItemsCount / 5) % 5);
          const row = (otherItemsCount % 5) + 1;
          
          updatedPositions[item.id] = { 
            x: col * GRID_SIZE, 
            y: row * GRID_SIZE 
          };
          
          otherItemsCount++;
        }
      }
    });
    
    localStorage.removeItem('desktopIconPositions');
    setIconPositions(updatedPositions);
    localStorage.setItem('desktopIconPositions', JSON.stringify(updatedPositions));
    localStorage.setItem(storageKey, 'true');
  }, [desktop, items, setIconPositions]);

  useEffect(() => {
    if (!desktop || appInitializedRef.current) return;
    
    const exeFiles = createAppItems();
    const requiredExeFiles = ['vscode', 'gameboy', 'paint'];
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
    
    let createdAnyFile = false;
    
    requiredExeFiles.forEach(exeId => {
      if (existingExeIds.has(exeId)) return;
      
      const exeFile = exeFiles[exeId];
      if (!exeFile) return;
      
      console.log(`Creating ${exeFile.name} on desktop`);
      fileSystem.createFile(exeFile.name, 'desktop', exeFile.content, 0);
      createdAnyFile = true;
    });
    
    if (createdAnyFile) {
      appInitializedRef.current = true;
      localStorage.removeItem('fixed-positions-applied');
    }
  }, [desktop, items, fileSystem]);

  // Monitor file system changes
  useEffect(() => {
    if (!desktop?.children) return;
    
    const currentChildren = desktop.children;
    const prevChildren = desktopChildrenRef.current;
    const newItemsAdded = currentChildren.filter(id => !prevChildren.includes(id));
    
    if (newItemsAdded.length > 0) {
      let currentPositions: Record<string, { x: number, y: number }> = {};
      
      try {
        const storedPositions = localStorage.getItem('desktopIconPositions');
        currentPositions = storedPositions ? JSON.parse(storedPositions) : { ...iconPositions };
      } catch (error) {
        console.error('Error loading positions from localStorage:', error);
        currentPositions = { ...iconPositions };
      }
      
      const positionsToUpdate: Record<string, { x: number, y: number }> = {};
      
      newItemsAdded.forEach(itemId => {
        if (!currentPositions[itemId]) {
          const item = items[itemId];
          const fixedPosition = item ? getFixedPositionForItem(item) : null;
          
          if (fixedPosition) {
            positionsToUpdate[itemId] = fixedPosition;
          } else {
            positionsToUpdate[itemId] = findNextAvailablePosition(0, 0, itemId);
          }
        }
      });
      
      if (Object.keys(positionsToUpdate).length > 0) {
        setIconPositions(prev => {
          const updated = { ...prev, ...positionsToUpdate };
          localStorage.setItem('desktopIconPositions', JSON.stringify(updated));
          return updated;
        });
      }
    }
    
    desktopChildrenRef.current = [...currentChildren];
  }, [desktop?.children, iconPositions, findNextAvailablePosition, setIconPositions, items]);

  // Auto-rename newly created items
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
      {allItems.map((item) => {
        if (!item) return null;
        
        const itemId = item.id;
        let position = iconPositions[itemId];
        
        if (!position) {
          const fixedPosition = getFixedPositionForItem(item);
          position = fixedPosition || findNextAvailablePosition(0, 0, itemId);
          
          setIconPositions(prev => {
            const updated = { ...prev, [itemId]: position };
            localStorage.setItem('desktopIconPositions', JSON.stringify(updated));
            return updated;
          });
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
            isNewItem={newItems.has(itemId)}
            isCut={clipboardOps.clipboard.operation === 'cut' && clipboardOps.clipboard.item?.id === itemId}
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

      <DesktopContextMenuHandler
        contextMenu={contextMenuOps.contextMenu}
        onClose={contextMenuOps.handleCloseContextMenu}
        getContextMenuItems={contextMenuOps.getContextMenuItems}
      />
    </div>
  );
};