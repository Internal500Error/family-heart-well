import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Footprints, 
  Target, 
  Flame, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Calendar, 
  Settings, 
  Smartphone, 
  MapPin, 
  Heart, 
  Zap, 
  Award, 
  RefreshCw,
  PlayCircle,
  PauseCircle,
  Activity,
  BarChart3,
  Users,
  CheckCircle,
  Plus,
  Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import EnhancedStepTrackerService from '@/lib/enhanced-step-tracker';
import type { EnhancedStepData, StepGoal, StepInsight } from '@/lib/enhanced-step-tracker';

const StepTracker: React.FC = () => {
  const [currentData, setCurrentData] = useState<EnhancedStepData | null>(null);
  const [weeklyData, setWeeklyData] = useState<Array<{date: string, steps: number, calories: number, distance: number, activeMinutes: number}>>([]);
  const [insights, setInsights] = useState<StepInsight[]>([]);
  const [goals, setGoals] = useState<StepGoal>({ daily: 10000, weekly: 70000, monthly: 300000 });
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [newGoal, setNewGoal] = useState(10000);
  
  const stepTracker = EnhancedStepTrackerService.getInstance();

  useEffect(() => {
    initializeStepTracker();
    loadAchievements();
  }, []);

  const initializeStepTracker = async () => {
    try {
      setIsLoading(true);
      
      // Load current data
      const current = await stepTracker.getCurrentStepData();
      setCurrentData(current);
      
      // Load weekly data
      const weekly = await stepTracker.getWeeklyData();
      setWeeklyData(weekly);
      
      // Load insights
      const stepInsights = await stepTracker.getStepInsights();
      setInsights(stepInsights);
      
      // Load goals
      const currentGoals = stepTracker.getGoals();
      setGoals(currentGoals);
      
      // Load connection status
      const status = stepTracker.getConnectionStatus();
      setConnectionStatus(status);
      
      // Calculate streak
      const currentStreak = calculateStreak(weekly);
      setStreak(currentStreak);
      
    } catch (error) {
      console.error('Failed to initialize step tracker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAchievements = () => {
    const saved = localStorage.getItem('stepAchievements');
    if (saved) {
      setAchievements(JSON.parse(saved));
    }
  };

  const saveAchievements = (newAchievements: string[]) => {
    setAchievements(newAchievements);
    localStorage.setItem('stepAchievements', JSON.stringify(newAchievements));
  };

  const calculateStreak = (data: Array<{steps: number}>) => {
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].steps >= goals.daily) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const connectGoogleFit = async () => {
    setIsConnecting(true);
    try {
      const connected = await stepTracker.connectGoogleFit();
      if (connected) {
        await initializeStepTracker();
        checkAchievements();
      }
    } catch (error) {
      console.error('Failed to connect to Google Fit:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectGoogleFit = async () => {
    try {
      await stepTracker.disconnectGoogleFit();
      await initializeStepTracker();
    } catch (error) {
      console.error('Failed to disconnect from Google Fit:', error);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await stepTracker.refreshData();
      await initializeStepTracker();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateGoal = () => {
    const updatedGoals = { ...goals, daily: newGoal };
    stepTracker.setGoals(updatedGoals);
    setGoals(updatedGoals);
    setShowGoalSetter(false);
    checkAchievements();
  };

  const checkAchievements = () => {
    if (!currentData) return;
    
    const newAchievements = [...achievements];
    
    // Check various achievement conditions
    if (currentData.steps >= goals.daily && !achievements.includes('Daily Goal')) {
      newAchievements.push('Daily Goal');
    }
    if (currentData.steps >= 15000 && !achievements.includes('Step Master')) {
      newAchievements.push('Step Master');
    }
    if (streak >= 7 && !achievements.includes('Week Warrior')) {
      newAchievements.push('Week Warrior');
    }
    if (streak >= 30 && !achievements.includes('Monthly Master')) {
      newAchievements.push('Monthly Master');
    }
    if (currentData.distance >= 10 && !achievements.includes('Distance Walker')) {
      newAchievements.push('Distance Walker');
    }
    if (currentData.calories >= 500 && !achievements.includes('Calorie Burner')) {
      newAchievements.push('Calorie Burner');
    }
    
    if (newAchievements.length > achievements.length) {
      saveAchievements(newAchievements);
    }
  };

  const getProgressPercentage = () => {
    if (!currentData) return 0;
    return Math.min((currentData.steps / goals.daily) * 100, 100);
  };

  const getMotivationalMessage = () => {
    if (!currentData) return 'Loading your progress...';
    
    const percentage = getProgressPercentage();
    
    if (percentage >= 100) return '🎉 Daily goal achieved! You\'re amazing!';
    if (percentage >= 80) return '🌟 Almost there! Keep going!';
    if (percentage >= 50) return '💪 Great progress! You\'re halfway there!';
    if (percentage >= 25) return '🚀 Good start! Keep the momentum!';
    return '👟 Time to get moving! Every step counts!';
  };

  const getHealthTip = () => {
    const tips = [
      'Take the stairs instead of the elevator',
      'Park further away from your destination',
      'Take a walking meeting instead of sitting',
      'Set reminders to walk every hour',
      'Try walking while talking on the phone',
      'Take short walks during lunch breaks',
      'Walk to nearby errands instead of driving',
      'Use a standing desk for part of your day'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your step data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground break-words">Step Tracker</h1>
          <p className="text-muted-foreground break-words">Track your daily activity with Google Fit integration</p>
        </div>

        {/* Stats Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Flame className="h-5 w-5 mr-2" />
                Daily Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2 break-words">{streak}</div>
              <p className="text-white/80 text-sm break-words">
                {streak >= 30 ? 'Incredible consistency!' : 
                 streak >= 7 ? 'Great momentum!' : 'Building your habit!'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2 break-words text-center w-full">{achievements.length}</div>
              <div className="flex flex-wrap gap-1 min-w-0">
                {achievements.slice(0, 2).map((achievement, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs break-words max-w-[80px] truncate">
                    {achievement}
                  </Badge>
                ))}
                {achievements.length > 2 && (
                  <Badge variant="outline" className="text-xs max-w-[60px] truncate">
                    +{achievements.length - 2} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Data Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium mb-2 break-words">
                {connectionStatus?.googleFit ? 'Google Fit' : 'Device Sensors'}
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus?.googleFit ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-xs text-muted-foreground">
                  {connectionStatus?.googleFit ? 'High accuracy' : 'Medium accuracy'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Step Counter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Footprints className="h-5 w-5 mr-2 text-orange-500" />
                Today's Steps
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={refreshData}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Step Counter Visual */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-100 to-orange-200"></div>
                  <div className="absolute inset-2 rounded-full bg-white shadow-inner"></div>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-4xl font-bold text-orange-600 break-words">
                      {currentData?.steps.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-muted-foreground break-words">steps</div>
                  </div>
                  <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-orange-500 transform -rotate-90"
                       style={{ 
                         background: `conic-gradient(from 0deg, #f97316 ${getProgressPercentage()}%, transparent ${getProgressPercentage()}%)`,
                         WebkitMask: 'radial-gradient(circle at center, transparent 50%, black 50%)',
                         mask: 'radial-gradient(circle at center, transparent 50%, black 50%)'
                       }}>
                  </div>
                </div>
              </div>

              {/* Progress Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between min-w-0">
                  <span className="text-sm text-muted-foreground break-words">Daily Goal Progress</span>
                  <span className="text-sm font-medium break-words">{Math.round(getProgressPercentage())}%</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-3" />
                <div className="text-center text-sm text-muted-foreground break-words">
                  {currentData ? `${(goals.daily - currentData.steps).toLocaleString()} steps remaining` : 'Loading...'}
                </div>
              </div>

              {/* Motivation Message */}
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg min-w-0">
                <p className="text-sm font-medium text-orange-800 break-words">
                  {getMotivationalMessage()}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 break-words">
                        {currentData?.distance.toFixed(1) || '0.0'}
                      </div>
                      <div className="text-xs text-muted-foreground break-words">km walked</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 break-words">
                    {currentData?.calories || '0'}
                  </div>
                  <div className="text-xs text-muted-foreground break-words">calories</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 break-words">
                    {currentData?.activeMinutes || '0'}
                  </div>
                  <div className="text-xs text-muted-foreground break-words">active min</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Fit Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 mr-2 text-green-500" />
                Google Fit Integration
              </div>
              {connectionStatus?.googleFit ? (
                <Button variant="outline" size="sm" onClick={disconnectGoogleFit}>
                  Disconnect
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={connectGoogleFit} 
                  disabled={isConnecting}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Google Fit'}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus?.googleFit ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm">
                  {connectionStatus?.googleFit ? 'Connected to Google Fit' : 'Not connected'}
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {connectionStatus?.googleFit ? (
                  <>Google Fit provides the most accurate step tracking across all your devices, including smartwatches and fitness trackers.</>
                ) : (
                  <>Connect to Google Fit for accurate step tracking from all your devices and access to comprehensive fitness data.</>
                )}
              </div>
              
              {connectionStatus?.lastSync && (
                <div className="text-xs text-muted-foreground">
                  Last synced: {new Date(connectionStatus.lastSync).toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Goal Setting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-500" />
                Daily Goal
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowGoalSetter(!showGoalSetter)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Adjust
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showGoalSetter && (
              <div className="space-y-4 mb-4">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setNewGoal(Math.max(1000, newGoal - 1000))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={newGoal}
                    onChange={(e) => setNewGoal(parseInt(e.target.value) || 10000)}
                    className="text-center"
                    min="1000"
                    max="50000"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setNewGoal(Math.min(50000, newGoal + 1000))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={updateGoal} className="w-full">
                  Update Goal
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 text-center min-w-0">
              <div className="p-3 bg-blue-50 rounded-lg min-w-0">
                <div className="text-2xl font-bold text-blue-600 break-words">{goals.daily.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground break-words">Daily Goal</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg min-w-0">
                <div className="text-2xl font-bold text-purple-600 break-words">{goals.weekly.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground break-words">Weekly Goal</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg min-w-0">
                <div className="text-2xl font-bold text-green-600 break-words">{goals.monthly.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground break-words">Monthly Goal</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="steps" fill="#f97316" name="Steps" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      insight.priority === 'high' ? 'bg-red-500' :
                      insight.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {insights.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Keep walking to get personalized insights!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Health Tip */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Daily Health Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">💡 Today's Tip</p>
                <p className="text-sm text-green-700 mt-1">{getHealthTip()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StepTracker;
