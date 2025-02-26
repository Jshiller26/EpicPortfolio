import { FileSystemState, Folder, FileSystemItem } from '../../../types/fileSystem';
import { checkNameConflict } from '../utils/pathUtils';

export const updatePaths = (
  id: string, 
  newParentPath: string,
  items: Record<string, FileSystemItem>
): Record<string, FileSystemItem> => {
  const updatedItems = { ...items };
  const currentItem = updatedItems[id];
  if (!currentItem) return updatedItems;
  
  const newPath = `${newParentPath}\\${currentItem.name}`;
  updatedItems[id] = {
    ...currentItem,
    path: newPath,
    modified: new Date()
  };
  
  // Recursively update children if it's a folder
  if (currentItem.type === 'folder') {
    const folder = currentItem as Folder;
    folder.children.forEach(childId => {
      Object.assign(updatedItems, updatePaths(childId, newPath, updatedItems));
    });
  }
  
  return updatedItems;
};

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
  if (checkNameConflict(targetFolder, item.name, item.type, newItems)) {
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
  };

  return { 
    ...state,
    items: updatedItems
  };
};
