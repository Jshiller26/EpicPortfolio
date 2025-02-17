"use client";

import React from 'react';
import Image from 'next/image';
import { ROOM } from '../constants/roomConstants';

export default function Room() {
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
      </div>
    </div>
  );
}