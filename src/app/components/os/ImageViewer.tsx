import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize2, X } from 'lucide-react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { File } from '@/app/types/fileSystem';

interface ImageViewerProps {
  fileId: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ fileId }) => {
  const fileSystem = useFileSystemStore();
  const file = fileSystem.items[fileId] as File;
  
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  if (!file || file.type !== 'file') {
    return <div className="p-4">File not found.</div>;
  }

  const getImagePath = () => {
    if (file.content && typeof file.content === 'string' && 
        (file.content.startsWith('/images/') || file.content.startsWith('/pdfs/'))) {
      return file.content;
    }
    
    const extension = file.extension?.toLowerCase();
    if (extension && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return `/images/projects/${file.name}`;
    }
  };

  const zoomIn = () => {
    setZoom(prev => {
      const newZoom = Math.min(prev + 0.25, 3);
      // Reset position when zooming back to 1
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const zoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.25, 0.25);
      // Reset position when zooming back to 1
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const rotateClockwise = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const rotateCounterClockwise = () => {
    setRotation(prev => (prev - 90 + 360) % 360);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // Mouse event handlers for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
      // Add cursor styling
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }
      e.preventDefault(); // Prevent default behavior
      e.stopPropagation(); // Stop propagation to parent
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;
      setPosition({ x: newX, y: newY });
      e.preventDefault(); // Prevent default behavior
      e.stopPropagation(); // Stop propagation to parent
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(false);
    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
    }
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop propagation to parent
  };

  // Reset position when zoom changes to 1
  React.useEffect(() => {
    if (zoom === 1) {
      setPosition({ x: 0, y: 0 });
    }
    // Update cursor based on zoom level
    if (containerRef.current) {
      containerRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
    }
  }, [zoom]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center border-b p-1 bg-gray-50">
        <button onClick={zoomIn} className="p-1 mx-1 hover:bg-gray-200 rounded" title="Zoom In">
          <ZoomIn size={16} />
        </button>
        <button onClick={zoomOut} className="p-1 mx-1 hover:bg-gray-200 rounded" title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <div className="mx-2 text-sm text-gray-600">{Math.round(zoom * 100)}%</div>
        <div className="w-px h-5 bg-gray-300 mx-2"></div>
        <button onClick={rotateClockwise} className="p-1 mx-1 hover:bg-gray-200 rounded" title="Rotate Clockwise">
          <RotateCw size={16} />
        </button>
        <button onClick={rotateCounterClockwise} className="p-1 mx-1 hover:bg-gray-200 rounded" title="Rotate Counter-clockwise">
          <RotateCcw size={16} />
        </button>
        <div className="w-px h-5 bg-gray-300 mx-2"></div>
        <button onClick={toggleFullscreen} className="p-1 mx-1 hover:bg-gray-200 rounded" title="Toggle Fullscreen">
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className={`flex-1 flex items-center justify-center bg-white overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-2 right-2 p-2 bg-gray-800 text-white rounded-full opacity-50 hover:opacity-100 z-10"
          >
            <X size={20} />
          </button>
        )}
        
        <div 
          className="relative" 
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: zoom === 1 ? 'transform 0.2s ease-in-out' : 'none',
            padding: '0.5rem'
          }}
        >
          <Image
            src={getImagePath()}
            alt={file.name}
            width={1000}
            height={800}
            className="pointer-events-none max-h-[calc(100vh-6rem)] max-w-full object-contain"
            unoptimized={true}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t py-1 px-2 bg-gray-50 text-xs flex justify-between items-center">
        <div>{file.name}</div>
        <div>
          {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;