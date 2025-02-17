export const BASE_TILE_SIZE = 16;  // Original Pokemon Emerald tile size
export const SCALE_FACTOR = 4;     // Scale everything up by 4x
export const GRID_SIZE = BASE_TILE_SIZE * SCALE_FACTOR; // 64 pixels

export const GRID = {
  COLS: 9,
  ROWS: 8,  
};

export const ROOM = {
  WIDTH: GRID.COLS * GRID_SIZE,    
  HEIGHT: GRID.ROWS * GRID_SIZE,
  BORDER: BASE_TILE_SIZE * SCALE_FACTOR,
};