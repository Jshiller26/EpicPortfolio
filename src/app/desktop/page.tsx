'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Desktop } from '../components/os/Desktop';
import { AuthProvider } from '../contexts/AuthContext';

export default function DesktopPage() {
  const router = useRouter();
  
  const handleClose = () => {
    router.push('/start');
  };
  
  return (
    <AuthProvider>
      <Desktop onClose={handleClose} />
    </AuthProvider>
  );
}