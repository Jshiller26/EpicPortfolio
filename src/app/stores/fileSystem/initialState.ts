import { FileSystemState, Folder, File } from '../../types/fileSystem';

const addOriginalFileNameToPdfs = (state: FileSystemState): FileSystemState => {
  const newItems = { ...state.items };
  
  Object.keys(newItems).forEach(key => {
    const item = newItems[key];
    if (item.type === 'file') {
      const file = item as File;
      if (file.extension === 'pdf') {
        (newItems[key] as File).originalFileName = file.name;
      }
    }
  });
  
  return {
    ...state,
    items: newItems
  };
};

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
      children: ['emc', 'knights', 'idea', 'pandora']
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
    
    // I.D.E.A. Museum folder
    'idea': {
      id: 'idea',
      name: 'I.D.E.A Museum',
      type: 'folder',
      path: 'C:\\Desktop\\My Projects\\I.D.E.A Museum',
      created: new Date(),
      modified: new Date(),
      parentId: 'my-projects',
      children: [
        'idea-pdf', 
        'idea-face-creatures', 
        'idea-finished', 
        'idea-install-1', 
        'idea-install-2', 
        'idea-music-box', 
        'idea-tree', 
        'idea-lighting', 
        'idea-sound'
      ]
    } as Folder,
    
    // I.D.E.A. Museum files
    'idea-pdf': {
      id: 'idea-pdf',
      name: 'I.D.E.A Museum.pdf',
      type: 'file',
      extension: 'pdf',
      path: 'C:\\Desktop\\My Projects\\I.D.E.A Museum\\I.D.E.A Museum.pdf',
      created: new Date(),
      modified: new Date(),
      parentId: 'idea',
      content: '/pdfs/I.D.E.A Museum.pdf',
      size: 2048,
      originalFileName: 'I.D.E.A Museum.pdf'
    } as File,
    
    'idea-face-creatures': {
      id: 'idea-face-creatures',
      name: 'ideaFaceCreatures.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\I.D.E.A Museum\\ideaFaceCreatures.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'idea',
      content: '/images/projects/idea/ideaFaceCreatures.jpg',
      size: 2850
    } as File,
    
    'idea-finished': {
      id: 'idea-finished',
      name: 'ideaFinished.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\I.D.E.A Museum\\ideaFinished.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'idea',
      content: '/images/projects/idea/ideaFinished.jpg',
      size: 3050
    } as File,
    
    'idea-install-1': {
      id: 'idea-install-1',
      name: 'ideaInstall1.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\I.D.E.A Museum\\ideaInstall1.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'idea',
      content: '/images/projects/idea/ideaInstall1.jpg',
      size: 2750
    } as File,
    
    'idea-install-2': {
      id: 'idea-install-2',
      name: 'ideaInstall2.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\I.D.E.A Museum\\ideaInstall2.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'idea',
      content: '/images/projects/idea/ideaInstall2.jpg',
      size: 2650
    } as File,
    
    'idea-music-box': {
      id: 'idea-music-box',
      name: 'ideamusicbox.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\I.D.E.A Museum\\ideamusicbox.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'idea',
      content: '/images/projects/idea/ideamusicbox.jpg',
      size: 2950
    } as File,
    
    'idea-tree': {
      id: 'idea-tree',
      name: 'ideatree.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\I.D.E.A Museum\\ideatree.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'idea',
      content: '/images/projects/idea/ideatree.jpg',
      size: 3150
    } as File,
    
    'idea-lighting': {
      id: 'idea-lighting',
      name: 'lightingScreenshot.png',
      type: 'file',
      extension: 'png',
      path: 'C:\\Desktop\\My Projects\\I.D.E.A Museum\\lightingScreenshot.png',
      created: new Date(),
      modified: new Date(),
      parentId: 'idea',
      content: '/images/projects/idea/lightingScreenshot.png',
      size: 1850
    } as File,
    
    'idea-sound': {
      id: 'idea-sound',
      name: 'soundscreenshot.png',
      type: 'file',
      extension: 'png',
      path: 'C:\\Desktop\\My Projects\\I.D.E.A Museum\\soundscreenshot.png',
      created: new Date(),
      modified: new Date(),
      parentId: 'idea',
      content: '/images/projects/idea/soundscreenshot.png',
      size: 1750
    } as File,
    
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
      size: 2048,
      originalFileName: 'Knights.pdf'
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
      size: 1756,
      originalFileName: 'KnightsPuzzleExplainer.pdf'
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
      children: ['pandora-pdf', 'pandora-image-1', 'pandora-image-2', 'pandora-video']
    } as Folder,
    
    // Pandora Kiosk files
    'pandora-pdf': {
      id: 'pandora-pdf',
      name: 'Pandora.pdf',
      type: 'file',
      extension: 'pdf',
      path: 'C:\\Desktop\\My Projects\\Pandora Kiosk\\Pandora.pdf',
      created: new Date(),
      modified: new Date(),
      parentId: 'pandora',
      content: '/pdfs/Pandora.pdf',
      size: 1845,
      originalFileName: 'Pandora.pdf'
    } as File,
    
    'pandora-image-1': {
      id: 'pandora-image-1',
      name: 'Pandora1.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\Pandora Kiosk\\Pandora1.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'pandora',
      content: '/images/projects/pandora/Pandora1.jpg',
      size: 3050
    } as File,
    
    'pandora-image-2': {
      id: 'pandora-image-2',
      name: 'Pandora2.jpg',
      type: 'file',
      extension: 'jpg',
      path: 'C:\\Desktop\\My Projects\\Pandora Kiosk\\Pandora2.jpg',
      created: new Date(),
      modified: new Date(),
      parentId: 'pandora',
      content: '/images/projects/pandora/Pandora2.jpg',
      size: 2950
    } as File,
    
    'pandora-video': {
      id: 'pandora-video',
      name: 'PandoraVid.mp4',
      type: 'file',
      extension: 'mp4',
      path: 'C:\\Desktop\\My Projects\\Pandora Kiosk\\PandoraVid.mp4',
      created: new Date(),
      modified: new Date(),
      parentId: 'pandora',
      content: '/videos/projects/pandora/PandoraVid.mp4',
      size: 28500
    } as File,
    
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
      size: 250,
      originalFileName: 'Resume.pdf'
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
      size: 1024,
      originalFileName: 'Interesting-Article.pdf'
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
      size: 2048,
      originalFileName: 'EMC BizQuiz.pdf'
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
      size: 1845,
      originalFileName: 'EMC Photobooth.pdf'
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
      size: 1024,
      originalFileName: 'EMC App Transfer Manual.pdf'
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
      size: 1356,
      originalFileName: 'EMC Change Overlay Manual.pdf'
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
export const initialStateWithPdfNames = addOriginalFileNameToPdfs(initialState);

export default initialState;