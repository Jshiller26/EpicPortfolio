'use client';

import { useRouter } from 'next/navigation';
import { Desktop } from '../components/os/Desktop';

export default function DesktopPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/home?from=desktop');
  };

  return <Desktop onClose={handleClose} />;
}