import React from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { File } from '@/app/types/fileSystem';
import { FileExplorer } from './FileExplorer';
import TextEditor from './TextEditor';
import BlankTextEditor from './BlankTextEditor';
import { isTextFile } from '@/app/utils/iconUtils';
import PDFViewer from './PDFViewer';
import VideoPlayer from './VideoPlayer';
import Browser from './browser/Browser';
import ImageViewer from './ImageViewer';

interface WindowContentProps {
  windowId: string;
}

export const WindowContent: React.FC<WindowContentProps> = ({ windowId }) => {
  const fileSystem = useFileSystemStore();

  // Handle specific window types
  if (windowId.startsWith('explorer-')) {
    // File Explorer
    return <FileExplorer windowId={windowId} />;
  } else if (windowId.startsWith('editor-')) {
    // Text Editor
    const fileId = windowId.replace('editor-', '');
    const file = fileSystem.items[fileId] as File;
    
    if (file && file.type === 'file') {
      if (isTextFile(file)) {
        return <TextEditor fileId={fileId} />;
      } else {
        return <div className="p-4">This file type is not supported by the text editor.</div>;
      }
    }
    return <div className="p-4">File not found.</div>;
  } else if (windowId.startsWith('vscode-')) {
    return <BlankTextEditor windowId={windowId} />;
  } else if (windowId.startsWith('image-')) {
    const fileId = windowId.replace('image-', '');
    return <ImageViewer fileId={fileId} />;
  } else if (windowId.startsWith('pdf-')) {
    const fileId = windowId.replace('pdf-', '');
    const file = fileSystem.items[fileId] as File;
    
    if (file && file.type === 'file') {
      return <PDFViewer fileId={fileId} />;
    }
    return <div className="p-4">PDF not found.</div>;
  } else if (windowId.startsWith('video-')) {
    const fileId = windowId.replace('video-', '');
    const file = fileSystem.items[fileId] as File;
    
    if (file && file.type === 'file') {
      return <VideoPlayer fileId={fileId} />;
    }
    return <div className="p-4">Video not found.</div>;
  } else if (windowId.startsWith('chrome-')) {
    return <Browser windowId={windowId} />;
  }
  
  // Default content for unknown window types
  return <div className="p-4">Window Content</div>;
};