import { FileSystemItem, File} from '@/app/types/fileSystem';
import { APPS, getAppInfo } from '@/app/config/appConfig';

// Helper to get the base window type from a window ID
export const getWindowType = (windowId: string) => {
  const parts = windowId.split('-');
  if (parts.length < 2) return '';
  return parts[0];
};

export const getContentId = (windowId: string) => {
  const parts = windowId.split('-');
  if (parts.length < 3) return '';
  
  if (windowId.startsWith('vscode-')) {
    return 'new';
  }
  
  parts.shift();
  parts.pop();  
  return parts.join('-');
};

// Get the icon path for a file system item
export const getIconForItem = (item: FileSystemItem): string => {
  if (item.type === 'app' && item.iconPath) {
    return item.iconPath;
  }
  if (item.type === 'app' && item.appType && APPS[item.appType]) {
    return APPS[item.appType].iconPath;
  }
  
  // Handle folders
  if (item.type === 'folder') {
    return '/images/desktop/icons8-folder.svg';
  }
  
  if (item.extension === 'exe' || (item.name && item.name.toLowerCase().endsWith('.exe'))) {
    const appInfo = getAppInfo(item);
    if (appInfo) {
      return appInfo.iconPath;
    }
    return '/images/desktop/icons8-app.svg';
  }
  if (item.type === 'file') {
    const file = item as File;
    
    if (file.content) {
      try {
        const contentObj = JSON.parse(file.content);
        if (contentObj.type === 'app' && contentObj.appId) {
          const app = APPS[contentObj.appId];
          if (app) {
            return app.iconPath;
          }
        }      
        if (contentObj.type === 'appShortcut' && contentObj.appId) {
          const app = APPS[contentObj.appId];
          if (app) {
            return app.iconPath;
          }
          return '/images/desktop/icons8-shortcut.svg';
        }
      } catch {
      }
    }
  }
  
  const file = item as File;
  
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
  } else if (['gb', 'gbc', 'gba'].includes(extension)) {
    return '/images/icons/games/gameboyIcon.png';
  }
  
  return '/images/desktop/icons8-file.svg';
};

// Get the icon path for a window by its ID
export const getIconForWindow = (windowId: string): string => {
  const windowType = getWindowType(windowId);
  
  const app = APPS[windowType];
  if (app) {
    return app.iconPath;
  }
  
  switch (windowType) {
    case 'explorer':
      return '/images/desktop/icons8-folder.svg';
    case 'editor':
      return '/images/desktop/textFileIcon.png';
    case 'image':
      return '/images/desktop/imageFileIcon.png';
    case 'pdf':
      return '/images/desktop/pdfFileIcon.png';
    case 'video':
      return '/images/desktop/videoFileIcon.png';
    case 'chrome':
      return '/images/desktop/icons8-chrome.svg';
    case 'edge':
      return '/images/desktop/icons8-microsoft-edge.svg';
    default:
      return '/images/desktop/icons8-file.svg';
  }
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

// Check if a file is a game ROM file
export const isGameROMFile = (file: File): boolean => {
  const gameExtensions = ['gb', 'gbc', 'gba', 'nes', 'snes', 'smc', 'z64', 'n64', 'nds'];
  return !!file.extension && gameExtensions.includes(file.extension.toLowerCase());
};

export const isAppFile = (item: FileSystemItem): boolean => {
  if (item.type === 'app') return true;
  
  if (item.extension === 'exe' || (item.name && item.name.toLowerCase().endsWith('.exe'))) {
    return true;
  }
  
  if (item.type === 'file') {
    const file = item as File;
    if (!file.content) return false;
    
    try {
      const content = JSON.parse(file.content);
      return (content.type === 'app' && !!content.appId) || 
             (content.type === 'appShortcut' && !!content.appId);
    } catch {
      return false;
    }
  }
  
  return false;
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

export const getAppIdFromFile = (item: FileSystemItem): string | null => {
  if (item.type === 'app' && item.appType) {
    return item.appType;
  }
  
  if (item.extension === 'exe' || (item.name && item.name.toLowerCase().endsWith('.exe'))) {
    const appInfo = getAppInfo(item);
    if (appInfo) {
      return appInfo.id;
    }
  }
  
  if (item.type === 'file') {
    const file = item as File;
    if (!file.content) return null;
    
    try {
      const content = JSON.parse(file.content);
      if ((content.type === 'app' || content.type === 'appShortcut') && content.appId) {
        return content.appId;
      }
    } catch {
      return null;
    }
  }
  
  return null;
};

// Get the window title based on its ID and file system data
export const getWindowTitle = (windowId: string, items: Record<string, FileSystemItem>, currentPath: string): string => {
  const windowType = getWindowType(windowId);
  const contentId = getContentId(windowId);
  
  const app = APPS[windowType];
  if (app && app.windowTitle) {
    return contentId ? `${app.windowTitle} - ${contentId}` : app.windowTitle;
  }
  
  switch (windowType) {
    case 'explorer': {
      // Get the folder name for the path currently being shown
      const folder = items[contentId];
      
      if (folder && folder.type === 'folder') {
        return folder.name;
      }
      
      // Fallback to the path
      const pathParts = currentPath.split('\\');
      return pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'File Explorer';
    }
    case 'editor': {
      const file = items[contentId];
      return file ? file.name : 'Text Editor';
    }
    case 'image': {
      const file = items[contentId];
      return file ? file.name : 'Image Viewer';
    }
    case 'pdf': {
      const file = items[contentId];
      return file ? file.name : 'PDF Viewer';
    }
    case 'video': {
      const file = items[contentId];
      return file ? file.name : 'Video Player';
    }
    default:
      return 'Window';
  }
};