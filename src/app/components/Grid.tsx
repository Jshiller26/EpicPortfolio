"use client";

import React from 'react';

export default function Grid() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="relative w-full h-full">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ffffff10 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff10 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
            width: '800px',
            height: '720px',
          }}
        />
      </div>
    </div>
  );
}