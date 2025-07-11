
import React from 'react';
import { 
  Heart, 
  Pill, 
  Activity, 
  BookOpen, 
  AlertTriangle,
  Bot,
  Stethoscope,
  User,
  Sun,
  Moon,
  Sunrise,
  MessageCircleHeart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NavLink } from 'react-router-dom';

const Index = () => {
  const currentHour = new Date().getHours();
  const userName = "Papa"; // This would come from user profile
  
  const getGreetingIcon = () => {
    if (currentHour < 12) return <Sunrise className="h-6 w-6 text-amber-500" />;
    if (currentHour < 17) return <Sun className="h-6 w-6 text-yellow-500" />;
    return <Moon className="h-6 w-6 text-blue-500" />;
  };

  const getGreeting = () => {
    if (currentHour < 12) return `Good Morning, ${userName}!`;
    if (currentHour < 17) return `Good Afternoon, ${userName}!`;
    return `Good Evening, ${userName}!`;
  };

  const quickActions = [
    {
      path: '/medicine',
      icon: Pill,
      label: 'Medicine',
      description: 'Reminders & Tracker',
      color: 'bg-medicine text-white',
      badge: '2 due'
    },
    {
      path: '/health',
      icon: Activity,
      label: 'Health',
      description: 'Track Vitals',
      color: 'bg-health-good text-white',
      badge: null
    },
    {
      path: '/sos',
      icon: AlertTriangle,
      label: 'SOS',
      description: 'Emergency Help',
      color: 'bg-health-danger text-white',
      badge: null
    },
    {
      path: '/gyaan',
      icon: BookOpen,
      label: 'Gyaan',
      description: 'Health Tips',
      color: 'bg-calm text-white',
      badge: 'New tip'
    }
  ];

  const todaysTip = "नमस्ते! Today's tip: Start your morning with warm water and lemon. It helps with digestion and keeps you hydrated! 🍋";
  const dailyQuote = "Every day is a new beginning. Take a deep breath, smile, and start again. Your children love you! 💕";

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Greeting Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/20 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-3">
            {getGreetingIcon()}
            <h1 className="text-2xl font-poppins font-semibold text-foreground">
              {getGreeting()}
            </h1>
          </div>
          <p className="text-muted-foreground">
            How are you feeling today? Remember to take care of yourself! 
          </p>
          <div className="flex items-center mt-4 space-x-2">
            <Heart className="h-4 w-4 text-primary animate-heart-beat" />
            <span className="text-sm text-primary font-medium">Sending love your way</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-poppins font-semibold mb-4 text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map(({ path, icon: Icon, label, description, color, badge }) => (
            <NavLink key={path} to={path}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className={`${color} rounded-2xl p-3 mb-3 w-fit relative`}>
                    <Icon className="h-6 w-6" />
                    {badge && (
                      <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                        {badge}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{label}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Today's Health Tip */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-health-good/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-health-good/20 rounded-full p-2">
              <BookOpen className="h-5 w-5 text-health-good" />
            </div>
            <div>
              <h3 className="font-semibold text-health-good mb-2">Today's Health Tip</h3>
              <p className="text-sm text-foreground leading-relaxed">{todaysTip}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Quote */}
      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-primary/20 rounded-full p-2">
              <MessageCircleHeart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Daily Love Note</h3>
              <p className="text-sm text-foreground leading-relaxed italic">{dailyQuote}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 text-xs border-primary/30 hover:bg-primary/10"
              >
                Share with family ❤️
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* More Options */}
      <div className="grid grid-cols-3 gap-3">
        <NavLink to="/ai">
          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-3 text-center">
              <Bot className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-medium">AI Assistant</p>
            </CardContent>
          </Card>
        </NavLink>
        
        <NavLink to="/doctor">
          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-3 text-center">
              <Stethoscope className="h-6 w-6 mx-auto mb-2 text-medicine" />
              <p className="text-xs font-medium">Doctor</p>
            </CardContent>
          </Card>
        </NavLink>
        
        <NavLink to="/profile">
          <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-3 text-center">
              <User className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs font-medium">Profile</p>
            </CardContent>
          </Card>
        </NavLink>
      </div>
    </div>
  );
};

export default Index;
