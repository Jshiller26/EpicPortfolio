import { FileSystemState, Folder, File } from '../../types/fileSystem';

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
    } as Folder,
    
    'readme': {
      id: 'readme',
      name: 'README.txt',
      type: 'file',
      extension: 'txt',
      path: 'C:\\Desktop\\README.txt',
      created: new Date(),
      modified: new Date(),
      parentId: 'desktop',
      content: 'Hi',
      size: 100
    } as File,
    
    'resume': {
      id: 'resume',
      name: 'Resume.pdf',
      type: 'file',
      extension: 'pdf',
      path: 'C:\\Desktop\\Documents\\Resume.pdf',
      created: new Date(),
      modified: new Date(),
      parentId: 'documents',
      content: '[PDF content would be here]',
      size: 250
    } as File,
    
    'download-file-1': {
      id: 'download-file-1',
      name: 'Interesting-Article.pdf',
      type: 'file',
      extension: 'pdf',
      path: 'C:\\Desktop\\Downloads\\Interesting-Article.pdf',
      created: new Date(),
      modified: new Date(),
      parentId: 'downloads',
      content: '[PDF content would be here]',
      size: 1024
    } as File,
    
    'download-file-2': {
      id: 'download-file-2',
      name: 'Cool-Project.zip',
      type: 'file',
      extension: 'zip',
      path: 'C:\\Desktop\\Downloads\\Cool-Project.zip',
      created: new Date(),
      modified: new Date(),
      parentId: 'downloads',
      content: '[ZIP binary content]',
      size: 5120
    } as File,
    
    'screenshots': {
      id: 'screenshots',
      name: 'Screenshots',
      type: 'folder',
      path: 'C:\\Desktop\\Pictures\\Screenshots',
      created: new Date(),
      modified: new Date(),
      parentId: 'pictures',
      children: []
    } as Folder,
    
    'EMC-Photobooth': {
      id: 'EMC-Photobooth',
      name: 'EMC-Photobooth',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects\\EMC\\EMC-Photobooth',
      created: new Date(),
      modified: new Date(),
      parentId: 'emc',
      children: []
    } as Folder,
    
    'Emc-QuizGame': {
      id: 'Emc-QuizGame',
      name: 'Emc-QuizGame',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects\\EMC\\Emc-QuizGame',
      created: new Date(),
      modified: new Date(),
      parentId: 'emc',
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