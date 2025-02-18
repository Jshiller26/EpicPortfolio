import React, { useState } from 'react';
import { useFileSystemStore } from '../../stores/fileSystemStore';
import { FileSystemItem, Folder, File } from '../../types/fileSystem';

interface FileExplorerProps {
  windowId: string;
  initialPath?: string;
}

// Type guard to check if an item is a folder
function isFolder(item: FileSystemItem): item is Folder {
  return item.type === 'folder';
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  windowId,
  initialPath = 'C:\\Desktop'
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const fileSystem = useFileSystemStore();
  
  // Get current folder's items
  const currentFolder = Object.values(fileSystem.items).find(
    item => item.path === fileSystem.currentPath
  );
  
  const currentItems = currentFolder && isFolder(currentFolder)
    ? currentFolder.children.map(id => fileSystem.items[id])
    : [];

  const navigateToPath = (path: string) => {
    fileSystem.setCurrentPath(path);
  };

  const handleItemDoubleClick = (item: File | Folder) => {
    if (isFolder(item)) {
      navigateToPath(item.path);
    }
    // Handle file opening later
  };

  const formatFileSize = (size?: number): string => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const PathBar = () => (
    <div className="flex items-center h-10 px-2 border-b">
      <button className="p-1 hover:bg-black/5 rounded-sm">
        <img
          src="/images/desktop/icons8-back-arrow.svg"
          alt="Back"
          className="w-4 h-4"
        />
      </button>
      <button className="p-1 hover:bg-black/5 rounded-sm">
        <img
          src="/images/desktop/icons8-forward-arrow.svg"
          alt="Forward"
          className="w-4 h-4"
        />
      </button>
      <button className="p-1 hover:bg-black/5 rounded-sm">
        <img
          src="/images/desktop/icons8-up-arrow.svg"
          alt="Up"
          className="w-4 h-4"
        />
      </button>
      <div className="flex-1 ml-2 px-2 py-1 border rounded-sm">
        {fileSystem.currentPath}
      </div>
    </div>
  );

  const ToolBar = () => (
    <div className="flex items-center h-12 px-2 border-b">
      <div className="flex space-x-2">
        <button className="px-3 py-1 hover:bg-black/5 rounded-sm">Cut</button>
        <button className="px-3 py-1 hover:bg-black/5 rounded-sm">Copy</button>
        <button className="px-3 py-1 hover:bg-black/5 rounded-sm">Paste</button>
        <span className="border-r mx-2" />
        <button className="px-3 py-1 hover:bg-black/5 rounded-sm">New</button>
      </div>
      <div className="flex-1" />
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setViewMode('list')}
          className={`p-1 rounded-sm ${viewMode === 'list' ? 'bg-black/10' : 'hover:bg-black/5'}`}
        >
          <img
            src="/images/desktop/icons8-list-view.svg"
            alt="List"
            className="w-4 h-4"
          />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-1 rounded-sm ${viewMode === 'grid' ? 'bg-black/10' : 'hover:bg-black/5'}`}
        >
          <img
            src="/images/desktop/icons8-grid-view.svg"
            alt="Grid"
            className="w-4 h-4"
          />
        </button>
      </div>
    </div>
  );

  const ListView = () => (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2">Name</th>
          <th className="text-left p-2">Date modified</th>
          <th className="text-left p-2">Type</th>
          <th className="text-left p-2">Size</th>
        </tr>
      </thead>
      <tbody>
        {currentItems.map((item: File | Folder) => (
          <tr
            key={item.id}
            className="hover:bg-black/5 cursor-pointer"
            onDoubleClick={() => handleItemDoubleClick(item)}
          >
            <td className="p-2 flex items-center">
              <img
                src={`/images/desktop/icons8-${item.type}.svg`}
                alt={item.type}
                className="w-4 h-4 mr-2"
              />
              {item.name}
            </td>
            <td className="p-2">
              {item.modified.toLocaleDateString()}
            </td>
            <td className="p-2">
              {isFolder(item) ? 'File folder' : `${item.type} file`}
            </td>
            <td className="p-2">{formatFileSize(item.size)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const GridView = () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 p-4">
      {currentItems.map((item: File | Folder) => (
        <div
          key={item.id}
          className="flex flex-col items-center p-2 rounded-sm hover:bg-black/5 cursor-pointer"
          onDoubleClick={() => handleItemDoubleClick(item)}
        >
          <img
            src={`/images/desktop/icons8-${item.type}.svg`}
            alt={item.type}
            className="w-12 h-12 mb-1"
          />
          <div className="text-sm text-center truncate w-full">
            {item.name}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <PathBar />
      <ToolBar />
      <div className="flex-1 overflow-auto">
        {viewMode === 'list' ? <ListView /> : <GridView />}
      </div>
    </div>
  );
};