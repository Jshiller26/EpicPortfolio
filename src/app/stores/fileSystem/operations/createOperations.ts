import { FileSystemState, Folder, File } from '../../../types/fileSystem';
import { joinPaths, generateUniqueFilename } from '../utils/pathUtils';

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
  
  const parentPath = parent.path || '';
  
  // Generate a unique name
  const uniqueName = generateUniqueFilename(parent, name, 'folder', state.items);
  
  const newItems = {
    ...state.items,
    [newId]: {
      id: newId,
      name: uniqueName,
      type: 'folder' as const,
      path: joinPaths(parentPath, uniqueName),
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
  
  const parentPath = parent.path || '';
  const uniqueName = generateUniqueFilename(parent, name, 'file', state.items);
  const extension = uniqueName.includes('.') ? uniqueName.split('.').pop()! : '';
  
  const isPdf = uniqueName.toLowerCase().endsWith('.pdf');
  
  const newFile: File = {
    id: newId,
    name: uniqueName,
    type: 'file' as const,
    path: joinPaths(parentPath, uniqueName),
    created: new Date(),
    modified: new Date(),
    parentId,
    extension,
    content,
    size: size || content.length
  };
  
  if (isPdf) {
    newFile.originalFileName = uniqueName;
  }
  
  const newItems = {
    ...state.items,
    [newId]: newFile,
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