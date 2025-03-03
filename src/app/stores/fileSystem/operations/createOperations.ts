import { FileSystemState, Folder, File, FileSystemItem } from '../../../types/fileSystem';
import { joinPaths } from '../utils/pathUtils';

export const ensureUniqueName = (
  name: string,
  parentId: string,
  type: 'folder' | 'file',
  items: Record<string, FileSystemItem>
): string => {
  const parent = items[parentId] as Folder;
  if (!parent || parent.type !== 'folder') {
    return name;
  }

  let baseName = name;
  let extension = '';
  
  if (type === 'file' && name.includes('.')) {
    const lastDotIndex = name.lastIndexOf('.');
    baseName = name.substring(0, lastDotIndex);
    extension = name.substring(lastDotIndex);
  }
  
  const baseNameMatch = baseName.match(/(.*?)\s*(\(\d+\))?$/);
  if (baseNameMatch && baseNameMatch[1]) {
    baseName = baseNameMatch[1].trim();
  }
  
  let highestNumber = 0;
  parent.children.forEach(childId => {
    const child = items[childId];
    if (child.type !== type) return; 
    
    let childBaseName = child.name;
    if (type === 'file' && child.name.includes('.')) {
      childBaseName = child.name.substring(0, child.name.lastIndexOf('.'));
    }
    
    const match = childBaseName.match(new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\((\\d+)\\)$`));
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > highestNumber) {
        highestNumber = num;
      }
    } else if (childBaseName === baseName) {
      highestNumber = Math.max(highestNumber, 0);
    }
  });
  
  const originalNameExists = parent.children.some(childId => {
    const child = items[childId];
    return child.name.toLowerCase() === name.toLowerCase() && child.type === type;
  });
  
  if (!originalNameExists) {
    return name;
  }
  
  if (type === 'file' && extension) {
    return `${baseName} (${highestNumber + 1})${extension}`;
  } else {
    return `${baseName} (${highestNumber + 1})`;
  }
};

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
  
  const uniqueName = ensureUniqueName(name, parentId, 'folder', state.items);
  
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
  
  const parentPath = parent.path;
  
  const uniqueName = ensureUniqueName(name, parentId, 'file', state.items);
  const extension = uniqueName.includes('.') ? uniqueName.split('.').pop()! : '';
  
  const newItems = {
    ...state.items,
    [newId]: {
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