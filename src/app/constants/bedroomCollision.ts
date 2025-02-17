import { TileType } from '../utils/tileMap';

export const BEDROOM_COLLISION: TileType[][] = [
  // 9 columns x 8 rows
  ['wall', 'wall', 'interact', 'wall', 'wall', 'interact', 'wall', 'wall', 'wall'],    
  ['interact', 'interact', 'interact', 'interact', 'interact', 'interact', 'wall', 'teleport', 'wall'], 
  ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'], 
  ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'], 
  ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'], 
  ['floor', 'wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'], 
  ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'], 
  ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'], 
];

export const INTERACTABLES = {
  PC: { x: 0, y: 1, id: 'PC' },
  BOOK: { x: 1, y: 1, id: 'Book' },
  MAP: { x: 2, y: 1, id: 'Map' },
  XBOX: { x: 3, y: 1, id: 'Game' },
  TV: { x: 4, y: 1,  id: 'TV' },
  CLOCK: { x: 5, y:1, id: 'Clock' },
};