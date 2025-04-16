'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
  onLogin: () => void;
  backgroundImage: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLogin,
  backgroundImage
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const success = login(password);
      
      if (success) {
        onLogin();
      } else {
        setError(true);
        setPassword('');
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };
  
  const defaultBgStyle = {
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
      <div className="w-full max-w-md p-4">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-white w-24 h-24 flex items-center justify-center mb-4 overflow-hidden">
            <Image 
              src="/images/desktop/defaultUser.png"
              alt="Default User"
              width={80}
              height={80}
            />
          </div>
          
          <h2 className="text-2xl font-light text-white mb-2">Joe Shiller</h2>
          
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            <div className="relative w-full max-w-xs mb-4">
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={handleKeyPress}
                placeholder="PIN"
                className={`w-full py-2 px-4 bg-black bg-opacity-50 text-white border ${error ? 'border-red-500' : 'border-gray-400'} rounded`}
                disabled={loading}
              />
              {error && (
                <p className="absolute text-red-500 text-sm mt-1">
                  The PIN is incorrect. Try again.
                </p>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <button 
                type="button"
                className="text-white hover:text-gray-200 text-sm mb-2 focus:outline-none"
                onClick={() => alert("PIN recovery functionality not implemented")}
                style={{ color: 'white' }}
              >
                I forgot my PIN
              </button>
              
              <button 
                type="button" 
                className="text-white hover:text-gray-200 text-sm focus:outline-none"
                style={{ color: 'white' }}
              >
                Sign-in options
              </button>
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