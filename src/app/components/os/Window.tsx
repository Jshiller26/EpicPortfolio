import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileExplorer } from './FileExplorer';
import { Minus, Square, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { useWindowStore } from '@/app/stores/windowStore';

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
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [previousState, setPreviousState] = useState({ position, size });
  
  const { addMinimizedWindow, removeMinimizedWindow, minimizedWindows } = useWindowStore();
  const rndRef = useRef<Rnd>(null);

  useEffect(() => {
    const isMinimized = minimizedWindows.some(w => w.id === id);
    if (!isMinimized && isMinimizing) {
      setIsMinimizing(false);
      if (rndRef.current?.resizableElement.current) {
        rndRef.current.resizableElement.current.style.transform = 'none';
      }
    }
  }, [minimizedWindows, id, isMinimizing]);

  useEffect(() => {
    if (isMaximized) {
      const taskbarHeight = 48;
      setPosition({ x: 0, y: 0 });
      setSize({
        width: window.innerWidth,
        height: window.innerHeight - taskbarHeight
      });
    }
  }, [isMaximized]);

  const getIconPath = () => {
    if (id.startsWith('explorer-')) {
      return '/images/desktop/icons8-folder.svg';
    }
    return '/images/desktop/icons8-window.svg';
  };

  const getWindowTitle = () => {
    if (id.startsWith('explorer-')) {
      return 'File Explorer';
    }
    return 'Window';
  };

  const handleMinimize = async () => {
    if (rndRef.current) {
      const rndNode = rndRef.current.resizableElement.current;
      const taskbarIcon = document.querySelector(`[data-taskbar-id="${id}"]`);
      
      if (taskbarIcon && rndNode) {
        const windowRect = rndNode.getBoundingClientRect();
        const iconRect = taskbarIcon.getBoundingClientRect();
        
        setIsMinimizing(true);
        
        addMinimizedWindow({
          id,
          title: getWindowTitle(),
          icon: getIconPath(),
        });

        const scaleX = iconRect.width / windowRect.width;
        const scaleY = iconRect.height / windowRect.height;
        const translateX = iconRect.left - windowRect.left;
        const translateY = iconRect.top - windowRect.top;

        rndNode.style.transition = 'transform 0.3s ease-in-out';
        rndNode.style.transform = 
          `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  };

  const handleMaximize = () => {
    if (!isMaximized) {
      setPreviousState({ position, size });
    } else {
      setPosition(previousState.position);
      setSize(previousState.size);
    }
    setIsMaximized(!isMaximized);
  };

  const renderWindowContent = () => {
    if (id.startsWith('explorer-')) {
      return <FileExplorer windowId={id} />;
    }
    return <div>Window Content</div>;
  };

  if (isMinimizing && minimizedWindows.some(w => w.id === id)) return null;

  return (
    <Rnd
      ref={rndRef}
      position={position}
      size={size}
      minWidth={400}
      minHeight={300}
      onDragStop={(e, d) => {
        if (!isMaximized) {
          setPosition({ x: d.x, y: d.y });
        }
      }}
      onResize={(e, direction, ref, delta, position) => {
        if (!isMaximized) {
          setPosition(position);
          setSize({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          });
        }
      }}
      className={`${isActive ? 'z-50' : 'z-0'}`}
      onMouseDown={onFocus}
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
        className={`flex flex-col h-full bg-white shadow-lg overflow-hidden border border-gray-200 ${
          isMaximized ? '' : 'rounded-lg'
        }`}
      >
        {/* Window Title Bar */}
        <div className="h-9 bg-white flex items-center justify-between select-none">
          <div className="flex items-center space-x-2 px-3">
            <img
              src={getIconPath()}
              alt="icon"
              className="w-4 h-4"
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