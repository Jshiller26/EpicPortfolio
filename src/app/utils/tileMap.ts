export type TileType = 'wall' | 'floor' | 'interact';

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

  // Check if a position is walkable
  isWalkable(x: number, y: number): boolean {
    if (y >= 0 && y < this.collisionMap.length && 
        x >= 0 && x < this.collisionMap[0].length) {
      return this.collisionMap[y][x] === 'floor';
    }
    return false;
  }

  // Check if a position is interactable
  isInteractable(x: number, y: number): boolean {
    if (y >= 0 && y < this.collisionMap.length && 
        x >= 0 && x < this.collisionMap[0].length) {
      return this.collisionMap[y][x] === 'interact';
    }
    return false;
  }
}

export const createBedroomCollision = (): RoomCollision => {
  const collision = new RoomCollision(12, 11); 
  
  for (let x = 0; x < 12; x++) {
    collision.setTile(x, 0, 'wall');  // Top wall
    collision.setTile(x, 10, 'wall'); // Bottom wall
  }
  for (let y = 0; y < 11; y++) {
    collision.setTile(0, y, 'wall');  // Left wall
    collision.setTile(11, y, 'wall'); // Right wall
  }
  
  collision.setTile(1, 1, 'wall');
  collision.setTile(2, 1, 'wall');
  
  collision.setTile(9, 1, 'interact');
  
  return collision;
};