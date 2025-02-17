import React from 'react';
import { BEDROOM_COLLISION } from '../constants/bedroomCollision';
import { ROOM } from '../constants/roomConstants';

const DebugGrid = ({ visible = true }) => {
  if (!visible) return null;

  const TILE_SIZE = 16;
  
  const scaleX = ROOM.WIDTH / (BEDROOM_COLLISION[0].length * TILE_SIZE);
  const scaleY = ROOM.HEIGHT / (BEDROOM_COLLISION.length * TILE_SIZE);

  return (
    <div 
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: ROOM.WIDTH,
        height: ROOM.HEIGHT,
      }}
    >
      {BEDROOM_COLLISION.map((row, y) => (
        <div key={y} className="flex">
          {row.map((tileType, x) => (
            <div
              key={`${x}-${y}`}
              className="border border-red-500 flex items-center justify-center relative"
              style={{
                width: `${TILE_SIZE * scaleX}px`,
                height: `${TILE_SIZE * scaleY}px`,
              }}
            >
              <span className="text-xs text-red-500 bg-black/50 px-1 rounded absolute">
                {`${x},${y}`}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DebugGrid;