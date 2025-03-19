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
      children: ['emc-bizquiz-pdf', 'emc-photobooth-pdf', 'emc-other-files']
    } as Folder,
    
    'knights': {
      id: 'knights',
      name: 'Knights Escape Room',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects\\Knights Escape Room',
      created: new Date(),
      modified: new Date(),
      parentId: 'my-projects',
      children: ['knights-pdf', 'knights-puzzle-explainer', 'knights-image-1', 'knights-image-2', 'knights-demo-video']
    } as Folder,
    
    // Knights Escape Room files
    'knights-pdf': {
      id: 'knights-pdf',
      name: 'Knights.pdf',
      type: 'file',
      extension: 'pdf',
      path: 'C:\\Desktop\\My Projects\\Knights Escape Room\\Knights.pdf',
      created: new Date(),
      modified: new Date(),
      parentId: 'knights',
      content: '/pdfs/Knights.pdf',
      size: 2048
    } as File,
    
    'knights-puzzle-explainer': {
      id: 'knights-puzzle-explainer',
      name: 'KnightsPuzzleExplainer.pdf',
      type: 'file',
      extension: 'pdf',
      path: 'C:\\Desktop\\My Projects\\Knights Escape Room\\KnightsPuzzleExplainer.pdf',
      created: new Date(),
      modified: new Date(),
      parentId: 'knights',
      content: '/pdfs/KnightsPuzzleExplainer.pdf',
      size: 1756
    } as File,
    
    'knights-image-1': {
      id: 'knights-image-1',
      name: 'knights1.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\Knights Escape Room\\knights1.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'knights',
      content: '/images/projects/knights/knights1.jpg',
      size: 3150
    } as File,
    
    'knights-image-2': {
      id: 'knights-image-2',
      name: 'knights2.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\Knights Escape Room\\knights2.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'knights',
      content: '/images/projects/knights/knights2.jpg',
      size: 2950
    } as File,
    
    'knights-demo-video': {
      id: 'knights-demo-video',
      name: 'KnightsDemoVid.mp4',
      type: 'file',
      extension: 'mp4',
      path: 'C:\\Desktop\\My Projects\\Knights Escape Room\\KnightsDemoVid.mp4',
      created: new Date(),
      modified: new Date(),
      parentId: 'knights',
      content: '/videos/projects/knights/KnightsDemoVid.mp4',
      size: 25600
    } as File,
    
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
    
    // EMC folder
    'emc-bizquiz-pdf': {
      id: 'emc-bizquiz-pdf',
      name: 'EMC BizQuiz.pdf',
      type: 'file',
      extension: 'pdf',
      path: 'C:\\Desktop\\My Projects\\EMC\\EMC BizQuiz.pdf',
      created: new Date(),
      modified: new Date(),
      parentId: 'emc',
      content: '/pdfs/EMC BizQuiz.pdf',
      size: 2048
    } as File,
    
    'emc-photobooth-pdf': {
      id: 'emc-photobooth-pdf',
      name: 'EMC Photobooth.pdf',
      type: 'file',
      extension: 'pdf',
      path: 'C:\\Desktop\\My Projects\\EMC\\EMC Photobooth.pdf',
      created: new Date(),
      modified: new Date(),
      parentId: 'emc',
      content: '/pdfs/EMC Photobooth.pdf',
      size: 1845
    } as File,
    
    // Other Files folder
    'emc-other-files': {
      id: 'emc-other-files',
      name: 'Other Files',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects\\EMC\\Other Files',
      created: new Date(),
      modified: new Date(),
      parentId: 'emc',
      children: ['app-transfer-manual', 'change-overlay-manual', 'emc-image-1', 'emc-image-2', 'emc-image-3']
    } as Folder,
    
    // Other Files contentsS
    'app-transfer-manual': {
      id: 'app-transfer-manual',
      name: 'EMC App Transfer Manual.pdf',
      type: 'file',
      extension: 'pdf',
      path: 'C:\\Desktop\\My Projects\\EMC\\Other Files\\App Transfer Manual.pdf',
      created: new Date(),
      modified: new Date(),
      parentId: 'emc-other-files',
      content: '/pdfs/Emc App Transfer Manual.pdf',
      size: 1024
    } as File,
    
    'change-overlay-manual': {
      id: 'change-overlay-manual',
      name: 'EMC Change Overlay Manual.pdf',
      type: 'file',
      extension: 'pdf',
      path: 'C:\\Desktop\\My Projects\\EMC\\Other Files\\Change Overlay Manual.pdf',
      created: new Date(),
      modified: new Date(),
      parentId: 'emc-other-files',
      content: '/pdfs/Emc Change Overlay Manual.pdf',
      size: 1356
    } as File,
    
    'emc-image-1': {
      id: 'emc-image-1',
      name: 'emc1.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\EMC\\Other Files\\emc1.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'emc-other-files',
      content: '/images/projects/emc/emc1.jpg',
      size: 2450
    } as File,
    
    'emc-image-2': {
      id: 'emc-image-2',
      name: 'emc2.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\EMC\\Other Files\\emc2.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'emc-other-files',
      content: '/images/projects/emc/emc2.jpg',
      size: 3240
    } as File,
    
    'emc-image-3': {
      id: 'emc-image-3',
      name: 'emc3.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\EMC\\Other Files\\emc3.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'emc-other-files',
      content: '/images/projects/emc/emc3.jpg',
      size: 1875
    } as File
  },
  currentPath: 'C:\\Desktop',
  selectedItems: [],
  clipboard: {
    items: [],
    operation: null
  }
};

export default initialState;