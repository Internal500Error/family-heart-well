/**
 * Enhanced Step Tracker Service with Google Fit Integration
 * Combines local step tracking with Google Fit API for maximum accuracy
 */

import GoogleFitService, { GoogleFitData } from './google-fit';

interface EnhancedStepData extends GoogleFitData {
  source: 'google-fit' | 'device-sensors' | 'manual';
  accuracy: 'high' | 'medium' | 'low';
  lastSync: Date;
}

interface StepGoal {
  daily: number;
  weekly: number;
  monthly: number;
}

interface StepInsight {
  type: 'achievement' | 'trend' | 'recommendation' | 'health-tip';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  data?: any;
}

class EnhancedStepTrackerService {
  private static instance: EnhancedStepTrackerService;
  private googleFit: GoogleFitService;
  private isGoogleFitEnabled = false;
  private lastDataSync = new Date(0);
  private cachedData: EnhancedStepData | null = null;
  private goals: StepGoal = { daily: 10000, weekly: 70000, monthly: 300000 };

  private constructor() {
    this.googleFit = GoogleFitService.getInstance();
    this.initializeGoogleFit();
  }

  static getInstance(): EnhancedStepTrackerService {
    if (!EnhancedStepTrackerService.instance) {
      EnhancedStepTrackerService.instance = new EnhancedStepTrackerService();
    }
    return EnhancedStepTrackerService.instance;
  }

  /**
   * Initialize Google Fit integration
   */
  private async initializeGoogleFit(): Promise<void> {
    try {
      const initialized = await this.googleFit.initialize();
      if (initialized) {
        console.log('Google Fit integration ready');
      }
    } catch (error) {
      console.warn('Google Fit initialization failed, falling back to device sensors:', error);
    }
  }

  /**
   * Connect to Google Fit (user action required)
   */
  async connectGoogleFit(): Promise<boolean> {
    try {
      const authenticated = await this.googleFit.authenticate();
      if (authenticated) {
        this.isGoogleFitEnabled = true;
        await this.syncGoogleFitData();
        console.log('Successfully connected to Google Fit');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect to Google Fit:', error);
      return false;
    }
  }

  /**
   * Disconnect from Google Fit
   */
  async disconnectGoogleFit(): Promise<void> {
    try {
      await this.googleFit.signOut();
      this.isGoogleFitEnabled = false;
      this.cachedData = null;
      console.log('Disconnected from Google Fit');
    } catch (error) {
      console.error('Error disconnecting from Google Fit:', error);
    }
  }

  /**
   * Get current step data with best available source
   */
  async getCurrentStepData(): Promise<EnhancedStepData> {
    try {
      // Try Google Fit first if enabled
      if (this.isGoogleFitEnabled && this.googleFit.isAuthenticated()) {
        const shouldSync = this.shouldSyncData();
        if (shouldSync || !this.cachedData) {
          await this.syncGoogleFitData();
        }
        
        if (this.cachedData) {
          return this.cachedData;
        }
      }

      // Fallback to device sensors (existing implementation)
      return await this.getDeviceSensorData();
    } catch (error) {
      console.error('Failed to get step data:', error);
      return await this.getDeviceSensorData();
    }
  }

  /**
   * Sync data from Google Fit
   */
  private async syncGoogleFitData(): Promise<void> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const googleFitData = await this.googleFit.getFitnessData(startOfDay, today);
      
      this.cachedData = {
        ...googleFitData,
        source: 'google-fit',
        accuracy: 'high',
        lastSync: new Date()
      };
      
      this.lastDataSync = new Date();
      console.log('Google Fit data synced successfully');
    } catch (error) {
      console.error('Failed to sync Google Fit data:', error);
      throw error;
    }
  }

  /**
   * Get data from device sensors (fallback)
   */
  private async getDeviceSensorData(): Promise<EnhancedStepData> {
    // Get data from localStorage
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem(`steps_${today}`);
    
    let basicData = {
      steps: 0,
      distance: 0,
      calories: 0,
      activeMinutes: 0,
      activities: []
    };

    if (storedData) {
      basicData = JSON.parse(storedData);
    }

    // Calculate derived metrics
    basicData.distance = Math.round((basicData.steps * 0.75 / 1000) * 100) / 100;
    basicData.calories = Math.round(basicData.steps * 0.045);
    basicData.activeMinutes = Math.round(basicData.steps / 100);

    return {
      ...basicData,
      source: 'device-sensors',
      accuracy: 'medium',
      lastSync: new Date()
    };
  }

  /**
   * Check if data should be synced
   */
  private shouldSyncData(): boolean {
    const now = new Date();
    const timeSinceLastSync = now.getTime() - this.lastDataSync.getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    return timeSinceLastSync > fiveMinutes;
  }

  /**
   * Get weekly step data for charts
   */
  async getWeeklyData(): Promise<Array<{date: string, steps: number, calories: number, distance: number, activeMinutes: number}>> {
    try {
      if (this.isGoogleFitEnabled && this.googleFit.isAuthenticated()) {
        return await this.googleFit.getWeeklyStepData();
      }
      
      // Get stored data from localStorage
      return this.getStoredWeeklyData();
    } catch (error) {
      console.error('Failed to get weekly data:', error);
      return this.getStoredWeeklyData();
    }
  }

  /**
   * Get stored weekly data from localStorage
   */
  private getStoredWeeklyData(): Array<{date: string, steps: number, calories: number, distance: number, activeMinutes: number}> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const storedData = localStorage.getItem(`steps_${dateStr}`);
      const steps = storedData ? JSON.parse(storedData).steps : 0;
      
      result.push({
        date: days[date.getDay()],
        steps,
        calories: Math.round(steps * 0.045),
        distance: Math.round((steps * 0.75 / 1000) * 100) / 100,
        activeMinutes: Math.round(steps / 100)
      });
    }
    
    return result;
  }

  /**
   * Get AI-powered insights based on step data
   */
  async getStepInsights(): Promise<StepInsight[]> {
    const currentData = await this.getCurrentStepData();
    const weeklyData = await this.getWeeklyData();
    const insights: StepInsight[] = [];

    // Goal achievement insights
    if (currentData.steps >= this.goals.daily) {
      insights.push({
        type: 'achievement',
        title: 'Daily Goal Achieved! 🎉',
        message: `Great job! You've reached your daily goal of ${this.goals.daily.toLocaleString()} steps.`,
        priority: 'high',
        actionable: false
      });
    } else {
      const remaining = this.goals.daily - currentData.steps;
      insights.push({
        type: 'recommendation',
        title: 'Keep Going!',
        message: `You need ${remaining.toLocaleString()} more steps to reach your daily goal.`,
        priority: 'medium',
        actionable: true,
        data: { remainingSteps: remaining }
      });
    }

    // Weekly trend analysis
    const avgSteps = weeklyData.reduce((sum, day) => sum + day.steps, 0) / weeklyData.length;
    if (currentData.steps > avgSteps * 1.2) {
      insights.push({
        type: 'trend',
        title: 'Above Average Performance',
        message: `Today's step count is 20% higher than your weekly average of ${Math.round(avgSteps).toLocaleString()} steps.`,
        priority: 'medium',
        actionable: false
      });
    }

    // Health recommendations
    if (currentData.steps < 5000) {
      insights.push({
        type: 'health-tip',
        title: 'More Movement Needed',
        message: 'Try to take short walks throughout the day. Even 10-minute walks can make a difference!',
        priority: 'high',
        actionable: true
      });
    }

    // Data source insight
    if (currentData.source === 'google-fit') {
      insights.push({
        type: 'recommendation',
        title: 'High Accuracy Data',
        message: `Data from Google Fit provides the most accurate tracking across all your devices.`,
        priority: 'low',
        actionable: false
      });
    }

    return insights;
  }

  /**
   * Set step goals
   */
  setGoals(goals: Partial<StepGoal>): void {
    this.goals = { ...this.goals, ...goals };
    localStorage.setItem('step-goals', JSON.stringify(this.goals));
  }

  /**
   * Get current goals
   */
  getGoals(): StepGoal {
    const stored = localStorage.getItem('step-goals');
    if (stored) {
      this.goals = JSON.parse(stored);
    }
    return this.goals;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    googleFit: boolean;
    deviceSensors: boolean;
    dataSource: string;
    lastSync: Date;
  } {
    return {
      googleFit: this.isGoogleFitEnabled && this.googleFit.isAuthenticated(),
      deviceSensors: true, // Always available as fallback
      dataSource: this.cachedData?.source || 'device-sensors',
      lastSync: this.lastDataSync
    };
  }

  /**
   * Force data refresh
   */
  async refreshData(): Promise<EnhancedStepData> {
    this.cachedData = null;
    this.lastDataSync = new Date(0);
    return await this.getCurrentStepData();
  }

  /**
   * Get data accuracy level
   */
  getDataAccuracy(): 'high' | 'medium' | 'low' {
    if (this.isGoogleFitEnabled && this.googleFit.isAuthenticated()) {
      return 'high';
    }
    return 'medium';
  }
}

export default EnhancedStepTrackerService;
export type { EnhancedStepData, StepGoal, StepInsight };
