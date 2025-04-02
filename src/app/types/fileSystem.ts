export type FileType = 'file' | 'folder' | 'app';

// Base interface for both files and folders
export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  createdAt?: string;
  updatedAt?: string;
  path?: string;
  created?: Date;
  modified?: Date;
  size?: number;
  
  // App-specific properties
  appType?: string;
  iconPath?: string;
  windowTitle?: string;
  windowComponent?: string;
}

// Interface for folder items
export interface Folder extends FileSystemItem {
  type: 'folder';
  children: string[]; // Array of child item IDs
}

// Interface for file items
export interface File extends FileSystemItem {
  type: 'file';
  extension?: string;
  content: string;
  originalFileName?: string; // Added to track the original filename for pdfs
}

// Interface for app items
export interface AppItem extends FileSystemItem {
  type: 'app';
  appType: string;
  iconPath: string;
}

export type FileSystemState = {
  items: { [key: string]: Folder | File | AppItem };
  currentPath: string;
  selectedItems: string[];
  clipboard: {
    items: string[];
    operation: 'copy' | 'cut' | null;
  };
};