export type Direction = 'down' | 'up' | 'left' | 'right';

export interface GridPosition {
  x: number;
  y: number;
}

export interface PixelPosition {
  x: number;
  y: number;
}

export interface MovementRequest {
  path: GridPosition[];
  onComplete?: () => void;
}

export interface InteractionEvent {
    position: GridPosition;
    direction: Direction;
  }