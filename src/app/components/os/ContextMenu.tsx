import React, { useEffect, useRef } from 'react';
import { ContextMenuProps } from '../../types/ui/ContextMenu';

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  
  // Position adjustment to keep menu within viewport
  const adjustPosition = () => {
    const menuWidth = 192;
    const menuHeight = items.length * 28; // Approximate height based on items
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > windowWidth) {
      adjustedX = windowWidth - menuWidth - 8;
    }

    if (y + menuHeight > windowHeight) {
      adjustedY = windowHeight - menuHeight - 8;
    }

    return { x: adjustedX, y: adjustedY };
  };

  const { x: menuX, y: menuY } = adjustPosition();

  // State to track which submenu is currently open
  const [openSubmenuIndex, setOpenSubmenuIndex] = React.useState<number | null>(null);

  useEffect(() => {
    // Create a handler at the document level
    const handleClickOutside = (e: MouseEvent) => {
      // Check if click was inside any context menu
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node) &&
          (!submenuRef.current || !submenuRef.current.contains(e.target as Node))) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Add the handler to mousedown to catch clicks
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Prevent default context menu on our menu
  const preventDefault = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      ref={contextMenuRef}
      className="context-menu fixed z-50 w-48 bg-white shadow-md rounded-none border border-gray-300"
      style={{ 
        left: menuX,
        top: menuY,
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
      }}
      onContextMenu={preventDefault}
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
                onClick={(e) => {
                  e.stopPropagation();
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
                  ref={submenuRef}
                  className="context-menu absolute z-50 w-48 bg-white shadow-md rounded-none border border-gray-300"
                  style={{ 
                    left: '100%',
                    top: '0',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                  }}
                  onContextMenu={preventDefault}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        // Execute item action and then close
                        subItem.onClick();
                        // Immediately close without delay
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
              onClick={(e) => {
                e.stopPropagation();
                if (!item.disabled && item.onClick) {
                  // Execute action first
                  item.onClick();
                  // Then close the menu immediately
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