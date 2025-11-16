/**
 * Google Fit API Integration Service
 * Provides accurate step tracking and fitness data from Google Fit
 */

// Extend Window interface for Google API
declare global {
  interface Window {
    gapi: any;
  }
}

interface GoogleFitData {
  steps: number;
  distance: number;
  calories: number;
  activeMinutes: number;
  heartRate?: number;
  activities: ActivityData[];
}

interface ActivityData {
  type: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  steps?: number;
  calories?: number;
}

interface GoogleFitConfig {
  clientId: string;
  scopes: string[];
  discoveryUrl: string;
}

class GoogleFitService {
  private static instance: GoogleFitService;
  private isInitialized = false;
  private authenticated = false;
  private gapi: any = null;
  
  private config: GoogleFitConfig = {
    clientId: import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID || '',
    scopes: [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.location.read',
      'https://www.googleapis.com/auth/fitness.sleep.read'
    ],
    discoveryUrl: 'https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest'
  };

  static getInstance(): GoogleFitService {
    if (!GoogleFitService.instance) {
      GoogleFitService.instance = new GoogleFitService();
    }
    return GoogleFitService.instance;
  }

  /**
   * Initialize Google Fit API
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Load Google API
      await this.loadGoogleAPI();
      
      // Initialize gapi
      await new Promise((resolve) => {
        this.gapi.load('auth2:client', resolve);
      });

      // Initialize auth and client
      await this.gapi.client.init({
        clientId: this.config.clientId,
        scope: this.config.scopes.join(' '),
        discoveryDocs: [this.config.discoveryUrl]
      });

      this.isInitialized = true;
      console.log('Google Fit API initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Fit API:', error);
      return false;
    }
  }

  /**
   * Load Google API script
   */
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        this.gapi = window.gapi;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.gapi = window.gapi;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Authenticate user with Google Fit
   */
  async authenticate(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      
      if (authInstance.isSignedIn.get()) {
        this.authenticated = true;
        return true;
      }

      const user = await authInstance.signIn();
      this.authenticated = user.isSignedIn();
      
      console.log('Google Fit authentication:', this.authenticated ? 'Success' : 'Failed');
      return this.authenticated;
    } catch (error) {
      console.error('Google Fit authentication failed:', error);
      return false;
    }
  }

  /**
   * Get today's step data from Google Fit
   */
  async getTodaySteps(): Promise<number> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Fit');
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    try {
      const response = await this.gapi.client.fitness.users.dataset.aggregate({
        userId: 'me',
        requestBody: {
          aggregateBy: [
            {
              dataTypeName: 'com.google.step_count.delta',
              dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
            }
          ],
          bucketByTime: { durationMillis: 86400000 }, // 24 hours
          startTimeMillis: startOfDay.getTime(),
          endTimeMillis: now.getTime()
        }
      });

      const buckets = response.result.bucket || [];
      let totalSteps = 0;

      buckets.forEach((bucket: any) => {
        bucket.dataset.forEach((dataset: any) => {
          dataset.point.forEach((point: any) => {
            totalSteps += point.value[0].intVal || 0;
          });
        });
      });

      return totalSteps;
    } catch (error) {
      console.error('Failed to get steps from Google Fit:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive fitness data for a date range
   */
  async getFitnessData(startDate: Date, endDate: Date): Promise<GoogleFitData> {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Google Fit');
    }

    try {
      const [stepsData, distanceData, caloriesData, activitiesData] = await Promise.all([
        this.getStepsData(startDate, endDate),
        this.getDistanceData(startDate, endDate),
        this.getCaloriesData(startDate, endDate),
        this.getActivitiesData(startDate, endDate)
      ]);

      return {
        steps: stepsData,
        distance: distanceData,
        calories: caloriesData,
        activeMinutes: this.calculateActiveMinutes(activitiesData),
        activities: activitiesData
      };
    } catch (error) {
      console.error('Failed to get fitness data:', error);
      throw error;
    }
  }

  /**
   * Get step count data
   */
  private async getStepsData(startDate: Date, endDate: Date): Promise<number> {
    const response = await this.gapi.client.fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [
          {
            dataTypeName: 'com.google.step_count.delta'
          }
        ],
        startTimeMillis: startDate.getTime(),
        endTimeMillis: endDate.getTime()
      }
    });

    let totalSteps = 0;
    const buckets = response.result.bucket || [];
    
    buckets.forEach((bucket: any) => {
      bucket.dataset.forEach((dataset: any) => {
        dataset.point.forEach((point: any) => {
          totalSteps += point.value[0].intVal || 0;
        });
      });
    });

    return totalSteps;
  }

  /**
   * Get distance data
   */
  private async getDistanceData(startDate: Date, endDate: Date): Promise<number> {
    try {
      const response = await this.gapi.client.fitness.users.dataset.aggregate({
        userId: 'me',
        requestBody: {
          aggregateBy: [
            {
              dataTypeName: 'com.google.distance.delta'
            }
          ],
          startTimeMillis: startDate.getTime(),
          endTimeMillis: endDate.getTime()
        }
      });

      let totalDistance = 0;
      const buckets = response.result.bucket || [];
      
      buckets.forEach((bucket: any) => {
        bucket.dataset.forEach((dataset: any) => {
          dataset.point.forEach((point: any) => {
            totalDistance += point.value[0].fpVal || 0;
          });
        });
      });

      return Math.round(totalDistance / 1000 * 100) / 100; // Convert to km
    } catch (error) {
      console.warn('Distance data not available, estimating from steps');
      const steps = await this.getStepsData(startDate, endDate);
      return Math.round((steps * 0.75 / 1000) * 100) / 100; // Estimate: 0.75m per step
    }
  }

  /**
   * Get calories data
   */
  private async getCaloriesData(startDate: Date, endDate: Date): Promise<number> {
    try {
      const response = await this.gapi.client.fitness.users.dataset.aggregate({
        userId: 'me',
        requestBody: {
          aggregateBy: [
            {
              dataTypeName: 'com.google.calories.expended'
            }
          ],
          startTimeMillis: startDate.getTime(),
          endTimeMillis: endDate.getTime()
        }
      });

      let totalCalories = 0;
      const buckets = response.result.bucket || [];
      
      buckets.forEach((bucket: any) => {
        bucket.dataset.forEach((dataset: any) => {
          dataset.point.forEach((point: any) => {
            totalCalories += point.value[0].fpVal || 0;
          });
        });
      });

      return Math.round(totalCalories);
    } catch (error) {
      console.warn('Calories data not available, estimating from steps');
      const steps = await this.getStepsData(startDate, endDate);
      return Math.round(steps * 0.045); // Estimate: 0.045 calories per step
    }
  }

  /**
   * Get activities data
   */
  private async getActivitiesData(startDate: Date, endDate: Date): Promise<ActivityData[]> {
    try {
      const response = await this.gapi.client.fitness.users.sessions.list({
        userId: 'me',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString()
      });

      const sessions = response.result.session || [];
      
      return sessions.map((session: any) => ({
        type: session.activityType || 'Unknown',
        startTime: new Date(parseInt(session.startTimeMillis)),
        endTime: new Date(parseInt(session.endTimeMillis)),
        duration: parseInt(session.endTimeMillis) - parseInt(session.startTimeMillis),
        steps: session.steps,
        calories: session.calories
      }));
    } catch (error) {
      console.warn('Activities data not available');
      return [];
    }
  }

  /**
   * Calculate active minutes from activities
   */
  private calculateActiveMinutes(activities: ActivityData[]): number {
    return activities.reduce((total, activity) => {
      return total + Math.round(activity.duration / (1000 * 60)); // Convert to minutes
    }, 0);
  }

  /**
   * Get weekly step data for charts
   */
  async getWeeklyStepData(): Promise<Array<{date: string, steps: number, calories: number, distance: number, activeMinutes: number}>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // Last 7 days

    const weeklyData = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      try {
        const dayData = await this.getFitnessData(dayStart, dayEnd);
        
        weeklyData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          steps: dayData.steps,
          calories: dayData.calories,
          distance: dayData.distance,
          activeMinutes: dayData.activeMinutes
        });
      } catch (error) {
        console.warn(`Failed to get data for ${date.toDateString()}`);
        weeklyData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          steps: 0,
          calories: 0,
          distance: 0,
          activeMinutes: 0
        });
      }
    }

    return weeklyData;
  }

  /**
   * Check if user has granted necessary permissions
   */
  async checkPermissions(): Promise<boolean> {
    if (!this.authenticated) return false;

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      const user = authInstance.currentUser.get();
      const scopes = user.getGrantedScopes();
      
      return this.config.scopes.every(scope => scopes.includes(scope));
    } catch (error) {
      console.error('Failed to check permissions:', error);
      return false;
    }
  }

  /**
   * Sign out from Google Fit
   */
  async signOut(): Promise<void> {
    if (this.authenticated && this.gapi) {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.authenticated = false;
      console.log('Signed out from Google Fit');
    }
  }

  /**
   * Get authentication status
   */
  isAuthenticated(): boolean {
    return this.authenticated;
  }
}

export default GoogleFitService;
export type { GoogleFitData, ActivityData };
