
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Pill, 
  Activity, 
  BookOpen, 
  AlertTriangle,
  Bot,
  Stethoscope,
  User
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/medicine', icon: Pill, label: 'Medicine' },
  { path: '/health', icon: Activity, label: 'Health' },
  { path: '/gyaan', icon: BookOpen, label: 'Gyaan' },
  { path: '/sos', icon: AlertTriangle, label: 'SOS' },
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-2 py-2 max-w-md">
        <div className="flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            
            return (
              <NavLink
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                  isActive 
                    ? 'text-primary bg-primary/10 scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className={`h-5 w-5 mb-1 ${isActive ? 'animate-gentle-bounce' : ''}`} />
                <span className="text-xs font-medium">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
