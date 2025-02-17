import { BEDROOM_COLLISION } from '../constants/bedroomCollision';
import { GRID } from '../constants/roomConstants';

export type TileType = 'wall' | 'floor' | 'interact' | 'teleport';

export class RoomCollision {
  private collisionMap: TileType[][];
  
  constructor(width: number, height: number) {
    this.collisionMap = Array(height).fill(null).map(() => 
      Array(width).fill('floor')
    );
  }

  setTile(x: number, y: number, type: TileType) {
    if (y >= 0 && y < this.collisionMap.length && 
        x >= 0 && x < this.collisionMap[0].length) {
      this.collisionMap[y][x] = type;
    }
  }

  isWalkable(x: number, y: number): boolean {
    if (y >= 0 && y < this.collisionMap.length && 
        x >= 0 && x < this.collisionMap[0].length) {
      return this.collisionMap[y][x] === 'floor';
    }
    return false;
  }

  isInteractable(x: number, y: number): boolean {
    if (y >= 0 && y < this.collisionMap.length && 
        x >= 0 && x < this.collisionMap[0].length) {
      return this.collisionMap[y][x] === 'interact';
    }
    return false;
  }
}

export const createBedroomCollision = (): RoomCollision => {
  const collision = new RoomCollision(GRID.COLS, GRID.ROWS);
  
  // Apply the collision map from BEDROOM_COLLISION array
  BEDROOM_COLLISION.forEach((row, y) => {
    row.forEach((tileType, x) => {
      collision.setTile(x, y, tileType);
    });
  });
  
  return collision;
};