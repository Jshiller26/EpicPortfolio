"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { createBedroomCollision } from '../utils/tileMap';
import { GRID_SIZE, SCALE_FACTOR, ROOM } from '../constants/roomConstants';
import type { Direction, GridPosition, PixelPosition, MovementRequest } from '../types/gameTypes';

const SPRITE_WIDTH = 16 * SCALE_FACTOR;
const SPRITE_HEIGHT = 20 * SCALE_FACTOR;
const MOVEMENT_SPEED = 3;

const SPRITE_INDEXES = {
  down: [0, 1, 2, 3],
  left: [5, 6, 7, 8],
  right: [10, 11, 12, 13],
  up: [15, 16, 17, 18]
};

interface PlayerProps {
  onMove?: (position: GridPosition) => void;
  movementRequest?: MovementRequest | null;
  onInteract?: (position: GridPosition, direction: Direction) => void;
  isDialogOpen?: boolean;
}

export default function Player({ onMove, movementRequest, onInteract, isDialogOpen }: PlayerProps) {
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
  const currentPath = useRef<GridPosition[]>([]);
  const collisionMap = useRef(createBedroomCollision());

  const getCurrentSprite = useCallback(() => {
    const spriteIndex = SPRITE_INDEXES[direction][frame % 4];
    return `/images/sprites/tile${spriteIndex.toString().padStart(3, '0')}.png`;
  }, [direction, frame]);

  const moveToGridPosition = useCallback((newGridX: number, newGridY: number) => {
    // Check collision before moving
    if (collisionMap.current.isWalkable(newGridX, newGridY)) {
      setGridPosition({ x: newGridX, y: newGridY });
      targetPosition.current = {
        x: newGridX * GRID_SIZE,
        y: newGridY * GRID_SIZE
      };
      setIsMoving(true);
      onMove?.({ x: newGridX, y: newGridY });
    }
  }, [onMove]);

  // Handle path movement
  useEffect(() => {
    if (movementRequest && !isMoving && movementRequest.path.length > 0 && !isDialogOpen) {
      currentPath.current = [...movementRequest.path];
      const nextPosition = currentPath.current[0];
      
      // Set direction based on movement
      const dx = nextPosition.x - gridPosition.x;
      const dy = nextPosition.y - gridPosition.y;
      
      if (dx > 0) setDirection('right');
      else if (dx < 0) setDirection('left');
      else if (dy > 0) setDirection('down');
      else if (dy < 0) setDirection('up');
      
      moveToGridPosition(nextPosition.x, nextPosition.y);
      currentPath.current.shift();
    }
  }, [movementRequest, isMoving, gridPosition, moveToGridPosition, isDialogOpen]);

  const updatePosition = useCallback((timestamp: number) => {
    const keys = keysPressed.current;

    // Don't process movement if dialog is open
    if (!isMoving && keys.size > 0 && !isDialogOpen) {
      const { x, y } = gridPosition;
      let newX = x;
      let newY = y;

      if (keys.has('arrowup') || keys.has('w')) {
        newY = y - 1;
        setDirection('up');
      } else if (keys.has('arrowdown') || keys.has('s')) {
        newY = y + 1;
        setDirection('down');
      } else if (keys.has('arrowleft') || keys.has('a')) {
        newX = x - 1;
        setDirection('left');
      } else if (keys.has('arrowright') || keys.has('d')) {
        newX = x + 1;
        setDirection('right');
      }

      if (newX !== x || newY !== y) {
        moveToGridPosition(newX, newY);
      }
    }

    if (isMoving) {
      const dx = targetPosition.current.x - pixelPosition.x;
      const dy = targetPosition.current.y - pixelPosition.y;
      
      if (Math.abs(dx) < MOVEMENT_SPEED && Math.abs(dy) < MOVEMENT_SPEED) {
        setPixelPosition(targetPosition.current);
        setIsMoving(false);

        if (currentPath.current.length === 0 && movementRequest?.onComplete) {
          movementRequest.onComplete();
        }
        else if (currentPath.current.length > 0 && !isDialogOpen) {
          const nextPosition = currentPath.current[0];
          
          const nextDx = nextPosition.x - gridPosition.x;
          const nextDy = nextPosition.y - gridPosition.y;
          
          if (nextDx > 0) setDirection('right');
          else if (nextDx < 0) setDirection('left');
          else if (nextDy > 0) setDirection('down');
          else if (nextDy < 0) setDirection('up');
          
          moveToGridPosition(nextPosition.x, nextPosition.y);
          currentPath.current.shift();
        }
      } else {
        const newX = pixelPosition.x + Math.sign(dx) * MOVEMENT_SPEED;
        const newY = pixelPosition.y + Math.sign(dy) * MOVEMENT_SPEED;
        setPixelPosition({ x: newX, y: newY });
        
        if (timestamp - lastFrameTime.current > 100) {
          setFrame(prev => (prev + 1) % 4);
          lastFrameTime.current = timestamp;
        }
      }
    } else if (keys.size === 0) {
      setFrame(0);
    }

    animationFrameRef.current = requestAnimationFrame(updatePosition);
  }, [direction, gridPosition, isMoving, moveToGridPosition, pixelPosition, isDialogOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Don't add movement keys if dialog is open
      if (!isDialogOpen && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
      }
      
      // Handle interaction
      if ((key === 'e' || key === ' ') && !isMoving && onInteract && !isDialogOpen) {
        e.preventDefault();
        const { x, y } = gridPosition;
        let interactPosition: GridPosition;
        
        switch (direction) {
          case 'up':
            interactPosition = { x, y: y - 1 };
            break;
          case 'down':
            interactPosition = { x, y: y + 1 };
            break;
          case 'left':
            interactPosition = { x: x - 1, y };
            break;
          case 'right':
            interactPosition = { x: x + 1, y };
            break;
        }
        
        onInteract(interactPosition, direction);
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
  }, [updatePosition, direction, gridPosition, isMoving, onInteract, isDialogOpen]);

  const roomCenterX = window.innerWidth / 2 - ROOM.WIDTH / 2;
  const roomCenterY = window.innerHeight / 2 - ROOM.HEIGHT / 2;
  
  const centerOffsetX = (GRID_SIZE - SPRITE_WIDTH) / 2;
  const centerOffsetY = (GRID_SIZE - SPRITE_HEIGHT) / 2 - (GRID_SIZE * 0.25);
  
  const displayX = Math.floor(pixelPosition.x + centerOffsetX);
  const displayY = Math.floor(pixelPosition.y + centerOffsetY);
  
  return (
    <div 
      className="absolute z-10"
      style={{
        transform: `translate(${displayX}px, ${displayY}px)`,
        width: `${SPRITE_WIDTH}px`,
        height: `${SPRITE_HEIGHT}px`,
        left: '50%',
        top: '50%',
        marginLeft: `-${ROOM.WIDTH / 2}px`,
        marginTop: `-${ROOM.HEIGHT / 2}px`,
        imageRendering: 'pixelated',
      }}
    >
      <Image
        src={getCurrentSprite()}
        alt="Player"
        width={SPRITE_WIDTH}
        height={SPRITE_HEIGHT}
        className="[image-rendering:pixelated]"
        priority
      />
    </div>
  );
}