import { RoomCollision } from './tileMap';
import type { GridPosition } from '../types/gameTypes';

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

function manhattan(start: GridPosition, end: GridPosition): number {
  return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
}

function getNeighbors(node: Node, collision: RoomCollision): Node[] {
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
  ];

  return directions
    .map(dir => ({
      x: node.x + dir.x,
      y: node.y + dir.y,
      g: node.g + 1,
      h: 0,
      f: 0,
      parent: node
    }))
    .filter(n => collision.isWalkable(n.x, n.y));
}

export function findPath(
  start: GridPosition,
  end: GridPosition,
  collision: RoomCollision
): GridPosition[] {
  // If the end position isn't walkable, find the closest walkable tile
  if (!collision.isWalkable(end.x, end.y)) {
    const directions = [
      { x: 0, y: -1 }, // up
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 },  // right
      { x: 0, y: 1 },  // down
    ];
    
    for (const dir of directions) {
      const newEnd = {
        x: end.x + dir.x,
        y: end.y + dir.y
      };
      if (collision.isWalkable(newEnd.x, newEnd.y)) {
        end = newEnd;
        break;
      }
    }
  }

  const openSet: Node[] = [];
  const closedSet: Set<string> = new Set();
  
  const startNode: Node = {
    x: start.x,
    y: start.y,
    g: 0,
    h: manhattan(start, end),
    f: 0,
    parent: null
  };
  startNode.f = startNode.g + startNode.h;
  
  openSet.push(startNode);
  
  while (openSet.length > 0) {
    // Find node with lowest f value
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[currentIndex].f) {
        currentIndex = i;
      }
    }
    
    const current = openSet[currentIndex];
    
    // Check if we reached the end
    if (current.x === end.x && current.y === end.y) {
      const path: GridPosition[] = [];
      let temp: Node | null = current;
      
      while (temp !== null) {
        path.push({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      
      return path.reverse();
    }
    
    // Move current node from open to closed set
    openSet.splice(currentIndex, 1);
    closedSet.add(`${current.x},${current.y}`);
    
    // Check all neighbors
    const neighbors = getNeighbors(current, collision);
    for (const neighbor of neighbors) {
      if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
        continue;
      }
      
      neighbor.h = manhattan({ x: neighbor.x, y: neighbor.y }, end);
      neighbor.f = neighbor.g + neighbor.h;
      
      const openNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
      if (!openNode) {
        openSet.push(neighbor);
      } else if (neighbor.g < openNode.g) {
        openNode.g = neighbor.g;
        openNode.f = openNode.g + openNode.h;
        openNode.parent = current;
      }
    }
  }
  
  return []; // No path found
}