import React, { useState, useEffect, useRef } from 'react';
import { useFileSystemStore } from '../../stores/fileSystemStore';
import { useWindowStore } from '../../stores/windowStore';
import { FileSystemItem, Folder, File } from '../../types/fileSystem';
import NavigationBar from './fileExplorer/NavigationBar';
import FileList from './fileExplorer/FileList';
import { useClipboardStore } from '../../stores/clipboardStore';

interface FileExplorerProps {
  initialPath?: string;
  windowId?: string;
}

function isFolder(item: FileSystemItem): item is Folder {
  return item.type === 'folder';
}

function isFile(item: FileSystemItem): item is File {
  return item.type === 'file';
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  initialPath,
  windowId
}) => {
  const fileSystem = useFileSystemStore();
  const windowStore = useWindowStore();
  const openWindow = windowStore.openWindow;
  const clipboard = useClipboardStore();
  
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const initializedRef = useRef(false);
  
  const [localPath, setLocalPath] = useState<string>('');  
  const currentPath = localPath || fileSystem.currentPath;
  const currentFolder = Object.values(fileSystem.items).find(
    item => item.path === currentPath
  );
  
  // Get items in the current folder
  const currentItems = currentFolder && isFolder(currentFolder)
    ? currentFolder.children.map(id => fileSystem.items[id]).filter(Boolean)
    : [];

  // Listen for window events
  useEffect(() => {
    const handleWindowOpen = (e: CustomEvent) => {
      if (e.detail && e.detail.windowId) {
        openWindow(e.detail.windowId);
      }
    };

    // Add event listener
    window.addEventListener('openWindow', handleWindowOpen as EventListener);

    // Clipboard keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Make sure we're in a file explorer context and not editing text somewhere
      if (e.target && (e.target as HTMLElement).tagName !== 'INPUT' && 
          (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        
        // Only process if current folder is valid
        if (currentFolder && currentFolder.id) {
          // Ctrl+V to paste
          if (e.ctrlKey && e.key === 'v') {
            if (clipboard.item) {
              if (clipboard.operation === 'cut') {
                fileSystem.moveItem(clipboard.item.id, currentFolder.id);
              } else if (clipboard.operation === 'copy') {
                fileSystem.copyItem(clipboard.item.id, currentFolder.id);
              }
              clipboard.clear();
              e.preventDefault();
            }
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('openWindow', handleWindowOpen as EventListener);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openWindow, clipboard, currentFolder, fileSystem]);

  // Initialize path
  useEffect(() => {
    if (initializedRef.current) return;    
    let pathToUse = initialPath;
    
    if (windowId && windowId.startsWith('explorer-')) {
      const folderId = windowId.replace('explorer-', '');
      const folder = fileSystem.items[folderId];
      
      if (folder && folder.type === 'folder' && folder.path) {
        pathToUse = folder.path;
      }
    }
    
    if (!pathToUse) {
      pathToUse = 'C:\\Desktop';
    }
    
    const pathExists = Object.values(fileSystem.items).some(item => item.path === pathToUse);
    
    if (pathExists) {
      setLocalPath(pathToUse);
      setNavigationHistory([pathToUse]);
      setHistoryIndex(0);
      initializedRef.current = true;
    } else {
      const desktopPath = 'C:\\Desktop';
      setLocalPath(desktopPath);
      setNavigationHistory([desktopPath]);
      setHistoryIndex(0);
      initializedRef.current = true;
    }
  }, [initialPath, windowId, fileSystem.items]);

  // Navigation functions
  const navigateToPath = (path: string, resetHistory = false) => {
    // Check if the path exists in the file system
    const pathExists = Object.values(fileSystem.items).some(item => item.path === path);
    
    if (!pathExists) {
      console.error(`Path not found: ${path}`);
      return;
    }
    
    setLocalPath(path);
    
    if (resetHistory) {
      setNavigationHistory([path]);
      setHistoryIndex(0);
    } else {
      const newHistory = [...navigationHistory.slice(0, historyIndex + 1), path];
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setLocalPath(navigationHistory[newIndex]);
    }
  };

  const navigateForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLocalPath(navigationHistory[newIndex]);
    }
  };

  const navigateUp = () => {
    if (currentFolder && currentFolder.parentId !== null) {
      const parentFolder = fileSystem.items[currentFolder.parentId];
      if (parentFolder && parentFolder.path) {
        navigateToPath(parentFolder.path);
      }
    }
  };

  const refreshCurrentFolder = () => {
    // Trigger a re-render of the current folder contents
    const currentPath = localPath;
    setLocalPath('');
    setTimeout(() => {
      setLocalPath(currentPath);
    }, 10);
  };

  // Helper function to check if a file is a text file
  const isTextFile = (file: File): boolean => {
    const textExtensions = ['txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'json', 'yml', 'yaml', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'php', 'rb', 'swift', 'go', 'rs', 'sql', 'xml', 'sh', 'bat', 'ps1'];
    return file.extension ? textExtensions.includes(file.extension.toLowerCase()) : false;
  };

  // Helper function to check if a file is a video file
  const isVideoFile = (file: File): boolean => {
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'mkv', 'flv'];
    return file.extension ? videoExtensions.includes(file.extension.toLowerCase()) : false;
  };

  const handleItemDoubleClick = (item: FileSystemItem) => {
    if (isFolder(item)) {
      if (item.path) {
        navigateToPath(item.path);
      }
    } else if (isFile(item)) {
      console.log('Opening file:', item.name, 'with extension:', item.extension);
      
      if (item.name.toLowerCase().includes('vs code') || item.name.toLowerCase() === 'vscode.exe') {
        openWindow('vscode-new');
        return;
      }
      
      // Handle text files with the editor
      if (isTextFile(item)) {
        openWindow(`editor-${item.id}`);
      } else if (item.extension && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(item.extension.toLowerCase())) {
        openWindow(`image-${item.id}`);
      } else if (item.extension?.toLowerCase() === 'pdf') {
        openWindow(`pdf-${item.id}`);
      } else if (isVideoFile(item)) {
        openWindow(`video-${item.id}`);
      } else if (item.extension?.toLowerCase() === 'exe') {
        if (item.name.toLowerCase().includes('vs code') || item.name.toLowerCase() === 'vscode.exe') {
          openWindow('vscode-new');
        } else {
          console.log(`Launching app: ${item.name}`);
          alert(`Application cannot be launched.`);
        }
      } else {
        alert(`File type ${item.extension ? '.' + item.extension : 'unknown'} is not supported.`);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navigation Bar */}
      <div className="flex flex-col">
        <NavigationBar
          currentPath={currentPath}
          historyIndex={historyIndex}
          navigationHistory={navigationHistory}
          hasParent={!!currentFolder?.parentId}
          navigateBack={navigateBack}
          navigateForward={navigateForward}
          navigateUp={navigateUp}
          refreshCurrentFolder={refreshCurrentFolder}
          navigateToPath={navigateToPath}
        />
      </div>
      
      {/* File List */}
      <FileList
        items={currentItems}
        onItemDoubleClick={handleItemDoubleClick}
        currentFolderId={currentFolder?.id}
      />
    </div>
  );
};