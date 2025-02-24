import React, { useState, useEffect, JSX } from 'react';
import { useFileSystemStore } from '../../stores/fileSystemStore';
import { FileSystemItem, Folder, File } from '../../types/fileSystem';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  RotateCcw, 
  Search, 
  FolderOpen, 
  FileText 
} from 'lucide-react';

interface FileExplorerProps {
  windowId: string;
  initialPath?: string;
}

function isFolder(item: FileSystemItem): item is Folder {
  return item.type === 'folder';
}

function getItemIcon(item: FileSystemItem): JSX.Element {
  if (item.type === 'folder') {
    return <FolderOpen size={16} className="text-yellow-500" />;
  } else {
    return <FileText size={16} className="text-blue-500" />;
  }
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  windowId,
  initialPath = 'C:\\Desktop'
}) => {
  const fileSystem = useFileSystemStore();
  const [viewMode] = useState<'list'>('list');
  const [addressBarText, setAddressBarText] = useState(fileSystem.currentPath);
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

  const navigateToParentByPath = () => {
    const pathParts = fileSystem.currentPath.split('\\');
    if (pathParts.length > 1) {
      const parentPath = pathParts.slice(0, -1).join('\\');
      navigateToPath(parentPath);
    }
  };

  const refreshCurrentFolder = () => {
    // Just re-set the current path to force a re-render
    fileSystem.setCurrentPath(fileSystem.currentPath);
  };

  const handleAddressBarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const path = addressBarText;
      // Attempt to navigate to the entered path
      const pathExists = Object.values(fileSystem.items).some(item => item.path === path);
      
      if (pathExists) {
        navigateToPath(path);
      } else {
        // If path doesn't exist, reset to current path
        setAddressBarText(fileSystem.currentPath);
      }
    }
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
  
  const formatFileSize = (size?: number): string => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getItemTypeString = (item: FileSystemItem): string => {
    if (item.type === 'folder') {
      return 'File folder';
    } else {
      const fileItem = item as File;
      if (fileItem.extension) {
        return `${fileItem.extension.toUpperCase()} File`;
      }
      return 'File';
    }
  };

  // Get the path parts for the breadcrumb navigation
  const getPathParts = (): { name: string; path: string }[] => {
    const parts = fileSystem.currentPath.split('\\');
    const result: { name: string; path: string }[] = [];
    
    let currentPath = '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === 0) {
        // Root drive
        currentPath = part;
      } else {
        currentPath = `${currentPath}\\${part}`;
      }
      
      result.push({
        name: part,
        path: currentPath
      });
    }
    
    return result;
  };

  const pathParts = getPathParts();

  return (
    <div className="flex flex-col h-full">
      {/* Navigation bar */}
      <div className="flex items-center h-10 px-2 gap-1 text-sm border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button 
            className={`p-1 rounded ${historyIndex > 0 ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
            onClick={navigateBack}
            disabled={historyIndex <= 0}
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            className={`p-1 rounded ${historyIndex < navigationHistory.length - 1 ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
            onClick={navigateForward}
            disabled={historyIndex >= navigationHistory.length - 1}
          >
            <ChevronRight size={16} />
          </button>
          <button 
            className={`p-1 rounded ${currentFolder && currentFolder.parentId !== null ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
            onClick={navigateUp}
            disabled={!currentFolder || currentFolder.parentId === null}
          >
            <ChevronUp size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 ml-2 flex-1">
          <button 
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            onClick={refreshCurrentFolder}
          >
            <RotateCcw size={16} />
          </button>
          
          {/* Address Bar */}
          <div className="flex items-center bg-gray-50 border border-gray-300 rounded px-2 py-1 flex-1">
            <span className="text-gray-600 mr-1">📂</span>
            
            {/* Breadcrumb navigation */}
            <div className="flex items-center flex-1 overflow-x-auto">
              {pathParts.map((part, index) => (
                <React.Fragment key={part.path}>
                  {index > 0 && <span className="mx-1 text-gray-400">\</span>}
                  <button 
                    className="hover:bg-gray-200 px-1 py-0.5 rounded text-gray-700 whitespace-nowrap"
                    onClick={() => navigateToPath(part.path)}
                  >
                    {part.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Search Box */}
          <div className="flex items-center bg-gray-50 border border-gray-300 rounded px-2 py-1 w-48">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent border-none outline-none ml-2 w-full text-sm placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="font-normal text-left px-4 py-1 text-gray-600">Name</th>
              <th className="font-normal text-left px-4 py-1 text-gray-600">Date modified</th>
              <th className="font-normal text-left px-4 py-1 text-gray-600">Type</th>
              <th className="font-normal text-left px-4 py-1 text-gray-600">Size</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item: File | Folder) => (
              <tr
                key={item.id}
                className="hover:bg-gray-100 cursor-pointer"
                onDoubleClick={() => handleItemDoubleClick(item)}
              >
                <td className="px-4 py-1 flex items-center gap-2">
                  {item.type === 'folder' ? (
                    <img
                      src="/images/desktop/icons8-folder.svg" 
                      alt="folder"
                      className="w-4 h-4"
                    />
                  ) : (
                    <img
                      src="/images/desktop/icons8-file.svg"
                      alt="file"
                      className="w-4 h-4"
                    />
                  )}
                  <span className="text-gray-700">{item.name}</span>
                </td>
                <td className="px-4 py-1 text-gray-700">
                  {new Date(item.modified).toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </td>
                <td className="px-4 py-1 text-gray-700">{getItemTypeString(item)}</td>
                <td className="px-4 py-1 text-gray-700">{item.type === 'file' ? formatFileSize(item.size) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};