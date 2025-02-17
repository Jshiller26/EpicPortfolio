import { TileType } from '../utils/tileMap';

export const BEDROOM_COLLISION: TileType[][] = [
  // 9 columns x 8 rows
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],    
  ['interact', 'interact', 'interact', 'interact', 'interact', 'interact', 'wall', 'teleport', 'wall'], 
  ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'], 
  ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'], 
  ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'], 
  ['floor', 'wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'], 
  ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'], 
  ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'], 
];

export const INTERACTABLES = {
  PC: { x: 1, y: 1, type: 'project', id: 'portfolio' },
  FISH_FRAME: { x: 2, y: 1, type: 'project', id: 'aquarium' },
  TV: { x: 4, y: 1, type: 'project', id: 'streaming' },
  CLOCK: { x: 6, y: 1, type: 'project', id: 'time-management' },
  WARDROBE: { x: 8, y: 1, type: 'project', id: 'wardrobe' }
};