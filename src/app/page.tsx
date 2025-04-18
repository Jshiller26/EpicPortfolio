'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Desktop } from './components/os/Desktop';
import AuthScreen from './components/AuthScreen';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type DesktopState = 'AUTH_SCREEN' | 'LOADING' | 'DESKTOP';

const ProtectedDesktop = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [currentState, setCurrentState] = useState<DesktopState>('AUTH_SCREEN');
  const [stateKey, setStateKey] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const isLogoutInProgress = useRef(false);

  useEffect(() => {
    if (isFirstLoad && isAuthenticated) {
      setCurrentState('DESKTOP');
      setIsFirstLoad(false);
    } 
    else if (isAuthenticated && currentState === 'AUTH_SCREEN' && !isFirstLoad) {
      setStateKey(prev => prev + 1);
      setCurrentState('LOADING');
    } 
    else if (!isAuthenticated && !isLogoutInProgress.current) {
      setCurrentState('AUTH_SCREEN');
    }
  }, [isAuthenticated, currentState, isFirstLoad]);

  useEffect(() => {
    if (isFirstLoad && !isAuthenticated) {
      setIsFirstLoad(false);
    }
  }, []);

  const handleClose = () => {
    router.push('/start');
  };

  const handleLoadingComplete = () => {
    setCurrentState('DESKTOP');
  };

  const handleLogout = () => {
    isLogoutInProgress.current = true;
    
    // Force re-render of Auth screen on logout
    setStateKey(prev => prev + 1);
    setCurrentState('AUTH_SCREEN');
    setTimeout(() => {
      isLogoutInProgress.current = false;
    }, 100);
  };

  switch (currentState) {
    case 'AUTH_SCREEN':
      return <AuthScreen key={`auth-${stateKey}`} onAuthenticated={() => {}} />;
    
    case 'LOADING':
      return <LoadingScreen key={`loading-${stateKey}`} onComplete={handleLoadingComplete} duration={2000} />;
    
    case 'DESKTOP':
      return <Desktop key={`desktop-${stateKey}`} onClose={handleClose} onLogout={handleLogout} />;
    
    default:
      return <AuthScreen key={`auth-default-${stateKey}`} onAuthenticated={() => {}} />;
  }
};

export default function HomePage() {
  return (
    <AuthProvider>
      <ProtectedDesktop />
    </AuthProvider>
  );
}
