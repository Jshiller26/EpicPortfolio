import React from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, RotateCcw } from 'lucide-react';
import { getPathParts } from '../../../stores/fileSystem/utils/pathUtils';

interface NavigationBarProps {
  currentPath: string;
  historyIndex: number;
  navigationHistory: string[];
  hasParent: boolean;
  navigateBack: () => void;
  navigateForward: () => void;
  navigateUp: () => void;
  refreshCurrentFolder: () => void;
  navigateToPath: (path: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  currentPath,
  historyIndex,
  navigationHistory,
  hasParent,
  navigateBack,
  navigateForward,
  navigateUp,
  refreshCurrentFolder,
  navigateToPath
}) => {
  const pathParts = getPathParts(currentPath);
  
  return (
    <div className="flex items-center h-10 px-2 gap-1 text-sm border-b border-gray-200">
      <div className="flex items-center gap-1">
        <button 
          className={`p-1 rounded ${historyIndex > 0 ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          onClick={navigateBack}
          disabled={historyIndex <= 0}
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          className={`p-1 rounded ${historyIndex < navigationHistory.length - 1 ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          onClick={navigateForward}
          disabled={historyIndex >= navigationHistory.length - 1}
        >
          <ChevronRight size={16} />
        </button>
        <button 
          className={`p-1 rounded ${hasParent ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          onClick={navigateUp}
          disabled={!hasParent}
        >
          <ChevronUp size={16} />
        </button>
      </div>
      
      <div className="flex items-center gap-2 ml-2 flex-1">
        <button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600"
          onClick={refreshCurrentFolder}
        >
          <RotateCcw size={16} />
        </button>
        
        {/* Address Bar */}
        <div className="flex items-center bg-gray-50 border border-gray-300 rounded px-2 py-1 flex-1">
          <span className="text-gray-600 mr-1">📂</span>
          
          {/* Breadcrumb navigation */}
          <div className="flex items-center flex-1 overflow-x-auto">
            {pathParts.map((part, index) => (
              <React.Fragment key={part.path}>
                {index > 0 && <span className="mx-1 text-gray-400">\</span>}
                <button 
                  className="hover:bg-gray-200 px-1 py-0.5 rounded text-gray-700 whitespace-nowrap"
                  onClick={() => navigateToPath(part.path)}
                >
                  {part.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
