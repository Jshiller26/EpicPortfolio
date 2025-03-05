import { FileSystemState, Folder, File, FileSystemItem } from '../../../types/fileSystem';
import { checkNameConflict, generateUniqueFilename } from '../utils/pathUtils';

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
  
  let finalName = newName;
  if (item.parentId) {
    const parent = newItems[item.parentId] as Folder;
    if (checkNameConflict(parent, newName, item.type, newItems, itemId)) {
      finalName = generateUniqueFilename(parent, newName, item.type, newItems);
    }
  }
  
  // Get parent path
  const parentPath = item.parentId ? newItems[item.parentId].path : null;
  
  // Update item name and path
  newItems[itemId] = {
    ...item,
    name: finalName,
    path: parentPath ? `${parentPath}\\${finalName}` : finalName,
    modified: new Date()
  };
  
  // If it's a file, update extension
  if (item.type === 'file') {
    const extension = finalName.includes('.') ? finalName.split('.').pop()! : '';
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