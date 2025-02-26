import React from 'react';
import { ContextMenuProps } from '../../types/ui/ContextMenu';

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

  // State to track which submenu is currently open
  const [openSubmenuIndex, setOpenSubmenuIndex] = React.useState<number | null>(null);

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
          {/* Check if this is a divider item */}
          {'divider' in item ? (
            <div className="h-[1px] bg-gray-300 my-[2px] mx-[1px]" />
          ) : 'submenu' in item ? (
            // Submenu Items
            <div className="relative">
              <button
                className="w-full px-3 py-[6px] text-left flex items-center justify-between text-gray-900 hover:bg-[#f2f2f2]"
                style={{
                  fontSize: '12px',
                  lineHeight: '1',
                  fontFamily: 'Segoe UI, system-ui, sans-serif'
                }}
                onClick={() => {
                  setOpenSubmenuIndex(openSubmenuIndex === index ? null : index);
                }}
                onMouseEnter={() => {
                  setOpenSubmenuIndex(index);
                }}
              >
                <span>{item.label}</span>
                <span className="ml-2">▶</span>
              </button>

              {/* Submenu */}
              {openSubmenuIndex === index && (
                <div 
                  className="context-menu absolute z-50 w-48 bg-white shadow-md rounded-none border border-gray-300"
                  style={{ 
                    left: '100%',
                    top: '0',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                  }}
                >
                  {item.submenu.map((subItem, subIndex) => (
                    <button
                      key={subIndex}
                      className="w-full px-3 py-[6px] text-left flex items-center space-x-2 text-gray-900 hover:bg-[#f2f2f2]"
                      style={{
                        fontSize: '12px',
                        lineHeight: '1',
                        fontFamily: 'Segoe UI, system-ui, sans-serif'
                      }}
                      onClick={() => {
                        subItem.onClick();
                        onClose();
                      }}
                    >
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Regular menu item
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