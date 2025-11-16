import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Droplet, 
  Plus, 
  Minus, 
  Trophy, 
  Flame, 
  Target, 
  Clock, 
  Calendar, 
  Award, 
  TrendingUp, 
  Bell, 
  Zap, 
  Heart, 
  Brain,
  Waves,
  Timer
} from 'lucide-react';

const DAILY_GOAL = 8; // 8 glasses
const GLASS_SIZE = 250; // ml

interface WaterRecord {
  id: string;
  glasses: number;
  date: string;
  timestamp: number;
  achieved: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

const WaterTracker: React.FC = () => {
  const [glasses, setGlasses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [waterHistory, setWaterHistory] = useState<WaterRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyGoal, setDailyGoal] = useState(DAILY_GOAL);
  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [lastDrinkTime, setLastDrinkTime] = useState<Date | null>(null);
  const [reminders, setReminders] = useState(true);

  useEffect(() => {
    loadSavedData();
    initializeAchievements();
    setupReminders();
  }, []);

  useEffect(() => {
    saveData();
    checkAchievements();
  }, [glasses, streak, waterHistory]);

  const loadSavedData = () => {
    try {
      const savedGlasses = localStorage.getItem('waterGlasses');
      const savedStreak = localStorage.getItem('waterStreak');
      const savedHistory = localStorage.getItem('waterHistory');
      const savedGoal = localStorage.getItem('waterGoal');
      const savedAchievements = localStorage.getItem('waterAchievements');
      const savedReminders = localStorage.getItem('waterReminders');
      
      if (savedGlasses) setGlasses(parseInt(savedGlasses));
      if (savedStreak) setStreak(parseInt(savedStreak));
      if (savedHistory) setWaterHistory(JSON.parse(savedHistory));
      if (savedGoal) setDailyGoal(parseInt(savedGoal));
      if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
      if (savedReminders) setReminders(JSON.parse(savedReminders));
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('waterGlasses', glasses.toString());
      localStorage.setItem('waterStreak', streak.toString());
      localStorage.setItem('waterHistory', JSON.stringify(waterHistory));
      localStorage.setItem('waterGoal', dailyGoal.toString());
      localStorage.setItem('waterAchievements', JSON.stringify(achievements));
      localStorage.setItem('waterReminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const initializeAchievements = () => {
    const defaultAchievements: Achievement[] = [
      { id: 'first_glass', name: 'First Drop', description: 'Log your first glass of water', icon: '💧', unlocked: false },
      { id: 'daily_goal', name: 'Daily Hydration', description: 'Reach your daily water goal', icon: '🎯', unlocked: false },
      { id: 'week_streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', unlocked: false },
      { id: 'month_streak', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '👑', unlocked: false },
      { id: 'early_bird', name: 'Early Bird', description: 'Drink water before 8 AM', icon: '🌅', unlocked: false },
      { id: 'night_owl', name: 'Night Hydrator', description: 'Drink water after 10 PM', icon: '🦉', unlocked: false },
      { id: 'overachiever', name: 'Overachiever', description: 'Exceed daily goal by 50%', icon: '🚀', unlocked: false },
      { id: 'consistent', name: 'Consistency King', description: 'Hit goal 5 days in a row', icon: '💪', unlocked: false }
    ];
    
    const saved = localStorage.getItem('waterAchievements');
    if (!saved) {
      setAchievements(defaultAchievements);
      localStorage.setItem('waterAchievements', JSON.stringify(defaultAchievements));
    }
  };

  const setupReminders = () => {
    if (!reminders) return;
    
    // Set up periodic reminders (every 2 hours)
    const reminderInterval = setInterval(() => {
      if (glasses < dailyGoal) {
        showNotification('Time to hydrate! 💧', 'Don\'t forget to drink water');
      }
    }, 2 * 60 * 60 * 1000); // 2 hours

    return () => clearInterval(reminderInterval);
  };

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/water-icon.png' });
    }
  };

  const addGlass = () => {
    if (glasses < dailyGoal * 2) { // Allow up to 2x daily goal
      setGlasses(g => g + 1);
      setLastDrinkTime(new Date());
      
      // Update today's record
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = waterHistory.find(r => r.date === today);
      
      if (todayRecord) {
        const updated = waterHistory.map(r => 
          r.date === today 
            ? { ...r, glasses: glasses + 1, achieved: glasses + 1 >= dailyGoal }
            : r
        );
        setWaterHistory(updated);
      } else {
        const newRecord: WaterRecord = {
          id: Date.now().toString(),
          glasses: glasses + 1,
          date: today,
          timestamp: Date.now(),
          achieved: glasses + 1 >= dailyGoal
        };
        setWaterHistory([newRecord, ...waterHistory]);
      }
    }
  };

  const removeGlass = () => {
    if (glasses > 0) {
      setGlasses(g => g - 1);
      
      // Update today's record
      const today = new Date().toISOString().split('T')[0];
      const updated = waterHistory.map(r => 
        r.date === today 
          ? { ...r, glasses: glasses - 1, achieved: glasses - 1 >= dailyGoal }
          : r
      );
      setWaterHistory(updated);
    }
  };

  const checkAchievements = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const hour = now.getHours();
    
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first_glass':
          shouldUnlock = glasses > 0;
          break;
        case 'daily_goal':
          shouldUnlock = glasses >= dailyGoal;
          break;
        case 'week_streak':
          shouldUnlock = streak >= 7;
          break;
        case 'month_streak':
          shouldUnlock = streak >= 30;
          break;
        case 'early_bird':
          shouldUnlock = glasses > 0 && hour < 8;
          break;
        case 'night_owl':
          shouldUnlock = glasses > 0 && hour >= 22;
          break;
        case 'overachiever':
          shouldUnlock = glasses >= dailyGoal * 1.5;
          break;
        case 'consistent':
          const recentDays = waterHistory.slice(0, 5);
          shouldUnlock = recentDays.length >= 5 && recentDays.every(day => day.achieved);
          break;
      }
      
      if (shouldUnlock) {
        showNotification('🏆 Achievement Unlocked!', `${achievement.name}: ${achievement.description}`);
        return { ...achievement, unlocked: true, date: today };
      }
      
      return achievement;
    });
    
    setAchievements(updatedAchievements);
  };

  const getMotivationalMessage = () => {
    const percentage = (glasses / dailyGoal) * 100;
    
    if (percentage >= 100) return "🎉 Daily goal achieved! You're amazing!";
    if (percentage >= 75) return "🌟 Almost there! Keep going!";
    if (percentage >= 50) return "💪 Great progress! You're halfway there!";
    if (percentage >= 25) return "🚀 Good start! Keep the momentum!";
    return "💧 Time to hydrate! Every drop counts!";
  };

  const getHydrationLevel = () => {
    const percentage = (glasses / dailyGoal) * 100;
    
    if (percentage >= 100) return { level: 'Optimal', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 75) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 50) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 25) return { level: 'Low', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  const hydrationStatus = getHydrationLevel();
  const progressPercentage = Math.min((glasses / dailyGoal) * 100, 100);
  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Water Tracker</h1>
          <p className="text-muted-foreground">Stay hydrated with smart reminders and tracking</p>
        </div>

        {/* Streak & Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Flame className="h-5 w-5 mr-2" />
                Hydration Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{streak}</div>
              <p className="text-white/80 text-sm">
                {streak >= 30 ? 'Incredible consistency!' : 
                 streak >= 7 ? 'Great momentum!' : 'Building your hydration habit!'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{unlockedAchievements.length}</div>
              <div className="flex flex-wrap gap-1">
                {unlockedAchievements.slice(0, 3).map((achievement, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {achievement.icon} {achievement.name}
                  </Badge>
                ))}
                {unlockedAchievements.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{unlockedAchievements.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Water Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Droplet className="h-5 w-5 mr-2 text-cyan-500" />
                Today's Progress
              </div>
              <Badge className={`${hydrationStatus.bg} ${hydrationStatus.color}`}>
                {hydrationStatus.level}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Water Visual */}
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-48 bg-gradient-to-t from-cyan-100 to-white rounded-full border-4 border-cyan-200 overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-400 to-cyan-300 transition-all duration-700 ease-out"
                    style={{ height: `${progressPercentage}%` }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-300 to-cyan-400 opacity-70 animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-cyan-800">
                      <div className="text-2xl font-bold">{glasses}</div>
                      <div className="text-xs">/ {dailyGoal}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="text-center text-sm text-muted-foreground">
                  {glasses * GLASS_SIZE}ml / {dailyGoal * GLASS_SIZE}ml
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button 
                  onClick={removeGlass} 
                  size="lg" 
                  variant="outline" 
                  disabled={glasses === 0}
                  className="h-12 w-12 rounded-full"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600">{glasses}</div>
                  <div className="text-sm text-muted-foreground">glasses</div>
                </div>
                
                <Button 
                  onClick={addGlass} 
                  size="lg" 
                  disabled={glasses >= dailyGoal * 2}
                  className="h-12 w-12 rounded-full bg-cyan-500 hover:bg-cyan-600"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              {/* Motivation Message */}
              <div className="text-center p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                <p className="text-sm font-medium text-cyan-800">
                  {getMotivationalMessage()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goal Setting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-500" />
                Daily Goal
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowGoalSetter(!showGoalSetter)}
              >
                Adjust Goal
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showGoalSetter && (
              <div className="space-y-4 mb-4">
                <Input
                  type="number"
                  placeholder="Daily goal (glasses)"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(parseInt(e.target.value) || 8)}
                  min="1"
                  max="20"
                />
                <Button onClick={() => setShowGoalSetter(false)}>
                  Save Goal
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-cyan-50 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600">{dailyGoal}</div>
                <div className="text-xs text-muted-foreground">Daily Goal</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{dailyGoal * GLASS_SIZE}ml</div>
                <div className="text-xs text-muted-foreground">Volume</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(progressPercentage)}%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminders & Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-orange-500" />
                Smart Reminders
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setReminders(!reminders);
                  if (!reminders) requestNotificationPermission();
                }}
              >
                {reminders ? 'Disable' : 'Enable'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-3 border rounded-lg">
                <Timer className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-sm">Regular Reminders</p>
                  <p className="text-xs text-muted-foreground">Every 2 hours during day</p>
                </div>
              </div>
              <div className="flex items-center p-3 border rounded-lg">
                <Zap className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <p className="font-medium text-sm">Smart Timing</p>
                  <p className="text-xs text-muted-foreground">Based on your habits</p>
                </div>
              </div>
            </div>
            
            {lastDrinkTime && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800">
                    Last drink: {lastDrinkTime.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Water History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-500" />
              Hydration History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {waterHistory.length > 0 ? (
              <div className="space-y-3">
                {waterHistory.slice(0, 7).map((record) => (
                  <div key={record.id} className="flex items-start justify-between p-4 border rounded-lg gap-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        record.achieved ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Droplet className={`h-5 w-5 ${
                          record.achieved ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{record.glasses} glasses</div>
                        <div className="text-sm text-muted-foreground truncate">{record.date}</div>
                        <div className="text-xs text-muted-foreground">
                          {record.glasses * GLASS_SIZE}ml consumed
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant={record.achieved ? 'default' : 'secondary'} className="whitespace-nowrap">
                        {record.achieved ? 'Goal Met' : 'Incomplete'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hydration history yet. Start tracking your water intake!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Health Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-500" />
              Hydration Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-3 border rounded-lg">
                <Heart className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <p className="font-medium text-sm">Heart Health</p>
                  <p className="text-xs text-muted-foreground">Proper hydration supports circulation</p>
                </div>
              </div>
              <div className="flex items-center p-3 border rounded-lg">
                <Zap className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <p className="font-medium text-sm">Energy Boost</p>
                  <p className="text-xs text-muted-foreground">Stay energized throughout the day</p>
                </div>
              </div>
              <div className="flex items-center p-3 border rounded-lg">
                <Brain className="h-5 w-5 text-purple-500 mr-3" />
                <div>
                  <p className="font-medium text-sm">Brain Function</p>
                  <p className="text-xs text-muted-foreground">Improve focus and concentration</p>
                </div>
              </div>
              <div className="flex items-center p-3 border rounded-lg">
                <Waves className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-sm">Skin Health</p>
                  <p className="text-xs text-muted-foreground">Keep your skin healthy and glowing</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaterTracker;
