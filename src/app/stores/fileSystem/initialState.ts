import { FileSystemState, Folder } from '../../types/fileSystem';

// Set up initial file system structure
const initialState: FileSystemState = {
  items: {
    // Root desktop folder
    'desktop': {
      id: 'desktop',
      name: 'Desktop',
      type: 'folder',
      path: 'C:\\Desktop',
      created: new Date(),
      modified: new Date(),
      parentId: null,
      children: ['my-projects', 'documents', 'pictures', 'downloads', 'readme']
    } as Folder,
    
    // Desktop subfolders
    'my-projects': {
      id: 'my-projects',
      name: 'My Projects',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects',
      created: new Date(),
      modified: new Date(),
      parentId: 'desktop',
      children: ['emc', 'knights', 'pandora']
    } as Folder,
    
    'documents': {
      id: 'documents',
      name: 'Documents',
      type: 'folder',
      path: 'C:\\Desktop\\Documents',
      created: new Date(),
      modified: new Date(),
      parentId: 'desktop',
      children: ['resume']
    } as Folder,
    
    'pictures': {
      id: 'pictures',
      name: 'Pictures',
      type: 'folder',
      path: 'C:\\Desktop\\Pictures',
      created: new Date(),
      modified: new Date(),
      parentId: 'desktop',
      children: ['screenshots']
    } as Folder,
    
    'downloads': {
      id: 'downloads',
      name: 'Downloads',
      type: 'folder',
      path: 'C:\\Desktop\\Downloads',
      created: new Date(),
      modified: new Date(),
      parentId: 'desktop',
      children: ['download-file-1', 'download-file-2']
    } as Folder,
    
    // Projects subfolders
    'emc': {
      id: 'emc',
      name: 'EMC',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects\\EMC',
      created: new Date(),
      modified: new Date(),
      parentId: 'my-projects',
      children: ['EMC-Photobooth', 'Emc-QuizGame']
    } as Folder,
    
    'knights': {
      id: 'knights',
      name: 'Knights Escape Room',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects\\Knights Escape Room',
      created: new Date(),
      modified: new Date(),
      parentId: 'my-projects',
      children: []
    } as Folder,
    
    'pandora': {
      id: 'pandora',
      name: 'Pandora Kiosk',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects\\Pandora Kiosk',
      created: new Date(),
      modified: new Date(),
      parentId: 'my-projects',
      children: []
    } as Folder
  },
  currentPath: 'C:\\Desktop',
  selectedItems: [],
  clipboard: {
    items: [],
    operation: null
  }
};

export default initialState;
