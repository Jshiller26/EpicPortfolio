'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number;
  backgroundImage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onComplete, 
  duration = 2000,
  backgroundImage = '/images/desktop/mountainWallpaperBlurred.jpg'
}) => {
  const radius = 25; 
  const dots = [];
  const dotSize = 8; 
  const centerX = 40;
  const centerY = 40; 

  // Calculate positions for the dotas
  for (let i = 0; i < 5; i++) {
    const angle = (i * (2 * Math.PI / 5)) - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle) - (dotSize / 2);
    const y = centerY + radius * Math.sin(angle) - (dotSize / 2);
    
    dots.push({
      x,
      y,
      style: {
        position: 'absolute' as const,
        left: `${x}px`,
        top: `${y}px`,
        width: `${dotSize}px`,
        height: `${dotSize}px`,
        backgroundColor: 'white',
        borderRadius: '50%'
      }
    });
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onComplete, duration]);
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: '#0078D7',
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="w-full max-w-md p-4 -mt-20">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-white w-42 h-42 flex items-center justify-center mb-5 overflow-hidden">
            <Image 
              src="/images/desktop/defaultUser.png"
              alt="Default User"
              width={150}
              height={150}
            />
          </div>
          
          <h2 className="text-2xl font-light text-white mb-4">Joe Shiller</h2>
          
          {/* Loading area*/}
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full max-w-xs mb-6 flex justify-center">
              <div className="relative mb-4" style={{ width: '80px', height: '80px' }}>
                <div className="absolute inset-0 animate-spin-container" style={{ width: '100%', height: '100%' }}>
                  {dots.map((dot, index) => (
                    <div key={index} style={dot.style}></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <p className="text-white text-lg">
                Welcome
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom left user info same as login screen */}
      <div className="fixed bottom-0 left-0 p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2 overflow-hidden">
            <Image 
              src="/images/desktop/defaultUser.png"
              alt="Default User"
              width={30}
              height={30}
            />
          </div>
          <p className="text-white text-sm">Joe Shiller</p>
        </div>
      </div>
      
      {/* Bottom right icons same as login screen */}
      <div className="fixed bottom-4 right-6 flex space-x-6">
        <div className="flex items-center justify-center w-6 h-6">
          <Image 
            src="/images/desktop/icons8-wifi-100.png" 
            alt="WiFi" 
            width={24} 
            height={24} 
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
        <div className="flex items-center justify-center w-6 h-6">
          <Image 
            src="/images/desktop/icons8-wired-network-connection-100.png" 
            alt="Wired Network" 
            width={24} 
            height={24} 
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
        <div className="flex items-center justify-center w-6 h-6">
          <Image 
            src="/images/desktop/icons8-power-100.png" 
            alt="Power" 
            width={24} 
            height={24} 
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;