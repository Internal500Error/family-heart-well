// Firebase config and initialization for secure document storage
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Demo configuration for development - replace with your actual Firebase config for production
const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'demo-app-id',
};

// Initialize Firebase only if credentials are properly configured
let app: any = null;
let storage: any = null;
let db: any = null;
let auth: any = null;

try {
  app = initializeApp(firebaseConfig);
  storage = getStorage(app);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase not configured for production. Using demo mode.');
  // Create mock objects for development
  storage = {
    ref: () => ({ uploadBytes: () => Promise.resolve(), getDownloadURL: () => Promise.resolve('demo-url') })
  };
  db = {
    collection: () => ({ add: () => Promise.resolve(), get: () => Promise.resolve({ docs: [] }) })
  };
  auth = {
    currentUser: null,
    signIn: () => Promise.resolve()
  };
}

export { storage, db, auth };
