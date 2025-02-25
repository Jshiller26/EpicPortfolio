import React from 'react';
import { FileSystemItem, File, Folder } from '../../../types/fileSystem';
import { formatFileSize, getItemTypeString } from '../../../stores/fileSystem/utils/pathUtils';

interface FileListItemProps {
  item: FileSystemItem;
  onDoubleClick: (item: FileSystemItem) => void;
}

const FileListItem: React.FC<FileListItemProps> = ({ item, onDoubleClick }) => {
  return (
    <tr
      className="hover:bg-gray-100 cursor-pointer"
      onDoubleClick={() => onDoubleClick(item)}
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
      <td className="px-4 py-1 text-gray-700">
        {item.type === 'file' ? formatFileSize(item.size) : ''}
      </td>
    </tr>
  );
};

export default FileListItem;
