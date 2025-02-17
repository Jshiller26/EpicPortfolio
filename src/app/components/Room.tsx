"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ROOM } from '../constants/roomConstants';
import DebugGrid from './DebugGrid';

export default function Room() {
  const [showDebug, setShowDebug] = useState(false);

  // Toggle debug grid with g key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'g') {
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div 
        className="relative" 
        style={{ 
          width: `${ROOM.WIDTH}px`,
          height: `${ROOM.HEIGHT}px`,
        }}
      >
        <Image
          src="/images/tiles/bedroom.png"
          alt="Bedroom"
          width={ROOM.WIDTH}
          height={ROOM.HEIGHT}
          className="[image-rendering:pixelated]"
          priority
          unoptimized
        />
        <DebugGrid visible={showDebug} />
      </div>
    </div>
  );
}