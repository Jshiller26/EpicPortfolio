import React, { useRef } from 'react';
import { FileExplorer } from './FileExplorer';
import { Minus, Square, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { useWindowStore } from '@/app/stores/windowStore';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import Image from 'next/image';
import TextEditor from './TextEditor';
import { File } from '@/app/types/fileSystem';

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
  
  const getIconPath = () => {
    if (id.startsWith('explorer-')) {
      return '/images/desktop/icons8-folder.svg';
    } else if (id.startsWith('editor-')) {
      return '/images/desktop/icons8-text-file.svg';
    } else if (id.startsWith('image-')) {
      return '/images/desktop/icons8-image.svg';
    } else if (id.startsWith('pdf-')) {
      return '/images/desktop/icons8-pdf.svg';
    }
    return '/images/desktop/icons8-window.svg';
  };
  
  const getWindowTitle = () => {
    if (id.startsWith('explorer-')) {
      // Get the folder name for the path currently being shown
      const folderId = id.replace('explorer-', '');
      const folder = fileSystem.items[folderId];
      
      if (folder && folder.type === 'folder') {
        return folder.name;
      }
      
      // Fallback to the path
      const pathParts = fileSystem.currentPath.split('\\');
      return pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'File Explorer';
    } else if (id.startsWith('editor-')) {
      const fileId = id.replace('editor-', '');
      const file = fileSystem.items[fileId];
      return file ? file.name : 'Text Editor';
    } else if (id.startsWith('image-')) {
      const fileId = id.replace('image-', '');
      const file = fileSystem.items[fileId];
      return file ? file.name : 'Image Viewer';
    } else if (id.startsWith('pdf-')) {
      const fileId = id.replace('pdf-', '');
      const file = fileSystem.items[fileId];
      return file ? file.name : 'PDF Viewer';
    }
    return 'Window';
  };
  
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

  const isTextFile = (file: File): boolean => {
    const textExtensions = ['txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'json', 'yml', 'yaml', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'php', 'rb', 'swift', 'go', 'rs', 'sql', 'xml', 'sh', 'bat', 'ps1'];
    return textExtensions.includes(file.extension.toLowerCase());
  };
  
  const renderWindowContent = () => {
    if (id.startsWith('explorer-')) {
      // Pass the window ID to FileExplorer so it can determine the correct path
      return <FileExplorer windowId={id} />;
    } else if (id.startsWith('editor-')) {
      const fileId = id.replace('editor-', '');
      const file = fileSystem.items[fileId] as File;
      
      if (file && file.type === 'file') {
        if (isTextFile(file)) {
          return <TextEditor fileId={fileId} />;
        } else {
          return <div className="p-4">This file type is not supported by the text editor.</div>;
        }
      }
      return <div className="p-4">File not found.</div>;
    } else if (id.startsWith('image-')) {
      // Image viewer goes here
      return <div className="p-4">Image Viewer Content</div>;
    } else if (id.startsWith('pdf-')) {
      // PDF viewer goes here
      return <div className="p-4">PDF Viewer Content</div>;
    }
    return <div className="p-4">Window Content</div>;
  };
  
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
        className={`flex flex-col h-full bg-white shadow-lg overflow-hidden border ${
          isActive ? 'border-blue-400' : 'border-gray-200'
        } ${isMaximized ? '' : 'rounded-lg'}`}
      >
        {/* Window Title Bar */}
        <div 
          className={`h-9 flex items-center justify-between select-none ${
            isActive ? 'bg-white' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-2 px-3">
            <Image
              src={getIconPath()}
              alt="icon"
              width={16}
              height={16}
              className="w-4 h-4"
              unoptimized={true}
            />
            <span className="text-sm text-gray-700">{getWindowTitle()}</span>
          </div>
          <div className="flex h-full">
            <button 
              className="px-4 hover:bg-gray-100 flex items-center justify-center h-full"
              onClick={handleMinimize}
            >
              <Minus size={16} className="text-gray-600" />
            </button>
            <button 
              className="px-4 hover:bg-gray-100 flex items-center justify-center h-full"
              onClick={handleMaximize}
            >
              <Square size={14} className="text-gray-600 rounded-sm" />
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
          {renderWindowContent()}
        </div>
      </div>
    </Rnd>
  );
};