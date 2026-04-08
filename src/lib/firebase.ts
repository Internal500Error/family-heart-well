// Firebase config and initialization for secure document storage
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Demo configuration for development - replace with your actual Firebase config for production
const firebaseConfig = {
  apiKey: "AIzaSyBCesCTHIrSzRpeo8LKGKwFzlCw9rYLPEc",
  authDomain: "mvpm-hackathon.firebaseapp.com",
  projectId: "mvpm-hackathon",
  storageBucket: "mvpm-hackathon.firebasestorage.app",
  messagingSenderId: "849303250120",
  appId: "1:849303250120:web:68ab45d379c8d368ceb1fd"
};

// Initialize Firebase only if credentials are properly configured
let app: any = null;
let storage: any = null;
let db: any = null;
let auth: any = null;
let googleProvider: any = null;

try {
  app = initializeApp(firebaseConfig);
  storage = getStorage(app);
  db = getFirestore(app);
  auth = getAuth(app);

  // Setup Google Auth Provider configured for Google Fit Scopes
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
  googleProvider.addScope('https://www.googleapis.com/auth/fitness.body.read');
  googleProvider.addScope('https://www.googleapis.com/auth/fitness.heart_rate.read');
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
  googleProvider = null;
}

export { app, storage, db, auth, googleProvider };
