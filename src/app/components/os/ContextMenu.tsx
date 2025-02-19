import React from 'react';

interface ContextMenuItem {
  label: string;
  icon?: string;
  divider?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.context-menu')) {
        onClose();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div 
      className="context-menu fixed z-50 w-64 bg-white shadow-lg rounded-md border border-gray-200 py-1"
      style={{ 
        left: x,
        top: y,
        filter: 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.1))'
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.divider ? (
            <div className="h-px bg-gray-200 my-1" />
          ) : (
            <button
              className={`w-full px-4 py-1.5 text-left flex items-center space-x-2 text-sm
                ${item.disabled 
                  ? 'text-gray-400 cursor-default' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
              onClick={() => {
                if (!item.disabled && item.onClick) {
                  item.onClick();
                  onClose();
                }
              }}
              disabled={item.disabled}
            >
              {item.icon && (
                <img src={item.icon} alt="" className="w-4 h-4" />
              )}
              <span>{item.label}</span>
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};