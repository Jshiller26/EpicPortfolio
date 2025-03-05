import React from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { File } from '@/app/types/fileSystem';
import { FileExplorer } from './FileExplorer';
import TextEditor from './TextEditor';
import BlankTextEditor from './BlankTextEditor';
import { isTextFile } from '@/app/utils/iconUtils';
import PDFViewer from './PDFViewer';

interface WindowContentProps {
  windowId: string;
}

export const WindowContent: React.FC<WindowContentProps> = ({ windowId }) => {
  const fileSystem = useFileSystemStore();

  if (windowId.startsWith('explorer-')) {
    // Pass the window ID to FileExplorer so it can determine the correct path
    return <FileExplorer windowId={windowId} />;
  } else if (windowId.startsWith('editor-')) {
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
    // Blank VS Code editor
    return <BlankTextEditor windowId={windowId} />;
  } else if (windowId.startsWith('image-')) {
    const fileId = windowId.replace('image-', '');
    const file = fileSystem.items[fileId] as File;
    
    if (file && file.type === 'file') {
      return (
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-gray-500">Image Viewer</div>
            <div className="mt-2 text-sm">{file.name}</div>
          </div>
        </div>
      );
    }
    return <div className="p-4">Image not found.</div>;
  } else if (windowId.startsWith('pdf-')) {
    const fileId = windowId.replace('pdf-', '');
    const file = fileSystem.items[fileId] as File;
    
    if (file && file.type === 'file') {
      return <PDFViewer fileId={file.name} />;
    }
    return <div className="p-4">PDF not found.</div>;
  }
  
  return <div className="p-4">Window Content</div>;
};