"use client";

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
      />

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center h-full">
        {/* Title Logo */}
        <div className="title-container mb-4 flex justify-center">
          <Image
            src="/images/pokemonNameCurve3.png"
            alt="Joe Shiller"
            width={600}
            height={200}
            priority
            className="transform -translate-y-20" 
          />
        </div>

        {/* Subtitle text */}
        <div className="flex flex-col items-center -mt-8 mb-16">
          <svg width="500" height="120" className="-mb-8">
            <defs>
              <path
                id="software-curve"
                d="M 50,80 Q 250,20 450,80"
                fill="none"
              />
            </defs>
            <text className="text-5xl" style={{
              fontFamily: 'BengalPixel, sans-serif',
              fill: 'white',
              textShadow: '2px 2px 0px #000'
            }}>
              <textPath href="#software-curve" startOffset="50%" textAnchor="middle">
                SOFTWARE
              </textPath>
            </text>
          </svg>
          
          <svg width="500" height="120">
            <defs>
              <path
                id="developer-curve"
                d="M 50,80 Q 250,20 450,80"
                fill="none"
              />
            </defs>
            <text className="text-5xl" style={{
              fontFamily: 'BengalPixel, sans-serif',
              fill: 'white',
              textShadow: '2px 2px 0px #000'
            }}>
              <textPath href="#developer-curve" startOffset="50%" textAnchor="middle">
                DEVELOPER
              </textPath>
            </text>
          </svg>
        </div>

        {/* Press Start Text */}
        <div 
          className={`press-start text-white text-3xl tracking-wider transition-opacity duration-200 ${
            isBlinking ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            fontFamily: 'BengalPixel, sans-serif',
            textShadow: '2px 2px 0px #000'
          }}
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