
import React from 'react';
import { BottomNavigation } from './BottomNavigation';
import { TopHeader } from './TopHeader';

interface DilCareLayoutProps {
  children: React.ReactNode;
}

export const DilCareLayout: React.FC<DilCareLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30 flex flex-col">
      <TopHeader />
      
      {/* Main content area with premium spacing */}
      <main className="flex-1 pt-20 pb-24 overflow-y-auto">
        <div className="container mx-auto px-6 py-8 max-w-md animate-fade-in">
          {children}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};
