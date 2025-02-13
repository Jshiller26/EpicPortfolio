"use client";

import React from 'react';
import Image from 'next/image';
import Grid from './Grid';

export default function Room() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div 
        className="relative" 
        style={{ 
          width: '768px',
          height: '704px',
          transform: 'translate(32px, 32px)'
        }}
      >
        <Image
          src="/images/tiles/bedroom.png"
          alt="Bedroom"
          layout="fill"
          className="[image-rendering:pixelated]"
          priority
          unoptimized
        />
        <Grid />
      </div>
    </div>
  );
}