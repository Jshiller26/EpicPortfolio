import { FileSystemItem, Folder, File } from '@/app/types/fileSystem';
import { ContextMenuItem } from '@/app/types/ui/ContextMenu';
import { openItem } from '@/app/utils/appUtils';
import { isProtectedItem } from '@/app/stores/fileSystem/utils/protectionUtils';

// Create a new folder with a unique name
export const createUniqueFolder = (
  desktop: Folder,
  items: Record<string, FileSystemItem>,
  createFolder: (name: string, parentId: string) => string | null
): string | null => {
  const baseName = 'New Folder';
  let counter = 1;
  let name = baseName;
  
  while (desktop.children.some(childId => {
    const child = items[childId];
    return child.name === name && child.type === 'folder';
  })) {
    name = `${baseName} (${counter})`;
    counter++;
  }
  
  return createFolder(name, 'desktop');
};

// Create a new text file with a unique name
export const createUniqueTextFile = (
  desktop: Folder,
  items: Record<string, FileSystemItem>,
  createFile: (name: string, parentId: string, content: string, size: number) => string | null,
  customName?: string,
  callback?: (id: string | null) => void
): string | null => {
  const baseName = customName || 'New Text Document';
  let counter = 1;
  let name = customName || `${baseName}.txt`;
  
  if (customName && !customName.includes('.')) {
    name = `${customName}.txt`;
  }
  
  while (desktop.children.some(childId => {
    const child = items[childId];
    return child.name === name && child.type === 'file';
  })) {
    name = customName ? 
      `${customName.replace(/\(\d+\)$/, '')} (${counter})${customName.includes('.') ? '' : '.txt'}` : 
      `${baseName} (${counter}).txt`;
    counter++;
  }
  
  const newId = createFile(name, 'desktop', '', 0);
  if (callback && typeof callback === 'function') {
    callback(newId);
  }
  return newId;
};

export { getInitialRenameName } from '@/app/utils/appUtils';

// Handle opening a file or folder
export const handleOpenItem = (
  itemId: string, 
  items: Record<string, FileSystemItem>,
  onOpenWindow: (windowId: string) => void
): void => {
  const item = items[itemId];
  if (!item) return;
  
  if (openItem(item, onOpenWindow)) {
    return;
  }
  
  if (item.type === 'folder') {
    const windowId = `explorer-${itemId}`;
    onOpenWindow(windowId);
  } else if (item.type === 'file') {
    const file = item as File;
    const extension = file.extension ? file.extension.toLowerCase() : '';
    
    switch (extension) {
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
      case 'mp4':
      case 'webm':
      case 'mov':
      case 'avi':
        onOpenWindow(`video-${itemId}`);
        break;
      case 'gb':
      case 'gbc':
      case 'gba':
        // Open in GameBoy Emulator
        const romName = file.name.substring(0, file.name.lastIndexOf('.'));
        onOpenWindow(`gameboy-${romName}`);
        break;
      default:
        // Default file handler
        console.log(`Opening file: ${file.name}`);
        if (file.parentId) {
          onOpenWindow(`explorer-${file.parentId}`);
        }
    }
  }
};

// Functions to generate context menus
export const getDesktopContextMenu = (
  handleCreateNewFolder: () => void,
  handleCreateTextFile: () => void,
  handlePaste: () => void,
  hasClipboardItem: boolean
): ContextMenuItem[] => {
  return [
    {
      label: 'New',
      submenu: [
        { label: 'Folder', onClick: handleCreateNewFolder },
        { label: 'Text Document', onClick: handleCreateTextFile },
      ]
    },
    { divider: true },
    {
      label: 'Paste',
      onClick: handlePaste,
      disabled: !hasClipboardItem
    }
  ];
};

export const getItemContextMenu = (
  itemId: string,
  handleOpen: (itemId: string) => void,
  handleCut: (itemId: string) => void,
  handleCopy: (itemId: string) => void,
  handleDelete: (itemId: string) => void,
  handleRename: (itemId: string) => void,
  handleProperties: (itemId: string) => void
): ContextMenuItem[] => {
  const isProtected = isProtectedItem(itemId);
  
  if (isProtected) {
    return [
      {
        label: 'Open',
        onClick: () => handleOpen(itemId)
      },
      { divider: true },
      {
        label: 'Cut',
        disabled: true,
        onClick: () => {} 
      },
      {
        label: 'Copy',
        disabled: true,
        onClick: () => {}
      },
      { divider: true },
      {
        label: 'Delete',
        disabled: true,
        onClick: () => {}
      },
      { divider: true },
      {
        label: 'Rename',
        disabled: true,
        onClick: () => {}
      },
      { divider: true },
      {
        label: 'Properties',
        onClick: () => handleProperties(itemId)
      }
    ];
  }

  // Regular context menu for other items
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