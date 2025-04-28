import React, { useRef, useEffect } from 'react';
import { Folder, File } from '@/app/types/fileSystem';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { formatSize } from '@/app/utils/displayUtils';

interface PropertiesDialogProps {
  itemId: string | null;
  onClose: () => void;
}

const PropertiesDialog: React.FC<PropertiesDialogProps> = ({ itemId, onClose }) => {
  const { items } = useFileSystemStore();
  const dialogRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!dialogRef.current) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
    };
    
    const dialogElement = dialogRef.current;
    dialogElement.addEventListener('mousedown', handleMouseDown, true);
    
    return () => {
      dialogElement.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, []);
  
  if (!itemId || !items[itemId]) {
    return null;
  }
  
  const item = items[itemId];
  const isFolder = item.type === 'folder';
  const folderItem = isFolder ? (item as Folder) : null;
  const fileItem = !isFolder ? (item as File) : null;
  
  const getFolderInfo = (folder: Folder) => {
    let fileCount = 0;
    let folderCount = 0;
    
    folder.children.forEach(childId => {
      const child = items[childId];
      if (child) {
        if (child.type === 'folder') folderCount++;
        else fileCount++;
      }
    });
    
    return { fileCount, folderCount };
  };
  
  const calculateFolderSize = (folder: Folder): number => {
    let totalSize = 0;
    
    folder.children.forEach(childId => {
      const child = items[childId];
      if (!child) return;
      
      if (child.type === 'file') {
        totalSize += (child as File).size || 0;
      } else if (child.type === 'folder') {
        totalSize += calculateFolderSize(child as Folder);
      }
    });
    
    return totalSize;
  };
  
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    };
    return date.toLocaleDateString('en-US', options);
  };
  
  const size = isFolder 
    ? calculateFolderSize(folderItem!)
    : fileItem?.size || 0;
  
  const contentInfo = isFolder 
    ? getFolderInfo(folderItem!)
    : null;
  
  const createdDate = new Date('2025-03-13T12:46:34');
  const modifiedDate = new Date('2025-03-13T12:46:34');
  
  const getContentString = () => {
    if (!isFolder || !contentInfo) return '';
    
    const parts = [];
    if (contentInfo.fileCount > 0) {
      parts.push(`${contentInfo.fileCount} File${contentInfo.fileCount !== 1 ? 's' : ''}`);
    }
    if (contentInfo.folderCount > 0) {
      parts.push(`${contentInfo.folderCount} Folder${contentInfo.folderCount !== 1 ? 's' : ''}`);
    }
    
    return parts.join(', ');
  };
  
  return (
    <div 
      ref={dialogRef}
      className="properties-dialog bg-white w-full h-full flex flex-col select-text cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Name field */}
      <div className="px-4 pt-4 pb-2">
        <div className="w-full border border-gray-300 px-2 py-1 text-sm bg-white">
          {item.name}
        </div>
      </div>
      
      {/* Properties Table */}
      <div className="flex-grow px-4">
        <div className="flex py-1">
          <div className="w-20 flex-shrink-0 text-sm">Type:</div>
          <div className="text-sm flex-grow">{isFolder ? 'File folder' : `${fileItem?.extension?.toUpperCase() || 'Unknown'} File`}</div>
        </div>
        
        <div className="flex py-1">
          <div className="w-20 flex-shrink-0 text-sm">Location:</div>
          <div className="text-sm flex-grow">/Users/Public</div>
        </div>
        
        <div className="flex py-1">
          <div className="w-20 flex-shrink-0 text-sm">Size:</div>
          <div className="text-sm flex-grow text-gray-800">
            {formatSize(size)} ({size.toLocaleString()} bytes)
          </div>
        </div>
        
        {isFolder && contentInfo && (
          <div className="flex py-1">
            <div className="w-20 flex-shrink-0 text-sm">Contains:</div>
            <div className="text-sm flex-grow">{getContentString()}</div>
          </div>
        )}
        
        <div className="my-2 h-[1px] bg-gray-200"></div>
        
        <div className="flex py-1">
          <div className="w-20 flex-shrink-0 text-sm">Created:</div>
          <div className="text-sm flex-grow text-gray-800">{formatDate(createdDate)}</div>
        </div>
        
        <div className="flex py-1">
          <div className="w-20 flex-shrink-0 text-sm">Accessed:</div>
          <div className="text-sm flex-grow text-gray-800">{formatDate(modifiedDate)}</div>
        </div>
      </div>
      
      {/* Bottom bar and buttons */}
      <div className="bg-gray-100 p-3 mt-auto flex justify-end space-x-2">
        <button 
          className="px-5 py-1 bg-white hover:bg-gray-50 border border-gray-300 text-sm cursor-pointer"
          onClick={onClose}
        >
          OK
        </button>
        <button 
          className="px-5 py-1 bg-white hover:bg-gray-50 border border-gray-300 text-sm cursor-pointer"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PropertiesDialog;