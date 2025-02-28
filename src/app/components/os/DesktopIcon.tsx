import React, { useRef } from 'react';
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

  // Focus the input field when renaming
  React.useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  return (
    <div
      className={`absolute flex flex-col items-center group cursor-pointer w-[76px] h-[76px] p-1 rounded hover:bg-white/10
        ${isCut ? 'opacity-50' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        // Only apply transition for dragging, not for newly created/pasted items
        transition: isDragging || isNewItem ? 'none' : 'transform 0.1s ease-out'
      }}
      draggable="true"
      onContextMenu={(e) => onContextMenu(e, itemId)}
      onDragStart={(e) => onDragStart(e, itemId)}
      onDragEnd={onDragEnd}
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