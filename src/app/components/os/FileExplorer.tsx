import React, { useState, useEffect, useRef } from 'react';
import { useFileSystemStore } from '../../stores/fileSystemStore';
import { FileSystemItem, Folder } from '../../types/fileSystem';
import NavigationBar from './fileExplorer/NavigationBar';
import SearchBar from './fileExplorer/SearchBar';
import FileList from './fileExplorer/FileList';

interface FileExplorerProps {
  initialPath?: string;
  windowId?: string;
}

function isFolder(item: FileSystemItem): item is Folder {
  return item.type === 'folder';
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  initialPath,
  windowId
}) => {
  const fileSystem = useFileSystemStore();
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

  useEffect(() => {
    if (initializedRef.current) return;    
    let pathToUse = initialPath;
    
    if (windowId && windowId.startsWith('explorer-')) {
      const folderId = windowId.replace('explorer-', '');
      const folder = fileSystem.items[folderId];
      
      if (folder && folder.type === 'folder') {
        pathToUse = folder.path;
      } else {
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
  }, [initialPath, windowId, fileSystem]);
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
      if (parentFolder) {
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

  const handleItemDoubleClick = (item: FileSystemItem) => {
    if (isFolder(item)) {
      // Navigate into the folder
      navigateToPath(item.path);
    } else {
      console.log('Opening file:', item.name);
      // Add different viewer based on file extension
    }
  };

  const handleSearch = (query: string) => {
    // Implement search
    console.log('Searching for:', query);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navigation and Search Bar */}
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
        <div className="px-2 py-1 border-b border-gray-200">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      
      {/* File List */}
      <FileList
        items={currentItems}
        onItemDoubleClick={handleItemDoubleClick}
      />
    </div>
  );
};