
import React from 'react';
import { Bell, Menu, User, Users, Heart, LocateIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserMode } from '@/hooks/useUserMode';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

export const TopHeader: React.FC = () => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const { mode, setMode } = useUserMode();
  const location = useLocation();
  const navigate = useNavigate();

  const isChildDashboard = location.pathname.includes('/child-dashboard');
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  if (isAuthPage) return null;

  return (
    <header className="topbar fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-6 py-4 max-w-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-display font-bold flex items-center gap-3 text-foreground">
                <img src="/assets/dilcare-heart.png.png" alt="DilCare logo" className="w-8 h-8 object-contain rounded-md" />
                <span className="leading-tight">DilCare</span>
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Tagline
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mode Switcher */}
            <NavLink to={isChildDashboard ? '/' : '/child-dashboard'}>
              <Button
                variant="ghost"
                size="lg"
                className={`p-2 hover:bg-accent/50 ${isChildDashboard ? 'bg-purple-100' : ''}`}
                title={isChildDashboard ? 'Switch to Personal Mode' : 'Switch to Family Mode'}
              >
                {isChildDashboard ? (
                  <Heart className="h-5 w-5 text-pink-500" />
                ) : (
                  <Users className="h-5 w-5 text-purple-500" />
                )}
              </Button>
            </NavLink>

            <Button
              variant="ghost"
              size="sm"
              className="p-2 relative hover:bg-accent/50"
              onClick={() => isChildDashboard && navigate('/child-dashboard/location')}
            >
              {isChildDashboard ? (
                <LocateIcon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <>
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-gradient-primary rounded-full border border-white animate-pulse-soft" />
                </>
              )}
            </Button>

            <NavLink to="/profile">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-accent/50">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
      {/* Brand moved into the heading above the greeting to avoid layout duplication */}
    </header>
  );
};
