import React from 'react';
import { FileSystemItem, File, Folder } from '../../../types/fileSystem';
import FileListItem from './FileListItem';

interface FileListProps {
  items: FileSystemItem[];
  onItemDoubleClick: (item: FileSystemItem) => void;
}

const FileList: React.FC<FileListProps> = ({ items, onItemDoubleClick }) => {
  return (
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
          {items.map((item) => (
            <FileListItem 
              key={item.id} 
              item={item} 
              onDoubleClick={onItemDoubleClick} 
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
    </div>
  );
};

export default FileList;
