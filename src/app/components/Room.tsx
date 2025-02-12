// src/app/components/Room.tsx
"use client";

import React from 'react';
import Image from 'next/image';

export default function Room() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="relative" style={{ width: '800px', height: '720px' }}>
        <Image
          src="/images/tiles/bedroom.png"
          alt="Bedroom"
          layout="fill"
          className="[image-rendering:pixelated]"
          priority
          unoptimized
        />
      </div>
    </div>
  );
}