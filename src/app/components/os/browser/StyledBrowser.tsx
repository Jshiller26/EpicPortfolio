'use client';

import React from 'react';

interface StyledBrowserProps {
  children: React.ReactNode;
  hasSrcDoc: boolean;
}

export const StyledBrowser: React.FC<StyledBrowserProps> = ({ children, hasSrcDoc }) => {
  return (
    <div className="flex flex-col h-full">
      <div className={`flex flex-col h-full ${hasSrcDoc ? 'bg-white' : ''}`}>
        {children}
      </div>
    </div>
  );
};