import { useFileSystemStore } from '@/app/stores/fileSystemStore';

export const PROTECTED_ITEMS: string[] = []; 

export const isProtectedItem = (itemId: string): boolean => {
  return PROTECTED_ITEMS.includes(itemId);
};

export const isSystemProtected = (itemId: string): boolean => {
  return PROTECTED_ITEMS.includes(itemId);
};

export const isPasswordProtected = (itemId: string): boolean => {
  const fileSystem = useFileSystemStore.getState();
  const item = fileSystem.items[itemId];
  
  if (!item) return false;
  
  return item.type === 'folder' && item.isPasswordProtected === true;
};

export const canOpenItem = (itemId: string): boolean => {
  const fileSystem = useFileSystemStore.getState();
  const item = fileSystem.items[itemId];
  
  if (!item) return true;
  
  if (item.type === 'folder' && item.isPasswordProtected === true) {
    return fileSystem.isUnlocked(itemId);
  }
  
  return true;
};