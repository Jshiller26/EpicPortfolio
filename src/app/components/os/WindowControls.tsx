import React, { useState } from 'react';
import { Minus, Square, X } from 'lucide-react';

interface WindowControlsProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div className="flex h-full">
      <button 
        onClick={onMinimize}
        className="px-4 hover:bg-gray-700 flex items-center justify-center h-full"
      >
        <Minus size={16} />
      </button>
      <button 
        onClick={onMaximize}
        className="px-4 hover:bg-gray-700 flex items-center justify-center h-full"
      >
        <Square size={14} className="rounded-sm" />
      </button>
      <button 
        onClick={onClose}
        className="px-4 hover:bg-red-500 flex items-center justify-center h-full group"
      >
        <X 
          size={16} 
          className="group-hover:text-white" 
        />
      </button>
    </div>
  );
};