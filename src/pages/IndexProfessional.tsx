import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button-simple';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-simple';
import { NavLink } from 'react-router-dom';
import { 
  Heart, 
  Pill, 
  Activity, 
  Footprints, 
  Droplets, 
  Calculator, 
  BookOpen, 
  Brain, 
  Zap, 
  Target, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  Check, 
  Sunrise, 
  Sun, 
  Moon,
  Shield,
  Phone
} from 'lucide-react';

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
  const [aiInsights, setAiInsights] = useState([
    { type: 'Health Optimization', recommendation: 'Your step count is excellent! Consider adding 15 min strength training.' },
    { type: 'Hydration Alert', recommendation: 'Increase water intake by 2 glasses to meet daily goals.' }
  ]);

  const getGreetingIcon = () => {
    if (currentHour < 12) return <Sunrise className="w-5 h-5" />;
    if (currentHour < 17) return <Sun className="w-5 h-5" />;
    return <Moon className="w-5 h-5" />;
  };

  const getGreeting = () => {
    if (currentHour < 12) return `Good Morning, ${userName}`;
    if (currentHour < 17) return `Good Afternoon, ${userName}`;
    return `Good Evening, ${userName}`;
  };

  const quickActions = [
    {
      path: '/medicine',
      icon: <Pill className="w-5 h-5" />,
      label: 'Medications',
      description: 'Smart Reminders & AI Insights',
      stats: `${medicinesDue} due today`,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      status: medicinesDue > 0 ? 'active' : 'normal'
    },
    {
      path: '/health',
      icon: <Heart className="w-5 h-5" />,
      label: 'Health Monitor',
      description: 'Track Vitals & Analytics',
      stats: `Score: ${healthScore}/100`,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      status: healthScore >= 80 ? 'good' : healthScore >= 60 ? 'warning' : 'critical'
    },
    {
      path: '/steps',
      icon: <Footprints className="w-5 h-5" />,
      label: 'Step Tracker',
      description: 'Activity & Fitness Goals',
      stats: `${currentSteps.toLocaleString()} steps`,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      status: currentSteps >= 8000 ? 'good' : 'normal'
    },
    {
      path: '/water',
      icon: <Droplets className="w-5 h-5" />,
      label: 'Hydration',
      description: 'Water Intake Tracking',
      stats: `${getTodayWater()}/8 glasses`,
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      status: getTodayWater() >= 6 ? 'good' : 'warning'
    },
    {
      path: '/bmi',
      icon: <Calculator className="w-5 h-5" />,
      label: 'BMI Calculator',
      description: 'Body Metrics & Analysis',
      stats: `BMI: ${getBMI()}`,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      status: 'normal'
    },
    {
      path: '/gyaan',
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Health Tips',
      description: 'Educational Content',
      stats: '12 new articles',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      status: 'normal'
    }
  ];

  const todayWater = getTodayWater();
  const bmi = getBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Professional Header Section */}
        <Card className="premium-card bg-gradient-to-br from-primary/5 to-accent/5 border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center border">
                  {getGreetingIcon()}
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">{getGreeting()}</CardTitle>
                  <p className="text-sm text-muted-foreground">Ready to optimize your health?</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full p-1">
                    <div className="bg-background rounded-full w-full h-full flex items-center justify-center border">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{healthScore}</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* AI Health Insights */}
        <Card className="premium-card border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-blue-500" />
              <span>AI Health Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiInsights.length > 0 ? (
              <div className="space-y-3">
                {aiInsights.slice(0, 2).map((insight, idx) => (
                  <div key={idx} className="text-sm p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="font-medium text-blue-800 mb-1">{insight.type}</p>
                    <p className="text-blue-600">{insight.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                AI is analyzing your health data...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Health Metrics Dashboard */}
        <Card className="premium-card border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Health Metrics</span>
            </CardTitle>
            <div className="text-xs text-muted-foreground flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enhanced Steps Card */}
            <Card className="premium-card border-l-4 border-l-green-500 border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center border border-green-200">
                      <Footprints className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-foreground">Daily Steps</h3>
                        {currentSteps >= 8000 && <Check className="w-4 h-4 text-green-600" />}
                      </div>
                      <p className="text-2xl font-bold text-green-600">{currentSteps.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>Goal: 10,000 steps</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-sm text-muted-foreground flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Progress</span>
                    </div>
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
            <Card className="premium-card border-l-4 border-l-blue-500 border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center relative border border-blue-200">
                      <Pill className="w-5 h-5 text-blue-600" />
                      {medicinesDue > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {medicinesDue}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-foreground">Medications</h3>
                        {medicinesDue > 0 && <AlertCircle className="w-4 h-4 text-red-500" />}
                      </div>
                      <p className="text-sm text-blue-600 font-medium">{medicinesDue} due today</p>
                      <p className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Next: {nextMedicine}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1">
                      View Schedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Water & BMI Combined */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="premium-card border-l-4 border-l-cyan-500 border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center border border-cyan-200">
                        <Droplets className="w-5 h-5 text-cyan-600" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-foreground">Hydration</h4>
                      <p className="text-xl font-bold text-cyan-600">{todayWater}/8</p>
                      <p className="text-xs text-muted-foreground">glasses</p>
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

              <Card className="premium-card border-l-4 border-l-purple-500 border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center border border-purple-200">
                        <Calculator className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-foreground">BMI Status</h4>
                      <p className="text-xl font-bold text-purple-600">{bmi}</p>
                      <div className={`text-xs px-2 py-1 rounded-full ${bmiCategory.bgColor} ${bmiCategory.color} font-medium inline-block border`}>
                        {bmiCategory.label}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Smart Features Section */}
        <Card className="premium-card border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Smart Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <NavLink key={action.path} to={action.path}>
                  <Card className={`premium-card hover:scale-105 transition-all duration-300 ${action.bgColor} relative overflow-hidden border`}>
                    <CardContent className="p-4 text-center relative z-10">
                      <div className="space-y-3">
                        <div className="flex items-center justify-center relative">
                          <div className="p-2 rounded-lg bg-white/80 shadow-sm border">
                            {action.icon}
                          </div>
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
                  </Card>
                </NavLink>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency & Support */}
        <Card className="premium-card border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Emergency & Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <NavLink to="/sos">
                <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 rounded-xl shadow-lg relative overflow-hidden border border-red-600">
                  <div className="flex items-center justify-center space-x-3 relative z-10">
                    <AlertCircle className="w-5 h-5" />
                    <span>Emergency SOS</span>
                    <span className="text-sm opacity-80">• Immediate Help</span>
                  </div>
                </Button>
              </NavLink>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="py-3 text-sm flex items-center justify-center space-x-2 border">
                  <Phone className="w-4 h-4" />
                  <span>Call Doctor</span>
                </Button>
                <Button variant="outline" className="py-3 text-sm flex items-center justify-center space-x-2 border">
                  <Brain className="w-4 h-4" />
                  <span>AI Assistant</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
