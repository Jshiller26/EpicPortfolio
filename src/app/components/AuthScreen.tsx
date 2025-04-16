'use client';

import React, { useState, useEffect } from 'react';
import LockScreen from './LockScreen';
import LoginScreen from './LoginScreen';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lockWallpaper = "/images/desktop/mountainWallpaper3.jpg";
  const loginWallpaper = "/images/desktop/mountainWallpaperBlurred.jpg";
  
  useEffect(() => {
    const img = new Image();
    img.src = loginWallpaper;
  }, []);
  
  const handleUnlock = () => {
    setIsTransitioning(true);

    setTimeout(() => {
      setShowLogin(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 30);
    }, 200);
  };
  
  return (
    <div className="fixed inset-0">
      {/* Background container that stays throughout transition */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('${showLogin ? loginWallpaper : lockWallpaper}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.3s ease-in-out'
        }}
      />
      
      {/* Content container with fade transition */}
      <div className="fixed inset-0 z-10">
        {!showLogin ? (
          <div className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <LockScreen onUnlock={handleUnlock} transparentBg={true} />
          </div>
        ) : (
          <div className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <LoginScreen 
              onLogin={onAuthenticated} 
              noBackground={true} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;