'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function StartScreen() {
  const [isBlinking, setIsBlinking] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full bg-emerald-800 overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'linear-gradient(135deg, #1a5c4a 0%, #2d8b6d 100%)',
        }}
      >
    </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center h-full">
        {/* Title Logo */}
        <div className="title-container mb-4">
          <Image
            src="/images/PokemonName2.png"
            alt="Joe Shiller"
            width={400}
            height={150}
            priority
          />
        </div>

        {/* Subtitle */}
        <div 
          className="text-white text-2xl mb-8"
          style={{ fontFamily: 'BengalPixel, sans-serif' }}
        >
          SOFTWARE DEVELOPER
        </div>

        {/* Press Start Text */}
        <div 
          className={`press-start text-white text-2xl mt-8 transition-opacity duration-200 ${
            isBlinking ? 'opacity-100' : 'opacity-0'
          }`}
        >
          PRESS START
        </div>

        {/* Copyright Text */}
        <div className="absolute bottom-4 right-4 text-white text-sm opacity-80">
          © 2025 Joe Shiller
        </div>
      </div>
    </div>
  );
}