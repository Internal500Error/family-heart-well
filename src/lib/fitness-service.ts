/**
 * Fitness Service - Step Tracking and Fitness Data Management
 * Handles step tracking, fitness goals, and activity monitoring
 */

import DatabaseService, { StepData, CreateStepDataRequest } from './database';
import EnhancedStepTrackerService from './enhanced-step-tracker';

export interface FitnessGoals {
  dailySteps: number;
  weeklyDistance: number;
  monthlyCalories: number;
  waterIntake: number;
}

export interface ActivitySummary {
  date: string;
  steps: number;
  distance: number;
  calories: number;
  activeMinutes: number;
  waterIntake: number;
  goalProgress: {
    steps: number;
    distance: number;
    calories: number;
    water: number;
  };
}

export interface WeeklyStats {
  totalSteps: number;
  averageSteps: number;
  totalDistance: number;
  totalCalories: number;
  activeDays: number;
  bestDay: {
    date: string;
    steps: number;
  };
  dailyData: Array<{
    date: string;
    steps: number;
    distance: number;
    calories: number;
  }>;
}

export interface FitnessAchievements {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedDate?: Date;
  icon: string;
  category: 'steps' | 'distance' | 'consistency' | 'goals';
}

class FitnessService {
  private static instance: FitnessService;
  private db: DatabaseService;
  private stepTracker: EnhancedStepTrackerService;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.stepTracker = EnhancedStepTrackerService.getInstance();
  }

  static getInstance(): FitnessService {
    if (!FitnessService.instance) {
      FitnessService.instance = new FitnessService();
    }
    return FitnessService.instance;
  }

  async initialize(): Promise<void> {
    await this.db.initialize();
    await this.stepTracker.initialize();
    this.startDataSync();
  }

  // Step Data Management
  async syncStepData(): Promise<StepData | null> {
    try {
      const userId = this.getCurrentUserId();
      const stepTrackerData = await this.stepTracker.getStepData();
      
      if (!stepTrackerData) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if we already have data for today
      const existingData = await this.db.getStepData(userId, today, new Date(today.getTime() + 24 * 60 * 60 * 1000));
      
      const stepData: Omit<CreateStepDataRequest, 'userId'> = {
        date: today,
        steps: stepTrackerData.steps,
        distance: stepTrackerData.distance,
        calories: stepTrackerData.calories,
        activeMinutes: stepTrackerData.activeMinutes || 0,
        source: stepTrackerData.source || 'device',
        accuracy: stepTrackerData.accuracy || 0.8,
      };

      if (existingData.length > 0) {
        // Update existing data
        return await this.db.updateStepData(existingData[0].id, stepData);
      } else {
        // Create new data
        return await this.db.addStepData({
          ...stepData,
          userId,
        });
      }
    } catch (error) {
      console.error('Error syncing step data:', error);
      return null;
    }
  }

  async getStepData(days: number = 7): Promise<StepData[]> {
    const userId = this.getCurrentUserId();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    return await this.db.getStepData(userId, startDate, endDate);
  }

  async getTodaySteps(): Promise<StepData | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userId = this.getCurrentUserId();
    const data = await this.db.getStepData(userId, today, tomorrow);
    
    return data.length > 0 ? data[0] : null;
  }

  // Fitness Goals Management
  async setFitnessGoals(goals: FitnessGoals): Promise<void> {
    const userId = this.getCurrentUserId();
    localStorage.setItem(`dilcare_fitness_goals_${userId}`, JSON.stringify(goals));
  }

  async getFitnessGoals(): Promise<FitnessGoals> {
    const userId = this.getCurrentUserId();
    const stored = localStorage.getItem(`dilcare_fitness_goals_${userId}`);
    
    if (stored) {
      return JSON.parse(stored);
    }

    // Default goals
    const defaultGoals: FitnessGoals = {
      dailySteps: 10000,
      weeklyDistance: 50, // km
      monthlyCalories: 50000,
      waterIntake: 8, // glasses
    };

    await this.setFitnessGoals(defaultGoals);
    return defaultGoals;
  }

  // Activity Summary
  async getTodayActivity(): Promise<ActivitySummary> {
    const todaySteps = await this.getTodaySteps();
    const goals = await this.getFitnessGoals();
    const today = new Date().toISOString().split('T')[0];

    const steps = todaySteps?.steps || 0;
    const distance = todaySteps?.distance || 0;
    const calories = todaySteps?.calories || 0;
    const activeMinutes = todaySteps?.activeMinutes || 0;
    
    // Get water intake for today
    const userId = this.getCurrentUserId();
    const waterData = await this.db.getWaterIntake(userId, new Date());
    const waterIntake = waterData.reduce((sum, entry) => sum + entry.amount, 0);

    return {
      date: today,
      steps,
      distance,
      calories,
      activeMinutes,
      waterIntake,
      goalProgress: {
        steps: Math.min(100, (steps / goals.dailySteps) * 100),
        distance: Math.min(100, (distance / (goals.weeklyDistance / 7)) * 100),
        calories: Math.min(100, (calories / (goals.monthlyCalories / 30)) * 100),
        water: Math.min(100, (waterIntake / goals.waterIntake) * 100),
      },
    };
  }

  // Weekly Statistics
  async getWeeklyStats(): Promise<WeeklyStats> {
    const stepData = await this.getStepData(7);
    
    const totalSteps = stepData.reduce((sum, day) => sum + day.steps, 0);
    const totalDistance = stepData.reduce((sum, day) => sum + day.distance, 0);
    const totalCalories = stepData.reduce((sum, day) => sum + day.calories, 0);
    const activeDays = stepData.filter(day => day.steps > 1000).length;
    
    const averageSteps = stepData.length > 0 ? Math.round(totalSteps / stepData.length) : 0;
    
    const bestDay = stepData.reduce((best, day) => 
      day.steps > best.steps ? day : best,
      { date: '', steps: 0 }
    );

    const dailyData = stepData.map(day => ({
      date: day.date.toISOString().split('T')[0],
      steps: day.steps,
      distance: day.distance,
      calories: day.calories,
    }));

    return {
      totalSteps,
      averageSteps,
      totalDistance,
      totalCalories,
      activeDays,
      bestDay: {
        date: bestDay.date.toISOString().split('T')[0],
        steps: bestDay.steps,
      },
      dailyData,
    };
  }

  // Water Intake Management
  async addWaterIntake(glasses: number = 1): Promise<void> {
    const userId = this.getCurrentUserId();
    await this.db.addWaterIntake({
      userId,
      amount: glasses,
      timestamp: new Date(),
    });
  }

  async getTodayWaterIntake(): Promise<number> {
    const userId = this.getCurrentUserId();
    const today = new Date();
    const waterData = await this.db.getWaterIntake(userId, today);
    
    return waterData.reduce((sum, entry) => sum + entry.amount, 0);
  }

  async getWeeklyWaterIntake(): Promise<Array<{ date: string; amount: number }>> {
    const userId = this.getCurrentUserId();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const waterData = await this.db.getWaterIntake(userId, date);
      const amount = waterData.reduce((sum, entry) => sum + entry.amount, 0);
      
      weekData.push({
        date: date.toISOString().split('T')[0],
        amount,
      });
    }
    
    return weekData;
  }

  // Achievements System
  async getAchievements(): Promise<FitnessAchievements[]> {
    const stepData = await this.getStepData(30);
    const goals = await this.getFitnessGoals();
    
    const achievements: FitnessAchievements[] = [
      {
        id: 'first_steps',
        title: 'First Steps',
        description: 'Record your first day of steps',
        achieved: stepData.length > 0,
        achievedDate: stepData.length > 0 ? stepData[0].date : undefined,
        icon: '👣',
        category: 'steps',
      },
      {
        id: 'daily_goal',
        title: 'Daily Walker',
        description: `Reach ${goals.dailySteps.toLocaleString()} steps in a day`,
        achieved: stepData.some(day => day.steps >= goals.dailySteps),
        achievedDate: stepData.find(day => day.steps >= goals.dailySteps)?.date,
        icon: '🎯',
        category: 'goals',
      },
      {
        id: 'week_consistency',
        title: 'Consistent Walker',
        description: 'Walk for 7 consecutive days',
        achieved: stepData.length >= 7 && stepData.slice(-7).every(day => day.steps > 1000),
        icon: '📅',
        category: 'consistency',
      },
      {
        id: 'distance_milestone',
        title: 'Distance Explorer',
        description: 'Walk 10km in a single day',
        achieved: stepData.some(day => day.distance >= 10),
        achievedDate: stepData.find(day => day.distance >= 10)?.date,
        icon: '🗺️',
        category: 'distance',
      },
      {
        id: 'calorie_burner',
        title: 'Calorie Crusher',
        description: 'Burn 500+ calories through walking',
        achieved: stepData.some(day => day.calories >= 500),
        achievedDate: stepData.find(day => day.calories >= 500)?.date,
        icon: '🔥',
        category: 'goals',
      },
    ];

    return achievements;
  }

  // Data Sync
  private startDataSync(): void {
    // Sync step data every 5 minutes
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncStepData();
      } catch (error) {
        console.error('Error in automatic step data sync:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Real-time step tracking
  async getCurrentSteps(): Promise<number> {
    try {
      const stepTrackerData = await this.stepTracker.getStepData();
      return stepTrackerData?.steps || 0;
    } catch (error) {
      console.error('Error getting current steps:', error);
      return 0;
    }
  }

  async isGoogleFitConnected(): Promise<boolean> {
    return await this.stepTracker.isGoogleFitConnected();
  }

  async connectGoogleFit(): Promise<boolean> {
    return await this.stepTracker.connectToGoogleFit();
  }

  async disconnectGoogleFit(): Promise<void> {
    await this.stepTracker.disconnectGoogleFit();
  }

  async getDataSource(): Promise<string> {
    return await this.stepTracker.getDataSource();
  }

  async getAccuracy(): Promise<number> {
    const stepTrackerData = await this.stepTracker.getStepData();
    return stepTrackerData?.accuracy || 0.8;
  }

  // Utility Methods
  private getCurrentUserId(): string {
    const userId = localStorage.getItem('dilcare_user_id');
    if (!userId) {
      throw new Error('No user logged in');
    }
    return userId;
  }

  // Health recommendations based on activity
  getActivityRecommendations(steps: number, goals: FitnessGoals): string[] {
    const recommendations: string[] = [];
    const progressPercent = (steps / goals.dailySteps) * 100;

    if (progressPercent < 25) {
      recommendations.push('Take a 10-minute walk to get started');
      recommendations.push('Use stairs instead of elevators');
      recommendations.push('Park farther away from your destination');
    } else if (progressPercent < 50) {
      recommendations.push('Great start! Try a longer walk after lunch');
      recommendations.push('Consider walking meetings when possible');
    } else if (progressPercent < 75) {
      recommendations.push('You\'re doing well! Keep up the momentum');
      recommendations.push('Add some light stretching to your routine');
    } else if (progressPercent < 100) {
      recommendations.push('Almost there! A short evening walk will complete your goal');
      recommendations.push('Stay hydrated as you finish strong');
    } else {
      recommendations.push('Congratulations! You\'ve met your daily goal');
      recommendations.push('Consider setting a new challenge for tomorrow');
      recommendations.push('Remember to rest and recover');
    }

    return recommendations;
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export default FitnessService;
