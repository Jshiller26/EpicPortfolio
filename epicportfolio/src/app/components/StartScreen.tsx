"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function StartScreen() {
  const [animationState, setAnimationState] = useState('initial');
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const sequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      setAnimationState('shine');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAnimationState('slideTitle');
      
      await new Promise(resolve => setTimeout(resolve, 200));
      setAnimationState('showDeveloper');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAnimationState('showBackground');
      setIsBlinking(true); 
    };
    sequence();
  }, []);

  useEffect(() => {
    let interval;
    if (animationState === 'showBackground') {
      interval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [animationState]);

  return (
    <div className={`relative h-screen w-full overflow-hidden ${
      animationState !== 'showBackground' && animationState !== 'complete' 
        ? 'bg-black' 
        : ''
    }`}>
      {/* Background pattern*/}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          animationState === 'initial' || animationState === 'shine' || animationState === 'slideTitle' || animationState === 'showDeveloper'
            ? 'opacity-0'
            : 'opacity-100'
        }`}
        style={{
          background: 'linear-gradient(135deg, #1a5c4a 0%, #2d8b6d 100%)',
        }}
      />

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center h-full">
        {/* Title Logo */}
        <div className={`title-container mb-2 flex justify-center relative transition-transform duration-1000 translate-x-1 ${
          animationState === 'initial' || animationState === 'shine' ? 'translate-y-0' :
          animationState === 'slideTitle' || animationState === 'showDeveloper' || animationState === 'showBackground' || animationState === 'complete'
            ? '-translate-y-20'
            : ''
        }`}>
          <div className="relative">
            <div className={`relative ${animationState === 'shine' || animationState === 'initial' ? 'overflow-hidden bg-black' : ''}`}>
              <Image
                src="/images/pokemonNameCurve5.png"
                alt="Joe Shiller"
                width={1730}
                height={578}
                quality={100}
                priority
                className="max-w-[600px] w-auto h-auto [image-rendering:crisp-edges] relative"
              />
              {/* Shine Overlay */}
              {animationState === 'shine' && (
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute inset-0 animate-shine"
                    style={{
                      background: 'linear-gradient(75deg, transparent, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.8) 45%, rgba(255, 255, 255, 0.8) 55%, rgba(255, 255, 255, 0) 80%, transparent)',
                      width: '25%',
                      mixBlendMode: 'color-dodge'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div 
          className={`flex flex-col items-center -mt-28 transition-all ${
            animationState === 'initial' || animationState === 'shine' || animationState === 'slideTitle'
              ? 'opacity-0 -translate-y-24'
              : 'opacity-100 translate-y-0'  
          }`}
          style={{ 
            transitionDuration: '2500ms'
          }}
        >
          {/* Software Developer subtitle*/}
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

        <div
          className={`text-white text-3xl tracking-wider transition-opacity duration-200 mt-16 ${
            animationState === 'showBackground' ? 
              (isBlinking ? 'opacity-100' : 'opacity-0') : 
              'opacity-0'
          }`}
          style={{ 
            fontFamily: 'Gbboot, sans-serif',
            textShadow: '2px 2px 0px #000'
          }}
        >
          PRESS START
        </div>

        {/* Copyright Text */}
        <div className={`absolute bottom-8 w-full text-center transition-opacity duration-500 ${
          animationState === 'showBackground' || animationState === 'complete' ? 'opacity-100' : 'opacity-0'
        }`}>
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