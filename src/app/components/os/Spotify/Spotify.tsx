'use client';

import React, { useRef, useEffect } from 'react';
import { useWindowStore } from '@/app/stores/windowStore';

export default function Spotify() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const windows = useWindowStore((state) => state.windows);
  const spotifyWindowId = Object.keys(windows).find(id => id.startsWith('spotify-'));
  const windowState = spotifyWindowId ? windows[spotifyWindowId] : null;

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
      className="flex flex-col h-full w-full bg-black overflow-hidden" 
      ref={containerRef}
    >
      <iframe 
        ref={iframeRef}
        src="https://open.spotify.com/embed/playlist/37i9dQZEVXcJZyENOWUFo7?utm_source=generator" 
        className="w-full h-full border-none"
        title="Spotify"
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
      />
    </div>
  );
}