'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
  onLogin: () => void;
  backgroundImage?: string;
  noBackground?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLogin,
  backgroundImage = '/images/desktop/mountainWallpaperBlurred.jpg',
  noBackground = false
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHelpMessage, setShowHelpMessage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await login(password);
      
      if (success) {
        onLogin();
      } else {
        setError(true);
        setPassword('');
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleHelpClick = () => {
    setShowHelpMessage(true);
  };
  
  const defaultBgStyle = noBackground ? {} : {
    backgroundColor: '#0078D7',
    backgroundImage: `url('${backgroundImage}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={defaultBgStyle}
    >
      {/* Moved the content up by adding negative margin-top */}
      <div className="w-full max-w-md p-4 -mt-20">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-white w-42 h-42 flex items-center justify-center mb-5 overflow-hidden">
            <Image 
              src="/images/desktop/defaultUser.png"
              alt="Default User"
              width={150}
              height={150}
            />
          </div>
          
          <h2 className="text-2xl font-light text-white mb-4">Joe Shiller</h2>
          
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            <div className="relative w-full max-w-xs mb-6">
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyDown}
                placeholder="Password"
                className={`w-full py-2 px-4 bg-black bg-opacity-50 text-white border ${error ? 'border-red-500' : 'border-gray-400'} rounded`}
                disabled={loading}
              />
              {error && (
                <p className="absolute text-red-500 text-sm mt-1">
                  The password is incorrect. Try again.
                </p>
              )}
            </div>
            
            {/* Fixed height container to prevent layout shift */}
            <div className="flex flex-col items-center min-h-[80px] flex-shrink-0 w-full justify-center">
              {!showHelpMessage ? (
                <>
                  <button 
                    type="button"
                    className="text-white text-sm mb-4 focus:outline-none transition-all duration-150 hover:text-gray-400 hover:underline"
                    onClick={handleHelpClick}
                  >
                    I forgot my password
                  </button>
                  
                  <button 
                    type="button" 
                    className="text-white text-sm focus:outline-none transition-all duration-150 hover:text-gray-400 hover:underline"
                    onClick={handleHelpClick}
                  >
                    Sign-in options
                  </button>
                </>
              ) : (
                <div className="text-white text-sm max-w-xs text-center bg-black bg-opacity-50 p-3 rounded animate-fade-in">
                  Password can be found in &quot;Projects&quot; section of my resume. If you are having trouble accessing the site you can reach me at shiller1205@gmail.com
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2 overflow-hidden">
            <Image 
              src="/images/desktop/defaultUser.png"
              alt="Default User"
              width={30}
              height={30}
            />
          </div>
          <p className="text-white text-sm">Joe Shiller</p>
        </div>
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

export default LoginScreen;