import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Footprints, Target, Flame, Trophy, TrendingUp,
  Clock, Settings, Smartphone, Heart, Zap, Award,
  RefreshCw, Activity, BarChart3, CheckCircle,
  Plus, Minus, MapPin,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import EnhancedStepTrackerService from '@/lib/enhanced-step-tracker';
import type { EnhancedStepData, StepGoal, StepInsight } from '@/lib/enhanced-step-tracker';

const StepTracker: React.FC = () => {
  const [currentData, setCurrentData] = useState<EnhancedStepData | null>(null);
  const [weeklyData, setWeeklyData] = useState<Array<{ date: string; steps: number; calories: number; distance: number; activeMinutes: number }>>([]);
  const [insights, setInsights] = useState<StepInsight[]>([]);
  const [goals, setGoals] = useState<StepGoal>({ daily: 10000, weekly: 70000, monthly: 300000 });
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [newGoal, setNewGoal] = useState(10000);
  const [manualSteps, setManualSteps] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const stepTracker = EnhancedStepTrackerService.getInstance();

  useEffect(() => { initializeStepTracker(); loadAchievements(); }, []);

  const initializeStepTracker = async () => {
    try {
      setIsLoading(true);
      const current = await stepTracker.getCurrentStepData(); setCurrentData(current);
      const weekly = await stepTracker.getWeeklyData(); setWeeklyData(weekly);
      const si = await stepTracker.getStepInsights(); setInsights(si);
      const cg = stepTracker.getGoals(); setGoals(cg);
      const st = stepTracker.getConnectionStatus(); setConnectionStatus(st);
      setStreak(calculateStreak(weekly));
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const weeklyDummyData = [
    { date: 'Mon', steps: 7200, calories: 320, distance: 5.1, activeMinutes: 48 },
    { date: 'Tue', steps: 9800, calories: 410, distance: 6.9, activeMinutes: 62 },
    { date: 'Wed', steps: 5400, calories: 240, distance: 3.8, activeMinutes: 35 },
    { date: 'Thu', steps: 11200, calories: 490, distance: 7.9, activeMinutes: 74 },
    { date: 'Fri', steps: 8600, calories: 375, distance: 6.1, activeMinutes: 57 },
    { date: 'Sat', steps: 13500, calories: 580, distance: 9.5, activeMinutes: 89 },
    { date: 'Sun', steps: 6100, calories: 270, distance: 4.3, activeMinutes: 41 },
  ];

  const loadAchievements = () => {
    const saved = localStorage.getItem('stepAchievements');
    if (saved) setAchievements(JSON.parse(saved));
  };

  const saveAchievements = (a: string[]) => {
    setAchievements(a);
    localStorage.setItem('stepAchievements', JSON.stringify(a));
  };

  const calculateStreak = (data: Array<{ steps: number }>) => {
    let s = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].steps >= goals.daily) s++; else break;
    }
    return s;
  };

  const connectGoogleFit = async () => {
    setIsConnecting(true);
    try {
      const ok = await stepTracker.connectGoogleFit();
      if (ok) { await initializeStepTracker(); checkAchievements(); }
    } catch (e) { console.error(e); }
    finally { setIsConnecting(false); }
  };

  const disconnectGoogleFit = async () => {
    try { await stepTracker.disconnectGoogleFit(); await initializeStepTracker(); }
    catch (e) { console.error(e); }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try { await stepTracker.refreshData(); await initializeStepTracker(); }
    catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const addManualSteps = () => {
    const steps = parseInt(manualSteps);
    if (!steps || steps < 0) return;
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`steps_${today}`);
    const current = stored ? JSON.parse(stored).steps : 0;
    localStorage.setItem(`steps_${today}`, JSON.stringify({ steps: current + steps, timestamp: new Date().toISOString() }));
    setManualSteps(''); setShowManualInput(false); initializeStepTracker();
  };

  const updateSteps = (inc: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`steps_${today}`);
    const current = stored ? JSON.parse(stored).steps : 0;
    localStorage.setItem(`steps_${today}`, JSON.stringify({ steps: Math.max(0, current + (inc ? 100 : -100)), timestamp: new Date().toISOString() }));
    initializeStepTracker();
  };

  const updateGoal = () => {
    const updated = { ...goals, daily: newGoal };
    stepTracker.setGoals(updated); setGoals(updated);
    setShowGoalSetter(false); checkAchievements();
  };

  const checkAchievements = () => {
    if (!currentData) return;
    const n = [...achievements];
    if (currentData.steps >= goals.daily && !n.includes('Daily Goal')) n.push('Daily Goal');
    if (currentData.steps >= 15000 && !n.includes('Step Master')) n.push('Step Master');
    if (streak >= 7 && !n.includes('Week Warrior')) n.push('Week Warrior');
    if (streak >= 30 && !n.includes('Monthly Master')) n.push('Monthly Master');
    if (currentData.distance >= 10 && !n.includes('Distance Walker')) n.push('Distance Walker');
    if (currentData.calories >= 500 && !n.includes('Calorie Burner')) n.push('Calorie Burner');
    if (n.length > achievements.length) saveAchievements(n);
  };

  const getProgressPercentage = () =>
    currentData ? Math.min((currentData.steps / goals.daily) * 100, 100) : 0;

  const getMotivationalMessage = () => {
    const p = getProgressPercentage();
    if (p >= 100) return "🎉 Daily goal achieved! You're amazing!";
    if (p >= 80) return '🌟 Almost there! Keep going!';
    if (p >= 50) return "💪 Great progress! You're halfway there!";
    if (p >= 25) return '🚀 Good start! Keep the momentum!';
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
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your step data...</p>
        </div>
      </div>
    );
  }

  const pct = getProgressPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* ── Page title ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Step Tracker</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track your daily activity</p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshData} className="shrink-0">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* ── Top stat cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {/* Streak */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Flame className="h-5 w-5 mb-2 text-white/80" />
              <div className="text-3xl font-bold leading-none">{streak}</div>
              <div className="text-xs text-white/80 mt-1 font-medium">Day Streak</div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Trophy className="h-5 w-5 mb-2 text-yellow-500" />
              <div className="text-3xl font-bold leading-none">{achievements.length}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">Badges</div>
            </CardContent>
          </Card>

          {/* Data source */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Activity className="h-5 w-5 mb-2 text-blue-500" />
              <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${connectionStatus?.googleFit ? 'bg-green-500' : 'bg-yellow-400'}`} />
              <div className="text-xs text-muted-foreground font-medium leading-tight">
                {connectionStatus?.googleFit ? 'Google Fit' : 'Device'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Main step counter ── */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-base">
                <Footprints className="h-5 w-5 mr-2 text-orange-500" />
                Today's Steps
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManualInput(!showManualInput)}
                className="h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Steps
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Manual input panel */}
            {showManualInput && (
              <div className="p-4 bg-blue-50 rounded-xl space-y-3 border border-blue-100">
                <p className="text-sm font-semibold text-blue-800">Add Steps Manually</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter steps..."
                    value={manualSteps}
                    onChange={(e) => setManualSteps(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addManualSteps} size="sm" className="shrink-0">Add</Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => updateSteps(false)}>
                    <Minus className="h-3.5 w-3.5 mr-1" /> −100
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => updateSteps(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> +100
                  </Button>
                </div>
              </div>
            )}

            {/* Ring counter */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-44 h-44">
                {/* Outer track */}
                <div className="absolute inset-0 rounded-full bg-orange-100" />
                {/* Inner white */}
                <div className="absolute inset-2 rounded-full bg-white shadow-inner" />
                {/* Conic progress */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#f97316 ${pct}%, #fed7aa ${pct}%)`,
                    WebkitMask: 'radial-gradient(circle at center, transparent 52%, black 52%)',
                    mask: 'radial-gradient(circle at center, transparent 52%, black 52%)',
                  }}
                />
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-orange-600 leading-none tabular-nums">
                    {(currentData?.steps ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">steps</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily Goal Progress</span>
                <span className="font-semibold text-orange-600">{Math.round(pct)}%</span>
              </div>
              <Progress value={pct} className="h-2.5 rounded-full" />
              <p className="text-center text-xs text-muted-foreground">
                {currentData
                  ? `${Math.max(0, goals.daily - currentData.steps).toLocaleString()} steps remaining`
                  : 'Loading...'}
              </p>
            </div>

            {/* Motivation */}
            <div className="text-center bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl px-4 py-3 border border-orange-100">
              <p className="text-sm font-medium text-orange-800">{getMotivationalMessage()}</p>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center bg-blue-50 rounded-xl p-3">
                <MapPin className="h-4 w-4 text-blue-500 mb-1.5" />
                <span className="text-xl font-bold text-blue-700 leading-none">
                  {currentData?.distance.toFixed(1) ?? '0.0'}
                </span>
                <span className="text-xs text-muted-foreground mt-1">km</span>
              </div>
              <div className="flex flex-col items-center bg-red-50 rounded-xl p-3">
                <Flame className="h-4 w-4 text-red-500 mb-1.5" />
                <span className="text-xl font-bold text-red-600 leading-none">
                  {currentData?.calories ?? 0}
                </span>
                <span className="text-xs text-muted-foreground mt-1">cal</span>
              </div>
              <div className="flex flex-col items-center bg-green-50 rounded-xl p-3">
                <Clock className="h-4 w-4 text-green-600 mb-1.5" />
                <span className="text-xl font-bold text-green-700 leading-none">
                  {currentData?.activeMinutes ?? 0}
                </span>
                <span className="text-xs text-muted-foreground mt-1">active min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Weekly chart ── */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyDummyData.length > 0 ? weeklyDummyData : weeklyData} barSize={20} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }}
                    cursor={{ fill: 'rgba(249,115,22,0.06)' }}
                  />
                  <Bar dataKey="steps" fill="#f97316" name="Steps" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ── Goal setting ── */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-base">
                <Target className="h-5 w-5 mr-2 text-blue-500" />
                Daily Goal
              </CardTitle>
              <Button
                variant="outline" size="sm"
                onClick={() => setShowGoalSetter(!showGoalSetter)}
                className="h-8 text-xs"
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                Adjust
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showGoalSetter && (
              <div className="p-4 bg-muted/40 rounded-xl space-y-3 border">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setNewGoal(Math.max(1000, newGoal - 1000))}
                    className="shrink-0 w-10 h-10 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={newGoal}
                    onChange={(e) => setNewGoal(parseInt(e.target.value) || 10000)}
                    className="text-center font-bold text-base flex-1"
                    min="1000" max="50000"
                  />
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setNewGoal(Math.min(50000, newGoal + 1000))}
                    className="shrink-0 w-10 h-10 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={updateGoal} className="w-full h-9">Update Goal</Button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Daily', value: goals.daily, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Weekly', value: goals.weekly, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Monthly', value: goals.monthly, color: 'text-green-600', bg: 'bg-green-50' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-3 flex flex-col items-center`}>
                  <span className={`text-lg font-bold ${color} leading-none tabular-nums`}>
                    {value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Google Fit ── */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-base">
                <Smartphone className="h-5 w-5 mr-2 text-green-500" />
                Google Fit
              </CardTitle>
              {connectionStatus?.googleFit ? (
                <Button variant="outline" size="sm" onClick={disconnectGoogleFit} className="h-8 text-xs">
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm" onClick={connectGoogleFit}
                  disabled={isConnecting}
                  className="h-8 text-xs bg-green-500 hover:bg-green-600 border-0"
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${connectionStatus?.googleFit ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium">
                {connectionStatus?.googleFit ? 'Connected to Google Fit' : 'Not connected'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {connectionStatus?.googleFit
                ? 'Google Fit provides accurate step tracking across all your devices.'
                : 'Connect for accurate step tracking from all your devices.'}
            </p>
            {connectionStatus?.lastSync && (
              <p className="text-xs text-muted-foreground">
                Last synced: {new Date(connectionStatus.lastSync).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── AI Insights ── */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length > 0 ? (
              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-xl bg-muted/20">
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${insight.priority === 'high' ? 'bg-red-500' :
                        insight.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Zap className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Keep walking to get personalized insights!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Badges row ── */}
        {achievements.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {achievements.map((a, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1 text-xs font-medium">
                    {a}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Health tip ── */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Daily Health Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-700 mb-1">💡 Today's Tip</p>
                <p className="text-sm text-green-800 leading-relaxed">{getHealthTip()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default StepTracker;