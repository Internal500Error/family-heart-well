
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Pill, 
  Activity, 
  BookOpen, 
  Shield,
  Footprints,
  Scale,
  Users
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/medicine', icon: Pill, label: 'Medicine' },
  { path: '/steps', icon: Footprints, label: 'Steps' },
  { path: '/bmi', icon: Scale, label: 'BMI' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/health', icon: Activity, label: 'Health' },
  { path: '/gyaan', icon: BookOpen, label: 'Wellness' },
  { path: '/sos', icon: Shield, label: 'Emergency' },
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
      <div className="container mx-auto px-4 py-3 max-w-md">
        <div className="flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            
            return (
              <NavLink
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 min-w-[60px] group ${
                  isActive 
                    ? 'text-primary bg-primary/10 scale-110 shadow-premium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-105'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  isActive ? 'bg-gradient-primary shadow-lg' : 'group-hover:bg-accent/30'
                }`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white animate-float' : ''}`} />
                </div>
                <span className={`text-xs font-medium mt-1 transition-all duration-300 ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
