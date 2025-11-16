/**
 * Database Service - Real Backend Integration
 * Handles all data persistence and retrieval operations
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database Schema Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  emergencyContacts: EmergencyContact[];
  medicalHistory: string[];
  allergies: string[];
  medications: Medicine[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Medicine {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
  nextDue: Date;
  instructions?: string;
  sideEffects?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthReading {
  id: string;
  userId: string;
  type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'temperature';
  value: string;
  systolic?: number;
  diastolic?: number;
  unit: string;
  timestamp: Date;
  notes?: string;
  deviceId?: string;
}

export interface StepData {
  id: string;
  userId: string;
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  date: string;
  source: 'google-fit' | 'device-sensors' | 'manual';
  accuracy: 'high' | 'medium' | 'low';
  timestamp: Date;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  specialty: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  title: string;
  date: Date;
  duration: number;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface WaterIntake {
  id: string;
  userId: string;
  amount: number;
  timestamp: Date;
  goal: number;
}

// IndexedDB Schema
interface DilCareDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  medicines: {
    key: string;
    value: Medicine;
    indexes: { 'by-user': string; 'by-due-date': Date };
  };
  healthReadings: {
    key: string;
    value: HealthReading;
    indexes: { 'by-user': string; 'by-type': string; 'by-date': Date };
  };
  stepData: {
    key: string;
    value: StepData;
    indexes: { 'by-user': string; 'by-date': string };
  };
  doctors: {
    key: string;
    value: Doctor;
    indexes: { 'by-user': string };
  };
  appointments: {
    key: string;
    value: Appointment;
    indexes: { 'by-user': string; 'by-doctor': string; 'by-date': Date };
  };
  emergencyContacts: {
    key: string;
    value: EmergencyContact;
    indexes: { 'by-user': string };
  };
  waterIntake: {
    key: string;
    value: WaterIntake;
    indexes: { 'by-user': string; 'by-date': Date };
  };
}

class DatabaseService {
  /** Get all users */
  async getAllUsers(): Promise<User[]> {
    const db = this.ensureDB();
    return await db.getAll('users');
  }

  /** Delete a user by ID */
  async deleteUser(userId: string): Promise<void> {
    const db = this.ensureDB();
    await db.delete('users', userId);
  }
  private static instance: DatabaseService;
  private db: IDBPDatabase<DilCareDB> | null = null;
  private readonly DB_NAME = 'DilCareDB';
  private readonly DB_VERSION = 1;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.db = await openDB<DilCareDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Users store
          if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', { keyPath: 'id' });
            userStore.createIndex('by-email', 'email', { unique: true });
          }

          // Medicines store
          if (!db.objectStoreNames.contains('medicines')) {
            const medicineStore = db.createObjectStore('medicines', { keyPath: 'id' });
            medicineStore.createIndex('by-user', 'userId');
            medicineStore.createIndex('by-due-date', 'nextDue');
          }

          // Health readings store
          if (!db.objectStoreNames.contains('healthReadings')) {
            const healthStore = db.createObjectStore('healthReadings', { keyPath: 'id' });
            healthStore.createIndex('by-user', 'userId');
            healthStore.createIndex('by-type', 'type');
            healthStore.createIndex('by-date', 'timestamp');
          }

          // Step data store
          if (!db.objectStoreNames.contains('stepData')) {
            const stepStore = db.createObjectStore('stepData', { keyPath: 'id' });
            stepStore.createIndex('by-user', 'userId');
            stepStore.createIndex('by-date', 'date');
          }

          // Doctors store
          if (!db.objectStoreNames.contains('doctors')) {
            const doctorStore = db.createObjectStore('doctors', { keyPath: 'id' });
            doctorStore.createIndex('by-user', 'userId');
          }

          // Appointments store
          if (!db.objectStoreNames.contains('appointments')) {
            const appointmentStore = db.createObjectStore('appointments', { keyPath: 'id' });
            appointmentStore.createIndex('by-user', 'userId');
            appointmentStore.createIndex('by-doctor', 'doctorId');
            appointmentStore.createIndex('by-date', 'date');
          }

          // Emergency contacts store
          if (!db.objectStoreNames.contains('emergencyContacts')) {
            const contactStore = db.createObjectStore('emergencyContacts', { keyPath: 'id' });
            contactStore.createIndex('by-user', 'userId');
          }

          // Water intake store
          if (!db.objectStoreNames.contains('waterIntake')) {
            const waterStore = db.createObjectStore('waterIntake', { keyPath: 'id' });
            waterStore.createIndex('by-user', 'userId');
            waterStore.createIndex('by-date', 'timestamp');
          }
        },
      });

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private ensureDB(): IDBPDatabase<DilCareDB> {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  // User Management
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = this.ensureDB();
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.add('users', user);
    return user;
  }

  async getUser(userId: string): Promise<User | undefined> {
    const db = this.ensureDB();
    return await db.get('users', userId);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const db = this.ensureDB();
    const user = await db.get('users', userId);
    if (!user) throw new Error('User not found');

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    await db.put('users', updatedUser);
    return updatedUser;
  }

  // Medicine Management
  async addMedicine(medicineData: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medicine> {
    const db = this.ensureDB();
    const medicine: Medicine = {
      ...medicineData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.add('medicines', medicine);
    return medicine;
  }

  async getMedicines(userId: string): Promise<Medicine[]> {
    const db = this.ensureDB();
    return await db.getAllFromIndex('medicines', 'by-user', userId);
  }

  async updateMedicine(medicineId: string, updates: Partial<Medicine>): Promise<Medicine> {
    const db = this.ensureDB();
    const medicine = await db.get('medicines', medicineId);
    if (!medicine) throw new Error('Medicine not found');

    const updatedMedicine = { ...medicine, ...updates, updatedAt: new Date() };
    await db.put('medicines', updatedMedicine);
    return updatedMedicine;
  }

  async deleteMedicine(medicineId: string): Promise<void> {
    const db = this.ensureDB();
    await db.delete('medicines', medicineId);
  }

  async getUpcomingMedicines(userId: string, limit: number = 5): Promise<Medicine[]> {
    const db = this.ensureDB();
    const tx = db.transaction('medicines', 'readonly');
    const index = tx.store.index('by-due-date');
    
    const medicines: Medicine[] = [];
    let cursor = await index.openCursor();
    
    while (cursor && medicines.length < limit) {
      if (cursor.value.userId === userId && !cursor.value.taken) {
        medicines.push(cursor.value);
      }
      cursor = await cursor.continue();
    }
    
    return medicines;
  }

  // Health Readings
  async addHealthReading(readingData: Omit<HealthReading, 'id'>): Promise<HealthReading> {
    const db = this.ensureDB();
    const reading: HealthReading = {
      ...readingData,
      id: this.generateId(),
    };

    await db.add('healthReadings', reading);
    return reading;
  }

  async getHealthReadings(userId: string, type?: string, limit?: number): Promise<HealthReading[]> {
    const db = this.ensureDB();
    
    if (type) {
      const readings = await db.getAllFromIndex('healthReadings', 'by-type', type);
      return readings.filter(r => r.userId === userId).slice(0, limit);
    }
    
    const readings = await db.getAllFromIndex('healthReadings', 'by-user', userId);
    return limit ? readings.slice(0, limit) : readings;
  }

  async getHealthReadingsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<HealthReading[]> {
    const db = this.ensureDB();
    const tx = db.transaction('healthReadings', 'readonly');
    const index = tx.store.index('by-date');
    
    const readings: HealthReading[] = [];
    let cursor = await index.openCursor(IDBKeyRange.bound(startDate, endDate));
    
    while (cursor) {
      if (cursor.value.userId === userId) {
        readings.push(cursor.value);
      }
      cursor = await cursor.continue();
    }
    
    return readings;
  }

  // Step Data Management
  async addStepData(stepData: Omit<StepData, 'id'>): Promise<StepData> {
    const db = this.ensureDB();
    const data: StepData = {
      ...stepData,
      id: this.generateId(),
    };

    await db.add('stepData', data);
    return data;
  }

  async getStepData(userId: string, date?: string): Promise<StepData[]> {
    const db = this.ensureDB();
    
    if (date) {
      const data = await db.getAllFromIndex('stepData', 'by-date', date);
      return data.filter(d => d.userId === userId);
    }
    
    return await db.getAllFromIndex('stepData', 'by-user', userId);
  }

  async getWeeklyStepData(userId: string): Promise<StepData[]> {
    const db = this.ensureDB();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const allData = await db.getAllFromIndex('stepData', 'by-user', userId);
    return allData.filter(data => new Date(data.timestamp) >= oneWeekAgo);
  }

  // Doctor Management
  async addDoctor(doctorData: Omit<Doctor, 'id' | 'createdAt'>): Promise<Doctor> {
    const db = this.ensureDB();
    const doctor: Doctor = {
      ...doctorData,
      id: this.generateId(),
      createdAt: new Date(),
    };

    await db.add('doctors', doctor);
    return doctor;
  }

  async getDoctors(userId: string): Promise<Doctor[]> {
    const db = this.ensureDB();
    return await db.getAllFromIndex('doctors', 'by-user', userId);
  }

  async updateDoctor(doctorId: string, updates: Partial<Doctor>): Promise<Doctor> {
    const db = this.ensureDB();
    const doctor = await db.get('doctors', doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const updatedDoctor = { ...doctor, ...updates };
    await db.put('doctors', updatedDoctor);
    return updatedDoctor;
  }

  async deleteDoctor(doctorId: string): Promise<void> {
    const db = this.ensureDB();
    await db.delete('doctors', doctorId);
  }

  // Appointment Management
  async addAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const db = this.ensureDB();
    const appointment: Appointment = {
      ...appointmentData,
      id: this.generateId(),
      createdAt: new Date(),
    };

    await db.add('appointments', appointment);
    return appointment;
  }

  async getAppointments(userId: string): Promise<Appointment[]> {
    const db = this.ensureDB();
    return await db.getAllFromIndex('appointments', 'by-user', userId);
  }

  async getUpcomingAppointments(userId: string, limit: number = 5): Promise<Appointment[]> {
    const db = this.ensureDB();
    const now = new Date();
    const tx = db.transaction('appointments', 'readonly');
    const index = tx.store.index('by-date');
    
    const appointments: Appointment[] = [];
    let cursor = await index.openCursor(IDBKeyRange.lowerBound(now));
    
    while (cursor && appointments.length < limit) {
      if (cursor.value.userId === userId && cursor.value.status === 'scheduled') {
        appointments.push(cursor.value);
      }
      cursor = await cursor.continue();
    }
    
    return appointments;
  }

  // Emergency Contacts
  async addEmergencyContact(contactData: Omit<EmergencyContact, 'id' | 'createdAt'>): Promise<EmergencyContact> {
    const db = this.ensureDB();
    const contact: EmergencyContact = {
      ...contactData,
      id: this.generateId(),
      createdAt: new Date(),
    };

    await db.add('emergencyContacts', contact);
    return contact;
  }

  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    const db = this.ensureDB();
    return await db.getAllFromIndex('emergencyContacts', 'by-user', userId);
  }

  async updateEmergencyContact(contactId: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const db = this.ensureDB();
    const contact = await db.get('emergencyContacts', contactId);
    if (!contact) throw new Error('Emergency contact not found');

    const updatedContact = { ...contact, ...updates };
    await db.put('emergencyContacts', updatedContact);
    return updatedContact;
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    const db = this.ensureDB();
    await db.delete('emergencyContacts', contactId);
  }

  // Water Intake
  async addWaterIntake(intakeData: Omit<WaterIntake, 'id'>): Promise<WaterIntake> {
    const db = this.ensureDB();
    const intake: WaterIntake = {
      ...intakeData,
      id: this.generateId(),
    };

    await db.add('waterIntake', intake);
    return intake;
  }

  async getWaterIntake(userId: string, date: Date): Promise<WaterIntake[]> {
    const db = this.ensureDB();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const tx = db.transaction('waterIntake', 'readonly');
    const index = tx.store.index('by-date');
    
    const intakes: WaterIntake[] = [];
    let cursor = await index.openCursor(IDBKeyRange.bound(startOfDay, endOfDay));
    
    while (cursor) {
      if (cursor.value.userId === userId) {
        intakes.push(cursor.value);
      }
      cursor = await cursor.continue();
    }
    
    return intakes;
  }

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async clearAllData(): Promise<void> {
    const db = this.ensureDB();
    const stores = ['users', 'medicines', 'healthReadings', 'stepData', 'doctors', 'appointments', 'emergencyContacts', 'waterIntake'];
    
    for (const store of stores) {
      await db.clear(store as any);
    }
  }

  async exportData(userId: string): Promise<any> {
    const db = this.ensureDB();
    
    const [
      user,
      medicines,
      healthReadings,
      stepData,
      doctors,
      appointments,
      emergencyContacts,
      waterIntake
    ] = await Promise.all([
      db.get('users', userId),
      db.getAllFromIndex('medicines', 'by-user', userId),
      db.getAllFromIndex('healthReadings', 'by-user', userId),
      db.getAllFromIndex('stepData', 'by-user', userId),
      db.getAllFromIndex('doctors', 'by-user', userId),
      db.getAllFromIndex('appointments', 'by-user', userId),
      db.getAllFromIndex('emergencyContacts', 'by-user', userId),
      this.getWaterIntake(userId, new Date())
    ]);

    return {
      user,
      medicines,
      healthReadings,
      stepData,
      doctors,
      appointments,
      emergencyContacts,
      waterIntake,
      exportDate: new Date(),
    };
  }
}

export default DatabaseService;
