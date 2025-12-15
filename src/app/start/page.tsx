'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StartPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect directly to home page
    router.push('/');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <p className="text-white text-xl">Loading...</p>
    </div>
  );
}