import { create } from 'zustand';
import { FileSystemState, FileSystemItem, Folder, File } from '../types/fileSystem';

const initialState: FileSystemState = {
  items: {
    'desktop': {
      id: 'desktop',
      name: 'Desktop',
      type: 'folder',
      path: 'C:\\Desktop',
      created: new Date(),
      modified: new Date(),
      parentId: null,
      children: ['my-projects']
    },
    'my-projects': {
      id: 'my-projects',
      name: 'My Projects',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects',
      created: new Date(),
      modified: new Date(),
      parentId: 'desktop',
      children: []
    }
  },
  currentPath: 'C:\\Desktop',
  selectedItems: [],
  clipboard: {
    items: [],
    operation: null
  }
};

export const useFileSystemStore = create<FileSystemState & {
  setCurrentPath: (path: string) => void;
  selectItems: (items: string[]) => void;
  createFolder: (name: string, parentId: string) => void;
  createFile: (name: string, parentId: string, content?: string) => void;
  deleteItems: (itemIds: string[]) => void;
  copyItems: (itemIds: string[]) => void;
  cutItems: (itemIds: string[]) => void;
  pasteItems: (targetFolderId: string) => void;
}>((set, get) => ({
  ...initialState,

  setCurrentPath: (path) => set({ currentPath: path }),
  
  selectItems: (items) => set({ selectedItems: items }),
  
  createFolder: (name, parentId) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const parent = get().items[parentId] as Folder;
    const parentPath = parent.path;
    
    set((state) => ({
      items: {
        ...state.items,
        [newId]: {
          id: newId,
          name,
          type: 'folder',
          path: `${parentPath}\\${name}`,
          created: new Date(),
          modified: new Date(),
          parentId,
          children: []
        },
        [parentId]: {
          ...parent,
          children: [...parent.children, newId],
          modified: new Date()
        }
      }
    }));
  },

  createFile: (name, parentId, content = '') => {
    const newId = Math.random().toString(36).substr(2, 9);
    const parent = get().items[parentId] as Folder;
    const parentPath = parent.path;
    const extension = name.includes('.') ? name.split('.').pop()! : '';
    
    set((state) => ({
      items: {
        ...state.items,
        [newId]: {
          id: newId,
          name,
          type: 'file',
          path: `${parentPath}\\${name}`,
          created: new Date(),
          modified: new Date(),
          parentId,
          extension,
          content
        },
        [parentId]: {
          ...parent,
          children: [...parent.children, newId],
          modified: new Date()
        }
      }
    }));
  },

  deleteItems: (itemIds) => {
    set((state) => {
      const newItems = { ...state.items };
      
      itemIds.forEach(id => {
        const item = newItems[id];
        if (!item) return;

        // Remove from parent's children
        if (item.parentId) {
          const parent = newItems[item.parentId] as Folder;
          newItems[item.parentId] = {
            ...parent,
            children: parent.children.filter(childId => childId !== id),
            modified: new Date()
          };
        }

        // Delete the item
        delete newItems[id];
      });

      return { items: newItems };
    });
  },

  copyItems: (itemIds) => set({ clipboard: { items: itemIds, operation: 'copy' } }),
  
  cutItems: (itemIds) => set({ clipboard: { items: itemIds, operation: 'cut' } }),
  
  pasteItems: (targetFolderId) => {
    const { clipboard, items } = get();
    if (!clipboard.items.length || !clipboard.operation) return;

    // how do we paste
  }
}));