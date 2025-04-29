'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useWindowStore } from '@/app/stores/windowStore';

const PLAYLISTS = [
  { id: '37i9dQZF1DXcBWIGoYBM5M', name: 'Today\'s Top Hits' },
  { id: '37i9dQZEVXbLRQDuF5jeBp', name: 'US Top 50' },
  { id: '37i9dQZF1DX0XUsuxWHRQd', name: 'RapCaviar' },
  { id: '6jBphva5plG0rjYBdiJbtc', name: 'Hiiipower' },
  { id: '37i9dQZF1DWXRqgorJj26U', name: 'Rock Classics' },
];

export default function Spotify() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(PLAYLISTS[0]);
  const [customUrl, setCustomUrl] = useState('');
  const [showInput, setShowInput] = useState(false);
  
  const windows = useWindowStore((state) => state.windows);
  const spotifyWindowId = Object.keys(windows).find(id => id.startsWith('spotify-'));
  const windowState = spotifyWindowId ? windows[spotifyWindowId] : null;

  useEffect(() => {
    if (!containerRef.current || !iframeRef.current) return;
    
    const handleResize = () => {
      if (containerRef.current && iframeRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const containerWidth = containerRef.current.clientWidth;
        
        const navHeight = 60;
        iframeRef.current.style.height = `${containerHeight - navHeight}px`;
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

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;
    
    let spotifyId = customUrl;
    
    try {
      if (customUrl.includes('spotify.com')) {
        const url = new URL(customUrl);
        const pathParts = url.pathname.split('/');
        spotifyId = pathParts[pathParts.length - 1];
      }
    } catch (error) {
      console.error('Failed to parse URL:', error);
    }
    
    setCurrentPlaylist({ id: spotifyId, name: 'Custom Playlist' });
    setCustomUrl('');
    setShowInput(false);
  };

  return (
    <div 
      className="flex flex-col h-full w-full bg-black overflow-hidden" 
      ref={containerRef}
    >
      {/* Navigation bar */}
      <div className="bg-zinc-900 text-white p-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {PLAYLISTS.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => setCurrentPlaylist(playlist)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  currentPlaylist.id === playlist.id
                    ? 'bg-green-500 text-black'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                {playlist.name}
              </button>
            ))}
            <button
              onClick={() => setShowInput(!showInput)}
              className="px-3 py-1 rounded-full text-sm whitespace-nowrap bg-zinc-800 hover:bg-zinc-700"
            >
              {showInput ? 'Cancel' : 'Custom URL'}
            </button>
          </div>
        </div>
        
        {/* Custom URL input */}
        {showInput && (
          <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Paste Spotify playlist/album/track URL or ID..."
              className="flex-1 p-2 rounded bg-zinc-800 text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded bg-green-500 text-black text-sm"
            >
              Go
            </button>
          </form>
        )}
      </div>
      
      {/* Spotify embed */}
      <iframe 
        ref={iframeRef}
        src={`https://open.spotify.com/embed/playlist/${currentPlaylist.id}?utm_source=generator`} 
        className="w-full border-none"
        title="Spotify"
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
      />
    </div>
  );
}