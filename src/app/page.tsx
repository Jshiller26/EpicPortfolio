'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Desktop } from './components/os/Desktop';
import AuthScreen from './components/AuthScreen';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedDesktop = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && !showLoading && !loadingComplete) {
      setShowLoading(true);
    }
  }, [isAuthenticated, showLoading, loadingComplete]);
  
  const handleClose = () => {
    router.push('/start');
  };
  
  const handleAuthenticated = () => {

  };
  
  const handleLoadingComplete = () => {
    setLoadingComplete(true);
    setShowLoading(false);
  };
  
  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }
  
  // Show loading screen after authentication
  if (showLoading && !loadingComplete) {
    return <LoadingScreen onComplete={handleLoadingComplete} duration={2000} />;
  }
  
  // Show desktop after loading
  return <Desktop onClose={handleClose} />;
};

export default function HomePage() {
  return (
    <AuthProvider>
      <ProtectedDesktop />
    </AuthProvider>
  );
}
