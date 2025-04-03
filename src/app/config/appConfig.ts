import { FileSystemItem } from '@/app/types/fileSystem';

// Type for app configuration
export interface AppConfig {
  id: string;
  name: string;
  type: 'app';
  iconPath: string;
  windowTitle?: string;
  windowComponent?: string;
  description?: string;
  fileExtension?: string;
}

// Create FileSystemItem from AppConfig
export const createAppItem = (app: AppConfig): FileSystemItem => {
  const fileName = app.fileExtension ? 
    `${app.name}.${app.fileExtension}` : 
    `${app.name}.exe`;
    
  return {
    id: app.id,
    name: fileName,
    type: 'app',
    appType: app.id,
    iconPath: app.iconPath,
    parentId: 'desktop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    extension: app.fileExtension || 'exe'
  };
};

// Define all desktop apps
export const APPS: Record<string, AppConfig> = {
  vscode: {
    id: 'vscode',
    name: 'VS Code',
    type: 'app',
    iconPath: '/images/desktop/icons8-vscode.svg',
    windowTitle: 'Visual Studio Code',
    windowComponent: 'VSCode',
    description: 'Code editor for development',
    fileExtension: 'exe'
  },
  gameboy: {
    id: 'gameboy',
    name: 'GameBoy',
    type: 'app',
    iconPath: '/images/icons/games/gameboyIcon.png',
    windowTitle: 'GameBoy Emulator',
    windowComponent: 'GameBoy',
    description: 'GameBoy emulator for retro games',
    fileExtension: 'exe'
  }
};

// Convert all app configs to app items for the file system
export const createAppItems = (): Record<string, FileSystemItem> => {
  const items: Record<string, FileSystemItem> = {};
  
  Object.values(APPS).forEach(app => {
    items[app.id] = createAppItem(app);
  });
  
  return items;
};

// Function to get app info from an item
export const getAppInfo = (item: FileSystemItem): AppConfig | null => {
  if (item.type === 'app' && item.appType && APPS[item.appType]) {
    return APPS[item.appType];
  }
  
  if (item.extension === 'exe' || item.name.endsWith('.exe')) {
    const appName = item.name.replace(/\.exe$/, '');
    
    const matchingApp = Object.values(APPS).find(app => 
      app.name === appName || 
      app.name.toLowerCase() === appName.toLowerCase()
    );
    
    if (matchingApp) {
      return matchingApp;
    }
  }
  
  return null;
};