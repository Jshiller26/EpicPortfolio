'use client';

import React, { useState, useEffect } from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { File } from '@/app/types/fileSystem';

interface PDFViewerProps {
  fileId: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ fileId }) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileSystem = useFileSystemStore();
  
  useEffect(() => {
    const file = fileSystem.items[fileId] as File;
    
    if (file && file.type === 'file') {
      const fileName = file.name;
      
      setPdfUrl(`/pdfs/${fileName}#pagemode=none&view=FitH&zoom=100`);
      setLoading(false);
    } else {
      setError("File not found in the file system");
      setLoading(false);
    }
  }, [fileId, fileSystem.items]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <div className="mt-2 text-gray-600">Loading PDF...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <div>Error loading PDF:</div>
          <div className="mt-1">{error}</div>
        </div>
      </div>
    );
  }

  // Use a simple iframe with the browser's built-in PDF viewer
  return (
    <div className="w-full h-full">
      <iframe 
        src={pdfUrl}
        className="w-full h-full border-none"
        title="PDF Viewer"
      />
    </div>
  );
};

export default PDFViewer;