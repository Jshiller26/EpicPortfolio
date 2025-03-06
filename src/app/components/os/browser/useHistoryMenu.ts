'use client';

import { useMemo } from 'react';

interface ContextMenuCapture {
  onContextMenuCapture?: (event: React.MouseEvent) => void;
}

const useHistoryMenu = (
  history: string[],
  position: number): {
  backMenu: ContextMenuCapture;
  forwardMenu: ContextMenuCapture;
} => {  
  const backMenu = useMemo<ContextMenuCapture>(
    () => ({
      onContextMenuCapture: (event) => {
        event.preventDefault();
      },
    }),
    [history, position]
  );
  
  const forwardMenu = useMemo<ContextMenuCapture>(
    () => ({
      onContextMenuCapture: (event) => {
        event.preventDefault();
      },
    }),
    [history, position]
  );
  
  return { backMenu, forwardMenu };
};

export default useHistoryMenu;