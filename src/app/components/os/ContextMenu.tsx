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
      className="context-menu fixed z-50 w-48 bg-white shadow-md rounded-none border border-gray-300"
      style={{ 
        left: x,
        top: y,
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.divider ? (
            <div className="h-[1px] bg-gray-300 my-[2px] mx-[1px]" />
          ) : (
            <button
              className={`w-full px-3 py-[6px] text-left flex items-center space-x-2
                ${item.disabled 
                  ? 'text-gray-400 cursor-default' 
                  : 'text-gray-900 hover:bg-[#f2f2f2]'}`}
              style={{
                fontSize: '12px',
                lineHeight: '1',
                fontFamily: 'Segoe UI, system-ui, sans-serif'
              }}
              onClick={() => {
                if (!item.disabled && item.onClick) {
                  item.onClick();
                  onClose();
                }
              }}
              disabled={item.disabled}
            >
              <span>{item.label}</span>
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};