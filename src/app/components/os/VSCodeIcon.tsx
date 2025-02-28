import React from 'react';
import { IconPosition } from '@/app/hooks/useIconPositions';

interface VSCodeIconProps {
  position: IconPosition;
  isDragging: boolean;
  onContextMenu: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDoubleClick: () => void;
}

export const VSCodeIcon: React.FC<VSCodeIconProps> = ({
  position,
  isDragging,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onDoubleClick
}) => {
  return (
    <div
      className="absolute flex flex-col items-center group cursor-pointer w-[76px] h-[76px] p-1 rounded hover:bg-white/10"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}
      draggable="true"
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDoubleClick={onDoubleClick}
    >
      <div className="w-8 h-8 flex items-center justify-center mb-1">
        <img
          src="/images/desktop/icons8-vscode.svg"
          alt="Visual Studio Code"
          className="w-8 h-8 pointer-events-none"
          draggable="false"
        />
      </div>
      <div className="text-[11px] text-white text-center leading-tight max-w-[72px] px-1 [text-shadow:_0.5px_0.5px_1px_rgba(0,0,0,0.6),_-0.5px_-0.5px_1px_rgba(0,0,0,0.6),_0.5px_-0.5px_1px_rgba(0,0,0,0.6),_-0.5px_0.5px_1px_rgba(0,0,0,0.6)]">
        VS Code
      </div>
    </div>
  );
};