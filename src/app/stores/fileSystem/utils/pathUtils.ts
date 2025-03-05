import { Folder, FileSystemItem, FileType } from '../../../types/fileSystem';

export const getParentPath = (path: string): string => {
  const pathParts = path.split('\\');
  if (pathParts.length <= 1) {
    return path; // Already at root
  }
  return pathParts.slice(0, -1).join('\\');
};

export const joinPaths = (parentPath: string, childName: string): string => {
  return `${parentPath}\\${childName}`;
};

export const checkNameConflict = (
  parent: Folder,
  name: string,
  type: FileType,
  items: Record<string, FileSystemItem>,
  excludeId?: string
): boolean => {
  return parent.children.some(childId => {
    if (excludeId && childId === excludeId) return false;
    
    const child = items[childId];
    return child.name.toLowerCase() === name.toLowerCase() && child.type === type;
  });
};

export const generateUniqueFilename = (
  parent: Folder,
  baseName: string,
  type: FileType,
  items: Record<string, FileSystemItem>
): string => {
  if (!checkNameConflict(parent, baseName, type, items)) {
    return baseName;
  }
  
  let nameWithoutExtension = baseName;
  let extension = '';
  
  if (type === 'file' && baseName.includes('.')) {
    const lastDotIndex = baseName.lastIndexOf('.');
    nameWithoutExtension = baseName.substring(0, lastDotIndex);
    extension = baseName.substring(lastDotIndex);
  }
  
  const counterRegex = /^(.*?)(?: \((\d+)\))?$/;
  const match = nameWithoutExtension.match(counterRegex);
  
  if (!match) {
    return baseName;
  }
  
  const nameBase = match[1];
  let counter = match[2] ? parseInt(match[2], 10) : 0;
  
  // Try incrementing numbers until we find a unique name
  let uniqueName = '';
  let isUnique = false;
  
  while (!isUnique) {
    counter++;
    uniqueName = type === 'file' 
      ? `${nameBase} (${counter})${extension}`
      : `${nameBase} (${counter})`;
    
    isUnique = !checkNameConflict(parent, uniqueName, type, items);
  }
  
  return uniqueName;
};

export const getPathParts = (path: string): { name: string; path: string }[] => {
  const parts = path.split('\\');
  const result: { name: string; path: string }[] = [];
  
  let currentPath = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === 0) {
      // Root drive
      currentPath = part;
    } else {
      currentPath = `${currentPath}\\${part}`;
    }
    
    result.push({
      name: part,
      path: currentPath
    });
  }
  
  return result;
};

export const formatFileSize = (size?: number): string => {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const getItemTypeString = (item: FileSystemItem): string => {
  if (item.type === 'folder') {
    return 'File folder';
  } else if (item.type === 'app') {
    return 'Application';
  } else {
    const extension = item.name.includes('.') ? item.name.split('.').pop() : '';
    if (extension) {
      return `${extension.toUpperCase()} File`;
    }
    return 'File';
  }
};