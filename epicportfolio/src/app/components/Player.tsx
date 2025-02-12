"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

type Direction = 'down' | 'up' | 'left' | 'right';
type Position = { x: number; y: number };

export default function Player() {
  const [position, setPosition] = useState<Position>({ x: 320, y: 240 });
  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);
  
  const SPEED = 4;
  const GRID_SIZE = 16;

  useEffect(() => {
    const keys = new Set<string>();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.add(e.key);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setIsMoving(false);
      }
    };

    const gameLoop = () => {
      let newX = position.x;
      let newY = position.y;
      let newDirection = direction;
      let moving = false;

      if (keys.has('ArrowUp')) {
        newY -= SPEED;
        newDirection = 'up';
        moving = true;
      } else if (keys.has('ArrowDown')) {
        newY += SPEED;
        newDirection = 'down';
        moving = true;
      }
      
      if (keys.has('ArrowLeft')) {
        newX -= SPEED;
        newDirection = 'left';
        moving = true;
      } else if (keys.has('ArrowRight')) {
        newX += SPEED;
        newDirection = 'right';
        moving = true;
      }

      setPosition({ x: newX, y: newY });
      setDirection(newDirection);
      setIsMoving(moving);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const gameInterval = setInterval(gameLoop, 1000 / 60);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(gameInterval);
    };
  }, [position, direction]);

  return (
    <div 
      className="absolute transition-transform"
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: '32px',
        height: '32px',
      }}
    >
      <Image
        src={`/images/player/${direction}${isMoving ? '_walk' : ''}.png`}
        alt="Player"
        width={32}
        height={32}
        className="[image-rendering:pixelated]"
      />
    </div>
  );
}