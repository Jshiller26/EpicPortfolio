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
        <div className="title-container mb-2 flex justify-center">
          <Image
            src="/images/pokemonNameCurve5.png"
            alt="Joe Shiller"
            width={1730}
            height={578}
            quality={100}
            priority
            className="transform -translate-y-20 max-w-[600px] w-auto h-auto [image-rendering:crisp-edges]"
          />
        </div>

        {/* Subtitle text */}
        <div className="flex flex-col items-center -mt-28">
          <svg width="500" height="80" className="-mb-8">
            <defs>
              <path
                id="software-curve"
                d="M 50,70 Q 250,30 450,70"
                fill="none"
              />
            </defs>
            <text className="text-6xl font-bold" style={{
              fontFamily: 'BengalPixel, sans-serif',
              fill: 'white',
              stroke: 'black',
              strokeWidth: '8px',
              paintOrder: 'stroke fill',
              letterSpacing: '0.1em'
            }}>
              <textPath href="#software-curve" startOffset="50%" textAnchor="middle">
                SOFTWARE
              </textPath>
            </text>
          </svg>
          
          <svg width="500" height="80">
            <defs>
              <path
                id="developer-curve"
                d="M 50,70 Q 250,30 450,70"
                fill="none"
              />
            </defs>
            <text className="text-5xl font-bold" style={{
              fontFamily: 'BengalPixel, sans-serif',
              fill: 'white',
              stroke: 'black',
              strokeWidth: '8px',
              paintOrder: 'stroke fill',
              letterSpacing: '0.1em'

            }}>
              <textPath href="#developer-curve" startOffset="50%" textAnchor="middle">
                DEVELOPER
              </textPath>
            </text>
          </svg>
        </div>

        {/* Press Start Text */}
        <div
         
          className={`press-start text-white text-3xl tracking-wider transition-opacity duration-200 mt-16 ${
            isBlinking ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            fontFamily: 'Gbboot, sans-serif',
            textShadow: '2px 2px 0px #000'
          }}
        >
          PRESS START
        </div>

        {/* Copyright Text */}
        <div className="absolute bottom-8 w-full text-center">
          <p 
            className="text-3xl text-white/90"
            style={{ 
              fontFamily: 'Gbboot, sans-serif',
              textShadow: '1px 1px 0px #000'
            }}
          >
            © 2025 Epic Personal Site inc.
          </p>
        </div>
      </div>
    </div>
  );
}