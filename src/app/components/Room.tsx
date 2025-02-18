"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ROOM, GRID_SIZE, GRID } from '../constants/roomConstants';
import { INTERACTABLES } from '../constants/bedroomCollision';
import DebugGrid from './DebugGrid';
import Player from './Player';
import DialogBox from './DialogBox';
import { createBedroomCollision } from '../utils/tileMap';
import { findPath } from '../utils/pathfinding';
import type { GridPosition, MovementRequest, Direction } from '../types/gameTypes';
import { Desktop } from './os/Desktop';

export default function Room() {
  const [showDebug, setShowDebug] = useState(false);
  const [movementRequest, setMovementRequest] = useState<MovementRequest | null>(null);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [showDesktop, setShowDesktop] = useState(false);
  const collisionMap = useRef(createBedroomCollision());
  const playerPosition = useRef<GridPosition>({ x: 5, y: 5 });
  const isMoving = useRef(false);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (dialogMessage) {
        setDialogMessage(null);
      }
    };

    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      if (dialogMessage && (e.key === 'e' || e.key === ' ')) {
        e.preventDefault();
        setDialogMessage(null);
      }

      if (e.key.toLowerCase() === 'g') {
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleGlobalKeyPress);
    
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleGlobalKeyPress);
    };
  }, [dialogMessage]);

  const getInteractableMessage = (id: string) => {
    switch(id) {
      case 'time-management':
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit'
        });
        return `The clock reads ${timeString}.`;
      case 'PC':
        setShowDesktop(true);
        return null;
      default:
        return `Interacting with ${id}`;
    }
  };

  const handleInteraction = (position: GridPosition, direction: Direction) => {
    if (isMoving.current || dialogMessage) return;

    const interactableItem = Object.entries(INTERACTABLES).find(([_, item]) => 
      item.x === position.x && item.y === position.y
    );

    if (interactableItem) {
      const [_, item] = interactableItem;
      const message = getInteractableMessage(item.id);
      setDialogMessage(message);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (dialogMessage) {
      e.stopPropagation();
      setDialogMessage(null);
      return;
    }

    if (isMoving.current) return;

    const roomElement = e.currentTarget as HTMLDivElement;
    const rect = roomElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);

    const clickedItem = Object.entries(INTERACTABLES).find(([_, item]) => 
      item.x === gridX && item.y === gridY
    );

    if (clickedItem) {
      const [_, item] = clickedItem;
      const targetY = item.y + 1; 
      
      if (targetY < GRID.ROWS) {
        const path = findPath(
          playerPosition.current,
          { x: item.x, y: targetY },
          collisionMap.current
        );

        if (path.length > 0) {
          isMoving.current = true;
          setMovementRequest({
            path,
            onComplete: () => {
              isMoving.current = false;
              setMovementRequest(null);
              const message = getInteractableMessage(item.id);
              setDialogMessage(message);
            }
          });
        }
      }
      return;
    }

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
          onInteract={handleInteraction}
          isDialogOpen={!!dialogMessage}
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
        
        {/* Dialog Layer */}
        {dialogMessage && (
          <DialogBox 
            message={dialogMessage} 
            onClose={() => setDialogMessage(null)} 
          />
        )}

        {/* Desktop Layer */}
        {showDesktop && (
          <Desktop onClose={() => setShowDesktop(false)} />
        )}
        
        {/* Debug Grid */}
        <DebugGrid visible={showDebug} />
      </div>
    </div>
  );
}