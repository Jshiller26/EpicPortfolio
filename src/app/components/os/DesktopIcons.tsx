import React, { useState, useEffect } from 'react';
import { useFileSystemStore } from '../../stores/fileSystemStore';
import { FileSystemItem, Folder, File } from '../../types/fileSystem';
import { ContextMenu } from './ContextMenu';

interface IconPosition {
  x: number;
  y: number;
}

interface DesktopIconsProps {
  onOpenWindow: (windowId: string) => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  itemId: string | null;
}

const GRID_SIZE = 76;

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onOpenWindow }) => {
  const desktop = useFileSystemStore(state => state.items['desktop']) as Folder;
  const items = useFileSystemStore(state => state.items);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    itemId: null
  });
  
  const [iconPositions, setIconPositions] = useState<Record<string, IconPosition>>(() => {
    const saved = localStorage.getItem('desktopIconPositions');
    return saved ? JSON.parse(saved) : {};
  });
  
  useEffect(() => {
    localStorage.setItem('desktopIconPositions', JSON.stringify(iconPositions));
  }, [iconPositions]);

  const desktopItems = desktop?.type === 'folder' 
    ? desktop.children.map(id => items[id])
    : [];

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    const item = items[itemId];
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      itemId
    });
  };

  const handleOpen = (itemId: string) => {
    onOpenWindow(`explorer-${itemId}`);
  };

  const handleCut = (itemId: string) => {
    console.log('Cut:', itemId);
    // Implement cut functionality
  };

  const handleCopy = (itemId: string) => {
    console.log('Copy:', itemId);
    // Implement copy functionality
  };

  const handleDelete = (itemId: string) => {
    console.log('Delete:', itemId);
    // Implement delete functionality
  };

  const handleRename = (itemId: string) => {
    console.log('Rename:', itemId);
    // Implement rename functionality
  };

  const handleProperties = (itemId: string) => {
    console.log('Properties:', itemId);
    // Implement properties functionality
  };

  const getContextMenuItems = (itemId: string) => {
    const item = items[itemId];
    return [
      {
        label: 'Open',
        onClick: () => handleOpen(itemId)
      },
      { divider: true },
      {
        label: 'Cut',
        onClick: () => handleCut(itemId)
      },
      {
        label: 'Copy',
        onClick: () => handleCopy(itemId)
      },
      { divider: true },
      {
        label: 'Delete',
        onClick: () => handleDelete(itemId)
      },
      { divider: true },
      {
        label: 'Rename',
        onClick: () => handleRename(itemId)
      },
      { divider: true },
      {
        label: 'Properties',
        onClick: () => handleProperties(itemId)
      }
    ];
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDragEnd = (e: React.DragEvent) => {
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
    
    const itemId = e.dataTransfer.getData('text/plain');
    if (!itemId) return;

    const desktopRect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - desktopRect.left - (GRID_SIZE / 2);
    const relativeY = e.clientY - desktopRect.top - (GRID_SIZE / 2);
    
    const x = Math.max(0, Math.round(relativeX / GRID_SIZE) * GRID_SIZE);
    const y = Math.max(0, Math.round(relativeY / GRID_SIZE) * GRID_SIZE);
    
    setIconPositions(prev => ({
      ...prev,
      [itemId]: { x, y }
    }));
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {desktopItems.map((item: File | Folder) => {
        const position = iconPositions[item.id] || { x: 0, y: 0 };
        
        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center group cursor-pointer w-[76px] h-[76px] p-1 rounded hover:bg-white/10"
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            draggable="true"
            onContextMenu={(e) => handleContextMenu(e, item.id)}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragEnd={handleDragEnd}
            onDoubleClick={() => handleOpen(item.id)}
          >
            <div className="w-8 h-8 flex items-center justify-center mb-1">
              <img
                src="/images/desktop/icons8-folder.svg"
                alt={item.name}
                className="w-8 h-8 pointer-events-none"
                draggable="false"
              />
            </div>
            <div className="text-[11px] text-white text-center leading-tight max-w-[72px] px-1 [text-shadow:_0.5px_0.5px_1px_rgba(0,0,0,0.6),_-0.5px_-0.5px_1px_rgba(0,0,0,0.6),_0.5px_-0.5px_1px_rgba(0,0,0,0.6),_-0.5px_0.5px_1px_rgba(0,0,0,0.6)]">
              {item.name}
            </div>
          </div>
        );
      })}

      {contextMenu.visible && contextMenu.itemId && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems(contextMenu.itemId)}
          onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        />
      )}
    </div>
  );
};