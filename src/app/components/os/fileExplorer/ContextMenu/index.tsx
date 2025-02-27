import React, { useEffect, useRef } from 'react';
import { FileSystemItem } from '@/app/types/fileSystem';

interface ContextMenuProps {
  x: number;
  y: number;
  currentFolder: string;
  selectedItem?: FileSystemItem | null;
  onClose: () => void;
  onCreateFile: (name: string, extension: string) => void;
  onCreateFolder: (name: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onCreateFile,
  onCreateFolder
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleCreateTextFile = () => {
    const fileName = prompt('Enter file name:', 'New Text File.txt');
    if (fileName) {
      // Extract extension or use txt as default
      const extension = fileName.includes('.') ? fileName.split('.').pop()! : 'txt';
      const nameWithExtension = fileName.includes('.') ? fileName : `${fileName}.txt`;
      
      onCreateFile(nameWithExtension, extension);
    }
    onClose();
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:', 'New Folder');
    if (folderName) {
      onCreateFolder(folderName);
    }
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute bg-white shadow-lg rounded-md py-1 z-50 select-none"
      style={{
        left: x,
        top: y,
        minWidth: '200px'
      }}
    >
      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
        Actions
      </div>
      
      <button
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
        onClick={handleCreateTextFile}
      >
        <span className="mr-2">📄</span>
        New Text Document
      </button>
      
      <button
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
        onClick={handleCreateFolder}
      >
        <span className="mr-2">📁</span>
        New Folder
      </button>
      
      <div className="border-t border-gray-100 my-1"></div>
      
      <button
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        onClick={onClose}
      >
        Refresh
      </button>
    </div>
  );
};

export default ContextMenu;