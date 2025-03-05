import React, { useState } from 'react';
import Image from 'next/image';
import { FileSystemItem } from '../../../types/fileSystem';
import { formatFileSize, getItemTypeString } from '../../../stores/fileSystem/utils/pathUtils';
import { useFileSystemStore } from '../../../stores/fileSystemStore';

interface FileListItemProps {
  item: FileSystemItem;
  onDoubleClick: (item: FileSystemItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
  currentFolderId: string;
}

const FileListItem: React.FC<FileListItemProps> = ({ 
  item, 
  onDoubleClick, 
  onContextMenu,
  currentFolderId 
}) => {
  const fileSystem = useFileSystemStore();
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Handle drag start for file explorer items
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    
    e.dataTransfer.effectAllowed = 'move';
    
    // Set data with JSON containing both item ID and source folder ID
    const dragData = {
      itemId: item.id,
      sourceFolderId: currentFolderId,
      source: 'fileExplorer'
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    // Also set plain text as fallback
    e.dataTransfer.setData('text/plain', item.id);
  };

  const getFormattedDate = () => {
    if (!item.modified) {
      return 'Unknown';
    }
    
    if (item.modified instanceof Date) {
      return item.modified.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    try {
      const date = new Date(item.modified);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid date';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (item.type !== 'folder') return;
    
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  // Handle drag leave for folders
  const handleDragLeave = (e: React.DragEvent) => {
    if (item.type !== 'folder') return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  // Handle drop for folders
  const handleDrop = (e: React.DragEvent) => {
    if (item.type !== 'folder') return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      if (!jsonData) return;
      
      const dragData = JSON.parse(jsonData);
      const draggedItemId = dragData.itemId;
      
      if (draggedItemId === item.id) return;
      
      if (dragData.source === 'desktop') {
        fileSystem.moveItem(draggedItemId, item.id);
      } else if (dragData.source === 'fileExplorer') {
        if (dragData.sourceFolderId === item.id) return;
        
        fileSystem.moveItem(draggedItemId, item.id);
      }
    } catch (error) {
      console.error('Error processing drop onto folder:', error);
    }
  };

  return (
    <tr
      className={`hover:bg-gray-100 cursor-pointer draggable-item ${isDragOver ? 'bg-blue-100' : ''}`}
      onDoubleClick={() => onDoubleClick(item)}
      onContextMenu={(e) => onContextMenu(e, item)}
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <td className="px-4 py-1 flex items-center gap-2">
        {item.type === 'folder' ? (
          <Image
            src="/images/desktop/icons8-folder.svg" 
            alt="folder"
            width={16}
            height={16}
            className="w-4 h-4"
            unoptimized={true}
          />
        ) : (
          <Image
            src="/images/desktop/icons8-file.svg"
            alt="file"
            width={16}
            height={16}
            className="w-4 h-4"
            unoptimized={true}
          />
        )}
        <span className="text-gray-700">{item.name}</span>
      </td>
      <td className="px-4 py-1 text-gray-700">
        {getFormattedDate()}
      </td>
      <td className="px-4 py-1 text-gray-700">{getItemTypeString(item)}</td>
      <td className="px-4 py-1 text-gray-700">
        {item.type === 'file' ? formatFileSize(item.size) : ''}
      </td>
    </tr>
  );
};

export default FileListItem;