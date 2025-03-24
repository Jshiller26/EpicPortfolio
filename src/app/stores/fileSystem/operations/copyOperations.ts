import { FileSystemState, Folder, File, AppItem } from '../../../types/fileSystem';
import { moveItem } from './moveOperations';
import { generateUniqueFilename } from '../utils/pathUtils';

export const copyItemAndChildren = (
  id: string, 
  targetId: string, 
  items: Record<string, Folder | File | AppItem>,
  idMap: Record<string, string> = {}
): [Record<string, Folder | File | AppItem>, string] => {
  const item = items[id];
  const targetFolder = items[targetId];
  
  if (!item || !targetFolder || targetFolder.type !== 'folder') {
    return [items, ''];
  }

  // Generate new ID for the copy
  const newId = Math.random().toString(36).substr(2, 9);
  idMap[id] = newId;
  
  // Ensure the name is unique in the target folder
  const uniqueName = generateUniqueFilename(targetFolder as Folder, item.name, item.type, items);
  
  // Create copy of the item with the unique name
  const newPath = `${targetFolder.path || ''}\\${uniqueName}`;
  const itemCopy = {
    ...JSON.parse(JSON.stringify(item)),
    id: newId,
    name: uniqueName,
    parentId: targetId,
    path: newPath,
    created: new Date(),
    modified: new Date()
  };

  if (item.type === 'file') {
    const file = item as File;
    
    if (file.name.toLowerCase().endsWith('.pdf')) {
      (itemCopy as File).originalFileName = file.originalFileName || file.name;
    }
  }

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
  
  return [
    {
      ...items,
      [newId]: itemCopy
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
    const targetFolder = newItems[targetFolderId];
    if (targetFolder.type === 'folder') {
      newItems[targetFolderId] = {
        ...targetFolder,
        children: [...(targetFolder as Folder).children, newId],
        modified: new Date()
      } as Folder;

      // Call the callback with the new ID if provided
      if (onCopyComplete) {
        setTimeout(() => {
          onCopyComplete(newId);
        }, 0);
      }
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
  targetFolderId: string,
  onPasteComplete?: (operation: 'cut' | 'copy', itemIds: Record<string, string>) => void
): FileSystemState => {
  const { clipboard } = state;
  if (!clipboard.items.length || !clipboard.operation) return state;

  const targetFolder = state.items[targetFolderId];
  if (!targetFolder || targetFolder.type !== 'folder') return state;

  let newState = { ...state };
  const resultIds: Record<string, string> = {};
  
  const operationType = clipboard.operation;
  
  if (operationType === 'cut') {
    clipboard.items.forEach(itemId => {
      resultIds[itemId] = itemId;
      
      newState = moveItem(newState, itemId, targetFolderId, (movedId) => {
        resultIds[itemId] = movedId;
      });
    });
  } else if (operationType === 'copy') {
    clipboard.items.forEach(itemId => {
      newState = copyItem(newState, itemId, targetFolderId, (newId) => {
        resultIds[itemId] = newId;
      });
    });
  }

  // Call the callback with the operation and resulting IDs
  if (onPasteComplete) {
    setTimeout(() => {
      onPasteComplete(operationType, resultIds);
    }, 0);
  }

  // Clear clipboard after paste
  return {
    ...newState,
    clipboard: { 
      items: [], 
      operation: null
    }
  };
};
