import React, { useRef } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { useWindowStore } from '@/app/stores/windowStore';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import Image from 'next/image';
import { WindowContent } from './WindowContent';
import { getIconForWindow, getWindowTitle } from '@/app/utils/iconUtils';

interface WindowProps {
  id: string;
}

export const Window: React.FC<WindowProps> = ({ id }) => {
  const rndRef = useRef<Rnd>(null);
  const fileSystem = useFileSystemStore();
  
  // Get all window information from the store
  const windowState = useWindowStore(state => state.windows[id]);
  const activeWindowId = useWindowStore(state => state.activeWindowId);
  const updateWindowPosition = useWindowStore(state => state.updateWindowPosition);
  const updateWindowSize = useWindowStore(state => state.updateWindowSize);
  const setActiveWindow = useWindowStore(state => state.setActiveWindow);
  const minimizeWindow = useWindowStore(state => state.minimizeWindow);
  const maximizeWindow = useWindowStore(state => state.maximizeWindow);
  const unmaximizeWindow = useWindowStore(state => state.unmaximizeWindow);
  const closeWindow = useWindowStore(state => state.closeWindow);
  
  // Check if window exists
  if (!windowState) return null;
  
  const { isMinimized, isMaximized, position, size, zIndex } = windowState;
  const isActive = activeWindowId === id;
  
  if (isMinimized) return null;
  
  const handleMinimize = () => {
    minimizeWindow(id);
  };
  
  const handleMaximize = () => {
    if (isMaximized) {
      unmaximizeWindow(id);
    } else {
      maximizeWindow(id);
    }
  };
  
  const handleClose = () => {
    closeWindow(id);
  };
  
  const isEditorWindow = id.startsWith('editor-') || id.startsWith('vscode-');
  
  const maximizedSize = {
    width: window.innerWidth,
    height: window.innerHeight - 48, // Subtract taskbar height
  };
  const maximizedPosition = { x: 0, y: 0 };
  
  return (
    <Rnd
      ref={rndRef}
      position={isMaximized ? maximizedPosition : position}
      size={isMaximized ? maximizedSize : size}
      minWidth={400}
      minHeight={300}
      style={{ zIndex }}
      onDragStop={(e, d) => {
        if (!isMaximized) {
          updateWindowPosition(id, { x: d.x, y: d.y });
        }
      }}
      onResize={(e, direction, ref, delta, position) => {
        if (!isMaximized) {
          updateWindowSize(id, {
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          });
          updateWindowPosition(id, position);
        }
      }}
      onMouseDown={() => setActiveWindow(id)}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      // prevent window dragging when interacting with file items
      cancel=".draggable-item"
      bounds="window"
      resizeHandleClasses={{
        bottom: 'h-1 bg-transparent ',
        bottomLeft: 'h-2 w-2 bg-transparent ',
        bottomRight: 'h-2 w-2 bg-transparent ',
        left: 'w-1 bg-transparent ',
        right: 'w-1 bg-transparent ',
        top: 'h-1 bg-transparent ',
        topLeft: 'h-2 w-2 bg-transparent ',
        topRight: 'h-2 w-2 bg-transparent '
      }}
    >
      <div 
        className={`flex flex-col h-full ${isEditorWindow ? 'bg-[#1e1e1e]' : 'bg-white'} shadow-lg overflow-hidden border ${
          isActive ? 'border-blue-400' : 'border-gray-200'
        } ${isMaximized ? '' : 'rounded-lg'}`}
      >
        {/* Window Title Bar */}
        <div 
          className={`h-9 flex items-center justify-between select-none ${
            isActive 
              ? isEditorWindow ? 'bg-[#333333] text-white' : 'bg-white' 
              : isEditorWindow ? 'bg-[#252525] text-gray-300' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-2 px-3">
            <Image
              src={getIconForWindow(id)}
              alt="icon"
              width={16}
              height={16}
              className="w-4 h-4"
              unoptimized={true}
            />
            <span className={`text-sm ${isEditorWindow ? 'text-gray-300' : 'text-gray-700'}`}>
              {getWindowTitle(id, fileSystem.items, fileSystem.currentPath)}
            </span>
          </div>
          <div className="flex h-full">
            <button 
              className={`px-4 ${isEditorWindow ? 'hover:bg-[#444444]' : 'hover:bg-gray-100'} flex items-center justify-center h-full`}
              onClick={handleMinimize}
            >
              <Minus size={16} className={isEditorWindow ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            <button 
              className={`px-4 ${isEditorWindow ? 'hover:bg-[#444444]' : 'hover:bg-gray-100'} flex items-center justify-center h-full`}
              onClick={handleMaximize}
            >
              <Square size={14} className={isEditorWindow ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            <button 
              className="px-4 hover:bg-red-500 flex items-center justify-center h-full group"
              onClick={handleClose}
            >
              <X size={16} className="text-gray-600 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-hidden">
          <WindowContent windowId={id} />
        </div>
      </div>
    </Rnd>
  );
};