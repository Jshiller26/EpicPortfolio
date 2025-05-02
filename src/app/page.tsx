'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import PreloadedDesktop from './components/os/PreloadedDesktop';
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextComponent, setNextComponent] = useState<DesktopState | null>(null);

  const handleDirectStateChange = (newState: DesktopState) => {
    setStateKey(prev => prev + 1);
    setCurrentState(newState);
  };

  useEffect(() => {
    if (isFirstLoad && isAuthenticated) {
      setCurrentState('DESKTOP');
      setIsFirstLoad(false);
    } 
    else if (isAuthenticated && currentState === 'AUTH_SCREEN' && !isFirstLoad) {
      handleDirectStateChange('LOADING');
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

  const handleLoadingToDesktopTransition = () => {
    setIsTransitioning(true);
    setNextComponent('DESKTOP');
    
    setTimeout(() => {
      setStateKey(prev => prev + 1);
      setCurrentState('DESKTOP');
      
      setTimeout(() => {
        setIsTransitioning(false);
        setNextComponent(null);
      }, 50);
    }, 200); // Match this with the CSS transition duration
  };

  const handleClose = () => {
    router.push('/start');
  };

  const handleLoadingComplete = () => {
    handleLoadingToDesktopTransition();
  };

  const handleLogout = () => {
    isLogoutInProgress.current = true;
    
    handleDirectStateChange('AUTH_SCREEN');
    
    setTimeout(() => {
      isLogoutInProgress.current = false;
    }, 100);
  };

  const shouldApplyTransition = isTransitioning && nextComponent === 'DESKTOP';

  const renderCurrentComponent = () => {
    switch (currentState) {
      case 'AUTH_SCREEN':
        return <AuthScreen key={`auth-${stateKey}`} onAuthenticated={() => {}} />;
      
      case 'LOADING':
        return <LoadingScreen key={`loading-${stateKey}`} onComplete={handleLoadingComplete} duration={2000} />;
      
      case 'DESKTOP':
        return <PreloadedDesktop key={`desktop-${stateKey}`} onClose={handleClose} onLogout={handleLogout} />;
      
      default:
        return <AuthScreen key={`auth-default-${stateKey}`} onAuthenticated={() => {}} />;
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className={`absolute inset-0 ${shouldApplyTransition ? 'transition-opacity duration-300 ease-in-out opacity-0' : 'opacity-100'}`}>
        {renderCurrentComponent()}
      </div>
      
      {nextComponent === 'DESKTOP' && (
        <div className="absolute inset-0 opacity-0">
          <PreloadedDesktop key={`next-desktop-${stateKey + 1}`} onClose={handleClose} onLogout={handleLogout} />
        </div>
      )}
    </div>
  );
};

export default function HomePage() {
  return (
    <AuthProvider>
      <ProtectedDesktop />
    </AuthProvider>
  );
}