import React, { useState, useEffect } from 'react';
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
  const [imagePath, setImagePath] = useState('/images/placeholder.svg');
  
  // Get image path based on file content
  useEffect(() => {
    if (file && file.type === 'file') {
      if (file.content && typeof file.content === 'string' && 
          (file.content.startsWith('/images/') || file.content.startsWith('/pdfs/'))) {
        setImagePath(file.content);
      } else if (file.extension && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(file.extension.toLowerCase())) {
        setImagePath(`/images/projects/${file.name}`);
      } else {
        setImagePath('/images/placeholder.svg');
      }
    }
  }, [file]);

  if (!file || file.type !== 'file') {
    return <div className="p-4">File not found.</div>;
  }

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
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
        className={`flex-1 flex items-center justify-center bg-white overflow-auto ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      >
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-2 right-2 p-2 bg-gray-800 text-white rounded-full opacity-50 hover:opacity-100 z-10"
          >
            <X size={20} />
          </button>
        )}
        
        <img
          src={imagePath}
          alt={file.name || 'Image'}
          style={{ 
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
          className="max-h-full max-w-full"
        />
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