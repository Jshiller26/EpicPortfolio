import React, { useState, useEffect } from 'react';
import { Desktop } from './Desktop';
import LoadingScreen from '../LoadingScreen';

interface PreloadedDesktopProps {
  onClose: () => void;
  onLogout?: () => void;
}

const PreloadedDesktop: React.FC<PreloadedDesktopProps> = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDesktopReady, setIsDesktopReady] = useState(false);
  
  // Preload the desktop component and necessary assets
  useEffect(() => {
    const preloadAssets = () => {
      const assets = [
        '/images/desktop/desktopWallpaper.jpg',
        '/images/desktop/icons/logo.png',
        '/images/desktop/icons/search.png',
        '/images/desktop/icons/fileExplorer.png',
        '/images/desktop/icons/edge.png',
        '/images/desktop/icons/settings.png',
        '/images/desktop/defaultUser.png'
      ];
      
      return Promise.all(
        assets.map(src => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          });
        })
      );
    };
    
    preloadAssets().then(() => {
      setIsDesktopReady(true);
      
      setTimeout(() => {
        setIsLoading(false);
      }, 50);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0">
        {/* This is a placeholder and should never be visible */}
        <div className="invisible">
          <LoadingScreen onComplete={() => {}} duration={0} />
        </div>
        
        {/* Preload Desktop in background */}
        {isDesktopReady && (
          <div className="hidden">
            <Desktop {...props} />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 animate-desktop-appear">
      <Desktop {...props} />
    </div>
  );
};

export default PreloadedDesktop;