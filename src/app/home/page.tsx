"use client";

import React, { Suspense } from 'react';
import Room from '../components/Room';

function RoomComponent() {
  return <Room />;
}

export default function Home() {
  return (
    <div className="w-full h-screen bg-black">
      <Suspense fallback={<div className="w-full h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
        <RoomComponent />
      </Suspense>
    </div>
  );
}