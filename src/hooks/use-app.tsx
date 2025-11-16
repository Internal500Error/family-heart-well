/**
 * React Hook for App Service
 * Provides easy access to all app services and state management
 */

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import AppService from '../lib/app-service';
import UserService from '../lib/user-service';
import HealthService from '../lib/health-service';
import FitnessService from '../lib/fitness-service';

interface AppContextType {
  appService: AppService;
  userService: UserService;
  healthService: HealthService;
  fitnessService: FitnessService;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  currentUser: any | null;
  refreshUser: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const appService = AppService.getInstance();
  const userService = appService.getUserService();
  const healthService = appService.getHealthService();
  const fitnessService = appService.getFitnessService();

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await appService.initialize();
      setIsInitialized(true);

      // Load current user
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

    } catch (err) {
      console.error('Failed to initialize app:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize app');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setCurrentUser(null);
    }
  };

  const refreshData = async () => {
    try {
      await appService.syncAllData();
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  useEffect(() => {
    initializeApp();

    // Handle app lifecycle events
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        appService.onAppResume();
      } else {
        appService.onAppPause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      appService.destroy();
    };
  }, []);

  const value: AppContextType = {
    appService,
    userService,
    healthService,
    fitnessService,
    isInitialized,
    isLoading,
    error,
    currentUser,
    refreshUser,
    refreshData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useUser() {
  const { userService, currentUser, refreshUser } = useApp();
  
  return {
    user: currentUser,
    userService,
    refreshUser,
    isLoggedIn: !!currentUser,
  };
}

export function useHealth() {
  const { healthService } = useApp();
  
  const [medicines, setMedicines] = useState<any[]>([]);
  const [healthStats, setHealthStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshHealth = async () => {
    try {
      setIsLoading(true);
      const [meds, stats] = await Promise.all([
        healthService.getMedicines(),
        healthService.getHealthStats(),
      ]);
      setMedicines(meds);
      setHealthStats(stats);
    } catch (error) {
      console.error('Error refreshing health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshHealth();
  }, []);

  return {
    healthService,
    medicines,
    healthStats,
    isLoading,
    refreshHealth,
  };
}

export function useFitness() {
  const { fitnessService } = useApp();
  
  const [todayActivity, setTodayActivity] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshFitness = async () => {
    try {
      setIsLoading(true);
      const [activity, weekly, steps] = await Promise.all([
        fitnessService.getTodayActivity(),
        fitnessService.getWeeklyStats(),
        fitnessService.getCurrentSteps(),
      ]);
      setTodayActivity(activity);
      setWeeklyStats(weekly);
      setCurrentSteps(steps);
    } catch (error) {
      console.error('Error refreshing fitness data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshFitness();
    
    // Refresh steps every 30 seconds
    const interval = setInterval(async () => {
      try {
        const steps = await fitnessService.getCurrentSteps();
        setCurrentSteps(steps);
      } catch (error) {
        console.error('Error updating current steps:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    fitnessService,
    todayActivity,
    weeklyStats,
    currentSteps,
    isLoading,
    refreshFitness,
  };
}

export default useApp;
