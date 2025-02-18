import React, { useState } from 'react';
import { FileExplorer } from './FileExplorer';
import { Minus, Square, X } from 'lucide-react';
import { Rnd } from 'react-rnd';

interface WindowProps {
  id: string;
  isActive: boolean;
  onClose: () => void;
  onFocus: () => void;
}

export const Window: React.FC<WindowProps> = ({
  id,
  isActive,
  onClose,
  onFocus,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 800, height: 600 });

  const getWindowTitle = () => {
    if (id.startsWith('explorer-')) {
      return 'File Explorer';
    }
    return 'Window';
  };

  const renderWindowContent = () => {
    if (id.startsWith('explorer-')) {
      return <FileExplorer windowId={id} />;
    }
    return <div>Window Content</div>;
  };

  return (
    <Rnd
      position={position}
      size={size}
      minWidth={400}
      minHeight={300}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        setPosition(position);
      }}
      className={`${isActive ? 'z-50' : 'z-0'}`}
      onMouseDown={onFocus}
    >
      <div className="flex flex-col h-full bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        {/* Window Title Bar */}
        <div className="h-9 bg-white flex items-center justify-between select-none">
          <div className="flex items-center space-x-2 px-3">
            <img
              src="/images/desktop/icons8-folder.svg"
              alt="icon"
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">{getWindowTitle()}</span>
          </div>
          <div className="flex h-full">
            <button 
              className="px-4 hover:bg-gray-100 flex items-center justify-center h-full"
              onClick={() => {/* Minimize */}}
            >
              <Minus size={16} className="text-gray-600" />
            </button>
            <button 
              className="px-4 hover:bg-gray-100 flex items-center justify-center h-full"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              <Square size={14} className="text-gray-600 rounded-sm" />
            </button>
            <button 
              className="px-4 hover:bg-red-500 flex items-center justify-center h-full group"
              onClick={onClose}
            >
              <X size={16} className="text-gray-600 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-hidden">
          {renderWindowContent()}
        </div>
      </div>
    </Rnd>
  );
};