import { FileSystemState, Folder, File } from '../../../types/fileSystem';
import { moveItem } from './moveOperations';
import { ensureUniqueName } from './createOperations';

export const copyItemAndChildren = (
  id: string, 
  targetId: string, 
  items: Record<string, Folder | File>,
  idMap: Record<string, string> = {}
): [Record<string, Folder | File>, string] => {
  const item = items[id];
  const targetFolder = items[targetId] as Folder;
  
  if (!item || !targetFolder || targetFolder.type !== 'folder') {
    return [items, ''];
  }

  // Generate new ID for the copy
  const newId = Math.random().toString(36).substr(2, 9);
  idMap[id] = newId;
  
  // Ensure the name is unique in the target folder
  const uniqueName = ensureUniqueName(item.name, targetId, item.type, items);
  
  // Create copy of the item with the unique name
  const newPath = `${targetFolder.path}\\${uniqueName}`;
  const itemCopy = {
    ...JSON.parse(JSON.stringify(item)),
    id: newId,
    name: uniqueName,
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
      [newId]: itemCopy as Folder | File
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
  
  // For files just return the copy
  return [
    {
      ...items,
      [newId]: itemCopy as File
    },
    newId
  ];
};

export const copyItem = (
  state: FileSystemState,
  itemId: string, 
  targetFolderId: string,
  onCopyComplete?: (newId: string) => void
): FileSystemState => {
  const [newItems, newId] = copyItemAndChildren(itemId, targetFolderId, state.items);
  
  // If copy was successful, add to target folder's children
  if (newId && newItems[targetFolderId]) {
    const targetFolder = newItems[targetFolderId] as Folder;
    newItems[targetFolderId] = {
      ...targetFolder,
      children: [...targetFolder.children, newId],
      modified: new Date()
    } as Folder;

    // Call the callback with the new ID if provided
    if (onCopyComplete) {
      onCopyComplete(newId);
    }
  }
  
  return { 
    ...state,
    items: newItems
  };
};

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