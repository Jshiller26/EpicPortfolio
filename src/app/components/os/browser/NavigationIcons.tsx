'use client';

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  X, 
  Globe 
} from 'lucide-react';

interface ArrowProps {
  direction: 'left' | 'right';
}

export const Arrow: React.FC<ArrowProps> = ({ direction }) => {
  return direction === 'left' ? 
    <ChevronLeft className="w-4 h-4" /> : 
    <ChevronRight className="w-4 h-4" />;
};

export const Refresh: React.FC = () => (
  <RotateCw className="w-4 h-4" />
);

export const Stop: React.FC = () => (
  <X className="w-4 h-4" />
);

export const Network: React.FC = () => (
  <Globe className="w-4 h-4" />
);