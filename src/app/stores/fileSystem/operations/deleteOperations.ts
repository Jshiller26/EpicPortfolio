import { FileSystemState, Folder, FileSystemItem } from '../../../types/fileSystem';

export const collectItemsToDelete = (
  id: string,
  items: Record<string, FileSystemItem>
): string[] => {
  const item = items[id];
  if (!item) return [];
  
  // If its a folder, recursively collect all children
  const childrenToDelete: string[] = [];
  if (item.type === 'folder') {
    const folder = item as Folder;
    folder.children.forEach(childId => {
      childrenToDelete.push(...collectItemsToDelete(childId, items));
    });
  }
  
  return [...childrenToDelete, id];
};

export const deleteItem = (
  state: FileSystemState,
  itemId: string
): FileSystemState => {
  const newItems = { ...state.items };
  const item = newItems[itemId];
  if (!item) return state;

  const itemsToDelete = collectItemsToDelete(itemId, newItems);
  
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

  // Update selected items if needed
  const newSelectedItems = state.selectedItems.filter(id => !itemsToDelete.includes(id));

  return { 
    ...state,
    items: newItems,
    selectedItems: newSelectedItems
  };
};

export const deleteItems = (
  state: FileSystemState,
  itemIds: string[]
): FileSystemState => {
  let newState = { ...state };
  itemIds.forEach(id => {
    newState = deleteItem(newState, id);
  });
  return newState;
};
