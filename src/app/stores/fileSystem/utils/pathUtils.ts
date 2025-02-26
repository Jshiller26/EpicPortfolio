import { Folder, FileSystemItem } from '../../../types/fileSystem';

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
  type: 'file' | 'folder',
  items: Record<string, FileSystemItem>,
  excludeId?: string
): boolean => {
  return parent.children.some(childId => {
    if (excludeId && childId === excludeId) return false;
    
    const child = items[childId];
    return child.name.toLowerCase() === name.toLowerCase() && child.type === type;
  });
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
  } else {
    const extension = item.name.includes('.') ? item.name.split('.').pop() : '';
    if (extension) {
      return `${extension.toUpperCase()} File`;
    }
    return 'File';
  }
};
