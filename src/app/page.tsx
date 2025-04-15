'use client';

import { useRouter } from 'next/navigation';
import { Desktop } from './components/os/Desktop';
import AuthScreen from './components/AuthScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedDesktop = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const handleClose = () => {
    router.push('/start');
  };
  
  const handleAuthenticated = () => {

  };
  
  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }
  
  return <Desktop onClose={handleClose} />;
};

export default function HomePage() {
  return (
    <AuthProvider>
      <ProtectedDesktop />
    </AuthProvider>
  );
}
