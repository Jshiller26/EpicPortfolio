import { create } from 'zustand';
import { FileSystemState, FileSystemItem } from '../types/fileSystem';
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
  createFolder: (name: string, parentId: string) => string;
  createFile: (name: string, parentId: string, content?: string, size?: number) => string;
  
  // Deletion operations
  deleteItem: (itemId: string) => void;
  deleteItems: (itemIds: string[]) => void;
  
  // Copy/Move operations
  copyItem: (itemId: string, targetFolderId: string, onCopyComplete?: (newId: string) => void) => void;
  moveItem: (itemId: string, targetFolderId: string, onMoveComplete?: (newId: string) => void) => void;
  copyItems: (itemIds: string[]) => void;
  cutItems: (itemIds: string[]) => void;
  pasteItems: (targetFolderId: string, onPasteComplete?: (operation: 'cut' | 'copy', itemIds: Record<string, string>) => void) => void;
  
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
  createFolder: (name, parentId) => {
    let folderId = '';
    set(state => {
      const newState = createFolder(state, name, parentId);
      // Find the ID of the newly created folder
      if (state.items[parentId]?.type === 'folder') {
        const parent = newState.items[parentId];
        if (parent.type === 'folder') {
          const newChildIds = parent.children.filter(
            id => !state.items[parentId].children.includes(id)
          );
          if (newChildIds.length === 1) {
            folderId = newChildIds[0];
          }
        }
      }
      return newState;
    });
    return folderId;
  },
  
  createFile: (name, parentId, content = '', size = 0) => {
    let fileId = '';
    set(state => {
      const newState = createFile(state, name, parentId, content, size);
      // Find the ID of the newly created file
      if (state.items[parentId]?.type === 'folder') {
        const parent = newState.items[parentId];
        if (parent.type === 'folder') {
          const newChildIds = parent.children.filter(
            id => !state.items[parentId].children.includes(id)
          );
          if (newChildIds.length === 1) {
            fileId = newChildIds[0];
          }
        }
      }
      return newState;
    });
    return fileId;
  },
  
  // Deletion operations
  deleteItem: (itemId) => set(state => deleteItem(state, itemId)),
  deleteItems: (itemIds) => set(state => deleteItems(state, itemIds)),
  
  // Copy/Move operations
  copyItem: (itemId, targetFolderId, onCopyComplete) => set(state => 
    copyItem(state, itemId, targetFolderId, onCopyComplete)
  ),
  moveItem: (itemId, targetFolderId, onMoveComplete) => set(state => 
    moveItem(state, itemId, targetFolderId, onMoveComplete)
  ),
  copyItems: (itemIds) => set(state => copyItems(state, itemIds)),
  cutItems: (itemIds) => set(state => cutItems(state, itemIds)),
  pasteItems: (targetFolderId, onPasteComplete) => set(state => 
    pasteItems(state, targetFolderId, onPasteComplete)
  ),
  
  // Rename operation
  renameItem: (itemId, newName) => set(state => renameItem(state, itemId, newName))
}));
