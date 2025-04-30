'use client';

import React, { useRef, useEffect } from 'react';
import { useWindowStore } from '@/app/stores/windowStore';

export default function Minesweeper() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const windows = useWindowStore((state) => state.windows);
  const minesweeperWindowId = Object.keys(windows).find(id => id.startsWith('minesweeper-'));
  const windowState = minesweeperWindowId ? windows[minesweeperWindowId] : null;

  useEffect(() => {
    if (!containerRef.current || !iframeRef.current) return;
    
    const handleResize = () => {
      if (containerRef.current && iframeRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const containerWidth = containerRef.current.clientWidth;
        
        iframeRef.current.style.height = `${containerHeight}px`;
        iframeRef.current.style.width = `${containerWidth}px`;
      }
    };
    
    // Initial sizing
    handleResize();
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [windowState?.isMaximized, windowState?.size]);

  return (
    <div 
      className="flex flex-col h-full w-full bg-white overflow-hidden" 
      ref={containerRef}
    >
      <iframe 
        ref={iframeRef}
        src="/minesweeper/index.html"
        className="w-full h-full border-none"
        title="Minesweeper"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
