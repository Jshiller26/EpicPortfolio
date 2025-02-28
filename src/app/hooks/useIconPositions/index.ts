import { useState, useEffect, useCallback } from 'react';

// Types for the hook
export interface IconPosition {
  x: number;
  y: number;
}

export interface UseIconPositionsReturn {
  iconPositions: Record<string, IconPosition>;
  vsCodePosition: IconPosition;
  setIconPositions: React.Dispatch<React.SetStateAction<Record<string, IconPosition>>>;
  setVsCodePosition: React.Dispatch<React.SetStateAction<IconPosition>>;
  newItems: Set<string>;
  findNextAvailablePosition: (startX: number, startY: number, excludeItemId?: string) => IconPosition;
  isPositionOccupied: (x: number, y: number, excludeItemId?: string) => boolean;
  addIconPosition: (itemId: string, position?: IconPosition) => void;
  removeIconPosition: (itemId: string) => void;
  savePositions: () => void;
}

const GRID_SIZE = 76;

// Custom hook to manage icon positions
export const useIconPositions = (
  desktopChildren: string[] = []
): UseIconPositionsReturn => {
  const [iconPositions, setIconPositions] = useState<Record<string, IconPosition>>({});
  const [vsCodePosition, setVsCodePosition] = useState<IconPosition>({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  
  // Track newly created or pasted items to avoid transition
  const [newItems, setNewItems] = useState<Set<string>>(new Set());

  // Check if a position is already occupied by another icon
  const isPositionOccupied = useCallback((x: number, y: number, excludeItemId?: string): boolean => {
    const desktopOccupied = Object.entries(iconPositions).some(([id, pos]) => {
      return pos.x === x && pos.y === y && id !== excludeItemId;
    });
    
    const vsCodeOccupied = vsCodePosition.x === x && vsCodePosition.y === y && excludeItemId !== 'vscode';
    
    return desktopOccupied || vsCodeOccupied;
  }, [iconPositions, vsCodePosition]);

  // Find the next available position on the grid
  const findNextAvailablePosition = useCallback((startX: number, startY: number, excludeItemId?: string): IconPosition => {
    if (!isPositionOccupied(startX, startY, excludeItemId)) {
      return { x: startX, y: startY };
    }
    
    for (let radius = 1; radius <= 5; radius++) {
      const positions = [
        { x: startX, y: startY + (GRID_SIZE * radius) },
        { x: startX + (GRID_SIZE * radius), y: startY },
        { x: startX, y: startY - (GRID_SIZE * radius) },
        { x: startX - (GRID_SIZE * radius), y: startY }
      ];
      
      for (const pos of positions) {
        if (!isPositionOccupied(pos.x, pos.y, excludeItemId)) {
          return pos;
        }
      }
    }
    
    // If no position is found nearby, use the right edge as fallback
    const rightEdgeX = Math.floor((window.innerWidth - GRID_SIZE * 2) / GRID_SIZE) * GRID_SIZE;
    let y = 0;
    
    // Find the first available spot going down the right edge
    while (isPositionOccupied(rightEdgeX, y, excludeItemId)) {
      y += GRID_SIZE;
    }
    
    return { x: rightEdgeX, y };
  }, [isPositionOccupied]);

  // Compute initial positions for all desktop items
  const computeInitialPositions = useCallback((savedPositions: Record<string, IconPosition> = {}) => {
    const positions: Record<string, IconPosition> = {};
    let posY = 0;
    
    // Right edge position for icons
    const rightEdgeX = Math.floor((window.innerWidth - GRID_SIZE * 2) / GRID_SIZE) * GRID_SIZE;
    
    // Process all desktop items and give them positions
    if (desktopChildren) {
      desktopChildren.forEach(itemId => {
        // If the item has a saved position, use it
        if (savedPositions[itemId]) {
          positions[itemId] = savedPositions[itemId];
          return;
        }
        
        // Otherwise place it at the right edge
        while (Object.values(positions).some(pos => pos.x === rightEdgeX && pos.y === posY)) {
          posY += GRID_SIZE;
        }
        
        positions[itemId] = { x: rightEdgeX, y: posY };
        posY += GRID_SIZE;
      });
    }
    
    return positions;
  }, [desktopChildren]);

  // Add a new icon position
  const addIconPosition = useCallback((itemId: string, position?: IconPosition) => {
    if (position) {
      setIconPositions(prev => ({
        ...prev,
        [itemId]: position
      }));
    } else {
      // Find a position for the new item
      const rightEdgeX = Math.floor((window.innerWidth - GRID_SIZE * 2) / GRID_SIZE) * GRID_SIZE;
      let newPosition: IconPosition;
      
      if (Object.keys(iconPositions).length > 0) {
        newPosition = findNextAvailablePosition(rightEdgeX, 0, itemId);
      } else {
        newPosition = { x: rightEdgeX, y: 0 };
      }
      
      setIconPositions(prev => ({
        ...prev,
        [itemId]: newPosition
      }));
    }
    
    // Add to newItems set to prevent transition animation
    setNewItems(prev => {
      const updated = new Set(prev);
      updated.add(itemId);
      return updated;
    });
    
    // Clear the newItems set after a delay
    setTimeout(() => {
      setNewItems(prev => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }, 100);
  }, [iconPositions, findNextAvailablePosition]);

  // Remove an icon position
  const removeIconPosition = useCallback((itemId: string) => {
    setIconPositions(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  }, []);

  // Save the positions to localStorage
  const savePositions = useCallback(() => {
    if (typeof window !== 'undefined' && ready) {
      try {
        if (Object.keys(iconPositions).length > 0) {
          localStorage.setItem('desktopIconPositions', JSON.stringify(iconPositions));
        }
        localStorage.setItem('vsCodeIconPosition', JSON.stringify(vsCodePosition));
      } catch (error) {
        console.error('Error saving icon positions:', error);
      }
    }
  }, [iconPositions, vsCodePosition, ready]);

  // Load saved positions on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !ready) {
      let savedPositions = {};
      let initialPositions = {};
      let savedVsCodePosition = { x: 0, y: 0 };
      
      try {
        // Try to load saved positions from localStorage
        const saved = localStorage.getItem('desktopIconPositions');
        if (saved) {
          savedPositions = JSON.parse(saved);
        }
        
        const savedVsCode = localStorage.getItem('vsCodeIconPosition');
        if (savedVsCode) {
          savedVsCodePosition = JSON.parse(savedVsCode);
        } else {
          savedVsCodePosition = { x: 0, y: 0 };
        }
        
        initialPositions = computeInitialPositions(savedPositions);
        
        setIconPositions(initialPositions);
        setVsCodePosition(savedVsCodePosition);
      } catch (error) {
        console.error('Error loading icon positions:', error);
        
        initialPositions = computeInitialPositions();
        setIconPositions(initialPositions);
        setVsCodePosition({ x: 0, y: 0 });
      }
      
      setReady(true);
    }
  }, [computeInitialPositions]);

  // Handle new desktop items without positions
  useEffect(() => {
    if (ready && desktopChildren) {
      const itemsWithoutPositions = desktopChildren.filter(id => !iconPositions[id]);
      
      if (itemsWithoutPositions.length > 0) {
        console.log("Found new items without positions:", itemsWithoutPositions);
        
        // Add these to the new items set to prevent transition
        setNewItems(prev => {
          const updated = new Set(prev);
          itemsWithoutPositions.forEach(id => updated.add(id));
          return updated;
        });
        
        setIconPositions(prev => {
          const updatedPositions = { ...prev };
          
          itemsWithoutPositions.forEach(itemId => {
            if (updatedPositions[itemId]) {
              return;
            }
            
            const rightEdgeX = Math.floor((window.innerWidth - GRID_SIZE * 2) / GRID_SIZE) * GRID_SIZE;
            let y = 0;
            
            while (Object.values(updatedPositions).some(pos => pos.x === rightEdgeX && pos.y === y)) {
              y += GRID_SIZE;
            }
            
            updatedPositions[itemId] = { x: rightEdgeX, y };
          });
          
          return updatedPositions;
        });
      }
    }
  }, [ready, desktopChildren, iconPositions]);

  // Save positions to localStorage when they change
  useEffect(() => {
    savePositions();
  }, [iconPositions, vsCodePosition, savePositions]);

  return {
    iconPositions,
    vsCodePosition,
    setIconPositions,
    setVsCodePosition,
    newItems,
    findNextAvailablePosition,
    isPositionOccupied,
    addIconPosition,
    removeIconPosition,
    savePositions
  };
};

export default useIconPositions;