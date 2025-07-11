
import React, { useState } from 'react';
import { 
  BookOpen, 
  Apple, 
  Dumbbell, 
  Wind, 
  Heart,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Star,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface GyaanTip {
  id: string;
  category: 'nutrition' | 'exercise' | 'meditation' | 'ayurveda';
  title: string;
  description: string;
  content: string;
  duration?: number; // in minutes
  completed: boolean;
  favorite: boolean;
  streak?: number;
}

const GyaanCorner = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  const [tips, setTips] = useState<GyaanTip[]>([
    {
      id: '1',
      category: 'nutrition',
      title: 'Morning Lemon Water',
      description: 'Start your day with warm lemon water for better digestion',
      content: 'Squeeze half a lemon in a glass of warm water. Drink it first thing in the morning on an empty stomach. This helps boost metabolism, aids digestion, and provides vitamin C.',
      completed: true,
      favorite: true,
      streak: 7
    },
    {
      id: '2',
      category: 'exercise',
      title: 'Gentle Morning Stretches',
      description: '5-minute stretching routine for flexibility',
      content: '1. Neck rolls (5 each direction)\n2. Shoulder shrugs (10 times)\n3. Arm circles (10 each direction)\n4. Gentle spinal twists (5 each side)\n5. Ankle rolls (10 each foot)',
      duration: 5,
      completed: false,
      favorite: false
    },
    {
      id: '3',
      category: 'meditation',
      title: 'Deep Breathing Exercise',
      description: '3-minute breathing technique for relaxation',
      content: 'Sit comfortably with your back straight. Breathe in slowly through your nose for 4 counts, hold for 4 counts, then exhale through your mouth for 6 counts. Repeat this cycle.',
      duration: 3,
      completed: false,
      favorite: true
    },
    {
      id: '4',
      category: 'ayurveda',
      title: 'Turmeric Golden Milk',
      description: 'Anti-inflammatory bedtime drink',
      content: 'Mix 1 tsp turmeric powder, pinch of black pepper, 1 tsp honey in warm milk. Drink before bedtime. This helps reduce inflammation and promotes better sleep.',
      completed: false,
      favorite: false
    }
  ]);

  const categories = [
    { id: 'all', label: 'All Tips', icon: BookOpen, color: 'text-primary' },
    { id: 'nutrition', label: 'Nutrition', icon: Apple, color: 'text-health-good' },
    { id: 'exercise', label: 'Exercise', icon: Dumbbell, color: 'text-medicine' },
    { id: 'meditation', label: 'Meditation', icon: Wind, color: 'text-calm' },
    { id: 'ayurveda', label: 'Ayurveda', icon: Heart, color: 'text-primary' }
  ];

  const filteredTips = selectedCategory === 'all' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory);

  const toggleComplete = (id: string) => {
    setTips(tips.map(tip => 
      tip.id === id ? { ...tip, completed: !tip.completed } : tip
    ));
  };

  const toggleFavorite = (id: string) => {
    setTips(tips.map(tip => 
      tip.id === id ? { ...tip, favorite: !tip.favorite } : tip
    ));
  };

  const startTimer = (id: string, duration: number) => {
    setActiveTimer(id);
    setTimerSeconds(duration * 60);
    // Timer logic would go here
  };

  const completedToday = tips.filter(tip => tip.completed).length;
  const totalTips = tips.length;
  const completionPercentage = (completedToday / totalTips) * 100;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <div className="bg-calm/20 rounded-full p-4 w-fit mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-calm" />
        </div>
        <h1 className="text-2xl font-poppins font-semibold mb-2">Gyaan Corner</h1>
        <p className="text-muted-foreground">Daily wisdom for healthy living</p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-calm/10 to-primary/10 border-calm/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-calm">Today's Progress</h3>
            <Badge variant="secondary">{completedToday}/{totalTips} completed</Badge>
          </div>
          <Progress value={completionPercentage} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Keep going! Small steps lead to big changes 🌱
          </p>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {categories.slice(0, 3).map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex flex-col items-center p-3 h-auto"
          >
            <category.icon className={`h-4 w-4 mb-1 ${category.color}`} />
            <span className="text-xs">{category.label}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {categories.slice(3).map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center justify-center p-3"
          >
            <category.icon className={`h-4 w-4 mr-2 ${category.color}`} />
            <span className="text-xs">{category.label}</span>
          </Button>
        ))}
      </div>

      {/* Tips List */}
      <div>
        <h2 className="text-lg font-poppins font-semibold mb-4 flex items-center">
          {selectedCategory === 'all' ? (
            <>
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              All Health Tips
            </>
          ) : (
            <>
              {categories.find(c => c.id === selectedCategory)?.icon && (
                React.createElement(categories.find(c => c.id === selectedCategory)!.icon, {
                  className: `h-5 w-5 mr-2 ${categories.find(c => c.id === selectedCategory)!.color}`
                })
              )}
              {categories.find(c => c.id === selectedCategory)?.label} Tips
            </>
          )}
        </h2>
        
        {filteredTips.map((tip) => (
          <Card key={tip.id} className={`mb-4 ${tip.completed ? 'bg-green-50 border-health-good/30' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base mb-1 flex items-center">
                    {tip.title}
                    {tip.streak && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {tip.streak} day streak 🔥
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                  {tip.duration && (
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {tip.duration} minutes
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(tip.id)}
                  className="p-2"
                >
                  <Star 
                    className={`h-4 w-4 ${tip.favorite ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} 
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {tip.content}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {tip.duration ? (
                  <>
                    <Button
                      variant={activeTimer === tip.id ? "secondary" : "default"}
                      size="sm"
                      onClick={() => startTimer(tip.id, tip.duration!)}
                      className="flex-1"
                    >
                      {activeTimer === tip.id ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Timer
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleComplete(tip.id)}
                      className={tip.completed ? "bg-health-good text-white hover:bg-health-good/80" : ""}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant={tip.completed ? "secondary" : "default"}
                    size="sm"
                    onClick={() => toggleComplete(tip.id)}
                    className={`flex-1 ${tip.completed ? "bg-health-good text-white hover:bg-health-good/80" : ""}`}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {tip.completed ? 'Completed!' : 'Mark as Done'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Featured Tip */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/20 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-primary/20 rounded-full p-2">
              <Heart className="h-5 w-5 text-primary animate-heart-beat" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Today's Special Tip</h3>
              <p className="text-sm text-foreground leading-relaxed">
                Practice gratitude! Before sleeping, think of 3 good things that happened today. 
                This simple practice can improve your mood and sleep quality. 🙏✨
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GyaanCorner;
