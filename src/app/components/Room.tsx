"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ROOM, GRID_SIZE } from '../constants/roomConstants';
import DebugGrid from './DebugGrid';
import Player from './Player';
import { createBedroomCollision } from '../utils/tileMap';
import { findPath } from '../utils/pathfinding';
import type { GridPosition, MovementRequest } from '../types/gameTypes';

export default function Room() {
  const [showDebug, setShowDebug] = useState(false);
  const [movementRequest, setMovementRequest] = useState<MovementRequest | null>(null);
  const collisionMap = useRef(createBedroomCollision());
  const playerPosition = useRef<GridPosition>({ x: 5, y: 5 });
  const isMoving = useRef(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'g') {
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    // Don't process new clicks while moving
    if (isMoving.current) return;

    // Get click coordinates relative to the room container
    const roomElement = e.currentTarget as HTMLDivElement;
    const rect = roomElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to grid coordinates
    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);

    // Check if target is within grid bounds
    if (gridX >= 0 && gridX < 9 && gridY >= 0 && gridY < 8) {
      const path = findPath(
        playerPosition.current,
        { x: gridX, y: gridY },
        collisionMap.current
      );

      if (path.length > 0) {
        isMoving.current = true;
        setMovementRequest({
          path,
          onComplete: () => {
            isMoving.current = false;
            setMovementRequest(null);
          }
        });
      }
    }
  };

  const handlePlayerMove = (newPosition: GridPosition) => {
    playerPosition.current = newPosition;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div 
        className="relative cursor-pointer" 
        style={{ 
          width: `${ROOM.WIDTH}px`,
          height: `${ROOM.HEIGHT}px`,
        }}
        onClick={handleClick}
      >
        {/* Base Layer */}
        <div className="absolute inset-0 z-0">
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
        
        {/* Player Layer */}
        <Player 
          onMove={handlePlayerMove}
          movementRequest={movementRequest}
        />
        
        {/* Sheets Layer */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          <Image
            src="/images/tiles/bedSheets.png"
            alt="Bed Sheets"
            width={ROOM.WIDTH}
            height={ROOM.HEIGHT}
            className="[image-rendering:pixelated]"
            priority
            unoptimized
          />
        </div>
        
        {/* Debug Grid */}
        <DebugGrid visible={showDebug} />
      </div>
    </div>
  );
}