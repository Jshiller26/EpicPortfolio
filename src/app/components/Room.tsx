"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ROOM } from '../constants/roomConstants';
import DebugGrid from './DebugGrid';
import Player from './Player';

export default function Room() {
  const [showDebug, setShowDebug] = useState(false);

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
        {/* Base Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tiles/bedroom.png"
            alt="Bedroom"
            width={ROOM.WIDTH}
            height={ROOM.HEIGHT}
            className="[image-rendering:pixelated]"
            priority
            unoptimized
          />
        </div>
        
        {/* Player Layer */}
        <Player />
        
        {/* Sheets Layer - Higher z-index than player */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          <Image
            src="/images/tiles/bedSheets.png"
            alt="Bed Sheets"
            width={ROOM.WIDTH}
            height={ROOM.HEIGHT}
            className="[image-rendering:pixelated]"
            priority
            unoptimized
          />
        </div>
        
        {/* Debug Grid */}
        <DebugGrid visible={showDebug} />
      </div>
    </div>
  );
}