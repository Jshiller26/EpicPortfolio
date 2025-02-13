// src/app/home/page.tsx
"use client";

import React from 'react';
import Room from '../components/Room';
import Player from '../components/Player';

export default function Home() {
  return (
    <div className="w-full h-screen bg-black">
      <Room />
      <Player />
    </div>
  );
}