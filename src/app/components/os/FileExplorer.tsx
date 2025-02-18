import React, { useState } from 'react';
import { useFileSystemStore } from '../../stores/fileSystemStore';
import { FileSystemItem, Folder, File } from '../../types/fileSystem';
import { ChevronLeft, ChevronRight, ChevronUp, RotateCcw, Search } from 'lucide-react';

interface FileExplorerProps {
  windowId: string;
  initialPath?: string;
}

function isFolder(item: FileSystemItem): item is Folder {
  return item.type === 'folder';
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  windowId,
  initialPath = 'C:\\Desktop'
}) => {
  const fileSystem = useFileSystemStore();
  const [viewMode] = useState<'list'>('list');
  
  const currentFolder = Object.values(fileSystem.items).find(
    item => item.path === fileSystem.currentPath
  );
  
  const currentItems = currentFolder && isFolder(currentFolder)
    ? currentFolder.children.map(id => fileSystem.items[id])
    : [];

  const formatFileSize = (size?: number): string => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navigation bar */}
      <div className="flex items-center h-10 px-2 gap-1 text-sm border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight size={16} className="text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <ChevronUp size={16} className="text-gray-600" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 ml-2 flex-1">
          <button className="p-1 hover:bg-gray-100 rounded">
            <RotateCcw size={16} className="text-gray-600" />
          </button>
          <div className="flex items-center bg-gray-50 border border-gray-300 rounded px-2 py-1 flex-1">
            <span className="text-gray-600">📂</span>
            <span className="ml-2 text-gray-700">Public</span>
          </div>
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
                className="hover:bg-gray-100"
              >
                <td className="px-4 py-1 flex items-center gap-2">
                  <img
                    src={`/images/desktop/icons8-${item.type}.svg`}
                    alt={item.type}
                    className="w-4 h-4"
                  />
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
                <td className="px-4 py-1 text-gray-700">File folder</td>
                <td className="px-4 py-1 text-gray-700">{formatFileSize(item.size)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};