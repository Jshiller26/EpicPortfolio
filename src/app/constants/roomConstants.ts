
export const TILE_SIZE = 8;  // Size of one pixel art tile
export const GRID_SIZE = 64; // Size of one grid cell

// Grid dimensions
export const GRID = {
  COLS: 12,
  ROWS: 11,
};

// Room dimensions including black border
export const ROOM = {
  WIDTH: GRID.COLS * GRID_SIZE,
  HEIGHT: GRID.ROWS * GRID_SIZE,
  BORDER: TILE_SIZE,
};