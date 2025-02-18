import React, { useMemo } from 'react';
import { useFileSystemStore } from '../../stores/fileSystemStore';
import { FileSystemItem, Folder, File } from '../../types/fileSystem';

interface DesktopIconsProps {
  onOpenWindow: (windowId: string) => void;
}

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onOpenWindow }) => {
  const desktop = useFileSystemStore(state => state.items['desktop']) as Folder;
  const items = useFileSystemStore(state => state.items);

  const desktopItems = useMemo(() => {
    if (desktop?.type === 'folder') {
      return desktop.children.map(id => items[id]);
    }
    return [];
  }, [desktop, items]);

  const handleDoubleClick = (itemId: string) => {
    onOpenWindow(`explorer-${itemId}`);
  };

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-1 p-1">
      {desktopItems.map((item: File | Folder) => (
        <div
          key={item.id}
          className="flex flex-col items-center group cursor-pointer w-[76px] h-[76px] p-1 rounded hover:bg-white/10"
          onDoubleClick={() => handleDoubleClick(item.id)}
        >
          <div className="w-8 h-8 flex items-center justify-center mb-1">
            <img
              src="/images/desktop/icons8-folder.svg"
              alt={item.name}
              className="w-8 h-8"
            />
          </div>
          <div className="text-[11px] text-white text-center leading-tight max-w-[72px] px-1 [text-shadow:_0.5px_0.5px_1px_rgba(0,0,0,0.6),_-0.5px_-0.5px_1px_rgba(0,0,0,0.6),_0.5px_-0.5px_1px_rgba(0,0,0,0.6),_-0.5px_0.5px_1px_rgba(0,0,0,0.6)]">
            {item.name}
          </div>
        </div>
      ))}
    </div>
  );
};