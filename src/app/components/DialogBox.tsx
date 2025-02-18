"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

const DialogBox = ({ message, onClose }: { message: string; onClose: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  // speed of text animation
  const CHAR_DELAY = 40;
  
  const typeText = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    let currentText = '';
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < message.length) {
        currentText += message[currentIndex];
        setDisplayedText(currentText);
        currentIndex++;
        timeoutId = setTimeout(typeNextChar, CHAR_DELAY);
      } else {
        setIsTyping(false);
      }
    };

    typeNextChar();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [message]);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    return typeText();
  }, [message, typeText]);
  

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'e') {
        if (isTyping) {
          setDisplayedText(message);
          setIsTyping(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose, isTyping, message]);

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
              lineHeight: '1.25'    
            }}
          >
            {displayedText}
          </p>
          
          {/* Arrow Indicator */}
          {!isTyping && (
            <div className="absolute bottom-0 right-4 animate-bounce">
              <span className="text-black text-2xl">▼</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DialogBox;