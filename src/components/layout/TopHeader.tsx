
import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TopHeader: React.FC = () => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 max-w-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div>
              <h1 className="text-lg font-poppins font-semibold text-primary">
                DilCare
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                {greeting}!
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="p-2 relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-white"></div>
          </Button>
        </div>
      </div>
    </header>
  );
};
