"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';

const DialogBox = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'e') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 z-50"
      style={{ 
        paddingBottom: '16px' 
      }}
    >
      <div 
        className="relative mx-auto"
        style={{
          width: '100%',        
          maxWidth: '800px',  
          height: '160px', 
          imageRendering: 'pixelated',
        }}
      >
        {/* Background Image */}
        <Image
          src="/images/pokemonDialogBox.png"
          alt="Dialog Box Background"
          fill
          className="[image-rendering:pixelated]"
          priority
        />
        
        {/* Text Content */}
        <div 
          className="absolute"
          style={{
            top: '16px',
            left: '32px',
            right: '32px',
            bottom: '16px'
          }}
        >
          <p 
            className="dialogText text-black text-lg"
            style={{
              fontSize: '2rem',  
              lineHeight: '1.75'    
            }}
          >
            {message}
          </p>
          
          {/* Arrow Indicator */}
          <div 
            className="absolute bottom-0 right-4 animate-bounce"
          >
            <span className="text-black text-2xl">▼</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogBox;