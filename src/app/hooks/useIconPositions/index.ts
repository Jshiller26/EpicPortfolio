import { useState, useEffect, useCallback } from 'react';

// Types for the hook
export interface IconPosition {
  x: number;
  y: number;
}

export interface UseIconPositionsReturn {
  iconPositions: Record<string, IconPosition>;
  setIconPositions: React.Dispatch<React.SetStateAction<Record<string, IconPosition>>>;
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
  desktopChildren: string[] = [],
  appIds: string[] = []
): UseIconPositionsReturn => {
  const [iconPositions, setIconPositions] = useState<Record<string, IconPosition>>({});
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
    return Object.entries(iconPositions).some(([id, pos]) => {
      return pos.x === x && pos.y === y && id !== excludeItemId;
    });
  }, [iconPositions]);

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
    
    const fallbackX = (excludeItemId?.charCodeAt(0) || 0) % maxColumns * GRID_SIZE;
    const fallbackY = (excludeItemId?.charCodeAt(1) || 0) % maxRows * GRID_SIZE;
    return { x: fallbackX, y: fallbackY };
  }, [isPositionOccupied, getWindowDimensions]);

  const arrangeIconsInGrid = useCallback((items: string[], savedPositions: Record<string, IconPosition> = {}) => {
    const positions: Record<string, IconPosition> = {};
    const { width, height } = getWindowDimensions();
    
    const maxColumns = Math.floor((width - GRID_SIZE) / GRID_SIZE);
    const maxRows = Math.floor((height - 100) / GRID_SIZE);
    
    const occupied: Record<string, boolean> = {};
    
    // First place items with saved positions
    items.forEach((itemId, index) => {
      if (savedPositions[itemId]) {
        const pos = savedPositions[itemId];
        
        if (pos.x >= 0 && pos.x <= maxColumns * GRID_SIZE && 
            pos.y >= 0 && pos.y <= maxRows * GRID_SIZE) {
          
          const posKey = `${pos.x},${pos.y}`;
          
          // Check if this position is already occupied
          if (!occupied[posKey]) {
            positions[itemId] = pos;
            occupied[posKey] = true;
          } else {
            let newPos = { 
              x: (index % maxColumns) * GRID_SIZE, 
              y: Math.floor(index / maxColumns) * GRID_SIZE 
            };
            
            while (occupied[`${newPos.x},${newPos.y}`] && 
                  newPos.y < maxRows * GRID_SIZE) {
              index++;
              newPos = { 
                x: (index % maxColumns) * GRID_SIZE, 
                y: Math.floor(index / maxColumns) * GRID_SIZE 
              };
            }
            
            positions[itemId] = newPos;
            occupied[`${newPos.x},${newPos.y}`] = true;
          }
        } else {
          let newPos = { 
            x: (index % maxColumns) * GRID_SIZE, 
            y: Math.floor(index / maxColumns) * GRID_SIZE 
          };
          
          while (occupied[`${newPos.x},${newPos.y}`] && 
                newPos.y < maxRows * GRID_SIZE) {
            index++;
            newPos = { 
              x: (index % maxColumns) * GRID_SIZE, 
              y: Math.floor(index / maxColumns) * GRID_SIZE 
            };
          }
          
          positions[itemId] = newPos;
          occupied[`${newPos.x},${newPos.y}`] = true;
        }
      }
    });
    
    // Then place items without saved positions
    items.forEach((itemId, index) => {
      if (positions[itemId]) return;
      
      let col = index % maxColumns;
      let row = Math.floor(index / maxColumns);
      let assigned = false;
      
      while (!assigned && row <= maxRows) {
        const x = col * GRID_SIZE;
        const y = row * GRID_SIZE;
        const posKey = `${x},${y}`;
        
        if (!occupied[posKey]) {
          positions[itemId] = { x, y };
          occupied[posKey] = true;
          assigned = true;
        } else {
          col = (col + 1) % maxColumns;
          if (col === 0) {
            row++;
          }
        }
      }
      if (!assigned) {
        const fallbackCol = (itemId.charCodeAt(0) || index) % maxColumns;
        const fallbackRow = (itemId.charCodeAt(1) || index) % maxRows;
        positions[itemId] = { 
          x: fallbackCol * GRID_SIZE, 
          y: fallbackRow * GRID_SIZE 
        };
      }
    });
    
    return positions;
  }, [getWindowDimensions]);

  const computeInitialPositions = useCallback((
    allItems: string[], 
    savedPositions: Record<string, IconPosition> = {}
  ) => {
    const positions = arrangeIconsInGrid(allItems, savedPositions);
    return positions;
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
      } catch (error) {
        console.error('Error saving icon positions:', error);
      }
    }
  }, [iconPositions, ready]);

  const ensureIconsVisible = useCallback(() => {
    if (!ready) return;
    
    const { width, height } = getWindowDimensions();
    const maxX = width - GRID_SIZE;
    const maxY = height - 100 - GRID_SIZE;
    
    let needsUpdate = false;
    const updatedPositions = { ...iconPositions };
    
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
  }, [ready, getWindowDimensions, iconPositions, findNextAvailablePosition]);

  // Load saved positions on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !ready) {
      try {
        // Try to load saved positions from localStorage
        const savedIconPositions = localStorage.getItem('desktopIconPositions');
        const parsedPositions = savedIconPositions ? JSON.parse(savedIconPositions) : {};
        
        const allItems = [...desktopChildren, ...appIds];
        
        // Compute positions for all items
        const initialPositions = computeInitialPositions(allItems, parsedPositions);
        
        setIconPositions(initialPositions);
      } catch (error) {
        console.error('Error loading icon positions:', error);
        
        const allItems = [...desktopChildren, ...appIds];
        const initialPositions = computeInitialPositions(allItems);
        setIconPositions(initialPositions);
      }
      
      setReady(true);
    }
  }, [computeInitialPositions, desktopChildren, appIds]);

  // Handle new desktop items without positions
  useEffect(() => {
    if (ready) {
      const allItems = [...desktopChildren, ...appIds];
      const itemsWithoutPositions = allItems.filter(id => !iconPositions[id]);
      
      if (itemsWithoutPositions.length > 0) {
        console.log("Found new items without positions:", itemsWithoutPositions);
        
        setIconPositions(prev => {
          const updatedPositions = { ...prev };
          const occupiedPositions = new Set(
            Object.values(updatedPositions).map(pos => `${pos.x},${pos.y}`)
          );
          
          const startIndex = Object.keys(updatedPositions).length;
          
          itemsWithoutPositions.forEach((itemId, index) => {
            const { width } = getWindowDimensions();
            const maxColumns = Math.floor((width - GRID_SIZE) / GRID_SIZE);
            
            const col = (startIndex + index) % maxColumns;
            const row = Math.floor((startIndex + index) / maxColumns);
            
            const x = col * GRID_SIZE;
            const y = row * GRID_SIZE;
            
            const posKey = `${x},${y}`;
            
            if (!occupiedPositions.has(posKey)) {
              updatedPositions[itemId] = { x, y };
              occupiedPositions.add(posKey);
            } else {
              updatedPositions[itemId] = findNextAvailablePosition(0, 0, itemId);
            }
            
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
  }, [ready, desktopChildren, appIds, iconPositions, findNextAvailablePosition, getWindowDimensions]);

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
  }, [iconPositions, savePositions]);

  return {
    iconPositions,
    setIconPositions,
    newItems,
    findNextAvailablePosition,
    isPositionOccupied,
    addIconPosition,
    removeIconPosition,
    savePositions
  };
};

export default useIconPositions;