import React, { useRef, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { useWindowStore } from '@/app/stores/windowStore';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import Image from 'next/image';
import { WindowContent } from './WindowContent';
import { getIconForWindow, getWindowTitle } from '@/app/utils/iconUtils';

interface WindowProps {
  id: string;
  title?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  onClose?: () => void;
  hideMinimize?: boolean;
  hideMaximize?: boolean;
  resizable?: boolean;
  alwaysOnTop?: boolean;
  initialState?: {
    isMaximized?: boolean;
    isMinimized?: boolean;
  };
  children?: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ 
  id, 
  title,
  width,
  height,
  x,
  y,
  onClose,
  hideMinimize = false,
  hideMaximize = false,
  resizable = true,
  alwaysOnTop = false,
  initialState,
  children
}) => {
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
  
  useEffect(() => {
    if (!windowState && (width || height || x || y || title || initialState)) {
      let initialWidth = width || 800;
      let initialHeight = height || 600;
      
      if (id.startsWith('password-dialog-')) {
        initialWidth = 400;
        initialHeight = 300;
      }
      
      const initialOptions: any = {
        id,
        width: initialWidth,
        height: initialHeight,
        x,
        y
      };
      
      if (title) initialOptions.title = title;
      if (children) initialOptions.content = children;
      if (initialState?.isMaximized) initialOptions.isMaximized = true;
      if (initialState?.isMinimized) initialOptions.isMinimized = true;
      if (hideMinimize) initialOptions.minimizable = false;
      if (hideMaximize) initialOptions.maximizable = false;
      if (!resizable) initialOptions.resizable = false;
      
      useWindowStore.getState().createWindow(initialOptions);
    }
  }, [id, width, height, x, y, title, initialState, children, windowState, hideMinimize, hideMaximize, resizable]);
  
  // cleanup for GBA emulator
  useEffect(() => {
    return () => {
      if (id.startsWith('gameboy-')) {
          document.querySelectorAll('audio').forEach(audio => {
          audio.pause();
          audio.srcObject = null;
        });
        
        if (window.EJS_terminate && typeof window.EJS_terminate === 'function') {
          try {
            window.EJS_terminate();
          } catch (error) {
            console.error('Error terminating EmulatorJS:', error);
          }
        }
      }
    };
  }, [id]);
  
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
    if (onClose) {
      onClose();
    } else {
      if (id.startsWith('gameboy-')) {
        document.querySelectorAll('audio').forEach(audio => {
          audio.pause();
          audio.srcObject = null;
        });
        
        if (window.EJS_terminate && typeof window.EJS_terminate === 'function') {
          window.EJS_terminate();
        }
      }
      
      closeWindow(id);
    }
  };
  
  const isEditorWindow = id.startsWith('editor-') || id.startsWith('vscode-');
  const isPasswordDialog = id.startsWith('password-dialog-');
  
  const maximizedSize = {
    width: window.innerWidth,
    height: window.innerHeight - 48, // Subtract taskbar height
  };
  const maximizedPosition = { x: 0, y: 0 };
  
  const effectiveZIndex = alwaysOnTop ? 9999 : zIndex;
  
  const minWidth = isPasswordDialog ? 400 : 400;
  const minHeight = isPasswordDialog ? 300 : 300;
  
  return (
    <Rnd
      ref={rndRef}
      position={isMaximized ? maximizedPosition : position}
      size={isMaximized ? maximizedSize : size}
      minWidth={minWidth}
      minHeight={minHeight}
      style={{ zIndex: effectiveZIndex }}
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
      enableResizing={!isMaximized && resizable}
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
              {windowState.title || getWindowTitle(id, fileSystem.items, fileSystem.currentPath)}
            </span>
          </div>
          <div className="flex h-full">
            {!hideMinimize && (
              <button 
                className={`px-4 ${isEditorWindow ? 'hover:bg-[#444444]' : 'hover:bg-gray-100'} flex items-center justify-center h-full`}
                onClick={handleMinimize}
              >
                <Minus size={16} className={isEditorWindow ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            )}
            {!hideMaximize && !isPasswordDialog && (
              <button 
                className={`px-4 ${isEditorWindow ? 'hover:bg-[#444444]' : 'hover:bg-gray-100'} flex items-center justify-center h-full`}
                onClick={handleMaximize}
              >
                <Square size={14} className={isEditorWindow ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            )}
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
          {children || <WindowContent windowId={id} />}
        </div>
      </div>
    </Rnd>
  );
};