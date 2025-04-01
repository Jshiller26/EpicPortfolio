import { useState } from 'react';
import { ContextMenuItem } from '@/app/types/ui/ContextMenu';
import { ContextMenuState } from '../components/os/DesktopContextMenuHandler';
import { getDesktopContextMenu, getItemContextMenu } from '@/app/utils/desktopUtils';

interface UseDesktopContextMenuProps {
  handleCreateNewFolder: () => void;
  handleCreateTextFile: () => void;
  handlePaste: () => void;
  handleOpen: (itemId: string) => void;
  handleCut: (itemId: string) => void;
  handleCopy: (itemId: string) => void;
  handleDelete: (itemId: string) => void;
  handleRename: (itemId: string) => void;
  handleProperties: (itemId: string) => void;
  hasClipboardItem: boolean;
}

export const useDesktopContextMenu = ({
  handleCreateNewFolder,
  handleCreateTextFile,
  handlePaste,
  handleOpen,
  handleCut,
  handleCopy,
  handleDelete,
  handleRename,
  handleProperties,
  hasClipboardItem
}: UseDesktopContextMenuProps) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    itemId: null
  });

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      itemId
    });
  };

  const handleDesktopContextMenu = (e: React.MouseEvent, gridSize: number) => {
    // Only show desktop context menu if rightclicking the desktop itself
    if (e.target === e.currentTarget) {
      e.preventDefault();
      
      const desktopRect = e.currentTarget.getBoundingClientRect();
      const desktopX = e.clientX - desktopRect.left;
      const desktopY = e.clientY - desktopRect.top;
      
      const gridX = Math.floor(desktopX / gridSize) * gridSize;
      const gridY = Math.floor(desktopY / gridSize) * gridSize;
      
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        itemId: null,
        desktopX: gridX,
        desktopY: gridY
      });
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const getContextMenuItems = (itemId: string | null): ContextMenuItem[] => {
    if (itemId === null) {
      return getDesktopContextMenu(
        handleCreateNewFolder,
        handleCreateTextFile,
        handlePaste,
        hasClipboardItem
      );
    }

    return getItemContextMenu(
      itemId,
      handleOpen,
      handleCut,
      handleCopy,
      handleDelete,
      handleRename,
      handleProperties
    );
  };

  return {
    contextMenu,
    handleContextMenu,
    handleDesktopContextMenu,
    handleCloseContextMenu,
    getContextMenuItems
  };
};