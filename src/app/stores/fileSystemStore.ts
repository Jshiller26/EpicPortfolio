import { create } from 'zustand';
import { FileSystemState, Folder, File } from '../types/fileSystem';

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
    } as Folder,
    'my-projects': {
      id: 'my-projects',
      name: 'My Projects',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects',
      created: new Date(),
      modified: new Date(),
      parentId: 'desktop',
      children: []
    } as Folder
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
  deleteItem: (itemId: string) => void;
  deleteItems: (itemIds: string[]) => void;
  copyItem: (itemId: string, targetFolderId: string) => void;
  moveItem: (itemId: string, targetFolderId: string) => void;
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
          type: 'folder' as const,
          path: `${parentPath}\\${name}`,
          created: new Date(),
          modified: new Date(),
          parentId,
          children: []
        } as Folder,
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
          type: 'file' as const,
          path: `${parentPath}\\${name}`,
          created: new Date(),
          modified: new Date(),
          parentId,
          extension,
          content
        } as File,
        [parentId]: {
          ...parent,
          children: [...parent.children, newId],
          modified: new Date()
        }
      }
    }));
  },

  deleteItem: (itemId) => {
    set((state) => {
      const newItems = { ...state.items };
      const item = newItems[itemId];
      if (!item) return state;

      // Remove from parent's children
      if (item.parentId) {
        const parent = newItems[item.parentId] as Folder;
        newItems[item.parentId] = {
          ...parent,
          children: parent.children.filter(childId => childId !== itemId),
          modified: new Date()
        };
      }

      // Delete the item
      delete newItems[itemId];

      return { items: newItems };
    });
  },

  deleteItems: (itemIds) => {
    set((state) => {
      const newItems = { ...state.items };
      
      itemIds.forEach(id => {
        const item = newItems[id];
        if (!item) return;

        // Remove from parents children
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

  copyItem: (itemId, targetFolderId) => {
    set((state) => {
      const newItems = { ...state.items };
      const item = newItems[itemId];
      const targetFolder = newItems[targetFolderId] as Folder;
      
      if (!item || !targetFolder || targetFolder.type !== 'folder') return state;

      // Generate new ID for the copy
      const newId = Math.random().toString(36).substr(2, 9);

      // Create copy of the item
      const itemCopy = {
        ...item,
        id: newId,
        parentId: targetFolderId,
        path: `${targetFolder.path}\\${item.name}`,
        created: new Date(),
        modified: new Date()
      };

      // If it's a folder, we need to recursively copy its children
      if (item.type === 'folder') {
        (itemCopy as Folder).children = [];
      }

      // Add to new parent
      newItems[targetFolderId] = {
        ...targetFolder,
        children: [...targetFolder.children, newId],
        modified: new Date()
      };

      // Add the copy to items
      newItems[newId] = itemCopy;

      return { items: newItems };
    });
  },

  moveItem: (itemId, targetFolderId) => {
    set((state) => {
      const newItems = { ...state.items };
      const item = newItems[itemId];
      const targetFolder = newItems[targetFolderId] as Folder;
      
      if (!item || !targetFolder || targetFolder.type !== 'folder') return state;

      // Remove from old parent
      if (item.parentId) {
        const oldParent = newItems[item.parentId] as Folder;
        newItems[item.parentId] = {
          ...oldParent,
          children: oldParent.children.filter(childId => childId !== itemId),
          modified: new Date()
        };
      }

      // Add to new parent
      newItems[targetFolderId] = {
        ...targetFolder,
        children: [...targetFolder.children, itemId],
        modified: new Date()
      };

      // Update item's parent and path
      newItems[itemId] = {
        ...item,
        parentId: targetFolderId,
        path: `${targetFolder.path}\\${item.name}`,
        modified: new Date()
      };

      return { items: newItems };
    });
  },

  copyItems: (itemIds) => set({ clipboard: { items: itemIds, operation: 'copy' } }),
  
  cutItems: (itemIds) => set({ clipboard: { items: itemIds, operation: 'cut' } }),
  
  pasteItems: (targetFolderId) => {
    const { clipboard, items } = get();
    if (!clipboard.items.length || !clipboard.operation) return;

    const targetFolder = items[targetFolderId] as Folder;
    if (!targetFolder || targetFolder.type !== 'folder') return;

    if (clipboard.operation === 'cut') {
      clipboard.items.forEach(itemId => {
        get().moveItem(itemId, targetFolderId);
      });
    } else if (clipboard.operation === 'copy') {
      clipboard.items.forEach(itemId => {
        get().copyItem(itemId, targetFolderId);
      });
    }

    // Clear clipboard after paste
    set({ clipboard: { items: [], operation: null } });
  }
}));