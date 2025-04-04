import React, { useRef, useState, useEffect } from 'react';
import { FileSystemItem } from '@/app/types/fileSystem';
import { getIconForItem } from '@/app/utils/iconUtils';
import { IconPosition } from '@/app/hooks/useIconPositions';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { getDisplayName } from '@/app/utils/displayUtils';

interface DesktopIconProps {
  item: FileSystemItem;
  itemId: string;
  position: IconPosition;
  isRenaming: boolean;
  newName: string;
  isDragging: boolean;
  isNewItem: boolean;
  isCut: boolean;
  onContextMenu: (e: React.MouseEvent, itemId: string) => void;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
  onDragEnd: () => void;
  onDoubleClick: () => void;
  onDragOver?: (e: React.DragEvent, itemId: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, itemId: string) => void;
  onRenameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRenameKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRenameComplete?: () => void;
  iconSrc?: string; // Optional override for app icons
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  item,
  itemId,
  position,
  isRenaming,
  newName,
  isDragging,
  isNewItem,
  isCut,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onDoubleClick,
  onDragOver,
  onDragLeave,
  onDrop,
  onRenameChange,
  onRenameKeyDown,
  onRenameComplete,
  iconSrc
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastPosition, setLastPosition] = useState(position);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileSystem = useFileSystemStore();

  // Get icon for this item - use custom icon source or auto-detect
  const iconSource = iconSrc || getIconForItem(item);

  const displayName = item.type === 'file' 
    ? getDisplayName(item.name)
    : item.name;

  // Check if this item is selected in the file system
  useEffect(() => {
    const selectedItems = fileSystem.selectedItems;
    setIsSelected(selectedItems.includes(itemId));
  }, [fileSystem.selectedItems, itemId]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    if (isNewItem || isDragging) {
      return;
    }

    if (position.x !== lastPosition.x || position.y !== lastPosition.y) {
      setIsVisible(false);
      
      setTimeout(() => {
        setLastPosition(position);
        setIsVisible(true);
      }, 50);
    }
  }, [position, lastPosition, isNewItem, isDragging]);

  const handleDragStart = (e: React.DragEvent) => {
    setIsVisible(false);
    
    const dragData = {
      itemId: itemId,
      source: 'desktop'
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.setData('text/plain', itemId);
    
    // Add a class to body to indicate drag operation
    document.body.classList.add('dragging');
    
    // Set the dropEffect to move
    e.dataTransfer.effectAllowed = 'move';
    
    onDragStart(e, itemId);
  };

  const handleDragEnd = () => {
    setLastPosition(position);
    setIsVisible(true);
    
    // Remove dragging class from body
    document.body.classList.remove('dragging');
    document.body.classList.remove('dragging-over-folder');
    
    onDragEnd();
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Only handle dragover for folders
    if (item.type === 'folder') {
      // Always prevent default to allow drop
      e.preventDefault();
      e.stopPropagation();
      
      // Force move cursor
      e.dataTransfer.dropEffect = 'move';
      
      // Add class to body to indicate drag over folder
      document.body.classList.add('dragging-over-folder');
      
      // Only set highlight if not already highlighted
      if (!isDropTarget) {
        setIsDropTarget(true);
        
        // Add drop target class to container
        if (containerRef.current) {
          containerRef.current.classList.add('folder-drop-target');
        }
      }
      
      // Call parent handler if exists
      if (onDragOver) {
        onDragOver(e, itemId);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (item.type === 'folder') {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      
      // Add class to body to indicate drag over folder
      document.body.classList.add('dragging-over-folder');
      
      setIsDropTarget(true);
      
      // Add drop target class to container
      if (containerRef.current) {
        containerRef.current.classList.add('folder-drop-target');
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (item.type === 'folder') {
      // Check if we're really leaving (and not just entering a child element)
      const relatedTarget = e.relatedTarget as Node;
      const currentTarget = e.currentTarget as Node;
      
      if (!currentTarget.contains(relatedTarget)) {
        setIsDropTarget(false);
        
        // Remove drop target class from container
        if (containerRef.current) {
          containerRef.current.classList.remove('folder-drop-target');
        }
        
        // Remove class from body
        document.body.classList.remove('dragging-over-folder');
      }
      
      if (onDragLeave) {
        onDragLeave(e);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (item.type === 'folder') {
      e.preventDefault();
      e.stopPropagation();
      setIsDropTarget(false);
      
      // Remove drop target class from container
      if (containerRef.current) {
        containerRef.current.classList.remove('folder-drop-target');
      }
      
      // Remove class from body
      document.body.classList.remove('dragging-over-folder');
      
      if (onDrop) {
        onDrop(e, itemId);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Select this item
    fileSystem.selectItems([itemId]);
    
    // Prevent event from bubbling up (which would deselect)
    e.stopPropagation();
  };

  // Determine classnames based on folder type and drop state
  const folderClasses = item.type === 'folder' ? 'folder-item' : '';
  const dropTargetClasses = isDropTarget && item.type === 'folder' ? 'folder-drop-target' : '';
  const selectedClass = isSelected ? 'bg-blue-500/30' : '';

  return (
    <div
      ref={containerRef}
      className={`absolute flex flex-col items-center group cursor-pointer w-[76px] h-[88px] p-1 rounded 
        ${isDropTarget ? 'bg-blue-500/40' : 'hover:bg-white/10'} 
        ${isCut ? 'opacity-50' : ''}
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${selectedClass}
        ${folderClasses} ${dropTargetClasses}`}
      style={{
        transform: `translate(${lastPosition.x}px, ${lastPosition.y}px)`,
        transition: 'none'
      }}
      draggable="true"
      onContextMenu={(e) => onContextMenu(e, itemId)}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDoubleClick={onDoubleClick}
      onClick={handleClick}
    >
      <div className="w-8 h-8 flex items-center justify-center mb-1">
        <img
          src={iconSource}
          alt={item.name}
          className="w-8 h-8 pointer-events-none"
          draggable="false"
        />
      </div>
      
      {isRenaming ? (
        <input
          ref={inputRef}
          type="text"
          value={newName}
          onChange={onRenameChange}
          onKeyDown={onRenameKeyDown}
          onBlur={onRenameComplete}
          className="text-black text-[11px] bg-white px-1 w-full text-center focus:outline-none rounded"
          autoFocus
        />
      ) : (
        <div className="text-[11px] text-white text-center w-full break-words px-1 leading-tight [text-shadow:_0.5px_0.5px_1px_rgba(0,0,0,0.6),_-0.5px_-0.5px_1px_rgba(0,0,0,0.6),_0.5px_-0.5px_1px_rgba(0,0,0,0.6),_-0.5px_0.5px_1px_rgba(0,0,0,0.6)]">
          {displayName}
        </div>
      )}
    </div>
  );
};