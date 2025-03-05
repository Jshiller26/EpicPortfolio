import { FileSystemState, Folder, File } from '../../../types/fileSystem';
import { generateUniqueFilename } from '../utils/pathUtils';

export const updatePaths = (
  id: string, 
  newParentPath: string,
  items: Record<string, Folder | File>
): Record<string, Folder | File> => {
  const updatedItems = { ...items };
  const currentItem = updatedItems[id];
  if (!currentItem) return updatedItems;
  
  const newPath = `${newParentPath}\\${currentItem.name}`;
  updatedItems[id] = {
    ...currentItem,
    path: newPath,
    modified: new Date()
  };
  
  // Recursively update children if its a folder
  if (currentItem.type === 'folder') {
    const folder = currentItem as Folder;
    folder.children.forEach(childId => {
      Object.assign(updatedItems, updatePaths(childId, newPath, updatedItems));
    });
  }
  
  return updatedItems;
};

// This function is executed when Window's internal hook needs to determine a position for the item
export interface MoveItemOptions {
  findNextPosition?: boolean;
}

export const moveItem = (
  state: FileSystemState,
  itemId: string, 
  targetFolderId: string,
  onMoveComplete?: (movedId: string) => void,
  options?: MoveItemOptions
): FileSystemState => {
  const newItems = { ...state.items };
  const item = newItems[itemId];
  const targetFolder = newItems[targetFolderId] as Folder;
  
  if (!item || !targetFolder || targetFolder.type !== 'folder') return state;
  
  // If moving to the same folder, no changes needed
  if (item.parentId === targetFolderId) {
    if (onMoveComplete) onMoveComplete(itemId);
    return state;
  }

  // Ensure the name is unique in the target folder
  const uniqueName = generateUniqueFilename(targetFolder, item.name, item.type, newItems);
  
  // Remove from old parent
  if (item.parentId) {
    const oldParent = newItems[item.parentId] as Folder;
    newItems[item.parentId] = {
      ...oldParent,
      children: oldParent.children.filter(childId => childId !== itemId),
      modified: new Date()
    } as Folder;
  }
  
  // Update item's name if it was changed for uniqueness
  if (uniqueName !== item.name) {
    newItems[itemId] = {
      ...newItems[itemId],
      name: uniqueName
    };
  }
  
  // Update paths for item and its children
  const updatedItems = updatePaths(itemId, targetFolder.path, newItems);
  
  // Update item's parent
  updatedItems[itemId] = {
    ...updatedItems[itemId],
    parentId: targetFolderId
  };

  // Add to new parent
  updatedItems[targetFolderId] = {
    ...targetFolder,
    children: [...targetFolder.children, itemId],
    modified: new Date()
  } as Folder;

  // Use options to determine how to handle the item's position
  const findNextPosition = options?.findNextPosition ?? true;

  // Call the callback if provided
  if (onMoveComplete) {
    onMoveComplete(itemId);
  }

  return { 
    ...state,
    items: updatedItems
  };
};
