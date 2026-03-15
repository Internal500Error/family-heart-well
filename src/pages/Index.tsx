
import React from 'react';
import {
  Heart,
  Pill,
  Activity,
  BookOpen,
  Shield,
  Bot,
  Stethoscope,
  User,
  Sun,
  Moon,
  Sunrise,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Footprints,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NavLink } from 'react-router-dom';

const Index = () => {
  const currentHour = new Date().getHours();
  const userName = "Dr. Sharma"; // More professional

  const getGreetingIcon = () => {
    if (currentHour < 12) return <Sunrise className="h-6 w-6 text-amber-500" />;
    if (currentHour < 17) return <Sun className="h-6 w-6 text-orange-500" />;
    return <Moon className="h-6 w-6 text-blue-500" />;
  };

  const getGreeting = () => {
    if (currentHour < 12) return `Good Morning, ${userName}`;
    if (currentHour < 17) return `Good Afternoon, ${userName}`;
    return `Good Evening, ${userName}`;
  };

  const quickActions = [
    {
      path: '/medicine',
      icon: Pill,
      label: 'Medications',
      description: 'Smart Reminders',
      gradient: 'from-blue-500 to-blue-600',
      badge: '2 due',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      path: '/steps',
      icon: Footprints,
      label: 'Step Tracker',
      description: 'Track Steps',
      gradient: 'from-orange-500 to-orange-600',
      badge: '8,432',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      path: '/bmi',
      icon: Scale,
      label: 'BMI Calculator',
      description: 'Check BMI',
      gradient: 'from-purple-500 to-purple-600',
      badge: null,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      path: '/health',
      icon: Activity,
      label: 'Health Metrics',
      description: 'Track Progress',
      gradient: 'from-emerald-500 to-emerald-600',
      badge: null,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      path: '/sos',
      icon: Shield,
      label: 'Emergency',
      description: 'Instant Help',
      gradient: 'from-red-500 to-red-600',
      badge: null,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      path: '/gyaan',
      icon: BookOpen,
      label: 'Wellness',
      description: 'Expert Tips',
      gradient: 'from-purple-500 to-purple-600',
      badge: '3 new',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  const notifications = [
    {
      id: '1',
      tag: 'Medicine Reminder',
      time: '08:30 AM',
      title: 'Time for Telma 40!',
      message: 'Please take your blood pressure medication after breakfast.',
      icon: Pill,
      variant: 'blue', // Uses blue theme
    },
    {
      id: '2',
      tag: 'Lab Report',
      time: 'Just Now',
      title: 'Annual Checkup Results Arrived',
      message: 'Your lipid profile report is now available for review.',
      icon: Activity,
      variant: 'emerald',
      actionLabel: 'View Report',
    },
    {
      id: '3',
      tag: 'Family Update',
      time: '2h ago',
      title: 'Message for Papa',
      message: 'Don\'t forget to check sugar levels today before lunch."',
      icon: User,
      variant: 'purple',
      isItalic: true,
    }
  ];

  const healthStats = [
    { label: 'Steps Today', value: '8,432', trend: '+12%', icon: Footprints, color: 'text-orange-600' },
    { label: 'BMI', value: '22.5', trend: 'Normal', icon: Scale, color: 'text-purple-600' },
    { label: 'Heart Rate', value: '78 BPM', trend: 'Normal', icon: Heart, color: 'text-blue-600' },
  ];

  const ActionCard = ({ item }) => {
    // Mapping variants to Tailwind classes
    const styles = {
      blue: { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-700', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
      emerald: { border: 'border-l-emerald-500', badge: 'bg-emerald-100 text-emerald-700', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
      purple: { border: 'border-l-purple-500', badge: 'bg-purple-100 text-purple-700', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    }[item.variant] || { border: 'border-l-gray-500', badge: 'bg-gray-100 text-gray-700', iconBg: 'bg-gray-50', iconColor: 'text-gray-600' };

    return (
      <Card className={`glass border-0 shadow-sm border-l-4 ${styles.border} overflow-hidden transition-transform active:scale-[0.98]`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className={`${styles.badge} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
              {item.tag}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">{item.time}</span>
          </div>
          <div className="flex gap-3">
            <div className={`${styles.iconBg} p-2 rounded-lg h-fit`}>
              <item.icon className={`h-5 w-5 ${styles.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className={`text-xs text-muted-foreground mt-1 ${item.isItalic ? 'italic' : ''}`}>
                {item.message}
              </p>
              {item.actionLabel && (
                <Button size="sm" variant="outline" className={`mt-3 h-7 text-xs border-${item.variant}-200 text-${item.variant}-700 hover:bg-${item.variant}-50`}>
                  {item.actionLabel}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Premium Greeting Section */}
        <Card className="glass border-0 shadow-premium interactive-card overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
          <CardContent className="p-8 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                {getGreetingIcon()}
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    {getGreeting()}
                  </h1>
                  <p className="text-muted-foreground font-medium">
                    Your health companion is ready
                  </p>
                </div>
              </div>
              <div className="animate-float">
                <Sparkles className="h-8 w-8 text-primary/60" />
              </div>
            </div>

            {/* Quick health overview */}
            <div className="grid grid-cols-3 gap-2">
              {healthStats.map((stat, index) => (

                <div key={index} className="bg-white/50 rounded-xl p-2 backdrop-blur-sm">

                  <div className="flex items-center space-x-2 mb-2">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">{stat.value}</div>
                  <p className={`text-xs ${stat.color} font-medium`}>{stat.trend}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Action Feed Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-display font-bold text-foreground">Important Updates</h2>
            <Button variant="ghost" size="sm" className="text-xs text-primary">Clear All</Button>
          </div>

          <div className="space-y-3">
            {notifications.map((item) => (
              <ActionCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Premium Secondary Actions */}
        <div className="grid grid-cols-3 gap-3">
          <NavLink to="/ai">
            <Card className="glass border-0 shadow-premium interactive hover:shadow-premium-lg transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="bg-primary/10 rounded-xl p-3 mx-auto mb-3 w-fit">
                  <Bot className="h-6 w-6 text-primary mx-auto" />
                </div>
                <p className="text-xs font-medium text-foreground">AI Assistant</p>
              </CardContent>
            </Card>
          </NavLink>

          <NavLink to="/doctor">
            <Card className="glass border-0 shadow-premium interactive hover:shadow-premium-lg transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="bg-medicine/10 rounded-xl p-3 mx-auto mb-3 w-fit">
                  <Stethoscope className="h-6 w-6 text-medicine mx-auto" />
                </div>
                <p className="text-xs font-medium text-foreground">Doctors</p>
              </CardContent>
            </Card>
          </NavLink>

          <NavLink to="/profile">
            <Card className="glass border-0 shadow-premium interactive hover:shadow-premium-lg transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="bg-muted/50 rounded-xl p-3 mx-auto mb-3 w-fit">
                  <User className="h-6 w-6 text-muted-foreground mx-auto" />
                </div>
                <p className="text-xs font-medium text-foreground">Profile</p>
              </CardContent>
            </Card>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Index;
