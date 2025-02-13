"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

type Direction = 'down' | 'up' | 'left' | 'right';
type GridPosition = { x: number; y: number };

const GRID_SIZE = 64;
const SPRITE_WIDTH = 34;
const SPRITE_HEIGHT = 50;
const SCALE_FACTOR = 2;
const MOVEMENT_DURATION = 200;

const SPRITE_INDEXES = {
  down: [0, 1, 2, 3],
  left: [5, 6, 7, 8],
  right: [10, 11, 12, 13],
  up: [15, 16, 17, 18]
};

export default function Player() {
  const [gridPosition, setGridPosition] = useState<GridPosition>({ x: 5, y: 5 });
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState<Direction>('down');
  const [frame, setFrame] = useState(0);

  const getCurrentSprite = useCallback(() => {
    const spriteIndex = SPRITE_INDEXES[direction][frame % 4];
    return `/images/sprites/tile${spriteIndex.toString().padStart(3, '0')}.png`;
  }, [direction, frame]);

  const getPixelPosition = useCallback((pos: GridPosition) => ({
    x: pos.x * GRID_SIZE + GRID_SIZE/2 - (SPRITE_WIDTH * SCALE_FACTOR)/2,
    y: pos.y * GRID_SIZE + GRID_SIZE/2 - (SPRITE_HEIGHT * SCALE_FACTOR)/2
  }), []);

  const moveToPosition = useCallback((newPos: GridPosition, newDirection: Direction) => {
    if (isMoving) return;

    // Boundary checks
    if (newPos.x < 0 || newPos.x >= 12 || newPos.y < 0 || newPos.y >= 11) return;

    setIsMoving(true);
    setDirection(newDirection);
    setGridPosition(newPos);

    setTimeout(() => {
      setIsMoving(false);
      setFrame(0);
    }, MOVEMENT_DURATION);
  }, [isMoving]);

  useEffect(() => {
    let frameId: number;
    let lastFrameTime = 0;
    const keys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        keys.add(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key);
    };

    const gameLoop = (timestamp: number) => {
      if (!isMoving && keys.size > 0) {
        const newPos = { ...gridPosition };
        let newDirection = direction;

        if (keys.has('ArrowUp')) {
          newPos.y--;
          newDirection = 'up';
        } else if (keys.has('ArrowDown')) {
          newPos.y++;
          newDirection = 'down';
        } else if (keys.has('ArrowLeft')) {
          newPos.x--;
          newDirection = 'left';
        } else if (keys.has('ArrowRight')) {
          newPos.x++;
          newDirection = 'right';
        }

        if (newPos.x !== gridPosition.x || newPos.y !== gridPosition.y) {
          moveToPosition(newPos, newDirection);
        }
      }

      if (isMoving && timestamp - lastFrameTime > 100) {
        setFrame(prev => (prev + 1) % 4);
        lastFrameTime = timestamp;
      }

      frameId = requestAnimationFrame(gameLoop);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    frameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameId);
    };
  }, [gridPosition, direction, isMoving, moveToPosition]);

  const currentPosition = getPixelPosition(gridPosition);

  return (
    <div
      className="absolute transition-all duration-200 ease-linear z-10"
      style={{
        transform: `translate(${currentPosition.x}px, ${currentPosition.y}px)`,
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