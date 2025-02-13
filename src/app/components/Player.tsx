"use client";

import React, { useState, useEffect } from 'react';

type Direction = 'down' | 'up' | 'left' | 'right';
type Position = { x: number; y: number };

export default function Player() {
  const [position, setPosition] = useState<Position>({ x: 320, y: 240 });
  const [direction, setDirection] = useState<Direction>('right');
  const [isMoving, setIsMoving] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [frame, setFrame] = useState(0);
  
  const WALK_SPEED = 4;
  const SPRINT_SPEED = 8;
  const SPRITE_SIZE = 32;

  useEffect(() => {
    const keys = new Set<string>();
    let animationFrame = 0;
    let lastFrameTime = 0;
    const WALK_FRAME_DURATION = 150; 
    const SPRINT_FRAME_DURATION = 100;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.add(e.key);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift'].includes(e.key)) {
        e.preventDefault();
      }
      // Update sprint state
      if (e.key === 'Shift') {
        setIsSprinting(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key);
      if (e.key === 'Shift') {
        setIsSprinting(false);
      }
    };

    const gameLoop = (timestamp: number) => {
      let newX = position.x;
      let newY = position.y;
      let newDirection = direction;
      let moving = false;

      // Calculate current speed based on sprint state
      const currentSpeed = isSprinting ? SPRINT_SPEED : WALK_SPEED;
      const frameDuration = isSprinting ? SPRINT_FRAME_DURATION : WALK_FRAME_DURATION;

      if (keys.has('ArrowUp')) {
        newY -= currentSpeed;
        newDirection = 'up';
        moving = true;
      } else if (keys.has('ArrowDown')) {
        newY += currentSpeed;
        newDirection = 'down';
        moving = true;
      }
      
      if (keys.has('ArrowLeft')) {
        newX -= currentSpeed;
        newDirection = 'left';
        moving = true;
      } else if (keys.has('ArrowRight')) {
        newX += currentSpeed;
        newDirection = 'right';
        moving = true;
      }

      // Update animation frame
      if (moving && timestamp - lastFrameTime > frameDuration) {
        setFrame(prev => (prev + 1) % 8);
        lastFrameTime = timestamp;
      } else if (!moving) {
        setFrame(0);
      }

      setPosition({ x: newX, y: newY });
      setDirection(newDirection);
      setIsMoving(moving);

      animationFrame = requestAnimationFrame(gameLoop);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    animationFrame = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrame);
    };
  }, [position, direction, isSprinting]);

  const getSpritesheetPosition = () => {
    const row = isSprinting ? 1 : 0;
    const col = isMoving ? (frame % 8) : 0;
    
    return {
      backgroundPosition: `-${col * SPRITE_SIZE}px -${row * SPRITE_SIZE}px`,
      transform: `scaleX(${direction === 'left' ? -1 : 1})`, // Mirror for left movement
    };
  };

  return (
    <div 
      className="absolute transition-transform"
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${SPRITE_SIZE}px`,
        height: `${SPRITE_SIZE}px`,
        backgroundImage: 'url("/images/sprites/EmeraldCharacterSheet.png")',
        imageRendering: 'pixelated',
      }}
    >
      <div 
        className="w-full h-full"
        style={{
          ...getSpritesheetPosition(),
          backgroundImage: 'url("/sprites/character.png")',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}