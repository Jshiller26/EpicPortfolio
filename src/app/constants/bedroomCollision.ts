import { TileType } from '../utils/tileMap';

export const BEDROOM_COLLISION: TileType[][] = [
  Array(12).fill('wall'),
  
  [
    'wall', // Left border
    'wall', // PC
    'wall', // PC
    'interact', // Frame
    'floor',
    'wall', // TV
    'wall', // Clock
    'floor',
    'floor',
    'wall', // Closet
    'wall', // Closet
    'wall', // Right border
  ],
  
  Array(12).fill('wall'),
];

export const INTERACTABLES = {
  PC: { x: 1, y: 1, type: 'project', id: 'portfolio' },
  TV: { x: 5, y: 1, type: 'project', id: 'streaming' },
  CLOCK: { x: 7, y: 1, type: 'project', id: 'time-management' },
};