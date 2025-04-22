import React, { useEffect } from 'react';
import { ContextMenu } from './ContextMenu';
import { ContextMenuItem } from '@/app/types/ui/ContextMenu';

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  itemId: string | null;
  desktopX?: number;
  desktopY?: number;
}

interface DesktopContextMenuHandlerProps {
  contextMenu: ContextMenuState;
  onClose: () => void;
  getContextMenuItems: (itemId: string | null) => ContextMenuItem[];
}

export const DesktopContextMenuHandler: React.FC<DesktopContextMenuHandlerProps> = ({
  contextMenu,
  onClose,
  getContextMenuItems
}) => {
  useEffect(() => {
    if (!contextMenu.visible) return;
    
    const handleGlobalClick = () => {
      setTimeout(() => {
        onClose();
      }, 10);
    };

    const handleCloseEvent = () => {
      onClose();
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('closeAllContextMenus', handleCloseEvent);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('closeAllContextMenus', handleCloseEvent);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.visible, onClose]);
  
  if (!contextMenu.visible) {
    return null;
  }

  const menuItems = getContextMenuItems(contextMenu.itemId);

  return (
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      items={menuItems}
      onClose={onClose}
    />
  );
};