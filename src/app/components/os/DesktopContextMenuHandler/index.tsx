import React from 'react';
import { ContextMenu } from '../ContextMenu';
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

const DesktopContextMenuHandler: React.FC<DesktopContextMenuHandlerProps> = ({
  contextMenu,
  onClose,
  getContextMenuItems
}) => {
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

export default DesktopContextMenuHandler;