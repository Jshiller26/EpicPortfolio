import { FileSystemState, Folder, FileSystemItem } from '../../../types/fileSystem';

/**
 * Recursively copy an item and all its children
 */
export const copyItemAndChildren = (
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

/**
 * Copy an item to a target folder
 */
export const copyItem = (
  state: FileSystemState,
  itemId: string, 
  targetFolderId: string
): FileSystemState => {
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
  
  return { 
    ...state,
    items: newItems
  };
};

/**
 * Copy multiple items to clipboard
 */
export const copyItems = (
  state: FileSystemState,
  itemIds: string[]
): FileSystemState => {
  return {
    ...state,
    clipboard: { 
      items: itemIds, 
      operation: 'copy' 
    }
  };
};

/**
 * Cut multiple items to clipboard
 */
export const cutItems = (
  state: FileSystemState,
  itemIds: string[]
): FileSystemState => {
  return {
    ...state,
    clipboard: { 
      items: itemIds, 
      operation: 'cut' 
    }
  };
};

/**
 * Paste items from clipboard to target folder
 */
export const pasteItems = (
  state: FileSystemState,
  targetFolderId: string
): FileSystemState => {
  const { clipboard } = state;
  if (!clipboard.items.length || !clipboard.operation) return state;

  const targetFolder = state.items[targetFolderId] as Folder;
  if (!targetFolder || targetFolder.type !== 'folder') return state;

  let newState = { ...state };
  
  if (clipboard.operation === 'cut') {
    clipboard.items.forEach(itemId => {
      newState = moveItem(newState, itemId, targetFolderId);
    });
  } else if (clipboard.operation === 'copy') {
    clipboard.items.forEach(itemId => {
      newState = copyItem(newState, itemId, targetFolderId);
    });
  }

  // Clear clipboard after paste
  return {
    ...newState,
    clipboard: { items: [], operation: null }
  };
};

/**
 * Move an item to a new folder
 * (Imported to avoid circular dependencies)
 */
export const moveItem = (
  state: FileSystemState,
  itemId: string, 
  targetFolderId: string
): FileSystemState => {
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

  return { 
    ...state,
    items: newItems
  };
};
