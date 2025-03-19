'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Desktop } from '../components/os/Desktop';

export default function DesktopPage() {
  const router = useRouter();
  
  const handleClose = () => {
    router.push('/start');
  };
  
  return <Desktop onClose={handleClose} />;
}