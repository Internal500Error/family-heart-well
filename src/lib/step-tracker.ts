/**
 * Advanced Step Tracker Service
 * Provides accurate step counting, activity analysis, and health insights
 */

interface StepData {
  steps: number;
  timestamp: Date;
  calories: number;
  distance: number; // in kilometers
  activeMinutes: number;
  stepRate: number; // steps per minute
}

interface DailyStepGoal {
  target: number;
  achieved: number;
  percentage: number;
  streak: number;
}

interface ActivityPattern {
  peakHours: string[];
  averageStepsPerHour: number;
  sedentaryPeriods: string[];
  mostActiveDay: string;
  weeklyTrend: 'increasing' | 'decreasing' | 'stable';
}

interface StepInsight {
  type: 'achievement' | 'motivation' | 'health' | 'pattern';
  title: string;
  message: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

export class StepTrackerService {
  private static instance: StepTrackerService;
  private stepHistory: StepData[] = [];
  private dailyGoal: number = 10000;
  private currentDaySteps: number = 0;
  private lastUpdateTime: Date = new Date();
  private accelerometerData: DeviceMotionEvent | null = null;
  private stepDetectionSensitivity: number = 1.5;
  private isTracking: boolean = false;

  static getInstance(): StepTrackerService {
    if (!StepTrackerService.instance) {
      StepTrackerService.instance = new StepTrackerService();
    }
    return StepTrackerService.instance;
  }

  // Initialize step tracking with device sensors
  async initializeStepTracking(): Promise<boolean> {
    try {
      // Request device motion permissions
      if (typeof DeviceMotionEvent !== 'undefined' && (DeviceMotionEvent as any).requestPermission) {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== 'granted') {
          throw new Error('Device motion permission denied');
        }
      }

      // Start listening to accelerometer data
      this.startAccelerometerTracking();
      
      // Load historical data
      await this.loadStepHistory();
      
      this.isTracking = true;
      return true;
    } catch (error) {
      console.warn('Step tracking initialization failed:', error);
      // Fall back to manual/estimated tracking
      this.initializeFallbackTracking();
      return false;
    }
  }

  private startAccelerometerTracking(): void {
    if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', (event) => {
        this.processAccelerometerData(event);
      });
    }
  }

  private processAccelerometerData(event: DeviceMotionEvent): void {
    if (!event.accelerationIncludingGravity) return;

    const { x, y, z } = event.accelerationIncludingGravity;
    if (x === null || y === null || z === null) return;

    // Calculate total acceleration magnitude
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    
    // Detect step based on acceleration threshold and pattern
    if (this.detectStep(acceleration)) {
      this.incrementStepCount();
    }
  }

  private detectStep(acceleration: number): boolean {
    // Simple step detection algorithm
    // In production, you'd use more sophisticated algorithms
    const threshold = 10 + this.stepDetectionSensitivity;
    
    // Basic peak detection with timing constraints
    const now = Date.now();
    const timeSinceLastStep = now - (this.lastUpdateTime?.getTime() || 0);
    
    // Minimum 300ms between steps (200 steps/min max)
    if (timeSinceLastStep < 300) return false;
    
    if (acceleration > threshold) {
      this.lastUpdateTime = new Date();
      return true;
    }
    
    return false;
  }

  private initializeFallbackTracking(): void {
    // Simulate step tracking based on activity patterns
    this.isTracking = true;
    console.log('Using fallback step tracking mode');
  }

  private incrementStepCount(): void {
    this.currentDaySteps++;
    
    // Update step data every 100 steps for performance
    if (this.currentDaySteps % 100 === 0) {
      this.updateStepData();
    }
  }

  private updateStepData(): void {
    const now = new Date();
    const calories = this.calculateCalories(this.currentDaySteps);
    const distance = this.calculateDistance(this.currentDaySteps);
    const activeMinutes = this.calculateActiveMinutes();
    const stepRate = this.calculateStepRate();

    const stepData: StepData = {
      steps: this.currentDaySteps,
      timestamp: now,
      calories,
      distance,
      activeMinutes,
      stepRate
    };

    this.stepHistory.push(stepData);
    this.saveStepHistory();
  }

  // Manual step entry for testing or when sensors aren't available
  addManualSteps(steps: number): void {
    this.currentDaySteps += steps;
    this.updateStepData();
  }

  // Get current day's step count
  getCurrentSteps(): number {
    return this.currentDaySteps;
  }

  // Set daily step goal
  setDailyGoal(goal: number): void {
    this.dailyGoal = goal;
    this.saveDailyGoal();
  }

  // Get daily goal progress
  getDailyGoalProgress(): DailyStepGoal {
    const achieved = this.currentDaySteps;
    const percentage = Math.min(100, Math.round((achieved / this.dailyGoal) * 100));
    const streak = this.calculateStreak();

    return {
      target: this.dailyGoal,
      achieved,
      percentage,
      streak
    };
  }

  // Calculate calories burned based on steps
  private calculateCalories(steps: number): number {
    // Average: 0.04-0.05 calories per step (varies by weight, age, intensity)
    const caloriesPerStep = 0.045;
    return Math.round(steps * caloriesPerStep);
  }

  // Calculate distance based on steps
  private calculateDistance(steps: number): number {
    // Average stride length: 0.7-0.8 meters
    const averageStrideLength = 0.75; // meters
    const distanceMeters = steps * averageStrideLength;
    return parseFloat((distanceMeters / 1000).toFixed(2)); // Convert to km
  }

  // Calculate active minutes based on step rate
  private calculateActiveMinutes(): number {
    // Consider active if step rate > 100 steps/minute
    const activeThreshold = 100;
    const recentData = this.stepHistory.slice(-60); // Last hour
    
    return recentData.filter(data => data.stepRate > activeThreshold).length;
  }

  // Calculate current step rate (steps per minute)
  private calculateStepRate(): number {
    const recentSteps = this.stepHistory.slice(-5); // Last 5 minutes
    if (recentSteps.length < 2) return 0;
    
    const totalSteps = recentSteps.reduce((sum, data) => sum + data.steps, 0);
    const timeSpanMinutes = recentSteps.length;
    
    return Math.round(totalSteps / timeSpanMinutes);
  }

  // Get weekly step data
  getWeeklyStepData(): StepData[] {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.stepHistory.filter(data => data.timestamp >= oneWeekAgo);
  }

  // Analyze activity patterns
  analyzeActivityPatterns(): ActivityPattern {
    const weeklyData = this.getWeeklyStepData();
    
    // Group by hour to find peak activity times
    const hourlySteps: { [hour: number]: number } = {};
    weeklyData.forEach(data => {
      const hour = data.timestamp.getHours();
      hourlySteps[hour] = (hourlySteps[hour] || 0) + data.steps;
    });

    // Find peak hours (top 3)
    const peakHours = Object.entries(hourlySteps)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    // Calculate average steps per hour
    const totalHours = Object.keys(hourlySteps).length;
    const totalSteps = Object.values(hourlySteps).reduce((sum, steps) => sum + steps, 0);
    const averageStepsPerHour = totalHours > 0 ? Math.round(totalSteps / totalHours) : 0;

    // Find sedentary periods (hours with low activity)
    const sedentaryThreshold = averageStepsPerHour * 0.3;
    const sedentaryPeriods = Object.entries(hourlySteps)
      .filter(([, steps]) => steps < sedentaryThreshold)
      .map(([hour]) => `${hour}:00`);

    // Find most active day
    const dailySteps: { [day: string]: number } = {};
    weeklyData.forEach(data => {
      const day = data.timestamp.toLocaleDateString();
      dailySteps[day] = (dailySteps[day] || 0) + data.steps;
    });
    
    const mostActiveDay = Object.entries(dailySteps)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data';

    // Determine weekly trend
    const weeklyTrend = this.calculateWeeklyTrend(weeklyData);

    return {
      peakHours,
      averageStepsPerHour,
      sedentaryPeriods,
      mostActiveDay,
      weeklyTrend
    };
  }

  private calculateWeeklyTrend(weeklyData: StepData[]): 'increasing' | 'decreasing' | 'stable' {
    if (weeklyData.length < 7) return 'stable';
    
    const firstHalf = weeklyData.slice(0, Math.floor(weeklyData.length / 2));
    const secondHalf = weeklyData.slice(Math.floor(weeklyData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, data) => sum + data.steps, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, data) => sum + data.steps, 0) / secondHalf.length;
    
    const difference = secondHalfAvg - firstHalfAvg;
    const threshold = firstHalfAvg * 0.1; // 10% change threshold
    
    if (difference > threshold) return 'increasing';
    if (difference < -threshold) return 'decreasing';
    return 'stable';
  }

  // Generate AI-powered step insights
  generateStepInsights(): StepInsight[] {
    const insights: StepInsight[] = [];
    const progress = this.getDailyGoalProgress();
    const patterns = this.analyzeActivityPatterns();
    const currentHour = new Date().getHours();

    // Goal achievement insights
    if (progress.percentage >= 100) {
      insights.push({
        type: 'achievement',
        title: 'Goal Achieved!',
        message: `Congratulations! You've reached your daily goal of ${progress.target} steps. ${progress.streak > 1 ? `That's ${progress.streak} days in a row!` : ''}`,
        actionable: false,
        priority: 'high'
      });
    } else if (progress.percentage >= 80) {
      const remaining = progress.target - progress.achieved;
      insights.push({
        type: 'motivation',
        title: 'Almost There!',
        message: `You're ${progress.percentage}% to your goal. Just ${remaining} more steps to go!`,
        actionable: true,
        priority: 'medium'
      });
    }

    // Activity pattern insights
    if (patterns.sedentaryPeriods.length > 6) {
      insights.push({
        type: 'health',
        title: 'Move More',
        message: `You have ${patterns.sedentaryPeriods.length} low-activity hours. Try to take short walks every hour.`,
        actionable: true,
        priority: 'medium'
      });
    }

    // Trend insights
    if (patterns.weeklyTrend === 'increasing') {
      insights.push({
        type: 'pattern',
        title: 'Great Progress!',
        message: 'Your weekly activity is trending upward. Keep up the excellent work!',
        actionable: false,
        priority: 'low'
      });
    } else if (patterns.weeklyTrend === 'decreasing') {
      insights.push({
        type: 'motivation',
        title: 'Stay Active',
        message: 'Your activity has decreased this week. Consider setting smaller daily goals to build momentum.',
        actionable: true,
        priority: 'high'
      });
    }

    // Time-based insights
    if (currentHour >= 9 && currentHour <= 17 && progress.percentage < 30) {
      insights.push({
        type: 'motivation',
        title: 'Workday Movement',
        message: 'Take the stairs, walk during lunch, or have walking meetings to boost your step count.',
        actionable: true,
        priority: 'medium'
      });
    }

    return insights;
  }

  // Calculate streak of days meeting goal
  private calculateStreak(): number {
    const dailyGoals = this.getDailyGoalHistory();
    let streak = 0;
    
    // Count consecutive days from most recent
    for (let i = dailyGoals.length - 1; i >= 0; i--) {
      if (dailyGoals[i].achieved >= dailyGoals[i].target) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private getDailyGoalHistory(): DailyStepGoal[] {
    // Group steps by day and check against daily goals
    const dailyData: { [date: string]: number } = {};
    
    this.stepHistory.forEach(data => {
      const dateKey = data.timestamp.toDateString();
      dailyData[dateKey] = Math.max(dailyData[dateKey] || 0, data.steps);
    });
    
    return Object.entries(dailyData).map(([date, steps]) => ({
      target: this.dailyGoal,
      achieved: steps,
      percentage: Math.round((steps / this.dailyGoal) * 100),
      streak: 0 // Individual day streak not applicable
    }));
  }

  // Simulate step data for demo purposes
  simulateStepData(): void {
    const now = new Date();
    const baseSteps = Math.floor(Math.random() * 3000) + 7000; // 7000-10000 steps
    
    this.currentDaySteps = baseSteps;
    this.updateStepData();
    
    // Add some historical data
    for (let i = 7; i > 0; i--) {
      const pastDate = new Date(now);
      pastDate.setDate(pastDate.getDate() - i);
      
      const historicalSteps = Math.floor(Math.random() * 5000) + 6000; // 6000-11000 steps
      
      this.stepHistory.push({
        steps: historicalSteps,
        timestamp: pastDate,
        calories: this.calculateCalories(historicalSteps),
        distance: this.calculateDistance(historicalSteps),
        activeMinutes: Math.floor(Math.random() * 120) + 30,
        stepRate: Math.floor(Math.random() * 50) + 80
      });
    }
  }

  // Persistence methods
  private async loadStepHistory(): Promise<void> {
    try {
      const saved = localStorage.getItem('dilcare_step_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.stepHistory = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
      
      const savedGoal = localStorage.getItem('dilcare_daily_step_goal');
      if (savedGoal) {
        this.dailyGoal = parseInt(savedGoal);
      }
      
      const savedCurrentSteps = localStorage.getItem('dilcare_current_steps');
      const savedDate = localStorage.getItem('dilcare_step_date');
      const today = new Date().toDateString();
      
      if (savedCurrentSteps && savedDate === today) {
        this.currentDaySteps = parseInt(savedCurrentSteps);
      } else {
        // New day, reset current steps
        this.currentDaySteps = 0;
        localStorage.setItem('dilcare_step_date', today);
      }
    } catch (error) {
      console.error('Error loading step history:', error);
    }
  }

  private saveStepHistory(): void {
    try {
      localStorage.setItem('dilcare_step_history', JSON.stringify(this.stepHistory));
      localStorage.setItem('dilcare_current_steps', this.currentDaySteps.toString());
      localStorage.setItem('dilcare_step_date', new Date().toDateString());
    } catch (error) {
      console.error('Error saving step history:', error);
    }
  }

  private saveDailyGoal(): void {
    try {
      localStorage.setItem('dilcare_daily_step_goal', this.dailyGoal.toString());
    } catch (error) {
      console.error('Error saving daily goal:', error);
    }
  }

  // Get tracking status
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  // Stop tracking
  stopTracking(): void {
    this.isTracking = false;
    // Save final data
    this.updateStepData();
  }
}

export default StepTrackerService;
