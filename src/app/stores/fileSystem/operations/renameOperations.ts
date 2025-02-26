import { FileSystemState, Folder, File, FileSystemItem } from '../../../types/fileSystem';
import { checkNameConflict } from '../utils/pathUtils';

export const updatePathsAfterRename = (
  id: string, 
  parentPath: string | null,
  items: Record<string, FileSystemItem>
): Record<string, FileSystemItem> => {
  const updatedItems = { ...items };
  const currentItem = updatedItems[id];
  if (!currentItem) return updatedItems;
  
  const newPath = parentPath ? `${parentPath}\\${currentItem.name}` : currentItem.name;
  updatedItems[id] = {
    ...currentItem,
    path: newPath,
    modified: new Date()
  };
  
  // Recursively update children if it's a folder
  if (currentItem.type === 'folder') {
    const folder = currentItem as Folder;
    folder.children.forEach(childId => {
      Object.assign(updatedItems, updatePathsAfterRename(childId, newPath, updatedItems));
    });
  }
  
  return updatedItems;
};

export const renameItem = (
  state: FileSystemState,
  itemId: string, 
  newName: string
): FileSystemState => {
  const newItems = { ...state.items };
  const item = newItems[itemId];
  
  if (!item) return state;
  
  // Check if an item with the same name exists in the parent folder
  if (item.parentId) {
    const parent = newItems[item.parentId] as Folder;
    if (checkNameConflict(parent, newName, item.type, newItems, itemId)) {
      console.error('An item with this name already exists');
      return state;
    }
  }
  
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
    const updatedItems = updatePathsAfterRename(itemId, parentPath, newItems);
    Object.assign(newItems, updatedItems);
  }
  
  return { 
    ...state,
    items: newItems
  };
};
