import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full p-2 transition-colors duration-200"
      aria-label="Shut down PC"
    >
      <ArrowRight className="w-6 h-6 text-white" />
    </button>
  );
};