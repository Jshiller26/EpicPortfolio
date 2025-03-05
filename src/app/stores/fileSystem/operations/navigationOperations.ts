import { FileSystemState, FileSystemItem } from '../../../types/fileSystem';

export const setCurrentPath = (
  state: FileSystemState,
  path: string
): FileSystemState => {
  return {
    ...state,
    currentPath: path
  };
};

export const selectItems = (
  state: FileSystemState,
  items: string[]
): FileSystemState => {
  return {
    ...state,
    selectedItems: items
  };
};

export const navigateToFolder = (
  state: FileSystemState,
  folderId: string
): FileSystemState => {
  const folder = state.items[folderId];
  
  if (!folder || folder.type !== 'folder') {
    console.error('Item is not a folder');
    return state;
  }
  
  if (!folder.path) {
    console.error('Folder path is undefined');
    return state;
  }
  
  return {
    ...state,
    currentPath: folder.path
  };
};

export const navigateUp = (
  state: FileSystemState
): FileSystemState => {
  const currentPath = state.currentPath;
  const pathParts = currentPath.split('\\');
  
  if (pathParts.length <= 1) {
    return state;
  }
  
  const parentPath = pathParts.slice(0, -1).join('\\');
  return {
    ...state,
    currentPath: parentPath
  };
};

export const getItemByPath = (
  state: FileSystemState,
  path: string
): FileSystemItem | null => {
  const item = Object.values(state.items).find(item => item.path === path);
  return item || null;
};

export const getPathToItem = (
  state: FileSystemState,
  itemId: string
): string | null => {
  const item = state.items[itemId];
  
  if (!item) return null;
  
  return item.path || null;
};