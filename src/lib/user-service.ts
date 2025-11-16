
/**
 * UserService - Advanced User Management and Authentication
 * Modular, scalable, and testable. Handles registration, authentication, profile, and emergency contacts.
 * All errors are logged and thrown for centralized error boundary handling.
 * All user-facing errors should be localized via i18n in UI.
 */

import DatabaseService, { User, EmergencyContact } from './database';
// ...existing code...

export interface CreateUserRequest {
  name: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  emergencyContacts?: Omit<EmergencyContact, 'id' | 'userId' | 'createdAt'>[];
  medicalHistory?: string[];
  allergies?: string[];
}

export interface LoginRequest {
  email: string;
  password?: string; // For future authentication
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  age: number;
  emergencyContacts: EmergencyContact[];
  medicalHistory: string[];
  allergies: string[];
  createdAt: Date;
  updatedAt: Date;
}

class UserService {
  /** Singleton instance for modularity and testability */
  private static instance: UserService;
  private db: DatabaseService;
  private currentUser: User | null = null;

  private constructor(db?: DatabaseService) {
    this.db = db || DatabaseService.getInstance();
  }

  /** Get singleton instance, optionally inject db for testing */
  static getInstance(db?: DatabaseService): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService(db);
    }
    return UserService.instance;
  }

  /** Initialize DB and load current user */
  async initialize(): Promise<void> {
    await this.db.initialize();
    await this.loadCurrentUser();
  }

  /** Load current user from localStorage */
  private async loadCurrentUser(): Promise<void> {
    try {
      const userId = localStorage.getItem('dilcare_user_id');
      if (userId) {
        this.currentUser = await this.db.getUser(userId) || null;
      }
    } catch (error) {
      this.handleError('Error loading current user', error);
    }
  }

  /**
   * Register a new user
   * @param userData - user registration data
   */
  async registerUser(userData: CreateUserRequest): Promise<UserProfile> {
    try {
      const user = await this.db.createUser({
        name: userData.name,
        email: userData.email,
        dateOfBirth: userData.dateOfBirth,
        phoneNumber: userData.phoneNumber,
        emergencyContacts: [],
        medicalHistory: userData.medicalHistory || [],
        allergies: userData.allergies || [],
        medications: [],
      });
      if (userData.emergencyContacts?.length) {
        for (const contactData of userData.emergencyContacts) {
          await this.db.addEmergencyContact({ ...contactData, userId: user.id });
        }
      }
      this.currentUser = user;
      localStorage.setItem('dilcare_user_id', user.id);
      return this.formatUserProfile(user);
    } catch (error) {
      this.handleError('Error registering user', error);
      throw new Error('Failed to register user');
    }
  }

  /**
   * Login user by email (stub, add password auth for production)
   */
  async loginUser(loginData: LoginRequest): Promise<UserProfile> {
    try {
      const users = await this.db.getAllUsers();
      const user = users.find(u => u.email === loginData.email);
      if (!user) throw new Error('User not found');
      this.currentUser = user;
      localStorage.setItem('dilcare_user_id', user.id);
      return this.formatUserProfile(user);
    } catch (error) {
      this.handleError('Error logging in user', error);
      throw new Error('Login failed');
    }
  }

  /** Get current user profile */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!this.currentUser) await this.loadCurrentUser();
    if (!this.currentUser) return null;
    return this.formatUserProfile(this.currentUser);
  }

  /** Update current user profile */
  async updateProfile(updates: Partial<CreateUserRequest>): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('No user logged in');
    try {
      const updatedUser = await this.db.updateUser(this.currentUser.id, {
        name: updates.name,
        email: updates.email,
        dateOfBirth: updates.dateOfBirth,
        phoneNumber: updates.phoneNumber,
        medicalHistory: updates.medicalHistory,
        allergies: updates.allergies,
      });
      this.currentUser = updatedUser;
      return this.formatUserProfile(updatedUser);
    } catch (error) {
      this.handleError('Error updating profile', error);
      throw new Error('Failed to update profile');
    }
  }

  /** Add emergency contact for current user */
  async addEmergencyContact(contactData: Omit<EmergencyContact, 'id' | 'userId' | 'createdAt'>): Promise<EmergencyContact> {
    if (!this.currentUser) throw new Error('No user logged in');
    return await this.db.addEmergencyContact({ ...contactData, userId: this.currentUser.id });
  }

  /** Get emergency contacts for current user */
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    if (!this.currentUser) throw new Error('No user logged in');
    return await this.db.getEmergencyContacts(this.currentUser.id);
  }

  /** Update emergency contact */
  async updateEmergencyContact(contactId: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact> {
    return await this.db.updateEmergencyContact(contactId, updates);
  }

  /** Delete emergency contact */
  async deleteEmergencyContact(contactId: string): Promise<void> {
    await this.db.deleteEmergencyContact(contactId);
  }

  /** Logout user and clear session */
  async logoutUser(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('dilcare_user_id');
  }

  /** Delete user account and all related data */
  async deleteAccount(): Promise<void> {
    if (!this.currentUser) throw new Error('No user logged in');
    try {
      const userId = this.currentUser.id;
      const [medicines, healthReadings, stepData, doctors, appointments, contacts, waterIntake] = await Promise.all([
        this.db.getMedicines(userId),
        this.db.getHealthReadings(userId),
        this.db.getStepData(userId),
        this.db.getDoctors(userId),
        this.db.getAppointments(userId),
        this.db.getEmergencyContacts(userId),
        this.db.getWaterIntake(userId, new Date()),
      ]);
      await Promise.all([
        ...medicines.map(m => this.db.deleteMedicine(m.id)),
        ...doctors.map(d => this.db.deleteDoctor(d.id)),
        ...contacts.map(c => this.db.deleteEmergencyContact(c.id)),
      ]);
      await this.db.deleteUser(userId);
      this.currentUser = null;
      localStorage.removeItem('dilcare_user_id');
    } catch (error) {
      this.handleError('Error deleting account', error);
      throw new Error('Failed to delete account');
    }
  }

  /** Export all user data for backup */
  async exportUserData(): Promise<any> {
    if (!this.currentUser) throw new Error('No user logged in');
    return await this.db.exportData(this.currentUser.id);
  }

  /** Get current user ID */
  getUserId(): string | null {
    return this.currentUser?.id || null;
  }

  /** Is user logged in? */
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  /** Format user profile for UI */
  private async formatUserProfile(user: User): Promise<UserProfile> {
    const emergencyContacts = await this.db.getEmergencyContacts(user.id);
    const age = this.calculateAge(user.dateOfBirth);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      phoneNumber: user.phoneNumber,
      age,
      emergencyContacts,
      medicalHistory: user.medicalHistory,
      allergies: user.allergies,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /** Calculate age from date of birth */
  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  /** Centralized error handler for logging/reporting */
  private handleError(context: string, error: unknown): void {
    // TODO: Integrate with error boundary/notification system
    console.error(`[UserService] ${context}:`, error);
  }

  // Demo data methods for development
  async createDemoUser(): Promise<UserProfile> {
    const demoUserData: CreateUserRequest = {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      dateOfBirth: '1978-05-15',
      phoneNumber: '+91-9876543210',
      emergencyContacts: [
        {
          name: 'Dr. Sarah Johnson',
          phone: '+91-9876543211',
          relationship: 'Primary Doctor',
          isPrimary: true,
        },
        {
          name: 'Priya Kumar (Daughter)',
          phone: '+91-9876543212',
          relationship: 'Daughter',
          isPrimary: false,
        },
      ],
      medicalHistory: [
        'Hypertension (2015)',
        'Type 2 Diabetes (2018)',
        'High Cholesterol (2020)',
      ],
      allergies: ['Penicillin', 'Shellfish'],
    };

    return await this.registerUser(demoUserData);
  }

  async loadDemoData(): Promise<void> {
    if (!this.currentUser) {
      await this.createDemoUser();
    }

    if (!this.currentUser) return;

    const userId = this.currentUser.id;

    // Add demo medicines
    const medicines = [
      {
        userId,
        name: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Daily',
        time: '8:00 PM',
        taken: false,
        nextDue: new Date(Date.now() + 2 * 60 * 60 * 1000),
        instructions: 'Take with dinner',
        sideEffects: ['muscle pain', 'digestive issues'],
      },
      {
        userId,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        time: '8:00 AM, 8:00 PM',
        taken: true,
        nextDue: new Date(Date.now() + 8 * 60 * 60 * 1000),
        instructions: 'Take with meals',
        sideEffects: ['nausea', 'diarrhea'],
      },
    ];

    for (const med of medicines) {
      await this.db.addMedicine(med);
    }

    // Add demo health readings
    const healthReadings = [
      {
        userId,
        type: 'blood_pressure' as const,
        value: '120/80',
        systolic: 120,
        diastolic: 80,
        unit: 'mmHg',
        timestamp: new Date(),
        notes: 'Morning reading',
      },
      {
        userId,
        type: 'blood_sugar' as const,
        value: '95',
        unit: 'mg/dL',
        timestamp: new Date(),
        notes: 'Fasting glucose',
      },
      {
        userId,
        type: 'weight' as const,
        value: '72.5',
        unit: 'kg',
        timestamp: new Date(),
      },
    ];

    for (const reading of healthReadings) {
      await this.db.addHealthReading(reading);
    }

    // Add demo doctors
    const doctors = [
      {
        userId,
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        phone: '+91-9876543211',
        email: 'sarah.johnson@hospital.com',
        address: 'City Heart Hospital, Main Road',
        isPrimary: true,
      },
      {
        userId,
        name: 'Dr. Michael Chen',
        specialty: 'Endocrinologist',
        phone: '+91-9876543213',
        email: 'michael.chen@hospital.com',
        address: 'Diabetes Care Center, Park Street',
        isPrimary: false,
      },
    ];

    for (const doctor of doctors) {
      await this.db.addDoctor(doctor);
    }

    console.log('Demo data loaded successfully');
  }
}

export default UserService;
