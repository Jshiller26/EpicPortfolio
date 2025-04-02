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
}

// Create FileSystemItem from AppConfig
export const createAppItem = (app: AppConfig): FileSystemItem => {
  return {
    id: app.id,
    name: app.name,
    type: 'app',
    appType: app.id,
    iconPath: app.iconPath,
    parentId: 'desktop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    description: 'Code editor for development'
  },
  gameboy: {
    id: 'gameboy',
    name: 'GameBoy',
    type: 'app',
    iconPath: '/images/icons/games/gameboyIcon.png',
    windowTitle: 'GameBoy Emulator',
    windowComponent: 'GameBoy',
    description: 'GameBoy emulator for retro games'
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