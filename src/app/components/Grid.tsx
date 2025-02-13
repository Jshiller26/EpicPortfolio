"use client";

import React from 'react';

const GRID_SIZE = 64;
const GRID_COLS = 12;
const GRID_ROWS = 11;

export default function Grid() {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <div 
        style={{
          width: '768px', 
          height: '704px', 
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          position: 'absolute'
        }}
      >
        {/* Grid cell coordinates for now */}
        {Array.from({ length: GRID_ROWS }, (_, y) =>
          Array.from({ length: GRID_COLS }, (_, x) => (
            <div
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: x * GRID_SIZE,
                top: y * GRID_SIZE,
                width: GRID_SIZE,
                height: GRID_SIZE,
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '12px',
                padding: '2px'
              }}
            >
              {x},{y}
            </div>
          ))
        )}
      </div>
    </div>
  );
}