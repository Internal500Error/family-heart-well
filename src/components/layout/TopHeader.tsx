
import React from 'react';
import { Bell, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TopHeader: React.FC = () => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-6 py-4 max-w-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-accent/50">
              <Menu className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold bg-gradient bg-clip-text text-transparent">
                DilCare
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                {greeting}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2 relative hover:bg-accent/50">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {/* Premium notification indicator */}
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-gradient-primary rounded-full border border-white animate-pulse-soft"></div>
            </Button>
            
            <Button variant="ghost" size="sm" className="p-2 hover:bg-accent/50">
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
