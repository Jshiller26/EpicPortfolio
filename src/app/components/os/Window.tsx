import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';

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
  const [maximized, setMaximized] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMaximize = () => {
    setMaximized(!maximized);
  };

  return (
    <Draggable
      handle=".window-title-bar"
      bounds="parent"
      disabled={maximized}
    >
      <div
        ref={windowRef}
        className={`absolute ${
          maximized ? 'inset-0' : 'w-96 h-64'
        } bg-windows-window shadow-lg ${
          isActive ? 'z-50' : 'z-40'
        }`}
        onClick={onFocus}
      >
        <div className="window-title-bar h-8 bg-windows-title-bar flex items-center justify-between px-2">
          <span>{id}</span>
          <div className="flex space-x-2">
            <button
              className="w-6 h-6 hover:bg-gray-700"
              onClick={handleMaximize}
            >
              □
            </button>
            <button
              className="w-6 h-6 hover:bg-red-600"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-4">
          {/* Window content goes here */}
          <p>Content for {id}</p>
        </div>
      </div>
    </Draggable>
  );
};