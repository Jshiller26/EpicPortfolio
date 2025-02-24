import { create } from 'zustand';
import { FileSystemState, Folder, File, FileSystemItem } from '../types/fileSystem';

// Set up initial file system
const initialState: FileSystemState = {
  items: {
    // Root desktop folder
    'desktop': {
      id: 'desktop',
      name: 'Desktop',
      type: 'folder',
      path: 'C:\\Desktop',
      created: new Date(),
      modified: new Date(),
      parentId: null,
      children: ['my-projects', 'documents', 'pictures', 'downloads', 'readme']
    } as Folder,
    
    // Desktop subfolders
    'my-projects': {
      id: 'my-projects',
      name: 'My Projects',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects',
      created: new Date(),
      modified: new Date(),
      parentId: 'desktop',
      children: ['emc', 'knights', 'pandora']
    } as Folder,
    
    'documents': {
      id: 'documents',
      name: 'Documents',
      type: 'folder',
      path: 'C:\\Desktop\\Documents',
      created: new Date(),
      modified: new Date(),
      parentId: 'desktop',
      children: ['resume',]
    } as Folder,
    
    'pictures': {
      id: 'pictures',
      name: 'Pictures',
      type: 'folder',
      path: 'C:\\Desktop\\Pictures',
      created: new Date(),
      modified: new Date(),
      parentId: 'desktop',
      children: ['screenshots']
    } as Folder,
    
    'downloads': {
      id: 'downloads',
      name: 'Downloads',
      type: 'folder',
      path: 'C:\\Desktop\\Downloads',
      created: new Date(),
      modified: new Date(),
      parentId: 'desktop',
      children: ['download-file-1', 'download-file-2']
    } as Folder,
    
    // Projects subfolders
    'emc': {
      id: 'emc',
      name: 'EMC',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects\\EMC',
      created: new Date(),
      modified: new Date(),
      parentId: 'my-projects',
      children: ['EMC-Photobooth', 'Emc-QuizGame']
    } as Folder,
    
    'knights': {
      id: 'knights',
      name: 'Knights Escape Room',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects\\Knights Escape Room',
      created: new Date(),
      modified: new Date(),
      parentId: 'my-projects',
      children: []
    } as Folder,
    
    'pandora': {
      id: 'pandora',
      name: 'Pandora Kiosk',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects\\Pandora Kiosk',
      created: new Date(),
      modified: new Date(),
      parentId: 'my-projects',
      children: []
    } as Folder,
    
    // EMC subfolder contents
    
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
  createFile: (name: string, parentId: string, content?: string, size?: number) => void;
  deleteItem: (itemId: string) => void;
  deleteItems: (itemIds: string[]) => void;
  copyItem: (itemId: string, targetFolderId: string) => void;
  moveItem: (itemId: string, targetFolderId: string) => void;
  copyItems: (itemIds: string[]) => void;
  cutItems: (itemIds: string[]) => void;
  pasteItems: (targetFolderId: string) => void;
  renameItem: (itemId: string, newName: string) => void;
  getPathToItem: (itemId: string) => string | null;
  navigateToFolder: (folderId: string) => void;
  navigateUp: () => void;
  getItemByPath: (path: string) => FileSystemItem | null;
}>((set, get) => ({
  ...initialState,

  setCurrentPath: (path) => set({ currentPath: path }),
  
  selectItems: (items) => set({ selectedItems: items }),
  
  createFolder: (name, parentId) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const parent = get().items[parentId] as Folder;
    
    if (!parent || parent.type !== 'folder') {
      console.error('Parent is not a folder');
      return;
    }
    
    const parentPath = parent.path;
    
    // Check if folder with same name already exists
    const folderExists = parent.children.some(childId => {
      const child = get().items[childId];
      return child.name.toLowerCase() === name.toLowerCase() && child.type === 'folder';
    });
    
    if (folderExists) {
      console.error('A folder with this name already exists');
      return;
    }
    
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

  createFile: (name, parentId, content = '', size = 0) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const parent = get().items[parentId] as Folder;
    
    if (!parent || parent.type !== 'folder') {
      console.error('Parent is not a folder');
      return;
    }
    
    const parentPath = parent.path;
    const extension = name.includes('.') ? name.split('.').pop()! : '';
    
    // Check if file with same name already exists
    const fileExists = parent.children.some(childId => {
      const child = get().items[childId];
      return child.name.toLowerCase() === name.toLowerCase() && child.type === 'file';
    });
    
    if (fileExists) {
      console.error('A file with this name already exists');
      return;
    }
    
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
          content,
          size: size || content.length
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
    const deleteItemAndChildren = (id: string, items: Record<string, FileSystemItem>) => {
      const item = items[id];
      if (!item) return [];
      
      // If it's a folder, recursively delete all children
      const childrenToDelete: string[] = [];
      if (item.type === 'folder') {
        const folder = item as Folder;
        folder.children.forEach(childId => {
          childrenToDelete.push(...deleteItemAndChildren(childId, items));
        });
      }
      
      return [...childrenToDelete, id];
    };
    
    set((state) => {
      const newItems = { ...state.items };
      const item = newItems[itemId];
      if (!item) return state;

      // Get all items to delete (including children)
      const itemsToDelete = deleteItemAndChildren(itemId, newItems);
      
      // Remove from parent's children
      if (item.parentId) {
        const parent = newItems[item.parentId] as Folder;
        newItems[item.parentId] = {
          ...parent,
          children: parent.children.filter(childId => childId !== itemId),
          modified: new Date()
        };
      }

      // Delete all items
      itemsToDelete.forEach(id => {
        delete newItems[id];
      });

      return { items: newItems };
    });
  },

  deleteItems: (itemIds) => {
    itemIds.forEach(id => {
      get().deleteItem(id);
    });
  },

  copyItem: (itemId, targetFolderId) => {
    const copyItemAndChildren = (
      id: string, 
      targetId: string, 
      items: Record<string, FileSystemItem>,
      idMap: Record<string, string> = {}
    ): [Record<string, FileSystemItem>, string] => {
      const item = items[id];
      const targetFolder = items[targetId] as Folder;
      
      if (!item || !targetFolder || targetFolder.type !== 'folder') {
        return [items, ''];
      }

      // Generate new ID for the copy
      const newId = Math.random().toString(36).substr(2, 9);
      idMap[id] = newId;
      
      // Create copy of the item
      const newPath = `${targetFolder.path}\\${item.name}`;
      const itemCopy = {
        ...JSON.parse(JSON.stringify(item)),
        id: newId,
        parentId: targetId,
        path: newPath,
        created: new Date(),
        modified: new Date()
      };

      // If it's a folder, copy all children
      if (item.type === 'folder') {
        const folder = item as Folder;
        (itemCopy as Folder).children = [];
        
        let newItems = {
          ...items,
          [newId]: itemCopy
        };
        
        // Copy each child
        folder.children.forEach(childId => {
          const [updatedItems, newChildId] = copyItemAndChildren(
            childId, 
            newId, 
            newItems,
            idMap
          );
          newItems = updatedItems;
          if (newChildId) {
            (newItems[newId] as Folder).children.push(newChildId);
          }
        });
        
        return [newItems, newId];
      }
      
      // For files, just return the copy
      return [
        {
          ...items,
          [newId]: itemCopy
        },
        newId
      ];
    };
    
    set((state) => {
      const [newItems, newId] = copyItemAndChildren(itemId, targetFolderId, state.items);
      
      // If copy was successful, add to target folder's children
      if (newId && newItems[targetFolderId]) {
        const targetFolder = newItems[targetFolderId] as Folder;
        newItems[targetFolderId] = {
          ...targetFolder,
          children: [...targetFolder.children, newId],
          modified: new Date()
        };
      }
      
      return { items: newItems };
    });
  },

  moveItem: (itemId, targetFolderId) => {
    set((state) => {
      const newItems = { ...state.items };
      const item = newItems[itemId];
      const targetFolder = newItems[targetFolderId] as Folder;
      
      if (!item || !targetFolder || targetFolder.type !== 'folder') return state;
      
      // Check if an item with the same name already exists in the target folder
      const nameExists = targetFolder.children.some(childId => {
        const child = newItems[childId];
        return child.name.toLowerCase() === item.name.toLowerCase() && child.type === item.type;
      });
      
      if (nameExists) {
        console.error('An item with the same name already exists in the target folder');
        return state;
      }

      // Remove from old parent
      if (item.parentId) {
        const oldParent = newItems[item.parentId] as Folder;
        newItems[item.parentId] = {
          ...oldParent,
          children: oldParent.children.filter(childId => childId !== itemId),
          modified: new Date()
        };
      }

      // Update the path for the item and all its children
      const updatePaths = (id: string, newParentPath: string) => {
        const currentItem = newItems[id];
        if (!currentItem) return;
        
        const newPath = `${newParentPath}\\${currentItem.name}`;
        newItems[id] = {
          ...currentItem,
          path: newPath,
          modified: new Date()
        };
        
        // Recursively update children if it's a folder
        if (currentItem.type === 'folder') {
          const folder = currentItem as Folder;
          folder.children.forEach(childId => {
            updatePaths(childId, newPath);
          });
        }
      };
      
      // Update paths
      updatePaths(itemId, targetFolder.path);
      
      // Update item's parent
      newItems[itemId] = {
        ...newItems[itemId],
        parentId: targetFolderId
      };

      // Add to new parent
      newItems[targetFolderId] = {
        ...targetFolder,
        children: [...targetFolder.children, itemId],
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
  },
  
  renameItem: (itemId, newName) => {
    set((state) => {
      const newItems = { ...state.items };
      const item = newItems[itemId];
      
      if (!item) return state;
      
      // Check if an item with the same name exists in the parent folder
      if (item.parentId) {
        const parent = newItems[item.parentId] as Folder;
        const nameExists = parent.children.some(childId => {
          const child = newItems[childId];
          return childId !== itemId && 
                 child.name.toLowerCase() === newName.toLowerCase() &&
                 child.type === item.type;
        });
        
        if (nameExists) {
          console.error('An item with this name already exists');
          return state;
        }
      }
      
      // Update the path for the item and all its children
      const updatePaths = (id: string, parentPath: string | null) => {
        const currentItem = newItems[id];
        if (!currentItem) return;
        
        const newPath = parentPath ? `${parentPath}\\${currentItem.name}` : currentItem.name;
        newItems[id] = {
          ...currentItem,
          path: newPath,
          modified: new Date()
        };
        
        // Recursively update children if it's a folder
        if (currentItem.type === 'folder') {
          const folder = currentItem as Folder;
          folder.children.forEach(childId => {
            updatePaths(childId, newPath);
          });
        }
      };
      
      // Get parent path
      const parentPath = item.parentId ? newItems[item.parentId].path : null;
      
      // Update item name and path
      newItems[itemId] = {
        ...item,
        name: newName,
        path: parentPath ? `${parentPath}\\${newName}` : newName,
        modified: new Date()
      };
      
      // If it's a file, update extension
      if (item.type === 'file') {
        const extension = newName.includes('.') ? newName.split('.').pop()! : '';
        (newItems[itemId] as File).extension = extension;
      }
      
      // If it's a folder, update paths for all children
      if (item.type === 'folder') {
        const folder = item as Folder;
        folder.children.forEach(childId => {
          updatePaths(childId, newItems[itemId].path);
        });
      }
      
      return { items: newItems };
    });
  },
  
  getPathToItem: (itemId) => {
    const items = get().items;
    const item = items[itemId];
    
    if (!item) return null;
    
    return item.path;
  },
  
  navigateToFolder: (folderId) => {
    const items = get().items;
    const folder = items[folderId];
    
    if (!folder || folder.type !== 'folder') {
      console.error('Item is not a folder');
      return;
    }
    
    set({ currentPath: folder.path });
  },
  
  navigateUp: () => {
    const currentPath = get().currentPath;
    const pathParts = currentPath.split('\\');
    
    if (pathParts.length <= 1) {
      return; // Already at root
    }
    
    const parentPath = pathParts.slice(0, -1).join('\\');
    set({ currentPath: parentPath });
  },
  
  getItemByPath: (path) => {
    const items = get().items;
    const item = Object.values(items).find(item => item.path === path);
    return item || null;
  }
}));