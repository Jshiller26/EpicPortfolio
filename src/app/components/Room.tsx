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
import type { GridPosition, MovementRequest } from '../types/gameTypes';


export default function Room() {
  const [showDebug, setShowDebug] = useState(false);
  const [movementRequest, setMovementRequest] = useState<MovementRequest | null>(null);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [isTvOn, setIsTvOn] = useState(false);
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

  useEffect(() => {
    const handleGlobalClick = () => {
      if (dialogMessage) {
        setDialogMessage(null);
        setIsTvOn(false);
      }
    };

    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      if (dialogMessage && (e.key === 'e' || e.key === ' ')) {
        e.preventDefault();
        setDialogMessage(null);
        setIsTvOn(false); 
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

  useEffect(() => {
    if (!dialogMessage) {
      setIsTvOn(false);
    }
  }, [dialogMessage]);

  const getInteractableMessage = (id: string) => {
    switch(id) {
      case 'Clock':
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit'
        });
        return `The clock reads ${timeString}.`;
      case 'PC':
        return "Epic PC";
      case 'Book':
        return "Reading is broing";
      case 'Map':
        return "Epic Map of Philadelphia";
      case 'Game':
        return "Let's play some games";
      case 'TV':
        setIsTvOn(true);
        return "You turned on the TV. Breaking Bad Season 5 episode 5 is playing.";
      default:
        return `Examining the ${id.toLowerCase()}...`;
    }
  };

  const findInteractableAtPosition = (x: number, y: number) => {
    return Object.values(INTERACTABLES).find(item => 
      item.x === x && item.y === y
    );
  };

  const handleInteraction = (position: GridPosition) => {
    if (isMoving.current || dialogMessage) return;

    const interactableItem = findInteractableAtPosition(position.x, position.y);

    if (interactableItem) {
      const message = getInteractableMessage(interactableItem.id);
      setDialogMessage(message);
    }
  };

  const handleMovement = (path: GridPosition[], onComplete?: () => void) => {
    isMoving.current = true;
    setMovementRequest({
      path,
      onComplete: () => {
        isMoving.current = false;
        setMovementRequest(null);
        onComplete?.();
      }
    });
  };

  const handleInteractableClick = (item: typeof INTERACTABLES[keyof typeof INTERACTABLES]) => {
    const targetY = item.y + 1;
    
    if (targetY < GRID.ROWS) {
      const path = findPath(
        playerPosition.current,
        { x: item.x, y: targetY },
        collisionMap.current
      );

      if (path.length > 0) {
        handleMovement(path, () => {
          const message = getInteractableMessage(item.id);
          setDialogMessage(message);
        });
      }
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
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);

    // Special cases for clicking above the clock or map
    if ((x === 2 && y === 0) || (x === 5 && y === 0)) {
      const interactableY = 1;
      const interactableItem = findInteractableAtPosition(x, interactableY);

      if (interactableItem) {
        handleInteractableClick(interactableItem);
        return;
      }
    }

    const clickedItem = findInteractableAtPosition(x, y);

    if (clickedItem) {
      handleInteractableClick(clickedItem);
      return;
    }

    if (x >= 0 && x < GRID.COLS && y >= 0 && y < GRID.ROWS) {
      const path = findPath(
        playerPosition.current,
        { x, y },
        collisionMap.current
      );

      if (path.length > 0) {
        handleMovement(path);
      }
    }
  };

  const handlePlayerMove = (newPosition: GridPosition) => {
    playerPosition.current = newPosition;
  };

  const handleDialogClose = () => {
    setDialogMessage(null);
    setIsTvOn(false);
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

        {/* TV On Layer */}
        {isTvOn && (
          <div className="absolute inset-0 z-40 pointer-events-none">
            <Image
              src="/images/tiles/TvOn.png"
              alt="TV Display"
              width={ROOM.WIDTH}
              height={ROOM.HEIGHT}
              className="[image-rendering:pixelated]"
              priority
              unoptimized
            />
          </div>
        )}
        
        {/* Dialog Layer */}
        {dialogMessage && (
          <DialogBox 
            message={dialogMessage} 
            onClose={() => handleDialogClose} 
            
          />
        )}
        
        {/* Debug Grid */}
        <DebugGrid visible={showDebug} />
      </div>
    </div>
  );
}