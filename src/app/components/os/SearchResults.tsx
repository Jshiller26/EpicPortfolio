import React from 'react';
import { FileSystemItem } from '@/app/types/fileSystem';
import { getIconForItem } from '@/app/utils/iconUtils';

interface SearchResultsProps {
  results: FileSystemItem[];
  onItemClick: (item: FileSystemItem) => void;
  onClose: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onItemClick,
  onClose
}) => {
  // Group results by type
  const fileResults = results.filter(item => item.type === 'file');
  const folderResults = results.filter(item => item.type === 'folder');
  const appResults = results.filter(item => item.type === 'app');

  // Close search results when clicking outside
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderResultList = (items: FileSystemItem[], category: string) => {
    if (items.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
          {category}
        </h3>
        <div className="space-y-1">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center px-3 py-2 hover:bg-blue-100 rounded-md cursor-pointer"
              onClick={() => onItemClick(item)}
            >
              <img
                src={getIconForItem(item)}
                alt={item.name}
                className="w-5 h-5 mr-3"
              />
              <div>
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">
                  {item.path || `C:\\${item.name}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/10 z-40"
      onClick={handleClickOutside}
    >
      <div className="absolute bottom-16 left-4 w-[500px] max-h-[70vh] bg-white/95 backdrop-blur-md rounded-lg shadow-lg overflow-hidden z-50 animate-slide-up">
        <div className="p-4">
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">No results found</div>
              <div className="text-xs mt-1">Try a different search term</div>
            </div>
          ) : (
            <div className="max-h-[calc(70vh-2rem)] overflow-y-auto">
              {renderResultList(appResults, 'Apps')}
              {renderResultList(folderResults, 'Folders')}
              {renderResultList(fileResults, 'Files')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
