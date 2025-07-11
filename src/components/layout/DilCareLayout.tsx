
import React from 'react';
import { BottomNavigation } from './BottomNavigation';
import { TopHeader } from './TopHeader';

interface DilCareLayoutProps {
  children: React.ReactNode;
}

export const DilCareLayout: React.FC<DilCareLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopHeader />
      
      {/* Main content area with padding for fixed header and bottom nav */}
      <main className="flex-1 pt-16 pb-20 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-md">
          {children}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};
