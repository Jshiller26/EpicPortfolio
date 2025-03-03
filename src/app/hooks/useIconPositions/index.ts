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

  const getAllOccupiedPositions = useCallback((): Record<string, string> => {
    const occupied: Record<string, string> = {};
    
    occupied[`${vsCodePosition.x},${vsCodePosition.y}`] = 'vscode';
    
    Object.entries(iconPositions).forEach(([id, pos]) => {
      occupied[`${pos.x},${pos.y}`] = id;
    });
    
    return occupied;
  }, [iconPositions, vsCodePosition]);

  const isPositionOccupied = useCallback((x: number, y: number, excludeItemId?: string): boolean => {
    if (vsCodePosition.x === x && vsCodePosition.y === y && excludeItemId !== 'vscode') {
      return true;
    }
    
    return Object.entries(iconPositions).some(([id, pos]) => {
      return pos.x === x && pos.y === y && id !== excludeItemId;
    });
  }, [iconPositions, vsCodePosition]);

  // Find the next available position on the grid
  const findNextAvailablePosition = useCallback((startX: number, startY: number, excludeItemId?: string): IconPosition => {
    if (!isPositionOccupied(startX, startY, excludeItemId)) {
      return { x: startX, y: startY };
    }
    
    const leftEdgeX = 0;
    let y = 0;
    
    while (isPositionOccupied(leftEdgeX, y, excludeItemId)) {
      y += GRID_SIZE;
    }
    
    return { x: leftEdgeX, y };
  }, [isPositionOccupied]);

  const arrangeIconsVertically = useCallback((items: string[], savedPositions: Record<string, IconPosition> = {}) => {
    const positions: Record<string, IconPosition> = {};
    const occupied: Record<string, string> = {};
    const leftEdgeX = 0;
    
    items.forEach(itemId => {
      if (savedPositions[itemId]) {
        const pos = savedPositions[itemId];
        const posKey = `${pos.x},${pos.y}`;
        
        if (!occupied[posKey]) {
          positions[itemId] = pos;
          occupied[posKey] = itemId;
        }
      }
    });
    
    items.forEach(itemId => {
      if (positions[itemId]) return;
      
      let y = 0;
      while (occupied[`${leftEdgeX},${y}`]) {
        y += GRID_SIZE;
      }
      
      positions[itemId] = { x: leftEdgeX, y };
      occupied[`${leftEdgeX},${y}`] = itemId;
    });
    
    return positions;
  }, []);

  // Compute initial positions for all items
  const computeInitialPositions = useCallback((
    allItems: string[], 
    savedIconPositions: Record<string, IconPosition> = {},
    savedVsCodePos?: IconPosition
  ) => {
    const allItemsCopy = [...allItems];
    
    if (!allItemsCopy.includes('vscode')) {
      allItemsCopy.unshift('vscode');
    }
    
    const combinedSavedPositions: Record<string, IconPosition> = { ...savedIconPositions };
    if (savedVsCodePos) {
      combinedSavedPositions['vscode'] = savedVsCodePos;
    }
    
    // Arrange all items vertically
    const allPositions = arrangeIconsVertically(allItemsCopy, combinedSavedPositions);
    
    // Extract VS Code position from the results
    const vsCodePos = allPositions['vscode'] || { x: 0, y: 0 };
    delete allPositions['vscode'];
    
    return {
      iconPositions: allPositions,
      vsCodePosition: vsCodePos
    };
  }, [arrangeIconsVertically]);

  // Add a new icon position
  const addIconPosition = useCallback((itemId: string, position?: IconPosition) => {
    if (position) {
      // Check if the position is available
      if (!isPositionOccupied(position.x, position.y, itemId)) {
        setIconPositions(prev => ({
          ...prev,
          [itemId]: position
        }));
      } else {
        // Find the next available position
        const newPos = findNextAvailablePosition(0, 0, itemId);
        setIconPositions(prev => ({
          ...prev,
          [itemId]: newPos
        }));
      }
    } else {
      // Default to finding a position along the left edge
      const newPos = findNextAvailablePosition(0, 0, itemId);
      setIconPositions(prev => ({
        ...prev,
        [itemId]: newPos
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
  }, [isPositionOccupied, findNextAvailablePosition]);

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
      try {
        // Try to load saved positions from localStorage
        const savedIconPositions = localStorage.getItem('desktopIconPositions');
        const savedVsCodePos = localStorage.getItem('vsCodeIconPosition');
        
        const parsedIconPositions = savedIconPositions ? JSON.parse(savedIconPositions) : {};
        const parsedVsCodePos = savedVsCodePos ? JSON.parse(savedVsCodePos) : undefined;
        
        // Compute positions for all items
        const { iconPositions: initialPositions, vsCodePosition: initialVsCodePos } = 
          computeInitialPositions(
            [...desktopChildren, 'vscode'], 
            parsedIconPositions,
            parsedVsCodePos
          );
        
        setIconPositions(initialPositions);
        setVsCodePosition(initialVsCodePos);
      } catch (error) {
        console.error('Error loading icon positions:', error);
        
        const { iconPositions: initialPositions, vsCodePosition: initialVsCodePos } = 
          computeInitialPositions([...desktopChildren, 'vscode']);
        
        setIconPositions(initialPositions);
        setVsCodePosition(initialVsCodePos);
      }
      
      setReady(true);
    }
  }, [computeInitialPositions, desktopChildren]);

  // Handle new desktop items without positions
  useEffect(() => {
    if (ready && desktopChildren) {
      const itemsWithoutPositions = desktopChildren.filter(id => !iconPositions[id]);
      
      if (itemsWithoutPositions.length > 0) {
        console.log("Found new items without positions:", itemsWithoutPositions);
        
        setNewItems(prev => {
          const updated = new Set(prev);
          itemsWithoutPositions.forEach(id => updated.add(id));
          return updated;
        });
        
        const occupied = getAllOccupiedPositions();
        
        // Update positions for new items
        setIconPositions(prev => {
          const updatedPositions = { ...prev };
          const leftEdgeX = 0;
          
          itemsWithoutPositions.forEach(itemId => {
            let y = 0;
            let posKey = `${leftEdgeX},${y}`;
            
            // Find the first unoccupied position
            while (occupied[posKey]) {
              y += GRID_SIZE;
              posKey = `${leftEdgeX},${y}`;
            }
            
            updatedPositions[itemId] = { x: leftEdgeX, y };
            occupied[posKey] = itemId; 
          });
          
          return updatedPositions;
        });
      }
    }
  }, [ready, desktopChildren, iconPositions, getAllOccupiedPositions]);

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