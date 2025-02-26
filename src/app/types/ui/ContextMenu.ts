// Define submenu item types
export interface ContextMenuSubmenuItem {
  label: string;
  onClick: () => void;
}

// Define different context menu item types
export type ContextMenuItem = 
  | { label: string; onClick?: () => void; disabled?: boolean; }
  | { label: string; submenu: ContextMenuSubmenuItem[]; }
  | { divider: boolean; };

export interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}