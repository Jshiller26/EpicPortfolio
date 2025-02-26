import { create } from 'zustand';
import { FileSystemState, Folder, File, FileSystemItem } from '../types/fileSystem';
import initialState from './fileSystem/initialState';
import {
  createFolder,
  createFile,
  deleteItem,
  deleteItems,
  copyItem,
  moveItem,
  copyItems,
  cutItems,
  pasteItems,
  renameItem,
  setCurrentPath,
  selectItems,
  navigateToFolder,
  navigateUp,
  getItemByPath,
  getPathToItem
} from './fileSystem/operations';

export const useFileSystemStore = create<FileSystemState & {
  // Navigation operations
  setCurrentPath: (path: string) => void;
  selectItems: (items: string[]) => void;
  navigateToFolder: (folderId: string) => void;
  navigateUp: () => void;
  getItemByPath: (path: string) => FileSystemItem | null;
  getPathToItem: (itemId: string) => string | null;
  
  // Creation operations
  createFolder: (name: string, parentId: string) => void;
  createFile: (name: string, parentId: string, content?: string, size?: number) => void;
  
  // Deletion operations
  deleteItem: (itemId: string) => void;
  deleteItems: (itemIds: string[]) => void;
  
  // Copy/Move operations
  copyItem: (itemId: string, targetFolderId: string) => void;
  moveItem: (itemId: string, targetFolderId: string) => void;
  copyItems: (itemIds: string[]) => void;
  cutItems: (itemIds: string[]) => void;
  pasteItems: (targetFolderId: string) => void;
  
  // Rename operation
  renameItem: (itemId: string, newName: string) => void;
}>((set, get) => ({
  ...initialState,

  // Navigation operations
  setCurrentPath: (path) => set(state => setCurrentPath(state, path)),
  selectItems: (items) => set(state => selectItems(state, items)),
  navigateToFolder: (folderId) => set(state => navigateToFolder(state, folderId)),
  navigateUp: () => set(state => navigateUp(state)),
  getItemByPath: (path) => getItemByPath(get(), path),
  getPathToItem: (itemId) => getPathToItem(get(), itemId),
  
  // Creation operations
  createFolder: (name, parentId) => set(state => createFolder(state, name, parentId)),
  createFile: (name, parentId, content = '', size = 0) => 
    set(state => createFile(state, name, parentId, content, size)),
  
  // Deletion operations
  deleteItem: (itemId) => set(state => deleteItem(state, itemId)),
  deleteItems: (itemIds) => set(state => deleteItems(state, itemIds)),
  
  // Copy/Move operations
  copyItem: (itemId, targetFolderId) => set(state => copyItem(state, itemId, targetFolderId)),
  moveItem: (itemId, targetFolderId) => set(state => moveItem(state, itemId, targetFolderId)),
  copyItems: (itemIds) => set(state => copyItems(state, itemIds)),
  cutItems: (itemIds) => set(state => cutItems(state, itemIds)),
  pasteItems: (targetFolderId) => set(state => pasteItems(state, targetFolderId)),
  
  // Rename operation
  renameItem: (itemId, newName) => set(state => renameItem(state, itemId, newName))
}));
