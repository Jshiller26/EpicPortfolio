'use client';

import React, { useState } from 'react';
import LockScreen from './LockScreen';
import LoginScreen from './LoginScreen';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [showLogin, setShowLogin] = useState(false);
  
  const handleUnlock = () => {
    setShowLogin(true);
  };
  
  return (
    <>
      {!showLogin ? (
        <LockScreen onUnlock={handleUnlock} />
      ) : (
        <LoginScreen 
          onLogin={onAuthenticated} 
          backgroundImage="/images/desktop/mountainWallpaperBlurred.jpg" 
        />
      )}
    </>
  );
};

export default AuthScreen;