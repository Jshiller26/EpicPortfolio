import React, { useState, useEffect } from 'react';
import { useFileSystemStore } from '../../stores/fileSystemStore';
import { FileSystemItem, Folder } from '../../types/fileSystem';
import NavigationBar from './fileExplorer/NavigationBar';
import SearchBar from './fileExplorer/SearchBar';
import FileList from './fileExplorer/FileList';

interface FileExplorerProps {
  windowId: string;
  initialPath?: string;
}

function isFolder(item: FileSystemItem): item is Folder {
  return item.type === 'folder';
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  initialPath = 'C:\\Desktop'
}) => {
  const fileSystem = useFileSystemStore();
  const [, setAddressBarText] = useState(fileSystem.currentPath);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Get the current folder based on the current path
  const currentFolder = Object.values(fileSystem.items).find(
    item => item.path === fileSystem.currentPath
  );
  
  // Get items in the current folder
  const currentItems = currentFolder && isFolder(currentFolder)
    ? currentFolder.children.map(id => fileSystem.items[id])
    : [];

  useEffect(() => {
    // Initialize the explorer with the initialPath
    if (initialPath && initialPath !== fileSystem.currentPath) {
      navigateToPath(initialPath, true);
    }
  }, []);

  useEffect(() => {
    // Update address bar when path changes
    setAddressBarText(fileSystem.currentPath);
  }, [fileSystem.currentPath]);

  const navigateToPath = (path: string, resetHistory = false) => {
    // Check if the path exists in the file system
    const pathExists = Object.values(fileSystem.items).some(item => item.path === path);
    
    if (!pathExists) {
      console.error(`Path not found: ${path}`);
      return;
    }
    
    // Update the current path in the file system
    fileSystem.setCurrentPath(path);
    
    // Update navigation history if this is a new navigation (not back/forward)
    if (resetHistory) {
      setNavigationHistory([path]);
      setHistoryIndex(0);
    } else {
      // Remove any forward history if we're navigating from a back state
      const newHistory = [...navigationHistory.slice(0, historyIndex + 1), path];
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      fileSystem.setCurrentPath(navigationHistory[newIndex]);
    }
  };

  const navigateForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      fileSystem.setCurrentPath(navigationHistory[newIndex]);
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
    // Just re-set the current path to force a re-render
    fileSystem.setCurrentPath(fileSystem.currentPath);
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
    // Implement search functionality here
    console.log('Searching for:', query);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navigation and Search Bar */}
      <div className="flex flex-col">
        <NavigationBar
          currentPath={fileSystem.currentPath}
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
