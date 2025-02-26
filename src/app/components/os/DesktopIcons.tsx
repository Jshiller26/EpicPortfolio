import React, { useState, useEffect, useRef } from 'react';
import { useFileSystemStore } from '../../stores/fileSystemStore';
import { useClipboardStore } from '../../stores/clipboardStore';
import { FileSystemItem, Folder, File } from '../../types/fileSystem';
import { ContextMenu } from './ContextMenu';
import { ContextMenuItem } from '../../types/ui/ContextMenu';

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
  
  const [iconPositions, setIconPositions] = useState<Record<string, IconPosition>>(() => {
    const saved = localStorage.getItem('desktopIconPositions');
    return saved ? JSON.parse(saved) : {};
  });
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('desktopIconPositions', JSON.stringify(iconPositions));
  }, [iconPositions]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);
  
  // Listen for clicks outside to cancel rename operations and context menus
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isRenaming && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        handleRenameComplete();
      }

      if (contextMenu.visible) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isRenaming, contextMenu.visible]);

  const desktopItems = desktop?.type === 'folder' 
    ? desktop.children.map(id => items[id])
    : [];

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

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    // Only show desktop context menu if we're right-clicking the desktop itself
    if (e.target === e.currentTarget) {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        itemId: null // null indicates desktop context menu
      });
    }
  };

  const handleOpen = (itemId: string) => {
    if (items[itemId].type === 'folder') {
      onOpenWindow(`explorer-${itemId}`);
    } else {
      // Handle file opening based on file type
      const file = items[itemId] as File;
      
      switch (file.extension.toLowerCase()) {
        case 'txt':
        case 'md':
        case 'js':
        case 'ts':
        case 'html':
        case 'css':
        case 'py':
        case 'json':
          // Open in text editor
          onOpenWindow(`editor-${itemId}`);
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
          // Open in image viewer
          onOpenWindow(`image-${itemId}`);
          break;
        case 'pdf':
          // Open in PDF viewer
          onOpenWindow(`pdf-${itemId}`);
          break;
        default:
          // Default file handler
          console.log(`Opening file: ${file.name}`);
          onOpenWindow(`explorer-${file.parentId}`);
      }
    }
  };

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

    if (clipboard.operation === 'cut') {
      // Move the item
      fileSystem.moveItem(clipboard.item.id, 'desktop');
      clipboard.clear();
    } else if (clipboard.operation === 'copy') {
      // Copy the item
      fileSystem.copyItem(clipboard.item.id, 'desktop');
      clipboard.clear();
    }
  };

  const handleDelete = (itemId: string) => {
    deleteItem(itemId);
    // Remove the position data for the deleted item
    const newPositions = { ...iconPositions };
    delete newPositions[itemId];
    setIconPositions(newPositions);
  };

  const handleRename = (itemId: string) => {
    const item = items[itemId];
    if (!item) return;
    
    setIsRenaming(itemId);
    setNewName(item.name);
  };

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleRenameComplete = () => {
    if (isRenaming && newName.trim()) {
      renameItem(isRenaming, newName.trim());
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
    const baseName = 'New Folder';
    let counter = 1;
    let name = baseName;
    
    // Check if the folder name already exists and increment counter
    while (desktop.children.some(childId => {
      const child = items[childId];
      return child.name === name && child.type === 'folder';
    })) {
      name = `${baseName} (${counter})`;
      counter++;
    }
    
    createFolder(name, 'desktop');
  };

  const handleCreateTextFile = () => {
    const baseName = 'New Text Document';
    let counter = 1;
    let name = `${baseName}.txt`;
    
    // Check if the file name already exists and increment counter
    while (desktop.children.some(childId => {
      const child = items[childId];
      return child.name === name && child.type === 'file';
    })) {
      name = `${baseName} (${counter}).txt`;
      counter++;
    }
    
    createFile(name, 'desktop', '', 0);
  };

  const handleProperties = (itemId: string) => {
    // In the future, implement properties dialog
    console.log('Properties:', itemId);
  };

  const getContextMenuItems = (itemId: string | null): ContextMenuItem[] => {
    // If itemId is null, we're showing the desktop context menu
    if (itemId === null) {
      return [
        {
          label: 'View',
          submenu: [
            { label: 'Large Icons', onClick: () => console.log('Large Icons') },
            { label: 'Medium Icons', onClick: () => console.log('Medium Icons') },
            { label: 'Small Icons', onClick: () => console.log('Small Icons') },
          ]
        },
        {
          label: 'Sort By',
          submenu: [
            { label: 'Name', onClick: () => console.log('Sort by Name') },
            { label: 'Size', onClick: () => console.log('Sort by Size') },
            { label: 'Type', onClick: () => console.log('Sort by Type') },
            { label: 'Date modified', onClick: () => console.log('Sort by Date') },
          ]
        },
        { divider: true },
        {
          label: 'Paste',
          onClick: handlePaste,
          disabled: !clipboard.item
        },
        { divider: true },
        {
          label: 'New',
          submenu: [
            { label: 'Folder', onClick: handleCreateNewFolder },
            { label: 'Text Document', onClick: handleCreateTextFile },
          ]
        },
        { divider: true },
        {
          label: 'Properties',
          onClick: () => console.log('Desktop properties')
        }
      ];
    }

    // Otherwise, show the item context menu
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

  const getIconForItem = (item: FileSystemItem): string => {
    if (item.type === 'folder') {
      return '/images/desktop/icons8-folder.svg';
    }
    
    // Handle different file types
    const file = item as File;
    switch (file.extension.toLowerCase()) {
      case 'txt':
        return '/images/desktop/icons8-text-file.svg';
      case 'pdf':
        return '/images/desktop/icons8-pdf.svg';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '/images/desktop/icons8-image.svg';
      case 'js':
      case 'ts':
        return '/images/desktop/icons8-js.svg';
      case 'html':
        return '/images/desktop/icons8-html.svg';
      case 'css':
        return '/images/desktop/icons8-css.svg';
      case 'json':
        return '/images/desktop/icons8-json.svg';
      case 'md':
        return '/images/desktop/icons8-markdown.svg';
      default:
        return '/images/desktop/icons8-file.svg';
    }
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      onContextMenu={handleDesktopContextMenu}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {desktopItems.map((item: File | Folder) => {
        const position = iconPositions[item.id] || { x: 0, y: 0 };
        
        return (
          <div
            key={item.id}
            className={`absolute flex flex-col items-center group cursor-pointer w-[76px] h-[76px] p-1 rounded hover:bg-white/10
              ${clipboard.operation === 'cut' && clipboard.item?.id === item.id ? 'opacity-50' : ''}`}
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
                src={getIconForItem(item)}
                alt={item.name}
                className="w-8 h-8 pointer-events-none"
                draggable="false"
              />
            </div>
            
            {isRenaming === item.id ? (
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={handleRenameChange}
                onKeyDown={handleRenameKeyDown}
                onBlur={handleRenameComplete}
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
      })}

      {contextMenu.visible && (
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