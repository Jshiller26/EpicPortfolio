import React, { useState } from 'react';
import { FileSystemItem } from '../../../types/fileSystem';
import FileListItem from './FileListItem';
import ContextMenu from './ContextMenu';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { useWindowStore } from '@/app/stores/windowStore';

interface FileListProps {
  items: FileSystemItem[];
  onItemDoubleClick: (item: FileSystemItem) => void;
  currentFolderId?: string;
}

const FileList: React.FC<FileListProps> = ({ items, onItemDoubleClick, currentFolderId }) => {
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    item?: FileSystemItem;
  }>({
    show: false,
    x: 0,
    y: 0
  });

  const fileSystem = useFileSystemStore();
  const openWindow = useWindowStore(state => state.openWindow);

  const handleContextMenu = (e: React.MouseEvent, item?: FileSystemItem) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, show: false });
  };

  const handleCreateFile = (name: string) => {
    if (!currentFolderId) return;
    
    // Create the file in the current folder
    fileSystem.createFile(name, currentFolderId, '');
    
    // Find the newly created file
    const folder = fileSystem.items[currentFolderId];
    if (folder && folder.type === 'folder') {
      const newFileId = folder.children.find(childId => {
        const child = fileSystem.items[childId];
        return child && child.type === 'file' && child.name === name;
      });
      
      if (newFileId) {
        openWindow(`editor-${newFileId}`);
      }
    }
  };

  const handleCreateFolder = (name: string) => {
    if (!currentFolderId) return;
    fileSystem.createFolder(name, currentFolderId);
  };

  return (
    <div 
      className="flex-1 overflow-auto relative"
      onContextMenu={(e) => handleContextMenu(e)}
    >
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
          {items.map((item) => (
            <FileListItem 
              key={item.id} 
              item={item} 
              onDoubleClick={onItemDoubleClick} 
              onContextMenu={(e) => handleContextMenu(e, item)}
            />
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                This folder is empty
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {contextMenu.show && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          currentFolder={currentFolderId || ''}
          selectedItem={contextMenu.item}
          onClose={handleCloseContextMenu}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
        />
      )}
    </div>
  );
};

export default FileList;