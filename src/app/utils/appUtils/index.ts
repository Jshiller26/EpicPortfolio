import { FileSystemItem, File, Folder } from '@/app/types/fileSystem';
import { getAppInfo } from '@/app/config/appConfig';
import { useWindowStore } from '@/app/stores/windowStore';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';

export const isExeFile = (item: FileSystemItem): boolean => {
  if (item.extension === 'exe' || item.name.toLowerCase().endsWith('.exe')) {
    return true;
  }
  
  if ('appType' in item) {
    return true;
  }
  
  return false;
};

export const openItem = (
  item: FileSystemItem, 
  onOpenWindow?: (windowId: string) => void
): boolean => {
  if (item.type === 'folder' && (item as Folder).isPasswordProtected) {
    const fileSystem = useFileSystemStore.getState();
    if (!fileSystem.isUnlocked(item.id)) {
      return false;
    }
  }
  
  if (isExeFile(item)) {
    const appInfo = getAppInfo(item);
    
    if (appInfo) {
      if (onOpenWindow) {
        onOpenWindow(appInfo.id);
      } else {
        useWindowStore.getState().openWindow(appInfo.id);
      }
      return true;
    }
  }
  
  // Handle folders
  if (item.type === 'folder') {
    const windowId = `explorer-${item.id}`;
    if (onOpenWindow) {
      onOpenWindow(windowId);
    } else {
      useWindowStore.getState().openWindow(windowId);
    }
    return true;
  }
  
  // Handle text files
  if (item.type === 'file') {
    const file = item as File;
    const extension = file.extension?.toLowerCase() || '';
    
    const textExtensions = ['txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'json', 'yml', 'yaml', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'php', 'rb', 'swift', 'go', 'rs', 'sql', 'xml', 'sh', 'bat', 'ps1'];
    
    if (textExtensions.includes(extension)) {
      const windowId = `editor-${item.id}`;
      if (onOpenWindow) {
        onOpenWindow(windowId);
      } else {
        useWindowStore.getState().openWindow(windowId);
      }
      return true;
    }
    
    // Image file extensions
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    
    if (imageExtensions.includes(extension)) {
      const windowId = `image-${item.id}`;
      if (onOpenWindow) {
        onOpenWindow(windowId);
      } else {
        useWindowStore.getState().openWindow(windowId);
      }
      return true;
    }
    
    // PDF files
    if (extension === 'pdf') {
      const windowId = `pdf-${item.id}`;
      if (onOpenWindow) {
        onOpenWindow(windowId);
      } else {
        useWindowStore.getState().openWindow(windowId);
      }
      return true;
    }
    
    // Video files
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'mkv', 'flv'];
    
    if (videoExtensions.includes(extension)) {
      const windowId = `video-${item.id}`;
      if (onOpenWindow) {
        onOpenWindow(windowId);
      } else {
        useWindowStore.getState().openWindow(windowId);
      }
      return true;
    }
    
    // Game ROM files
    const gameExtensions = ['gb', 'gbc', 'gba', 'nes', 'snes', 'smc', 'z64', 'n64', 'nds'];
    
    if (gameExtensions.includes(extension)) {
      const romName = file.name.substring(0, file.name.lastIndexOf('.'));
      const windowId = `gameboy-${romName}`;
      if (onOpenWindow) {
        onOpenWindow(windowId);
      } else {
        useWindowStore.getState().openWindow(windowId);
      }
      return true;
    }
  }
  
  return false;
};

export const getInitialRenameName = (item: FileSystemItem): string => {
  if (item.extension || (item.name && item.name.includes('.'))) {
    const lastDotIndex = item.name.lastIndexOf('.');
    if (lastDotIndex > 0) {
      return item.name.substring(0, lastDotIndex);
    }
  }
  
  return item.name;
};

export const getFinalRenameName = (item: FileSystemItem, newName: string): string => {
  // Truncate name to 15 characters if it's longer
  const truncatedName = newName.length > 15 ? newName.substring(0, 15) : newName;
  
  if (item.extension) {
    return `${truncatedName}.${item.extension}`;
  } else if (item.name && item.name.includes('.')) {
    const extension = item.name.substring(item.name.lastIndexOf('.') + 1);
    return `${truncatedName}.${extension}`;
  }
  
  return truncatedName;
};