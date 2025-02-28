import React, { useState, useEffect } from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { useClipboardStore } from '@/app/stores/clipboardStore';
import { Folder } from '@/app/types/fileSystem';
import useIconPositions from '@/app/hooks/useIconPositions';
import { ContextMenuState } from '../DesktopContextMenuHandler';
import {
  getInitialRenameName,
  handleOpenItem
} from '@/app/utils/desktopUtils';
import { DesktopIcon } from '../DesktopIcon';
import { VSCodeIcon } from '../VSCodeIcon';

interface DesktopIconsProps {
  onOpenWindow: (windowId: string) => void;
}

const GRID_SIZE = 76;

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onOpenWindow }) => {
  const fileSystem = useFileSystemStore();
  const desktop = fileSystem.items['desktop'] as Folder;
  const items = fileSystem.items;
  const renameItem = fileSystem.renameItem;
  const clipboard = useClipboardStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [, setContextMenu] = useState<ContextMenuState>({
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

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", itemId);
  };

  const handleVsCodeDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", "vscode");
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="absolute inset-0 p-1"
      onContextMenu={handleDesktopContextMenu}
    >
      {/* Desktop Icons */}
      {desktop && desktop.children.map(itemId => {
        const item = items[itemId];
        const position = iconPositions[itemId] || { x: 0, y: 0 };
        const isCut = clipboard.item?.id === itemId && clipboard.operation === 'cut';
        
        if (!item) return null;
        
        return (
          <DesktopIcon
            key={itemId}
            item={item}
            itemId={itemId}
            position={position}
            isDragging={isDragging}
            isNewItem={false}
            isCut={isCut}
            isRenaming={isRenaming === itemId}
            newName={isRenaming === itemId ? newName : ''}
            onDoubleClick={() => handleOpen(itemId)}
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onRenameChange={handleRenameChange}
            onRenameKeyDown={handleRenameKeyDown}
            onRenameComplete={handleRenameComplete}
          />
        );
      })}
      
      {/* VS Code Icon */}
      <VSCodeIcon
        position={vsCodePosition}
        isDragging={isDragging}
        onDoubleClick={handleOpenVsCode}
        onContextMenu={handleVsCodeContextMenu}
        onDragStart={handleVsCodeDragStart}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
};

export default DesktopIcons;