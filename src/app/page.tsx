'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isAuthenticated) {
      if (currentState === 'AUTH_SCREEN') {
        setStateKey(prev => prev + 1);
        setCurrentState('LOADING');
      }
    } else {
      setCurrentState('AUTH_SCREEN');
    }
  }, [isAuthenticated, currentState]);

  const handleClose = () => {
    router.push('/start');
  };

  const handleLoadingComplete = () => {
    setCurrentState('DESKTOP');
  };

  const handleLogout = () => {
    // Force re-render of Auth screen on logout
    setStateKey(prev => prev + 1);
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
