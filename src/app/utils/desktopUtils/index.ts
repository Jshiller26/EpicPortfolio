import { FileSystemItem, Folder, File } from '@/app/types/fileSystem';
import { ContextMenuItem } from '@/app/types/ui/ContextMenu';

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
  createFile: (name: string, parentId: string, content: string, size: number) => string | null
): string | null => {
  const baseName = 'New Text Document';
  let counter = 1;
  let name = `${baseName}.txt`;
  
  while (desktop.children.some(childId => {
    const child = items[childId];
    return child.name === name && child.type === 'file';
  })) {
    name = `${baseName} (${counter}).txt`;
    counter++;
  }
  
  return createFile(name, 'desktop', '', 0);
};

// Get the initial new name for renaming, handling file extensions
export const getInitialRenameName = (item: FileSystemItem): string => {
  if (item.type === 'file' && item.name.includes('.')) {
    // For files, exclude extension when renaming
    return item.name.substring(0, item.name.lastIndexOf('.'));
  }
  return item.name;
};

// Handle opening a file or folder
export const handleOpenItem = (
  itemId: string, 
  items: Record<string, FileSystemItem>,
  onOpenWindow: (windowId: string) => void
): void => {
  const item = items[itemId];
  if (!item) return;
  
  if (item.type === 'folder') {
    const windowId = `explorer-${itemId}`;
    onOpenWindow(windowId);
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
    },
    { divider: true },
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
      label: 'Properties',
      onClick: () => console.log('Desktop properties')
    }
  ];
};

export const getVsCodeContextMenu = (
  handleOpenVsCode: () => void
): ContextMenuItem[] => {
  return [
    {
      label: 'Open',
      onClick: handleOpenVsCode
    },
    { divider: true },
    {
      label: 'Create New File',
      onClick: handleOpenVsCode
    },
    { divider: true },
    {
      label: 'Properties',
      onClick: () => console.log('VS Code properties')
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