import React from 'react';

interface DesktopIconsProps {
  onOpenWindow: (windowId: string) => void;
}

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onOpenWindow }) => {
  const icons = [
    { id: 'my-projects', label: 'My Projects' },
    { id: 'about-me', label: 'About Me' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="grid grid-cols-auto-fit gap-4 p-4">
      {icons.map((icon) => (
        <div
          key={icon.id}
          className="flex flex-col items-center space-y-2 cursor-pointer"
          onDoubleClick={() => onOpenWindow(icon.id)}
        >
          <div className="w-16 h-16 bg-gray-200">
            {/* Icon image */}
          </div>
          <span className="text-white text-center">{icon.label}</span>
        </div>
      ))}
    </div>
  );
};