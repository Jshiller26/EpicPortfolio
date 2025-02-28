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
    
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('closeAllContextMenus', handleCloseEvent);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('closeAllContextMenus', handleCloseEvent);
    };
  }, [contextMenu.visible, onClose]);
  
  if (!contextMenu.visible) {
    return null;
  }

  return (
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      items={getContextMenuItems(contextMenu.itemId)}
      onClose={onClose}
    />
  );
};