import React, { useEffect, useRef, useState } from 'react';

interface EmulatorJSProps {
  rom?: string;
  fullscreen?: boolean;
}

// Use a global flag to track if the emulator is already loaded
let emulatorScriptsLoaded = false;

const EmulatorJS: React.FC<EmulatorJSProps> = ({ 
  rom = 'PokemonEmerald', 
  fullscreen = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to properly clean up the EmulatorJS resources
  const cleanupEmulator = () => {
    // Clean up EJS_terminate function if available
    if (window.EJS_terminate && typeof window.EJS_terminate === 'function') {
      try {
        window.EJS_terminate();
      } catch (error) {
        console.error('Error terminating EmulatorJS:', error);
      }
    }

    // Clean up audio elements
    document.querySelectorAll('audio').forEach(audio => {
      if (!audio.paused) {
        audio.pause();
        audio.srcObject = null;
        audio.remove();
      }
    });

    // Remove all EmulatorJS specific divs
    document.querySelectorAll('div[id^="emjs-"]').forEach(element => {
      element.remove();
    });

    // Clear all variables defined by EmulatorJS
    delete window.EJS_player;
    delete window.EJS_core;
    delete window.EJS_pathtodata;
    delete window.EJS_gameUrl;
    delete window.EJS_defaultOptions;
    delete window.EJS_volume;
    
    // Clear any pending timeouts that might be causing errors
    const numericTimeoutId = Number(setTimeout(() => {}, 0));
    for (let i = 0; i < numericTimeoutId; i++) {
      clearTimeout(i);
    }
    
    // Reset the emulator loaded flag
    emulatorScriptsLoaded = false;
    initialized.current = false;
  };
  
  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    
    const initEmulator = () => {
      setError(null);
      
      // Create game div
      const gameDiv = document.createElement('div');
      gameDiv.id = 'game';
      gameDiv.style.width = '100%';
      gameDiv.style.height = '100%';
      
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(gameDiv);
      }
      
      const romPath = `/games/emulatorjs/gba/${rom}.gba`;
      
      fetch(romPath, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`ROM file not found: ${romPath}`);
          }
          initializeEmulatorScripts(romPath);
        })
        .catch(err => {
          console.error('Error loading ROM:', err);
          setError(`Error loading ROM: ${err.message}`);
          if (containerRef.current) {
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'red';
            errorDiv.style.padding = '20px';
            errorDiv.textContent = `Error: ${err.message}`;
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(errorDiv);
          }
        });
    };
    
    const initializeEmulatorScripts = (romPath: string) => {
      // Define global EmulatorJS variables for this instance
      window.EJS_player = "#game";
      window.EJS_core = "gba";
      window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
      window.EJS_gameUrl = romPath;
      window.EJS_defaultOptions = { "gba": {"sound": true, "vsync": true} };
      window.EJS_volume = 0.5;
      
      // Create loader script only if it hasn't been loaded before
      if (!emulatorScriptsLoaded) {
        const loaderScript = document.createElement('script');
        loaderScript.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
        loaderScript.onerror = () => {
          setError('Error loading EmulatorJS. Please check your internet connection and try again.');
          if (containerRef.current) {
            containerRef.current.innerHTML = '<div style="color: red; padding: 20px;">Error loading EmulatorJS. Please check your internet connection and try again.</div>';
          }
        };
        
        document.body.appendChild(loaderScript);
        emulatorScriptsLoaded = true;
      } else {
        // If already loaded, we need to manually trigger the emulator boot process
        if (typeof window.EJS_emulator === 'function') {
          try {
            window.EJS_emulator();
          } catch (error) {
            console.error('Error re-initializing emulator:', error);
            setError('Error re-initializing emulator. Please try again.');
          }
        }
      }
      
      initialized.current = true;
    };
    
    initEmulator();
    
    // Cleanup function
    return () => {
      cleanupEmulator();
    };
  }, [rom]);
  
  return (
    <div 
      ref={containerRef} 
      className={`emulatorjs-container w-full ${fullscreen ? 'h-full' : 'h-auto'} bg-black flex flex-col items-center justify-center p-4`}
    >
      {error ? (
        <div className="text-red-500 text-center">
          <p className="font-bold">Network Error</p>
          <p className="mt-2">{error}</p>
        </div>
      ) : (
        <div className="text-white text-center">
          <p>Loading emulator...</p>
          <p className="text-xs mt-2">Please wait while the game loads.</p>
        </div>
      )}
    </div>
  );
};

// Add global type definition for EmulatorJS
declare global {
  interface Window {
    EJS_terminate?: () => void;
    EJS_emulator?: () => void;
    EJS_player?: string;
    EJS_core?: string;
    EJS_pathtodata?: string;
    EJS_gameUrl?: string;
    EJS_defaultOptions?: Record<string, unknown>;
    EJS_volume?: number;
    setImmediate?: (callback: (...args: unknown[]) => void, ...args: unknown[]) => number;
    clearImmediate?: (immediateId: number) => void;
  }
}

export default EmulatorJS;