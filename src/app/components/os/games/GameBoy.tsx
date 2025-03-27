import React, { useState, useEffect } from 'react';
import EmulatorJS from './EmulatorJS';

interface GameBoyProps {
  game?: string;
}

const GameBoy: React.FC<GameBoyProps> = ({ game = 'PokemonEmerald' }) => {
  const [errorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    return () => {
      document.querySelectorAll('audio').forEach(audio => {
        if (!audio.paused) {
          audio.pause();
          audio.srcObject = null;
        }
      });
      
      document.querySelectorAll('canvas').forEach(canvas => {
        const context = canvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
      
      console.log('GameBoy component unmounted and cleaned up');
    };
  }, []);
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with controls info */}
      <div className="bg-gray-800 text-white p-2 text-xs">
        <p>
          <span className="font-bold">Controls:</span> Arrow keys to move, Z = A button, X = B button, 
          A = L button, S = R button, Enter = Start, Space = Select
        </p>
        <p className="mt-1 text-gray-400">
          Game Boy Advance - {game}
        </p>
      </div>
      
      {/* Error message if any */}
      {errorMessage && (
        <div className="bg-red-800 text-white p-2 text-xs">
          {errorMessage}
        </div>
      )}
      
      {/* EmulatorJS component */}
      <div className="flex-1 overflow-hidden">
        <EmulatorJS rom={game} fullscreen={true} />
      </div>
    </div>
  );
};

export default GameBoy;