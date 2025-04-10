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
import GameBoy from './games/GameBoy';
import { useWindowStore } from '@/app/stores/windowStore';
import { PasswordDialog } from './PasswordDialog';

interface WindowContentProps {
  windowId: string;
}

const getWindowType = (windowId: string) => {
  const parts = windowId.split('-');
  if (parts.length < 2) return '';
  
  if (windowId.startsWith('vscode-')) {
    return 'vscode';
  }
  
  if (windowId.startsWith('password-dialog-')) {
    return 'password-dialog';
  }
  
  return parts[0];
};

const getContentId = (windowId: string) => {
  const parts = windowId.split('-');
  if (parts.length < 3) return '';
  
  if (windowId.startsWith('vscode-')) {
    return 'new';
  }
  
  if (windowId.startsWith('password-dialog-')) {
    return windowId.split('-')[2];
  }
  
  parts.shift();
  parts.pop();
  
  return parts.join('-');
};

export const WindowContent: React.FC<WindowContentProps> = ({ windowId }) => {
  const fileSystem = useFileSystemStore();  
  const windowStore = useWindowStore();
  const windowType = getWindowType(windowId);
  const contentId = getContentId(windowId);
  
  const windowData = windowStore.windows[windowId];
  
  if (windowData && windowData.content) {
    return windowData.content;
  }
  
  // Handle specific window types
  if (windowType === 'explorer') {
    // File Explorer
    return <FileExplorer windowId={windowId} />;
  } else if (windowType === 'editor') {
    // Text Editor
    const file = fileSystem.items[contentId] as File;
    
    if (file && file.type === 'file') {
      if (isTextFile(file)) {
        return <TextEditor fileId={contentId} />;
      } else {
        return <div className="p-4">This file type is not supported by the text editor.</div>;
      }
    }
    return <div className="p-4">File not found.</div>;
  } else if (windowType === 'vscode') {
    return <BlankTextEditor windowId={windowId} />;
  } else if (windowType === 'image') {
    return <ImageViewer fileId={contentId} />;
  } else if (windowType === 'pdf') {
    const file = fileSystem.items[contentId] as File;
    
    if (file && file.type === 'file') {
      return <PDFViewer fileId={contentId} />;
    }
    return <div className="p-4">PDF not found.</div>;
  } else if (windowType === 'video') {
    const file = fileSystem.items[contentId] as File;
    
    if (file && file.type === 'file') {
      return <VideoPlayer fileId={contentId} />;
    }
    return <div className="p-4">Video not found.</div>;
  } else if (windowType === 'chrome') {
    return <Browser windowId={windowId} />;
  } else if (windowType === 'gameboy') {
    const gameName = contentId || 'PokemonEmerald';
    return <GameBoy game={gameName} />;
  } else if (windowType === 'password-dialog') {
    const folderId = contentId;
    const folder = fileSystem.items[folderId];
    
    const handleClose = () => {
      windowStore.closeWindow(windowId);
    };
    
    const handleSuccess = () => {
      fileSystem.unlockFolder(folderId);
      
      windowStore.closeWindow(windowId);
      
      setTimeout(() => {
        windowStore.openWindow(`explorer-${folderId}`);
      }, 100);
    };
    
    return (
      <PasswordDialog
        folderId={folderId}
        folderName={folder?.name || 'Protected Folder'}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );
  }
  
  // Default content for unknown window types
  return <div className="p-4">Window Content</div>;
};