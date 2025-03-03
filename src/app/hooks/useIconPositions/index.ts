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

// Fixed grid size
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

  const getWindowDimensions = useCallback(() => {
    if (typeof window === 'undefined') return { width: 1920, height: 1080 };
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }, []);

  const isPositionOccupied = useCallback((x: number, y: number, excludeItemId?: string): boolean => {
    if (vsCodePosition.x === x && vsCodePosition.y === y && excludeItemId !== 'vscode') {
      return true;
    }
    
    return Object.entries(iconPositions).some(([id, pos]) => {
      return pos.x === x && pos.y === y && id !== excludeItemId;
    });
  }, [iconPositions, vsCodePosition]);

  const findNextAvailablePosition = useCallback((startX: number, startY: number, excludeItemId?: string): IconPosition => {
    if (!isPositionOccupied(startX, startY, excludeItemId)) {
      return { x: startX, y: startY };
    }
    
    const { width, height } = getWindowDimensions();
    
    const maxColumns = Math.floor((width - GRID_SIZE) / GRID_SIZE);
    const maxRows = Math.floor((height - 100) / GRID_SIZE);
    
    // Start at the top-left corner
    for (let col = 0; col <= maxColumns; col++) {
      for (let row = 0; row <= maxRows; row++) {
        const x = col * GRID_SIZE;
        const y = row * GRID_SIZE;
        
        if (!isPositionOccupied(x, y, excludeItemId)) {
          return { x, y };
        }
      }
    }
    
    return { x: 0, y: 0 };
  }, [isPositionOccupied, getWindowDimensions]);

  const arrangeIconsInGrid = useCallback((items: string[], savedPositions: Record<string, IconPosition> = {}) => {
    const positions: Record<string, IconPosition> = {};
    const { width, height } = getWindowDimensions();
    
    const maxColumns = Math.floor((width - GRID_SIZE) / GRID_SIZE);
    const maxRows = Math.floor((height - 100) / GRID_SIZE);
    
    const occupied: Record<string, boolean> = {};
    
    items.forEach(itemId => {
      if (savedPositions[itemId]) {
        const pos = savedPositions[itemId];
        
        if (pos.x >= 0 && pos.x <= maxColumns * GRID_SIZE && 
            pos.y >= 0 && pos.y <= maxRows * GRID_SIZE) {
          
          const posKey = `${pos.x},${pos.y}`;
          
          // Check if this position is already occupied
          if (!occupied[posKey]) {
            positions[itemId] = pos;
            occupied[posKey] = true;
          }
        }
      }
    });
    
    items.forEach(itemId => {
      if (positions[itemId]) return;
      
      // Find the first available position in the grid
      for (let col = 0; col <= maxColumns; col++) {
        for (let row = 0; row <= maxRows; row++) {
          const x = col * GRID_SIZE;
          const y = row * GRID_SIZE;
          const posKey = `${x},${y}`;
          
          if (!occupied[posKey]) {
            positions[itemId] = { x, y };
            occupied[posKey] = true;
            return;
          }
        }
      }
      positions[itemId] = { x: 0, y: 0 };
    });
    
    return positions;
  }, [getWindowDimensions]);

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
    
    const allPositions = arrangeIconsInGrid(allItemsCopy, combinedSavedPositions);
    
    // Extract VS Code position from the results
    const vsCodePos = allPositions['vscode'] || { x: 0, y: 0 };
    delete allPositions['vscode'];
    
    return {
      iconPositions: allPositions,
      vsCodePosition: vsCodePos
    };
  }, [arrangeIconsInGrid]);

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

  const ensureIconsVisible = useCallback(() => {
    if (!ready) return;
    
    const { width, height } = getWindowDimensions();
    const maxX = width - GRID_SIZE;
    const maxY = height - 100 - GRID_SIZE;
    
    let needsUpdate = false;
    const updatedPositions = { ...iconPositions };
    
    if (vsCodePosition.x > maxX || vsCodePosition.y > maxY) {
      setVsCodePosition(prev => {
        if (prev.x <= maxX) {
          return { x: prev.x, y: Math.min(prev.y, maxY) };
        }
        return findNextAvailablePosition(0, 0, 'vscode');
      });
    }
    
    Object.entries(iconPositions).forEach(([id, pos]) => {
      if (pos.x > maxX || pos.y > maxY) {
        needsUpdate = true;
        
        if (pos.x <= maxX) {
          updatedPositions[id] = { x: pos.x, y: Math.min(pos.y, maxY) };
        } else {
          updatedPositions[id] = findNextAvailablePosition(0, 0, id);
        }
      }
    });
    
    if (needsUpdate) {
      setIconPositions(updatedPositions);
    }
  }, [ready, getWindowDimensions, iconPositions, vsCodePosition, findNextAvailablePosition]);

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
        
        // Update positions for new items
        setIconPositions(prev => {
          const updatedPositions = { ...prev };
          
          itemsWithoutPositions.forEach(itemId => {
            const position = findNextAvailablePosition(0, 0, itemId);
            updatedPositions[itemId] = position;
            
            setNewItems(prevItems => {
              const updated = new Set(prevItems);
              updated.add(itemId);
              return updated;
            });
            setTimeout(() => {
              setNewItems(prevItems => {
                const updated = new Set(prevItems);
                updated.delete(itemId);
                return updated;
              });
            }, 500);
          });
          
          return updatedPositions;
        });
      }
    }
  }, [ready, desktopChildren, iconPositions, findNextAvailablePosition]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ready) {
      const handleResize = () => {
        ensureIconsVisible();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [ready, ensureIconsVisible]);

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