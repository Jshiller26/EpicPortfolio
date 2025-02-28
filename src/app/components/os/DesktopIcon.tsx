import React, { useRef, useState, useEffect } from 'react';
import { FileSystemItem } from '@/app/types/fileSystem';
import { getIconForItem } from '@/app/utils/iconUtils';
import { IconPosition } from '@/app/hooks/useIconPositions';

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
  onRenameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRenameKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRenameComplete?: () => void;
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
  onRenameChange,
  onRenameKeyDown,
  onRenameComplete
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastPosition, setLastPosition] = useState(position);

  React.useEffect(() => {
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
    onDragStart(e, itemId);
  };

  const handleDragEnd = () => {
    setLastPosition(position);
    setIsVisible(true);
    onDragEnd();
  };

  return (
    <div
      className={`absolute flex flex-col items-center group cursor-pointer w-[76px] h-[76px] p-1 rounded hover:bg-white/10
        ${isCut ? 'opacity-50' : ''}
        ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        transform: `translate(${lastPosition.x}px, ${lastPosition.y}px)`,
        transition: 'none'
      }}
      draggable="true"
      onContextMenu={(e) => onContextMenu(e, itemId)}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDoubleClick={onDoubleClick}
    >
      <div className="w-8 h-8 flex items-center justify-center mb-1">
        <img
          src={getIconForItem(item)}
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
        <div className="text-[11px] text-white text-center leading-tight max-w-[72px] px-1 [text-shadow:_0.5px_0.5px_1px_rgba(0,0,0,0.6),_-0.5px_-0.5px_1px_rgba(0,0,0,0.6),_0.5px_-0.5px_1px_rgba(0,0,0,0.6),_-0.5px_0.5px_1px_rgba(0,0,0,0.6)]">
          {item.name}
        </div>
      )}
    </div>
  );
};