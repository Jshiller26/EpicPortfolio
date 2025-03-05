import React, { useEffect, useRef } from 'react';
import { FileSystemItem, File } from '@/app/types/fileSystem';
import { useClipboardStore } from '@/app/stores/clipboardStore';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';

interface FileExplorerContextMenuProps {
  x: number;
  y: number;
  currentFolder: string;
  selectedItem?: FileSystemItem | null;
  onClose: () => void;
}

const FileExplorerContextMenu: React.FC<FileExplorerContextMenuProps> = ({
  x,
  y,
  currentFolder,
  selectedItem,
  onClose
}) => {
  const clipboard = useClipboardStore();
  const fileSystem = useFileSystemStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  
  // Track which submenu is open
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);
  
  // Determine if the paste option should be enabled
  const canPaste = !!clipboard.item;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          (!submenuRef.current || !submenuRef.current.contains(e.target as Node))) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
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

  const getFileExtension = (item: FileSystemItem): string => {
    if (item.type === 'file') {
      return (item as File).extension?.toLowerCase() || '';
    }
    return '';
  };

  // Actions
  const handleOpen = () => {
    if (!selectedItem) return;
    
    if (selectedItem.type === 'folder') {
      fileSystem.navigateToFolder(selectedItem.id);
    } else {
      const fileExt = getFileExtension(selectedItem);
      const windowType = ['txt', 'md', 'js', 'ts', 'html', 'css', 'py', 'json'].includes(fileExt) 
        ? 'editor' 
        : ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExt)
        ? 'image'
        : fileExt === 'pdf' ? 'pdf' : 'editor';
      
      window.dispatchEvent(new CustomEvent('openWindow', { 
        detail: { windowId: `${windowType}-${selectedItem.id}` } 
      }));
    }
    onClose();
  };

  const handleCut = () => {
    if (!selectedItem) return;
    clipboard.setClipboard(selectedItem, 'cut');
    onClose();
  };

  const handleCopy = () => {
    if (!selectedItem) return;
    clipboard.setClipboard(selectedItem, 'copy');
    onClose();
  };

  const handlePaste = () => {
    if (!clipboard.item) return;
    
    if (clipboard.operation === 'cut') {
      fileSystem.moveItem(clipboard.item.id, currentFolder);
    } else if (clipboard.operation === 'copy') {
      fileSystem.copyItem(clipboard.item.id, currentFolder);
    }
    clipboard.clear();
    onClose();
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    fileSystem.deleteItem(selectedItem.id);
    onClose();
  };

  const handleRename = () => {
    if (!selectedItem) return;
    
    // Trigger a rename event that the item component will listen for
    window.dispatchEvent(new CustomEvent('renameItem', {
      detail: { itemId: selectedItem.id }
    }));
    
    onClose();
  };

  const handleCreateFolder = () => {
    const folderId = fileSystem.createFolder('New Folder', currentFolder);
    
    // Trigger the rename event immediately after creation to start inline renaming
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('renameItem', {
        detail: { itemId: folderId }
      }));
    }, 100);
    
    onClose();
  };

  const handleCreateTextFile = () => {
    const fileId = fileSystem.createFile('New Text Document.txt', currentFolder, '', 0);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('renameItem', {
        detail: { itemId: fileId }
      }));
    }, 100);
    
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      className="custom-context-menu absolute z-[9999] w-48 bg-white shadow-md rounded-none border border-gray-300"
      style={{ 
        left: x,
        top: y,
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
      }}
      onContextMenu={preventDefault}
    >
      {selectedItem ? (
        // Item-specific menu
        <>
          <button
            className="w-full px-3 py-[6px] text-left flex items-center space-x-2 text-gray-900 hover:bg-[#f2f2f2]"
            style={{
              fontSize: '12px',
              lineHeight: '1',
              fontFamily: 'Segoe UI, system-ui, sans-serif'
            }}
            onClick={handleOpen}
          >
            <span>Open</span>
          </button>
          
          <div className="h-[1px] bg-gray-300 my-[2px] mx-[1px]" />
          
          <button
            className="w-full px-3 py-[6px] text-left flex items-center space-x-2 text-gray-900 hover:bg-[#f2f2f2]"
            style={{
              fontSize: '12px',
              lineHeight: '1',
              fontFamily: 'Segoe UI, system-ui, sans-serif'
            }}
            onClick={handleCut}
          >
            <span>Cut</span>
          </button>
          
          <button
            className="w-full px-3 py-[6px] text-left flex items-center space-x-2 text-gray-900 hover:bg-[#f2f2f2]"
            style={{
              fontSize: '12px',
              lineHeight: '1',
              fontFamily: 'Segoe UI, system-ui, sans-serif'
            }}
            onClick={handleCopy}
          >
            <span>Copy</span>
          </button>
          
          <div className="h-[1px] bg-gray-300 my-[2px] mx-[1px]" />
          
          <button
            className="w-full px-3 py-[6px] text-left flex items-center space-x-2 text-gray-900 hover:bg-[#f2f2f2]"
            style={{
              fontSize: '12px',
              lineHeight: '1',
              fontFamily: 'Segoe UI, system-ui, sans-serif'
            }}
            onClick={handleDelete}
          >
            <span>Delete</span>
          </button>
          
          <div className="h-[1px] bg-gray-300 my-[2px] mx-[1px]" />
          
          <button
            className="w-full px-3 py-[6px] text-left flex items-center space-x-2 text-gray-900 hover:bg-[#f2f2f2]"
            style={{
              fontSize: '12px',
              lineHeight: '1',
              fontFamily: 'Segoe UI, system-ui, sans-serif'
            }}
            onClick={handleRename}
          >
            <span>Rename</span>
          </button>
          
          <div className="h-[1px] bg-gray-300 my-[2px] mx-[1px]" />
          
          <button
            className="w-full px-3 py-[6px] text-left flex items-center space-x-2 text-gray-900 hover:bg-[#f2f2f2]"
            style={{
              fontSize: '12px',
              lineHeight: '1',
              fontFamily: 'Segoe UI, system-ui, sans-serif'
            }}
            onClick={() => {
              console.log('Properties for', selectedItem.name);
              onClose();
            }}
          >
            <span>Properties</span>
          </button>
        </>
      ) : (
        // Background/folder menu
        <>
          <div className="relative">
            <button
              className="w-full px-3 py-[6px] text-left flex items-center justify-between text-gray-900 hover:bg-[#f2f2f2]"
              style={{
                fontSize: '12px',
                lineHeight: '1',
                fontFamily: 'Segoe UI, system-ui, sans-serif'
              }}
              onClick={() => setOpenSubmenu(openSubmenu === 'new' ? null : 'new')}
              onMouseEnter={() => setOpenSubmenu('new')}
            >
              <span>New</span>
              <span className="ml-2">▶</span>
            </button>
            
            {openSubmenu === 'new' && (
              <div 
                ref={submenuRef}
                className="absolute z-[9999] w-48 bg-white shadow-md rounded-none border border-gray-300"
                style={{ 
                  left: '100%',
                  top: '0',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                }}
                onContextMenu={preventDefault}
              >
                <button
                  className="w-full px-3 py-[6px] text-left flex items-center space-x-2 text-gray-900 hover:bg-[#f2f2f2]"
                  style={{
                    fontSize: '12px',
                    lineHeight: '1',
                    fontFamily: 'Segoe UI, system-ui, sans-serif'
                  }}
                  onClick={handleCreateFolder}
                >
                  <span>Folder</span>
                </button>
                <button
                  className="w-full px-3 py-[6px] text-left flex items-center space-x-2 text-gray-900 hover:bg-[#f2f2f2]"
                  style={{
                    fontSize: '12px',
                    lineHeight: '1',
                    fontFamily: 'Segoe UI, system-ui, sans-serif'
                  }}
                  onClick={handleCreateTextFile}
                >
                  <span>Text Document</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="h-[1px] bg-gray-300 my-[2px] mx-[1px]" />
          
          <button
            className={`w-full px-3 py-[6px] text-left flex items-center space-x-2
              ${!canPaste ? 'text-gray-400 cursor-default' : 'text-gray-900 hover:bg-[#f2f2f2]'}`}
            style={{
              fontSize: '12px',
              lineHeight: '1',
              fontFamily: 'Segoe UI, system-ui, sans-serif'
            }}
            onClick={canPaste ? handlePaste : undefined}
            disabled={!canPaste}
          >
            <span>Paste</span>
          </button>
          
          <div className="h-[1px] bg-gray-300 my-[2px] mx-[1px]" />
          
          <div className="relative">
            <button
              className="w-full px-3 py-[6px] text-left flex items-center justify-between text-gray-900 hover:bg-[#f2f2f2]"
              style={{
                fontSize: '12px',
                lineHeight: '1',
                fontFamily: 'Segoe UI, system-ui, sans-serif'
              }}
              onClick={() => setOpenSubmenu(openSubmenu === 'view' ? null : 'view')}
              onMouseEnter={() => setOpenSubmenu('view')}
            >
              <span>View</span>
              <span className="ml-2">▶</span>
            </button>
            
            {openSubmenu === 'view' && (
              <div 
                className="absolute z-[9999] w-48 bg-white shadow-md rounded-none border border-gray-300"
                style={{ 
                  left: '100%',
                  top: '0',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                }}
                onContextMenu={preventDefault}
              >
                <button className="w-full px-3 py-[6px] text-left text-gray-900 hover:bg-[#f2f2f2]" style={{ fontSize: '12px' }}>
                  Large Icons
                </button>
                <button className="w-full px-3 py-[6px] text-left text-gray-900 hover:bg-[#f2f2f2]" style={{ fontSize: '12px' }}>
                  Medium Icons
                </button>
                <button className="w-full px-3 py-[6px] text-left text-gray-900 hover:bg-[#f2f2f2]" style={{ fontSize: '12px' }}>
                  Small Icons
                </button>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              className="w-full px-3 py-[6px] text-left flex items-center justify-between text-gray-900 hover:bg-[#f2f2f2]"
              style={{
                fontSize: '12px',
                lineHeight: '1',
                fontFamily: 'Segoe UI, system-ui, sans-serif'
              }}
              onClick={() => setOpenSubmenu(openSubmenu === 'sort' ? null : 'sort')}
              onMouseEnter={() => setOpenSubmenu('sort')}
            >
              <span>Sort By</span>
              <span className="ml-2">▶</span>
            </button>
            
            {openSubmenu === 'sort' && (
              <div 
                className="absolute z-[9999] w-48 bg-white shadow-md rounded-none border border-gray-300"
                style={{ 
                  left: '100%',
                  top: '0',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                }}
                onContextMenu={preventDefault}
              >
                <button className="w-full px-3 py-[6px] text-left text-gray-900 hover:bg-[#f2f2f2]" style={{ fontSize: '12px' }}>
                  Name
                </button>
                <button className="w-full px-3 py-[6px] text-left text-gray-900 hover:bg-[#f2f2f2]" style={{ fontSize: '12px' }}>
                  Size
                </button>
                <button className="w-full px-3 py-[6px] text-left text-gray-900 hover:bg-[#f2f2f2]" style={{ fontSize: '12px' }}>
                  Type
                </button>
                <button className="w-full px-3 py-[6px] text-left text-gray-900 hover:bg-[#f2f2f2]" style={{ fontSize: '12px' }}>
                  Date modified
                </button>
              </div>
            )}
          </div>
          
          <div className="h-[1px] bg-gray-300 my-[2px] mx-[1px]" />
          
          <button
            className="w-full px-3 py-[6px] text-left flex items-center space-x-2 text-gray-900 hover:bg-[#f2f2f2]"
            style={{
              fontSize: '12px',
              lineHeight: '1',
              fontFamily: 'Segoe UI, system-ui, sans-serif'
            }}
            onClick={() => {
              console.log('Folder properties');
              onClose();
            }}
          >
            <span>Properties</span>
          </button>
        </>
      )}
    </div>
  );
};

export default FileExplorerContextMenu;