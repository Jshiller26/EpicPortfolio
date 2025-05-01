import { FileSystemItem, File } from '@/app/types/fileSystem';

// Type for app configuration
export interface AppConfig {
  id: string;
  name: string;
  iconPath: string;
  windowTitle?: string;
  windowComponent?: string;
  description?: string;
}

export const createAppItem = (app: AppConfig): File => {
  const fileName = `${app.name}.exe`;
    
  return {
    id: app.id,
    name: fileName,
    type: 'file',
    extension: 'exe',
    parentId: 'desktop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: JSON.stringify({
      type: 'appExe',
      appId: app.id,
      appType: app.id
    }),
    size: 0
  };
};

// Define all desktop apps
export const APPS: Record<string, AppConfig> = {
  vscode: {
    id: 'vscode',
    name: 'VS Code',
    iconPath: '/images/desktop/icons8-vscode.svg',
    windowTitle: 'Visual Studio Code',
    windowComponent: 'VSCode',
    description: 'Code editor for development'
  },
  gameboy: {
    id: 'gameboy',
    name: 'GameBoy',
    iconPath: '/images/icons/games/gameboyIcon.png',
    windowTitle: 'GameBoy Emulator',
    windowComponent: 'GameBoy',
    description: 'GameBoy emulator for retro games'
  },
  paint: {
    id: 'paint',
    name: 'Paint',
    iconPath: '/images/desktop/paintIcon.png',
    windowTitle: 'Paint',
    windowComponent: 'Paint',
    description: 'Simple drawing application'
  },
  minesweeper: {
    id: 'minesweeper',
    name: 'Minesweeper',
    iconPath: '/images/desktop/Minesweeper.png',
    windowTitle: 'Minesweeper',
    windowComponent: 'Minesweeper',
    description: 'Classic Windows Minesweeper game'
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    iconPath: '/images/icons/spotifyIcon.png',
    windowTitle: 'Spotify',
    windowComponent: 'Spotify',
    description: 'Music streaming service'
  }
};

// Convert all app configs to app items for the file system
export const createAppItems = (): Record<string, File> => {
  const items: Record<string, File> = {};
  
  Object.values(APPS).forEach(app => {
    items[app.id] = createAppItem(app);
  });
  
  return items;
};

// Function to get app info from a file item
export const getAppInfo = (file: FileSystemItem): AppConfig | null => {
  if (file.type === 'file' && (file.extension === 'exe' || file.name.endsWith('.exe'))) {
    try {
      if ('content' in file && typeof file.content === 'string') {
        const content = JSON.parse(file.content);
        if (content.appId && APPS[content.appId]) {
          return APPS[content.appId];
        }
      }
  
      const appName = file.name.replace(/\.exe$/i, '');
      const matchingApp = Object.values(APPS).find(app => 
        app.name === appName || 
        app.name.toLowerCase() === appName.toLowerCase()
      );
      
      if (matchingApp) {
        return matchingApp;
      }
    } catch (e) {
      console.warn('Failed to parse app exe content', e);
    }
  }
  
  if ('appType' in file && APPS[file.appType as string]) {
    return APPS[file.appType as string];
  }
  
  return null;
};