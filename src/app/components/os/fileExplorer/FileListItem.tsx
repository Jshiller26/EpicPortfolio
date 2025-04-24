import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FileSystemItem } from '../../../types/fileSystem';
import { formatFileSize, getItemTypeString } from '../../../stores/fileSystem/utils/pathUtils';
import { useFileSystemStore } from '../../../stores/fileSystemStore';
import { getIconForItem } from '../../../utils/iconUtils';
import { getAppInfo } from '../../../config/appConfig';
import { openItem } from '../../../utils/appUtils';
import { useWindowStore } from '../../../stores/windowStore';
import { getDisplayName } from '../../../utils/displayUtils';
import { isProtectedItem } from '@/app/stores/fileSystem/utils/protectionUtils';
import { ViewMode } from '@/app/stores/userPreferencesStore';

interface FileListItemProps {
  item: FileSystemItem;
  onDoubleClick: (item: FileSystemItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
  currentFolderId: string;
  viewMode: ViewMode;
}

const FileListItem: React.FC<FileListItemProps> = ({ 
  item, 
  onDoubleClick, 
  onContextMenu,
  currentFolderId,
  viewMode 
}) => {
  const fileSystem = useFileSystemStore();
  const windowStore = useWindowStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isProtected = isProtectedItem(item.id);
  
  type RenameItemEvent = CustomEvent<{ itemId: string }>;

  // Listen for rename event
  useEffect(() => {
    const handleRename = (e: RenameItemEvent) => {
      if (e.detail && e.detail.itemId === item.id) {
        if (!isProtected) {
          startRenaming();
        }
      }
    };
    
    window.addEventListener('renameItem', handleRename as EventListener);
    
    return () => {
      window.removeEventListener('renameItem', handleRename as EventListener);
    };
  }, [item.id, isProtected]);
  
  // Focus input when renaming starts
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      
      // Select only the name part for files (exclude extension)
      if (item.type === 'file' && item.name.includes('.')) {
        const lastDotIndex = item.name.lastIndexOf('.');
        inputRef.current.setSelectionRange(0, lastDotIndex);
      } else {
        inputRef.current.select();
      }
    }
  }, [isRenaming, item]);
  
  const startRenaming = () => {
    if (isProtected) return;
    setIsRenaming(true);
    setNewName(item.name);
  };
  
  const finishRenaming = () => {
    if (newName.trim() && newName !== item.name) {
      // For files, preserve the extension
      if (item.type === 'file' && item.name.includes('.') && !newName.includes('.')) {
        const extension = item.name.substring(item.name.lastIndexOf('.'));
        fileSystem.renameItem(item.id, newName.trim() + extension);
      } else {
        fileSystem.renameItem(item.id, newName.trim());
      }
    }
    setIsRenaming(false);
  };
  
  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishRenaming();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
    }
  };
  
  const handleInputBlur = () => {
    finishRenaming();
  };
  
  // Handle drag start for file explorer items
  const handleDragStart = (e: React.DragEvent) => {
    if (isRenaming || isProtected) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    
    e.dataTransfer.effectAllowed = 'move';
    
    // Set data with JSON containing both item ID and source folder ID
    const dragData = {
      itemId: item.id,
      sourceFolderId: currentFolderId,
      source: 'fileExplorer',
      isApp: item.type === 'app' || 
             item.extension === 'exe' || 
             (item.name && item.name.toLowerCase().endsWith('.exe'))
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

  // Handle drag over events for folders
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
      
      // Don't allow dropping onto itself
      if (draggedItemId === item.id) return;
      
      if (dragData.source === 'desktop') {
        // Handle desktop items being dropped
        if (dragData.isDesktopApp) {
          const appInfo = getAppInfo({ id: draggedItemId, name: '', type: 'app', parentId: null });
          if (appInfo) {
            const fileName = `${appInfo.name}.exe`;
            const appData = {
              type: 'app',
              appId: appInfo.id,
              appType: appInfo.id
            };
            fileSystem.createFile(fileName, item.id, JSON.stringify(appData), 0);
          }
        } else {
          fileSystem.moveItem(draggedItemId, item.id);
        }
      } else if (dragData.source === 'fileExplorer') {
        if (dragData.sourceFolderId === item.id) return;
        
        fileSystem.moveItem(draggedItemId, item.id);
      }
    } catch (error) {
      console.error('Error processing drop onto folder:', error);
    }
  };

  const handleItemClick = () => {
  };

  const getFileIcon = () => {
    return getIconForItem(item);
  };

  const displayName = item.type === 'file' 
    ? getDisplayName(item.name)
    : item.name;

  const getIconSize = () => {
    switch (viewMode) {
      case 'large': return 24;
      case 'medium': return 16;
      case 'small': return 12;
      default: return 16; 
    }
  };

  const getViewModeStyles = () => {
    const iconSize = getIconSize();
    
    switch (viewMode) {
      case 'large':
        return {
          rowClass: 'py-2',
          iconClass: `w-${iconSize/4} h-${iconSize/4}`, 
          fontSize: '14px'
        };
      case 'medium':
        return {
          rowClass: 'py-1',
          iconClass: `w-${iconSize/4} h-${iconSize/4}`,
          fontSize: '12px'
        };
      case 'small':
        return {
          rowClass: 'py-0.5',
          iconClass: `w-${iconSize/4} h-${iconSize/4}`,
          fontSize: '11px'
        };
      default:
        return {
          rowClass: 'py-1',
          iconClass: 'w-4 h-4',
          fontSize: '12px'
        };
    }
  };

  const styles = getViewModeStyles();
  const iconSize = getIconSize();

  return (
    <tr
      className={`explorer-item draggable-item ${styles.rowClass} ${isDragOver ? 'bg-blue-100' : ''} ${isProtected ? 'bg-yellow-50' : ''}`}
      onDoubleClick={() => {
        if (isRenaming) return;
        
        // Try to use our new openItem utility for app files
        const isAppFile = item.type === 'app' || 
                         item.extension === 'exe' || 
                         item.name.toLowerCase().endsWith('.exe');
                         
        if (isAppFile) {
          openItem(item, windowStore.openWindow);
        } else {
          onDoubleClick(item);
        }
      }}
      onContextMenu={(e) => !isRenaming && onContextMenu(e, item)}
      draggable={!isRenaming && !isProtected}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleItemClick}
      style={{ fontSize: styles.fontSize }}
    >
      <td className="px-4 py-1">
        <div className="flex items-center gap-2 relative">
          <Image
            src={getFileIcon()}
            alt={item.type}
            width={iconSize}
            height={iconSize}
            className={styles.iconClass}
            unoptimized={true}
          />
          {isRenaming ? (
            <div className="absolute left-6 top-[-1px] z-10">
              <input
                ref={inputRef}
                type="text"
                className="px-1 py-0 m-0 border border-blue-500 outline-none bg-white text-gray-700 w-40"
                value={newName}
                onChange={(e) => {
                  // Limit to 50 characters
                  if (e.target.value.length <= 50) {
                    setNewName(e.target.value);
                  }
                }}
                maxLength={50}
                onKeyDown={handleRenameKeyDown}
                onBlur={handleInputBlur}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : null}
          <span className={`${isProtected ? 'text-yellow-700 font-medium' : 'text-gray-700'} ${isRenaming ? 'invisible' : 'visible'}`}>{displayName}</span>
        </div>
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