'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [time, setTime] = useState(new Date());
  const [showTime, setShowTime] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr}`;
  };
  
  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const month = months[date.getMonth()];
    const dayNumber = date.getDate();
    
    return `${dayName}, ${month} ${dayNumber}`;
  };
  
  const handleInteraction = () => {
    setShowTime(false);
    setTimeout(() => {
      onUnlock();
    }, 500);
  };
  
  useEffect(() => {
    const handleKeyDown = () => {
      handleInteraction();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return (
    <div 
      className="fixed inset-0 flex flex-col items-center cursor-pointer"
      style={{
        backgroundImage: "url('/images/desktop/mountainWallpaper3.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      onClick={handleInteraction}
    >
      <div 
        className={`text-white text-center transition-transform duration-500 mt-32 ${showTime ? 'transform-none' : 'transform -translate-y-full'}`}
      >
        <div className="text-9xl font-light">{formatTime(time)}</div>
        <div className="text-3xl mt-4 font-light">{formatDate(time)}</div>
      </div>

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

export default LockScreen;