import React, { useEffect, useRef, useState } from 'react';

interface EmulatorJSProps {
  rom?: string;
  fullscreen?: boolean;
}

const EmulatorJS: React.FC<EmulatorJSProps> = ({ 
  rom = 'PokemonEmerald', 
  fullscreen = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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
      // Create EJS_player script variable
      const playerScript = document.createElement('script');
      playerScript.textContent = 'EJS_player = "#game";';
      
      const coreScript = document.createElement('script');
      coreScript.textContent = 'EJS_core = "gba";';
      
      const pathScript = document.createElement('script');
      pathScript.textContent = 'EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";';
      
      const gameUrlScript = document.createElement('script');
      gameUrlScript.textContent = `EJS_gameUrl = "${romPath}";`;
      
      const optionsScript = document.createElement('script');
      optionsScript.textContent = 'EJS_defaultOptions = { "gba": {"sound": true, "vsync": true} };';
      
      // Add volume control
      const volumeScript = document.createElement('script');
      volumeScript.textContent = 'EJS_volume = 0.5;';
      
      // Create loader script
      const loaderScript = document.createElement('script');
      loaderScript.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
      loaderScript.onerror = () => {
        setError('Error loading EmulatorJS. Please check your internet connection and try again.');
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div style="color: red; padding: 20px;">Error loading EmulatorJS. Please check your internet connection and try again.</div>';
        }
      };
      
      // Append scripts to document
      if (containerRef.current) {
        containerRef.current.appendChild(playerScript);
        containerRef.current.appendChild(coreScript);
        containerRef.current.appendChild(pathScript);
        containerRef.current.appendChild(optionsScript);
        containerRef.current.appendChild(volumeScript);
        containerRef.current.appendChild(gameUrlScript);
        containerRef.current.appendChild(loaderScript);
      }
      
      initialized.current = true;
    };
    
    initEmulator();
    
    // Cleanup function
    return () => {
      initialized.current = false;
      
      if (window.EJS_terminate && typeof window.EJS_terminate === 'function') {
        window.EJS_terminate();
      }
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
  }
}

export default EmulatorJS;