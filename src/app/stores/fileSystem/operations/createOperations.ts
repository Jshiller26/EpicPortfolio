import { FileSystemState, Folder, File } from '../../../types/fileSystem';
import { checkNameConflict, joinPaths } from '../utils/pathUtils';

export const createFolder = (
  state: FileSystemState,
  name: string,
  parentId: string
): FileSystemState => {
  const newId = Math.random().toString(36).substr(2, 9);
  const parent = state.items[parentId] as Folder;
  
  if (!parent || parent.type !== 'folder') {
    console.error('Parent is not a folder');
    return state;
  }
  
  const parentPath = parent.path;
  
  // Check if folder with same name already exists
  if (checkNameConflict(parent, name, 'folder', state.items)) {
    console.error('A folder with this name already exists');
    return state;
  }
  
  const newItems = {
    ...state.items,
    [newId]: {
      id: newId,
      name,
      type: 'folder' as const,
      path: joinPaths(parentPath, name),
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
  };
  
  return {
    ...state,
    items: newItems
  };
};

export const createFile = (
  state: FileSystemState,
  name: string,
  parentId: string,
  content = '',
  size = 0
): FileSystemState => {
  const newId = Math.random().toString(36).substr(2, 9);
  const parent = state.items[parentId] as Folder;
  
  if (!parent || parent.type !== 'folder') {
    console.error('Parent is not a folder');
    return state;
  }
  
  const parentPath = parent.path;
  const extension = name.includes('.') ? name.split('.').pop()! : '';
  
  // Check if file with same name already exists
  if (checkNameConflict(parent, name, 'file', state.items)) {
    console.error('A file with this name already exists');
    return state;
  }
  
  const newItems = {
    ...state.items,
    [newId]: {
      id: newId,
      name,
      type: 'file' as const,
      path: joinPaths(parentPath, name),
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
  };
  
  return {
    ...state,
    items: newItems
  };
};
