
/**
 * HealthService - Advanced Health Data Management
 * Modular, scalable, and testable. Handles medicine reminders, health readings, doctor management, and appointments.
 * All errors are logged and thrown for centralized error boundary handling.
 * All user-facing errors should be localized via i18n in UI.
 */

import DatabaseService, { 
  Medicine, 
  HealthReading, 
  Doctor, 
  Appointment
} from './database';

export interface MedicineSchedule {
  medicine: Medicine;
  nextDose: Date;
  isOverdue: boolean;
  timeSinceLastDose?: number;
}

export interface HealthStats {
  totalMedicines: number;
  pendingDoses: number;
  overdueDoses: number;
  recentReadings: HealthReading[];
  upcomingAppointments: Appointment[];
  doctorCount: number;
}

export interface HealthTrends {
  type: string;
  data: Array<{
    date: string;
    value: number;
    systolic?: number;
    diastolic?: number;
  }>;
  trend: 'up' | 'down' | 'stable';
  averageChange: number;
}

class HealthService {
  /** Singleton instance for modularity and testability */
  private static instance: HealthService;
  private db: DatabaseService;
  private reminderInterval: NodeJS.Timeout | null = null;

  private constructor(db?: DatabaseService) {
    this.db = db || DatabaseService.getInstance();
  }

  /** Get singleton instance, optionally inject db for testing */
  static getInstance(db?: DatabaseService): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService(db);
    }
    return HealthService.instance;
  }
  /** Centralized error handler for logging/reporting */
  private handleError(context: string, error: unknown): void {
    // TODO: Integrate with error boundary/notification system
    console.error(`[HealthService] ${context}:`, error);
  }

  async initialize(): Promise<void> {
    await this.db.initialize();
    this.startMedicineReminders();
  }

  // Medicine Management
  async addMedicine(medicineData: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Medicine> {
    const userId = this.getCurrentUserId();
    return await this.db.addMedicine({
      ...medicineData,
      userId,
      taken: false,
      nextDue: new Date(),
    });
  }

  async getMedicines(): Promise<Medicine[]> {
    const userId = this.getCurrentUserId();
    return await this.db.getMedicines(userId);
  }

  async updateMedicine(medicineId: string, updates: Partial<Medicine>): Promise<Medicine> {
    return await this.db.updateMedicine(medicineId, updates);
  }

  async deleteMedicine(medicineId: string): Promise<void> {
    await this.db.deleteMedicine(medicineId);
  }

  async markMedicineTaken(medicineId: string): Promise<Medicine> {
    const medicines = await this.getMedicines();
    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) {
      throw new Error('Medicine not found');
    }
    const nextDue = this.calculateNextDose(medicine.frequency, medicine.time);
    return await this.updateMedicine(medicineId, {
      taken: true,
      nextDue,
      updatedAt: new Date(),
    });
  }

  async getMedicineSchedule(): Promise<MedicineSchedule[]> {
    const medicines = await this.getMedicines();
    const now = new Date();

    return medicines.map(medicine => {
      const nextDose = medicine.nextDue;
      const isOverdue = nextDose < now;
      return {
        medicine,
        nextDose,
        isOverdue,
        timeSinceLastDose: undefined,
      };
    });
  }

  private calculateNextDose(frequency: string, time: string): Date {
    const now = new Date();
    const nextDose = new Date();

    switch (frequency.toLowerCase()) {
      case 'daily':
        nextDose.setDate(now.getDate() + 1);
        break;
      case 'twice daily':
        // If current time is before the second dose, set to second dose today
        const [firstTime, secondTime] = time.split(', ');
        const [currentHour] = now.toTimeString().split(':');
        const [secondHour] = (secondTime || '20:00').split(':');
        
        if (parseInt(currentHour) < parseInt(secondHour)) {
          // Set to second dose today
          const [hour, minute] = secondTime.split(':');
          nextDose.setHours(parseInt(hour), parseInt(minute), 0, 0);
        } else {
          // Set to first dose tomorrow
          nextDose.setDate(now.getDate() + 1);
          const [hour, minute] = firstTime.split(':');
          nextDose.setHours(parseInt(hour), parseInt(minute), 0, 0);
        }
        break;
      case 'weekly':
        nextDose.setDate(now.getDate() + 7);
        break;
      default:
        nextDose.setDate(now.getDate() + 1);
    }

    // Set time
    const [hour, minute] = time.split(':');
    nextDose.setHours(parseInt(hour), parseInt(minute || '0'), 0, 0);

    return nextDose;
  }

  private startMedicineReminders(): void {
    // Check for medicine reminders every minute
    this.reminderInterval = setInterval(async () => {
      try {
        const schedule = await this.getMedicineSchedule();
        const overdueMedicines = schedule.filter(item => item.isOverdue && !item.medicine.taken);
        
        for (const item of overdueMedicines) {
          this.showMedicineReminder(item.medicine);
        }
      } catch (error) {
        console.error('Error checking medicine reminders:', error);
      }
    }, 60000); // Check every minute
  }

  private showMedicineReminder(medicine: Medicine): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Medicine Reminder: ${medicine.name}`, {
        body: `Time to take ${medicine.dosage} of ${medicine.name}`,
        icon: '/favicon.ico',
        tag: `medicine-${medicine.id}`,
      });
    }
  }

  // Health Readings Management
  async addHealthReading(readingData: Omit<HealthReading, 'id' | 'userId'>): Promise<HealthReading> {
    const userId = this.getCurrentUserId();
    return await this.db.addHealthReading({
      ...readingData,
      userId,
    });
  }

  async getHealthReadings(type?: string, days: number = 30): Promise<HealthReading[]> {
    const userId = this.getCurrentUserId();
    return await this.db.getHealthReadings(userId, type, days);
  }

  async getHealthTrends(type: string, days: number = 30): Promise<HealthTrends> {
    const readings = await this.getHealthReadings(type, days);
    
    const data = readings.map(reading => ({
      date: reading.timestamp.toISOString().split('T')[0],
      value: parseFloat(reading.value),
      systolic: reading.systolic,
      diastolic: reading.diastolic,
    }));

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let averageChange = 0;

    if (data.length >= 2) {
      const recent = data.slice(-7); // Last 7 readings
      const older = data.slice(0, Math.min(7, data.length - 7));
      
      if (recent.length && older.length) {
        const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, item) => sum + item.value, 0) / older.length;
        averageChange = recentAvg - olderAvg;
        
        if (averageChange > 2) trend = 'up';
        else if (averageChange < -2) trend = 'down';
      }
    }

    return {
      type,
      data,
      trend,
      averageChange,
    };
  }

  // Doctor Management
  async addDoctor(doctorData: Omit<Doctor, 'id' | 'createdAt' | 'userId'>): Promise<Doctor> {
    const userId = this.getCurrentUserId();
    return await this.db.addDoctor({
      ...doctorData,
      userId,
    });
  }

  async getDoctors(): Promise<Doctor[]> {
    const userId = this.getCurrentUserId();
    return await this.db.getDoctors(userId);
  }

  async updateDoctor(doctorId: string, updates: Partial<Doctor>): Promise<Doctor> {
    return await this.db.updateDoctor(doctorId, updates);
  }

  async deleteDoctor(doctorId: string): Promise<void> {
    await this.db.deleteDoctor(doctorId);
  }

  // Appointment Management
  async addAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'userId'>): Promise<Appointment> {
    const userId = this.getCurrentUserId();
    return await this.db.addAppointment({
      ...appointmentData,
      userId,
    });
  }

  async getAppointments(upcoming: boolean = true): Promise<Appointment[]> {
    const userId = this.getCurrentUserId();
    const appointments = await this.db.getAppointments(userId);
    
    if (upcoming) {
      const now = new Date();
      return appointments.filter(apt => apt.date > now);
    }
    
    return appointments;
  }

  // Add update/delete appointment methods if implemented in DatabaseService

  // Health Statistics
  async getHealthStats(): Promise<HealthStats> {
    const userId = this.getCurrentUserId();
    
    const [medicines, recentReadings, upcomingAppointments, doctors] = await Promise.all([
      this.getMedicines(),
      this.getHealthReadings(undefined, 7),
      this.getAppointments(true),
      this.getDoctors(),
    ]);

    const now = new Date();
    const pendingDoses = medicines.filter(m => !m.taken && m.nextDue <= now).length;
    const overdueDoses = medicines.filter(m => !m.taken && m.nextDue < now).length;

    return {
      totalMedicines: medicines.length,
      pendingDoses,
      overdueDoses,
      recentReadings: recentReadings.slice(0, 5),
      upcomingAppointments: upcomingAppointments.slice(0, 3),
      doctorCount: doctors.length,
    };
  }

  // BMI Calculation
  calculateBMI(weight: number, height: number): { bmi: number; category: string; ideal: string } {
    const bmi = weight / ((height / 100) ** 2);
    
    let category = '';
    let ideal = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      ideal = 'Consider gaining weight through healthy diet';
    } else if (bmi < 25) {
      category = 'Normal weight';
      ideal = 'Maintain current weight through balanced diet and exercise';
    } else if (bmi < 30) {
      category = 'Overweight';
      ideal = 'Consider losing weight through diet and exercise';
    } else {
      category = 'Obese';
      ideal = 'Consult with healthcare provider for weight management';
    }

    return {
      bmi: Math.round(bmi * 10) / 10,
      category,
      ideal,
    };
  }

  // Utility Methods
  private getCurrentUserId(): string {
    const userId = localStorage.getItem('dilcare_user_id');
    if (!userId) {
      throw new Error('No user logged in');
    }
    return userId;
  }

  async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  destroy(): void {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
  }
}

export default HealthService;
