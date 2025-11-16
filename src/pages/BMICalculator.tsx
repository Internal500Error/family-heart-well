import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Award, 
  History, 
  Scale,
  Heart,
  Brain,
  Zap,
  Trophy,
  Flame,
  LineChart
} from 'lucide-react';

function calculateBMI(weight: number, height: number) {
  if (!weight || !height) return 0;
  return +(weight / ((height / 100) ** 2)).toFixed(1);
}

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { 
    label: 'Underweight', 
    color: 'bg-blue-100 text-blue-800',
    gradient: 'from-blue-500 to-blue-600',
    advice: 'Consider gaining weight with a balanced diet and exercise'
  };
  if (bmi < 25) return { 
    label: 'Normal', 
    color: 'bg-green-100 text-green-800',
    gradient: 'from-green-500 to-green-600',
    advice: 'Great! Maintain your healthy weight with balanced lifestyle'
  };
  if (bmi < 30) return { 
    label: 'Overweight', 
    color: 'bg-yellow-100 text-yellow-800',
    gradient: 'from-yellow-500 to-yellow-600',
    advice: 'Consider weight loss through healthy diet and exercise'
  };
  return { 
    label: 'Obese', 
    color: 'bg-red-100 text-red-800',
    gradient: 'from-red-500 to-red-600',
    advice: 'Consult a healthcare provider for a weight management plan'
  };
}

interface BMIRecord {
  id: string;
  weight: number;
  height: number;
  bmi: number;
  date: string;
  category: string;
}

const BMICalculator: React.FC = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiHistory, setBmiHistory] = useState<BMIRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [targetBMI, setTargetBMI] = useState(22.5);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showTargetSetter, setShowTargetSetter] = useState(false);
  
  const bmi = calculateBMI(Number(weight), Number(height));
  const category = getBMICategory(bmi);

  useEffect(() => {
    // Load saved data from localStorage
    const savedHistory = localStorage.getItem('bmiHistory');
    const savedStreak = localStorage.getItem('bmiStreak');
    const savedTarget = localStorage.getItem('bmiTarget');
    const savedAchievements = localStorage.getItem('bmiAchievements');
    
    if (savedHistory) setBmiHistory(JSON.parse(savedHistory));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedTarget) setTargetBMI(parseFloat(savedTarget));
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
  }, []);

  const saveBMIRecord = () => {
    if (!weight || !height) return;
    
    const record: BMIRecord = {
      id: Date.now().toString(),
      weight: Number(weight),
      height: Number(height),
      bmi,
      date: new Date().toISOString().split('T')[0],
      category: category.label
    };
    
    const updatedHistory = [record, ...bmiHistory.slice(0, 9)];
    setBmiHistory(updatedHistory);
    localStorage.setItem('bmiHistory', JSON.stringify(updatedHistory));
    
    // Update streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('bmiStreak', newStreak.toString());
    
    // Check for achievements
    checkAchievements(newStreak, bmi);
  };

  const checkAchievements = (currentStreak: number, currentBMI: number) => {
    const newAchievements = [...achievements];
    
    if (currentStreak >= 7 && !achievements.includes('Week Warrior')) {
      newAchievements.push('Week Warrior');
    }
    if (currentStreak >= 30 && !achievements.includes('Monthly Master')) {
      newAchievements.push('Monthly Master');
    }
    if (currentBMI >= 18.5 && currentBMI <= 24.9 && !achievements.includes('Healthy Range')) {
      newAchievements.push('Healthy Range');
    }
    if (bmiHistory.length >= 10 && !achievements.includes('Tracking Pro')) {
      newAchievements.push('Tracking Pro');
    }
    
    if (newAchievements.length > achievements.length) {
      setAchievements(newAchievements);
      localStorage.setItem('bmiAchievements', JSON.stringify(newAchievements));
    }
  };

  const getProgressToTarget = () => {
    if (!bmi) return 0;
    const range = Math.abs(targetBMI - 15); // Assume range from 15 to target
    const progress = Math.max(0, Math.min(100, ((bmi - 15) / range) * 100));
    return Math.round(progress);
  };

  const getTrendIcon = () => {
    if (bmiHistory.length < 2) return null;
    const current = bmiHistory[0]?.bmi || 0;
    const previous = bmiHistory[1]?.bmi || 0;
    
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">BMI Calculator</h1>
          <p className="text-muted-foreground">Track your Body Mass Index with AI-powered insights</p>
        </div>

        {/* Streak & Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Flame className="h-5 w-5 mr-2" />
                Tracking Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{streak}</div>
              <p className="text-white/80 text-sm">
                {streak >= 30 ? 'Amazing consistency!' : 
                 streak >= 7 ? 'Great momentum!' : 'Keep building your habit!'}
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
              <div className="text-2xl font-bold mb-2">{achievements.length}</div>
              <div className="flex flex-wrap gap-1">
                {achievements.slice(0, 2).map((achievement, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {achievement}
                  </Badge>
                ))}
                {achievements.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{achievements.length - 2} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BMI Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-purple-500" />
              Calculate BMI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Weight (kg)"
                  value={weight}
                  onChange={e => setWeight(e.target.value.replace(/[^0-9.]/g, ''))}
                  type="number"
                  className="text-lg p-3"
                />
                <Input
                  placeholder="Height (cm)"
                  value={height}
                  onChange={e => setHeight(e.target.value.replace(/[^0-9.]/g, ''))}
                  type="number"
                  className="text-lg p-3"
                />
              </div>
              
              <Button 
                onClick={saveBMIRecord}
                disabled={!weight || !height} 
                className="w-full text-lg py-3"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate & Save BMI
              </Button>
              
              {bmi > 0 && (
                <div className="text-center space-y-4 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="text-6xl font-bold text-purple-600">{bmi}</div>
                    <Badge className={`${category.color} text-lg px-4 py-2`}>{category.label}</Badge>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    {getTrendIcon()}
                    <p className="text-sm text-muted-foreground">
                      {category.advice}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Target BMI Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-500" />
                Target BMI
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowTargetSetter(!showTargetSetter)}
              >
                Set Target
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showTargetSetter && (
              <div className="space-y-4 mb-4">
                <Input
                  placeholder="Target BMI (e.g., 22.5)"
                  value={targetBMI}
                  onChange={e => setTargetBMI(parseFloat(e.target.value) || 22.5)}
                  type="number"
                  step="0.1"
                />
                <Button onClick={() => {
                  localStorage.setItem('bmiTarget', targetBMI.toString());
                  setShowTargetSetter(false);
                }}>
                  Save Target
                </Button>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current: {bmi || 'Not calculated'}</span>
                <span className="text-sm text-muted-foreground">Target: {targetBMI}</span>
              </div>
              <Progress value={getProgressToTarget()} className="h-3" />
              <p className="text-xs text-center text-muted-foreground">
                {bmi ? `${Math.abs(bmi - targetBMI).toFixed(1)} points ${bmi > targetBMI ? 'above' : 'below'} target` : 'Calculate BMI to see progress'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* BMI History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2 text-blue-500" />
              BMI History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bmiHistory.length > 0 ? (
              <div className="space-y-3">
                {bmiHistory.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-start justify-between p-4 border rounded-lg gap-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Scale className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-lg text-purple-600">{record.bmi}</div>
                        <div className="text-sm text-muted-foreground truncate">{record.category}</div>
                        <div className="text-xs text-muted-foreground">
                          Weight: {record.weight}kg • Height: {record.height}cm
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-muted-foreground whitespace-nowrap">{record.date}</div>
                      <div className="text-xs text-purple-600 mt-1">
                        BMI: {record.bmi}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No BMI records yet. Calculate your first BMI to start tracking!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Health Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-500" />
              Health Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-3 border rounded-lg">
                <Heart className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <p className="font-medium text-sm">Heart Health</p>
                  <p className="text-xs text-muted-foreground">Healthy BMI reduces heart disease risk</p>
                </div>
              </div>
              <div className="flex items-center p-3 border rounded-lg">
                <Zap className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <p className="font-medium text-sm">Energy Levels</p>
                  <p className="text-xs text-muted-foreground">Optimal weight boosts daily energy</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BMICalculator;
