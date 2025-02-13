"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

type Direction = 'down' | 'up' | 'left' | 'right';
type GridPosition = { x: number; y: number };
type PixelPosition = { x: number; y: number };

const GRID_SIZE = 64;
const SPRITE_WIDTH = 34;
const SPRITE_HEIGHT = 50;
const SCALE_FACTOR = 2;
const MOVEMENT_SPEED = 3;

const SPRITE_INDEXES = {
  down: [0, 1, 2, 3],
  left: [5, 6, 7, 8],
  right: [10, 11, 12, 13],
  up: [15, 16, 17, 18]
};

export default function Player() {
  const [gridPosition, setGridPosition] = useState<GridPosition>({ x: 5, y: 5 });
  const [pixelPosition, setPixelPosition] = useState<PixelPosition>({ 
    x: 5 * GRID_SIZE, 
    y: 5 * GRID_SIZE 
  });
  const [direction, setDirection] = useState<Direction>('down');
  const [frame, setFrame] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  
  const lastFrameTime = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | null>(null);
  const targetPosition = useRef<PixelPosition>({ x: 5 * GRID_SIZE, y: 5 * GRID_SIZE });

  const getCurrentSprite = useCallback(() => {
    const spriteIndex = SPRITE_INDEXES[direction][frame % 4];
    return `/images/sprites/tile${spriteIndex.toString().padStart(3, '0')}.png`;
  }, [direction, frame]);

  const moveToGridPosition = useCallback((newGridX: number, newGridY: number) => {
    if (newGridX >= 0 && newGridX < 12 && newGridY >= 0 && newGridY < 11) {
      setGridPosition({ x: newGridX, y: newGridY });
      targetPosition.current = {
        x: newGridX * GRID_SIZE,
        y: newGridY * GRID_SIZE
      };
      setIsMoving(true);
    }
  }, []);

  const updatePosition = useCallback((timestamp: number) => {
    const keys = keysPressed.current;
    let newDirection = direction;

    if (!isMoving && keys.size > 0) {
      const { x, y } = gridPosition;
      let newX = x;
      let newY = y;

      if (keys.has('arrowup') || keys.has('w')) {
        newY = y - 1;
        newDirection = 'up';
      } else if (keys.has('arrowdown') || keys.has('s')) {
        newY = y + 1;
        newDirection = 'down';
      } else if (keys.has('arrowleft') || keys.has('a')) {
        newX = x - 1;
        newDirection = 'left';
      } else if (keys.has('arrowright') || keys.has('d')) {
        newX = x + 1;
        newDirection = 'right';
      }

      if (newX !== x || newY !== y) {
        moveToGridPosition(newX, newY);
        setDirection(newDirection);
      }
    }

    // Handle animation
    if (isMoving) {
      const dx = targetPosition.current.x - pixelPosition.x;
      const dy = targetPosition.current.y - pixelPosition.y;
      
      if (Math.abs(dx) < MOVEMENT_SPEED && Math.abs(dy) < MOVEMENT_SPEED) {
        // We reached our target position
        setPixelPosition(targetPosition.current);
        setIsMoving(false);
      } else {
        // Move towards target position
        const newX = pixelPosition.x + Math.sign(dx) * MOVEMENT_SPEED;
        const newY = pixelPosition.y + Math.sign(dy) * MOVEMENT_SPEED;
        setPixelPosition({ x: newX, y: newY });
        
        // Update animation frame every 100ms while moving
        if (timestamp - lastFrameTime.current > 100) {
          setFrame(prev => (prev + 1) % 4);
          lastFrameTime.current = timestamp;
        }
      }
    } else if (keys.size === 0) {
      setFrame(0); // Reset to standing frame when not moving
    }

    animationFrameRef.current = requestAnimationFrame(updatePosition);
  }, [direction, gridPosition, isMoving, moveToGridPosition, pixelPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    animationFrameRef.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updatePosition]);

  const displayX = pixelPosition.x + (GRID_SIZE / 2) - (SPRITE_WIDTH * SCALE_FACTOR / 2);
  const displayY = pixelPosition.y + (GRID_SIZE / 2) - (SPRITE_HEIGHT * SCALE_FACTOR / 2);

  return (
    <div
      className="absolute z-10"
      style={{
        transform: `translate(${displayX}px, ${displayY}px)`,
        width: `${SPRITE_WIDTH * SCALE_FACTOR}px`,
        height: `${SPRITE_HEIGHT * SCALE_FACTOR}px`,
      }}
    >
      <Image
        src={getCurrentSprite()}
        alt="Player"
        width={SPRITE_WIDTH * SCALE_FACTOR}
        height={SPRITE_HEIGHT * SCALE_FACTOR}
        className="[image-rendering:pixelated]"
        priority
      />
    </div>
  );
}