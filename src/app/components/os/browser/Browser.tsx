'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Arrow, Network, Refresh, Stop } from './NavigationIcons';

interface BrowserProps {
  windowId: string;
}

// Google URL that works in iframes
const GOOGLE_URL = 'https://www.google.com/webhp?igu=1';

const Browser: React.FC<BrowserProps> = ({ }) => {
  const [url, setUrl] = useState<string>(GOOGLE_URL);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<string[]>([GOOGLE_URL]);
  const [historyPosition, setHistoryPosition] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const urlUpdateRef = useRef<boolean>(false);

  const canGoBack = historyPosition > 0;
  const canGoForward = historyPosition < history.length - 1;

  const navigateTo = useCallback((targetUrl: string, addToHistory = true) => {
    setLoading(true);
    
    // Reset search query
    setSearchQuery(null);
    
    let formattedUrl = targetUrl;
    
    // Handle special case for Google
    if (formattedUrl.includes('google.com') && !formattedUrl.includes('igu=1')) {
      formattedUrl = GOOGLE_URL;
    }
    
    // Format URLs without a protocol
    if (!formattedUrl.startsWith('http') && !formattedUrl.startsWith('about:')) {
      // Check if it looks like a domain
      if (/^([-a-zA-Z0-9@:%._+~#=]{1,256}\.)+[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      } else {
        // It's a search query
        setSearchQuery(formattedUrl);
        formattedUrl = GOOGLE_URL;
      }
    }
    
    // Set the URL in the address bar
    setUrl(formattedUrl);
    urlUpdateRef.current = true;
    
    // Add to history if this is a new navigation
    if (addToHistory) {
      const newHistory = [...history.slice(0, historyPosition + 1), formattedUrl];
      setHistory(newHistory);
      setHistoryPosition(newHistory.length - 1);
    }
    
    // Set the iframe src
    if (iframeRef.current) {
      iframeRef.current.src = formattedUrl;
    }
  }, [history, historyPosition]);

  // Go back in history
  const goBack = useCallback(() => {
    if (canGoBack) {
      setHistoryPosition(prev => prev - 1);
      navigateTo(history[historyPosition - 1], false);
    }
  }, [canGoBack, history, historyPosition, navigateTo]);

  // Go forward in history
  const goForward = useCallback(() => {
    if (canGoForward) {
      setHistoryPosition(prev => prev + 1);
      navigateTo(history[historyPosition + 1], false);
    }
  }, [canGoForward, history, historyPosition, navigateTo]);

  const handleIframeLoad = useCallback(() => {
    setLoading(false);
    
    // Handle search query if present
    if (searchQuery && iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const iframe = iframeRef.current;
        const contentWindow = iframe.contentWindow;
        
        // Attempt to find and populate the search input
        const searchInput = contentWindow.document.querySelector('input[type="text"], input[name="q"]');
        if (searchInput) {
          (searchInput as HTMLInputElement).value = searchQuery;
          
          const searchButton = contentWindow.document.querySelector('input[type="submit"], button[type="submit"]');
          if (searchButton) {
            (searchButton as HTMLButtonElement).click();
          } else {
            const form = contentWindow.document.querySelector('form');
            if (form) {
              form.submit();
            }
          }
        }
      } catch (e) {
        console.error('Error executing search in iframe:', e);
      }
    }
    
  }, [searchQuery]);

  // Initialize the browser
  useEffect(() => {
    // Only run this once on first render
    navigateTo(GOOGLE_URL);
  }, []);

  // Update input field when URL changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = url;
    }
  }, [url]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Browser controls */}
      <div className="flex items-center p-2 bg-gray-100 border-b border-gray-300">
        <div className="flex space-x-1">
          <button
            disabled={!canGoBack}
            onClick={goBack}
            title="Go back"
            className={`p-1.5 rounded-full ${canGoBack ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
          >
            <Arrow direction="left" />
          </button>
          <button
            disabled={!canGoForward}
            onClick={goForward}
            title="Go forward"
            className={`p-1.5 rounded-full ${canGoForward ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
          >
            <Arrow direction="right" />
          </button>
          <button
            title={loading ? "Stop" : "Reload"}
            className="p-1.5 rounded-full hover:bg-gray-200"
            onClick={() => {
              if (loading) {
                setLoading(false);
                if (iframeRef.current) {
                  iframeRef.current.src = 'about:blank';
                }
              } else {
                navigateTo(url);
              }
            }}
          >
            {loading ? <Stop /> : <Refresh />}
          </button>
        </div>
        <input
          ref={inputRef}
          defaultValue={url}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputRef.current) {
              navigateTo(inputRef.current.value);
            }
          }}
          placeholder="Search or enter a URL"
          className="flex-1 mx-2 py-1.5 px-3 rounded-full bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          className="p-1.5 rounded-full hover:bg-gray-200"
          title="Show settings"
          onClick={() => {
            // dont need settings
          }}
        >
          <Network />
        </button>
      </div>

      {/* Bookmarks/Quick Access */}
      <div className="flex items-center p-1 bg-gray-100 border-b border-gray-300">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { icon: '🏠', url: GOOGLE_URL, name: 'Google' },
            { icon: '📚', url: 'https://en.wikipedia.org', name: 'Wikipedia' },
            { icon: '💧', url: 'https://paveldogreat.github.io/WebGL-Fluid-Simulation/', name: 'Fluid' },
            { icon: '🐱', url: 'https://pokemondb.net/pokedex/national', name: 'Pokédex' },
            { icon: '⚡', url: 'https://codepen.io/akm2/full/rHIsa', name: 'Lightning' },
            { icon: '🎨', url: 'https://jacksonpollock.org', name: 'Paint' }
          ].map((bookmark) => (
            <button
              key={bookmark.name}
              onClick={() => navigateTo(bookmark.url)}
              title={bookmark.name}
              className="p-1.5 rounded hover:bg-gray-200 flex items-center text-sm"
            >
              <span className="mr-1">{bookmark.icon}</span>
              <span>{bookmark.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Browser content */}
      <div className="flex-1 relative">
        {/* Loading indicator */}
        {loading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-10">
            <div className="h-full bg-blue-500 animate-pulse" style={{width: '100%'}}></div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
};

export default Browser;