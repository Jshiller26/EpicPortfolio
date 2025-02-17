import React, { useEffect } from 'react';

const DialogBox = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 p-4">
      <div 
        className="relative bg-white border-2 border-gray-800 rounded p-4 mx-auto max-w-2xl"
        style={{
          imageRendering: 'pixelated',
          backgroundColor: '#F8F8F8',
          borderWidth: '4px'
        }}
      >
        <p className="text-lg" style={{ fontFamily: 'Pokemon'}}>{message}</p>
        <div className="absolute bottom-2 right-4">
          <span className="text-red-600 animate-bounce">▼</span>
        </div>
      </div>
    </div>
  );
};

export default DialogBox;