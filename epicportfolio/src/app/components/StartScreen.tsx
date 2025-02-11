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
        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute border-2 border-yellow-400 rounded-full"
              style={{
                width: `${(i + 1) * 100}px`,
                height: `${(i + 1) * 100}px`,
                left: `${Math.sin(i) * 200 + 50}%`,
                top: `${Math.cos(i) * 200 + 50}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center h-full">
        {/* Title Logo */}
        <div className="title-container mb-8">
          <Image
            src=""
            alt=""
            width={400}
            height={150}
            priority
          />
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