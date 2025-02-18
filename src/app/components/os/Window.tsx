import React, { useState } from 'react';
import { FileExplorer } from './FileExplorer';
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
      const folderId = id.replace('explorer-', '');
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
        <div className="h-8 bg-gray-100 flex items-center justify-between px-2 select-none">
          <div className="flex items-center space-x-2">
            <img
              src="/images/desktop/icons8-folder.svg"
              alt="icon"
              className="w-4 h-4"
            />
            <span className="text-sm">{getWindowTitle()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="w-6 h-6 hover:bg-black/5 rounded-sm flex items-center justify-center"
              onClick={() => {/* Minimize */}}
            >
              <span className="transform translate-y-2">_</span>
            </button>
            <button
              className="w-6 h-6 hover:bg-black/5 rounded-sm flex items-center justify-center"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              □
            </button>
            <button
              className="w-6 h-6 hover:bg-red-500 hover:text-white rounded-sm flex items-center justify-center"
              onClick={onClose}
            >
              ×
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