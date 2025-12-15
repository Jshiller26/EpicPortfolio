"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/');
  }, [router]);
  
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <p className="text-white text-xl">Redirecting...</p>
    </div>
  );
}