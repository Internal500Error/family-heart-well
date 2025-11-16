
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

  const healthStats = [
    { label: 'Steps Today', value: '8,432', trend: '+12%', icon: Footprints, color: 'text-orange-600' },
    { label: 'BMI', value: '22.5', trend: 'Normal', icon: Scale, color: 'text-purple-600' },
    { label: 'Heart Rate', value: '78 BPM', trend: 'Normal', icon: Heart, color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
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
          <div className="grid grid-cols-2 gap-4">
            {healthStats.map((stat, index) => (
              <div key={index} className="bg-white/50 rounded-xl p-4 backdrop-blur-sm">
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

      {/* Premium Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-foreground">
            Quick Actions
          </h2>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map(({ path, icon: Icon, label, description, gradient, badge, bgColor, iconColor }) => (
            <NavLink key={path} to={path}>
              <Card className="glass border-0 shadow-premium interactive-card h-full overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
                <CardContent className="p-6 relative">
                  <div className={`${bgColor} rounded-2xl p-4 mb-4 w-fit relative`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                    {badge && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        {badge}
                      </div>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-1">{label}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Premium Today's Insight */}
      <Card className="glass border-0 shadow-premium">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-lg" />
        <CardContent className="p-6 relative">
          <div className="flex items-start space-x-4">
            <div className="bg-emerald-50 rounded-2xl p-3">
              <BookOpen className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-emerald-700 mb-3">Today's Health Insight</h3>
              <p className="text-sm text-foreground leading-relaxed mb-4">
                Your morning walk routine is showing excellent consistency! Keep maintaining 30 minutes of daily activity for optimal cardiovascular health.
              </p>
              <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg">
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
  );
};

export default Index;
