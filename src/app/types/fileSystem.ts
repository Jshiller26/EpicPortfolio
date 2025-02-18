export type FileType = 'file' | 'folder';

// Base interface for both files and folders
export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  path: string;
  created: Date;
  modified: Date;
  size?: number;
  parentId: string | null;
}

// Interface for folder items
export interface Folder extends FileSystemItem {
  type: 'folder';
  children: string[]; // Array of child item IDs
}

// Interface for file items
export interface File extends FileSystemItem {
  type: 'file';
  extension: string;
  content: string;
}

export type FileSystemState = {
  items: { [key: string]: Folder | File };
  currentPath: string;
  selectedItems: string[];
  clipboard: {
    items: string[];
    operation: 'copy' | 'cut' | null;
  };
};