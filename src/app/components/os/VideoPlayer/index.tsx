'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { File } from '@/app/types/fileSystem';

interface VideoPlayerProps {
  fileId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ fileId }) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  
  const fileSystem = useFileSystemStore();
  
  useEffect(() => {
    const file = fileSystem.items[fileId] as File;
    
    if (file && file.type === 'file') {
      const path = file.content;
      
      if (typeof path === 'string' && path.startsWith('/videos/')) {
        setVideoUrl(path);
        setLoading(false);
      } else {
        setError("Invalid video file path");
        setLoading(false);
      }
    } else {
      setError("File not found in the file system");
      setLoading(false);
    }
  }, [fileId, fileSystem.items]);

  useEffect(() => {
    // Auto-hide controls after inactivity
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (isPlaying) {
        timeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Update current time while playing
  useEffect(() => {
    const interval = isPlaying ? 
      setInterval(() => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
        }
      }, 1000) : null;
      
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stop event propagation
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stop event propagation
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Prevent mousedown on sliders from triggering parent drag behavior
  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.volume = volume;
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setShowControls(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <div className="mt-2 text-gray-400">Loading video...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center text-red-500">
          <div>Error loading video:</div>
          <div className="mt-1">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoUrl}
          className="max-w-full max-h-full"
          onClick={handlePlayPause}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnd}
        />
      </div>
      
      {/* Video Controls */}
      <div 
        ref={controlsRef}
        className={`absolute bottom-0 left-0 right-0 bg-black/70 p-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()} // Stop click propagation
      >
        <div className="flex items-center justify-between space-x-4">
          <button 
            onClick={handlePlayPause}
            className="text-white px-2 py-1 rounded"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <div className="text-white text-xs mx-2">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <div className="flex-grow">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleTimeChange}
              onMouseDown={handleSliderMouseDown}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              onMouseDown={handleSliderMouseDown}
              className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;