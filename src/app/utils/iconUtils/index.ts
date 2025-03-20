import { FileSystemItem, File } from '@/app/types/fileSystem';

// Get the icon path for a file system item
export const getIconForItem = (item: FileSystemItem): string => {
  if (item.type === 'folder') {
    return '/images/desktop/icons8-folder.svg';
  }
  
  if (isVSCodeItem(item)) {
    return '/images/desktop/icons8-vscode.svg';
  }
  
  // Handle different file types
  const file = item as File;
  
  if (file.content) {
    try {
      const contentObj = JSON.parse(file.content);
      if (contentObj.type === 'appShortcut' && contentObj.appId) {
        switch (contentObj.appId) {
          case 'vscode':
            return '/images/desktop/icons8-vscode.svg';
          default:
            return '/images/desktop/icons8-shortcut.svg';
        }
      }
    } catch {
    }
  }
  
  if (!file.extension) {
    return '/images/desktop/icons8-file.svg';
  }
  
  const extension = file.extension.toLowerCase();
  
  if (extension === 'pdf') {
    return '/images/desktop/pdfFileIcon.png';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return '/images/desktop/imageFileIcon.png';
  } else if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension)) {
    return '/images/desktop/videoFileIcon.png';
  } else if (['txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'yml', 'yaml'].includes(extension)) {
    return '/images/desktop/textFileIcon.png';
  } else if (extension === 'exe') {
    return '/images/desktop/icons8-app.svg';
  }
  
  return '/images/desktop/icons8-file.svg';
};

// Get the icon path for a window by its ID
export const getIconForWindow = (windowId: string): string => {
  if (windowId.startsWith('explorer-')) {
    return '/images/desktop/icons8-folder.svg';
  } else if (windowId.startsWith('editor-')) {
    return '/images/desktop/textFileIcon.png';
  } else if (windowId.startsWith('vscode-')) {
    return '/images/desktop/icons8-vscode.svg';
  } else if (windowId.startsWith('image-')) {
    return '/images/desktop/imageFileIcon.png';
  } else if (windowId.startsWith('pdf-')) {
    return '/images/desktop/pdfFileIcon.png';
  } else if (windowId.startsWith('video-')) {
    return '/images/desktop/videoFileIcon.png';
  } else if (windowId.startsWith('chrome-')) {
    return '/images/desktop/icons8-chrome.svg';
  } else if (windowId.startsWith('edge-')) {
    return '/images/desktop/icons8-microsoft-edge.svg';
  }
  
  return '/images/desktop/icons8-file.svg';
};

// Determine if a file is a text file that can be opened in the editor
export const isTextFile = (file: File): boolean => {
  const textExtensions = ['txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'json', 'yml', 'yaml', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'php', 'rb', 'swift', 'go', 'rs', 'sql', 'xml', 'sh', 'bat', 'ps1'];
  return !!file.extension && textExtensions.includes(file.extension.toLowerCase());
};

// Check if a file is a video file
export const isVideoFile = (file: File): boolean => {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'mkv', 'flv'];
  return !!file.extension && videoExtensions.includes(file.extension.toLowerCase());
};

// Check if a file is an app shortcut
export const isAppShortcut = (file: File): boolean => {
  if (!file.content) return false;
  
  try {
    const content = JSON.parse(file.content);
    return content.type === 'appShortcut' && !!content.appId;
  } catch {
    return false;
  }
};

// Get app ID from a shortcut file
export const getAppIdFromShortcut = (file: File): string | null => {
  if (!isAppShortcut(file)) return null;
  
  try {
    const content = JSON.parse(file.content);
    return content.appId;
  } catch {
    return null;
  }
};

export const isVSCodeItem = (item: FileSystemItem): boolean => {
  if (
    item.name.toLowerCase().includes('vs code') || 
    item.name.toLowerCase() === 'vscode.exe'
  ) {
    return true;
  }
  
  // Additionally check for VS Code shortcuts if needed
  if (item.type === 'file' && (item as File).content) {
    try {
      const content = JSON.parse((item as File).content);
      return content.type === 'appShortcut' && content.appId === 'vscode';
    } catch {
      return false;
    }
  }
  
  return false;
};

// Get the window title based on its ID and file system data
export const getWindowTitle = (windowId: string, items: Record<string, FileSystemItem>, currentPath: string): string => {
  if (windowId.startsWith('explorer-')) {
    // Get the folder name for the path currently being shown
    const folderId = windowId.replace('explorer-', '');
    const folder = items[folderId];
    
    if (folder && folder.type === 'folder') {
      return folder.name;
    }
    
    // Fallback to the path
    const pathParts = currentPath.split('\\');
    return pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'File Explorer';
  } else if (windowId.startsWith('editor-')) {
    const fileId = windowId.replace('editor-', '');
    const file = items[fileId];
    return file ? file.name : 'Text Editor';
  } else if (windowId.startsWith('vscode-')) {
    return 'Visual Studio Code - Untitled.txt';
  } else if (windowId.startsWith('image-')) {
    const fileId = windowId.replace('image-', '');
    const file = items[fileId];
    return file ? file.name : 'Image Viewer';
  } else if (windowId.startsWith('pdf-')) {
    const fileId = windowId.replace('pdf-', '');
    const file = items[fileId];
    return file ? file.name : 'PDF Viewer';
  } else if (windowId.startsWith('video-')) {
    const fileId = windowId.replace('video-', '');
    const file = items[fileId];
    return file ? file.name : 'Video Player';
  }
  
  return 'Window';
};