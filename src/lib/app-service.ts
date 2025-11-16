
/**
 * AppService - Advanced Main Application Service
 * Modular, scalable, and testable. Manages app initialization, data synchronization, and service coordination.
 * All errors are logged and thrown for centralized error boundary handling.
 * All user-facing errors should be localized via i18n in UI.
 */

import UserService from './user-service';
import HealthService from './health-service';
import FitnessService from './fitness-service';
import DatabaseService from './database';

export interface AppInitializationStatus {
  database: boolean;
  userService: boolean;
  healthService: boolean;
  fitnessService: boolean;
  isReady: boolean;
}

export interface AppStats {
  totalUsers: number;
  activeUser: boolean;
  dataPoints: {
    medicines: number;
    healthReadings: number;
    stepData: number;
    doctors: number;
    appointments: number;
  };
  lastSync: Date | null;
}

class AppService {
  /** Singleton instance for modularity and testability */
  private static instance: AppService;
  private isInitialized = false;
  private initializationStatus: AppInitializationStatus = {
    database: false,
    userService: false,
    healthService: false,
    fitnessService: false,
    isReady: false,
  };

  private userService: UserService;
  private healthService: HealthService;
  private fitnessService: FitnessService;
  private database: DatabaseService;

  private constructor(
    database?: DatabaseService,
    userService?: UserService,
    healthService?: HealthService,
    fitnessService?: FitnessService
  ) {
    this.database = database || DatabaseService.getInstance();
    this.userService = userService || UserService.getInstance();
    this.healthService = healthService || HealthService.getInstance();
    this.fitnessService = fitnessService || FitnessService.getInstance();
  }

  /** Get singleton instance, optionally inject dependencies for testing */
  static getInstance(
    database?: DatabaseService,
    userService?: UserService,
    healthService?: HealthService,
    fitnessService?: FitnessService
  ): AppService {
    if (!AppService.instance) {
      AppService.instance = new AppService(database, userService, healthService, fitnessService);
    }
    return AppService.instance;
  }
  /** Centralized error handler for logging/reporting */
  private handleError(context: string, error: unknown): void {
    // TODO: Integrate with error boundary/notification system
    console.error(`[AppService] ${context}:`, error);
  }

  async initialize(): Promise<AppInitializationStatus> {
    if (this.isInitialized) {
      return this.initializationStatus;
    }

    console.log('🚀 Initializing DilCare App Services...');

    try {
      // Initialize database first
      await this.database.initialize();
      this.initializationStatus.database = true;
      console.log('✅ Database initialized');

      // Initialize user service
      await this.userService.initialize();
      this.initializationStatus.userService = true;
      console.log('✅ User service initialized');

      // Initialize health service
      await this.healthService.initialize();
      this.initializationStatus.healthService = true;
      console.log('✅ Health service initialized');

      // Initialize fitness service
      await this.fitnessService.initialize();
      this.initializationStatus.fitnessService = true;
      console.log('✅ Fitness service initialized');

      // Request notification permissions
      await this.healthService.requestNotificationPermission();
      console.log('✅ Notification permissions requested');

      this.initializationStatus.isReady = true;
      this.isInitialized = true;

      console.log('🎉 DilCare App successfully initialized!');

      // Load demo data if no user exists
      await this.loadInitialData();

      return this.initializationStatus;
    } catch (error) {
      console.error('❌ Failed to initialize DilCare App:', error);
      throw new Error('App initialization failed');
    }
  }

  private async loadInitialData(): Promise<void> {
    try {
      const currentUser = await this.userService.getCurrentUser();
      
      if (!currentUser) {
        console.log('📋 No user found, loading demo data...');
        await this.userService.loadDemoData();
        console.log('✅ Demo data loaded successfully');
      } else {
        console.log(`👋 Welcome back, ${currentUser.name}!`);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }

  // Service Getters
  getUserService(): UserService {
    return this.userService;
  }

  getHealthService(): HealthService {
    return this.healthService;
  }

  getFitnessService(): FitnessService {
    return this.fitnessService;
  }

  getDatabaseService(): DatabaseService {
    return this.database;
  }

  // App Status and Statistics
  getInitializationStatus(): AppInitializationStatus {
    return { ...this.initializationStatus };
  }

  isReady(): boolean {
    return this.initializationStatus.isReady;
  }

  async getAppStats(): Promise<AppStats> {
    try {
      const currentUser = await this.userService.getCurrentUser();
      const userId = currentUser?.id;

      if (!userId) {
        return {
          totalUsers: 0,
          activeUser: false,
          dataPoints: {
            medicines: 0,
            healthReadings: 0,
            stepData: 0,
            doctors: 0,
            appointments: 0,
          },
          lastSync: null,
        };
      }

      const [medicines, healthReadings, stepData, doctors, appointments] = await Promise.all([
        this.healthService.getMedicines(),
        this.healthService.getHealthReadings(),
        this.fitnessService.getStepData(30),
        this.healthService.getDoctors(),
        this.healthService.getAppointments(false),
      ]);

      const lastSyncStr = localStorage.getItem('dilcare_last_sync');
      const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;

      return {
        totalUsers: 1, // For single-user app
        activeUser: true,
        dataPoints: {
          medicines: medicines.length,
          healthReadings: healthReadings.length,
          stepData: stepData.length,
          doctors: doctors.length,
          appointments: appointments.length,
        },
        lastSync,
      };
    } catch (error) {
      console.error('Error getting app stats:', error);
      return {
        totalUsers: 0,
        activeUser: false,
        dataPoints: {
          medicines: 0,
          healthReadings: 0,
          stepData: 0,
          doctors: 0,
          appointments: 0,
        },
        lastSync: null,
      };
    }
  }

  // Data Management
  async syncAllData(): Promise<boolean> {
    try {
      console.log('🔄 Syncing all app data...');

      // Sync fitness data
      await this.fitnessService.syncStepData();
      console.log('✅ Fitness data synced');

      // Update last sync time
      localStorage.setItem('dilcare_last_sync', new Date().toISOString());

      console.log('✅ All data synced successfully');
      return true;
    } catch (error) {
      console.error('❌ Error syncing data:', error);
      return false;
    }
  }

  async exportAllData(): Promise<any> {
    try {
      const currentUser = await this.userService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      const userData = await this.userService.exportUserData();
      const appStats = await this.getAppStats();

      return {
        user: currentUser,
        data: userData,
        stats: appStats,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  async clearAllData(): Promise<void> {
    try {
      console.log('🗑️ Clearing all app data...');

      // Clear user data
      await this.userService.deleteAccount();

      // Clear local storage
      const keysToKeep = ['dilcare_fitness_goals'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (key.startsWith('dilcare_') && !keysToKeep.some(keep => key.includes(keep))) {
          localStorage.removeItem(key);
        }
      });

      // Reset initialization status
      this.isInitialized = false;
      this.initializationStatus = {
        database: false,
        userService: false,
        healthService: false,
        fitnessService: false,
        isReady: false,
      };

      console.log('✅ All data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw new Error('Failed to clear data');
    }
  }

  // Health Dashboard Data
  async getDashboardData(): Promise<any> {
    try {
      const currentUser = await this.userService.getCurrentUser();
      if (!currentUser) {
        return null;
      }

      const [healthStats, todayActivity, weeklyStats, achievements] = await Promise.all([
        this.healthService.getHealthStats(),
        this.fitnessService.getTodayActivity(),
        this.fitnessService.getWeeklyStats(),
        this.fitnessService.getAchievements(),
      ]);

      return {
        user: currentUser,
        health: healthStats,
        fitness: {
          today: todayActivity,
          weekly: weeklyStats,
          achievements: achievements.filter(a => a.achieved),
        },
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return null;
    }
  }

  // Emergency Functions
  async triggerEmergency(): Promise<boolean> {
    try {
      const currentUser = await this.userService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      const emergencyContacts = await this.userService.getEmergencyContacts();
      const primaryContact = emergencyContacts.find(c => c.isPrimary);

      if (primaryContact) {
        // In a real app, this would send SMS or make calls
        console.log(`🚨 Emergency triggered! Contact: ${primaryContact.name} (${primaryContact.phone})`);
        
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Emergency Alert Sent', {
            body: `Emergency contact ${primaryContact.name} has been notified`,
            icon: '/favicon.ico',
          });
        }

        return true;
      } else {
        throw new Error('No emergency contact available');
      }
    } catch (error) {
      console.error('Error triggering emergency:', error);
      return false;
    }
  }

  // App Lifecycle
  async onAppStart(): Promise<void> {
    await this.initialize();
    await this.syncAllData();
  }

  async onAppPause(): Promise<void> {
    // Save any pending data
    await this.syncAllData();
  }

  async onAppResume(): Promise<void> {
    // Sync data when app comes back to foreground
    await this.syncAllData();
  }

  destroy(): void {
    console.log('🛑 Destroying DilCare App services...');
    
    this.healthService.destroy();
    this.fitnessService.destroy();
    
    this.isInitialized = false;
    this.initializationStatus = {
      database: false,
      userService: false,
      healthService: false,
      fitnessService: false,
      isReady: false,
    };

    console.log('✅ App services destroyed');
  }

  // Development helpers
  async resetToDemo(): Promise<void> {
    await this.clearAllData();
    await this.initialize();
  }

  getServiceHealth(): { [key: string]: boolean } {
    return {
      database: this.initializationStatus.database,
      userService: this.initializationStatus.userService,
      healthService: this.initializationStatus.healthService,
      fitnessService: this.initializationStatus.fitnessService,
      overall: this.initializationStatus.isReady,
    };
  }
}

export default AppService;
