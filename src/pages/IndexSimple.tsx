import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button-simple';
import { Card, CardContent } from '@/components/ui/card-simple';
import { NavLink } from 'react-router-dom';

const getTodayWater = () => 5; // out of 8
const getBMI = () => 23.4;
const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600', bgColor: 'bg-blue-50' };
  if (bmi < 25) return { label: 'Normal', color: 'text-green-600', bgColor: 'bg-green-50' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  return { label: 'Obese', color: 'text-red-600', bgColor: 'bg-red-50' };
};

const Index = () => {
  const currentHour = new Date().getHours();
  const userName = "Dr. Sharma";
  const [currentSteps, setCurrentSteps] = useState(7845);
  const [healthScore, setHealthScore] = useState(82);
  const [medicinesDue, setMedicinesDue] = useState(2);
  const [nextMedicine, setNextMedicine] = useState("Atorvastatin at 8:00 PM");

  const getGreetingIcon = () => {
    if (currentHour < 12) return '🌅';
    if (currentHour < 17) return '☀️';
    return '🌙';
  };

  const getGreeting = () => {
    if (currentHour < 12) return `Good Morning, ${userName}`;
    if (currentHour < 17) return `Good Afternoon, ${userName}`;
    return `Good Evening, ${userName}`;
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Every step counts towards better health! 💪",
      "You're doing great with your health journey! 🌟",
      "Stay consistent, small changes make big impacts! 🎯",
      "Your health is your wealth - keep it up! 💎"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const quickActions = [
    {
      path: '/medicine',
      icon: '💊',
      label: 'Medications',
      description: 'Smart Reminders',
      stats: `${medicinesDue} due today`,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      status: medicinesDue > 0 ? 'active' : 'normal'
    },
    {
      path: '/health',
      icon: '❤️',
      label: 'Health Monitor',
      description: 'Track Vitals',
      stats: `Score: ${healthScore}/100`,
      gradient: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      status: healthScore >= 80 ? 'good' : healthScore >= 60 ? 'warning' : 'critical'
    },
    {
      path: '/steps',
      icon: '👟',
      label: 'Step Tracker',
      description: 'Daily Activity',
      stats: `${currentSteps.toLocaleString()} steps`,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      status: currentSteps >= 8000 ? 'good' : 'normal'
    },
    {
      path: '/water',
      icon: '💧',
      label: 'Hydration',
      description: 'Water Intake',
      stats: `${getTodayWater()}/8 glasses`,
      gradient: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      status: getTodayWater() >= 6 ? 'good' : 'warning'
    },
    {
      path: '/bmi',
      icon: '📊',
      label: 'BMI Calculator',
      description: 'Body Metrics',
      stats: `BMI: ${getBMI()}`,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      status: 'normal'
    },
    {
      path: '/gyaan',
      icon: '📚',
      label: 'Health Tips',
      description: 'Learn & Grow',
      stats: '12 new articles',
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      status: 'normal'
    }
  ];

  const todayWater = getTodayWater();
  const bmi = getBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Header */}
      <div className="text-center space-y-6 animate-slide-down">
        <div className="flex items-center justify-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">{getGreetingIcon()}</span>
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-foreground">{getGreeting()}</h1>
            <p className="text-sm text-muted-foreground">Ready to take care of your health?</p>
            <p className="text-xs text-primary font-medium mt-1">{getMotivationalMessage()}</p>
          </div>
        </div>
        
        {/* Health Score Ring */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full p-1">
              <div className="bg-background rounded-full w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">{healthScore}</div>
                  <div className="text-xs text-muted-foreground">Health</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Stats Dashboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Today's Overview</h2>
          <div className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 animate-slide-up">
          {/* Enhanced Steps Card */}
          <Card className="premium-card border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👟</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Daily Steps</h3>
                    <p className="text-2xl font-bold text-green-600">{currentSteps.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Goal: 10,000 steps</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <div className="w-20 h-3 bg-gray-200 rounded-full">
                    <div 
                      className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((currentSteps / 10000) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium text-green-600">
                    {Math.round((currentSteps / 10000) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Medicine Reminder Card */}
          <Card className="premium-card border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center relative">
                    <span className="text-2xl">�</span>
                    {medicinesDue > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {medicinesDue}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Medicines</h3>
                    <p className="text-sm text-blue-600 font-medium">{medicinesDue} due today</p>
                    <p className="text-xs text-muted-foreground">Next: {nextMedicine}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1">
                    View All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Water & BMI Combined Card */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="premium-card border-l-4 border-l-cyan-500">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-xl">💧</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Water</h4>
                    <p className="text-xl font-bold text-cyan-600">{todayWater}/8</p>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-700"
                        style={{ width: `${(todayWater / 8) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="premium-card border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">BMI</h4>
                    <p className="text-xl font-bold text-purple-600">{bmi}</p>
                    <div className={`text-xs px-2 py-1 rounded-full ${bmiCategory.bgColor} ${bmiCategory.color} font-medium`}>
                      {bmiCategory.label}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
          <div className="text-xs text-muted-foreground">Tap to access</div>
        </div>
        <div className="grid grid-cols-2 gap-4 animate-slide-up">
          {quickActions.map((action, index) => (
            <NavLink key={action.path} to={action.path}>
              <Card className={`premium-card hover:scale-105 transition-all duration-300 ${action.bgColor} relative overflow-hidden`}>
                <CardContent className="p-4 text-center relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center relative">
                      <div className="text-3xl">{action.icon}</div>
                      {action.status === 'active' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      {action.status === 'good' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                      )}
                      {action.status === 'warning' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-semibold text-sm ${action.textColor}`}>{action.label}</h3>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                      <p className="text-xs font-medium mt-1 text-foreground">{action.stats}</p>
                    </div>
                  </div>
                </CardContent>
                {/* Subtle gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5`}></div>
              </Card>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Enhanced Emergency Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-foreground">Emergency & Support</h2>
        <div className="space-y-3">
          <NavLink to="/sos">
            <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 rounded-xl shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-center space-x-3 relative z-10">
                <span className="text-xl">🚨</span>
                <span>Emergency SOS</span>
                <span className="text-sm opacity-80">• Tap for help</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 hover:opacity-20 transition-opacity"></div>
            </Button>
          </NavLink>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="py-3 text-sm">
              <span className="mr-2">📞</span>
              Call Doctor
            </Button>
            <Button variant="outline" className="py-3 text-sm">
              <span className="mr-2">💬</span>
              AI Assistant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
