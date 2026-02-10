import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDL3SPNSDEUFjeMODcL3bqP3DnICYgmlUU",
  authDomain: "moneymitra-27d26.firebaseapp.com",
  projectId: "moneymitra-27d26",
  storageBucket: "moneymitra-27d26.firebasestorage.app",
  messagingSenderId: "874728901532",
  appId: "1:874728901532:web:c00282e5e3fe3947789659",
  measurementId: "G-3DED7XZQX9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and export
export const auth = getAuth(app);

// Initialize Firestore and export
export const db = getFirestore(app);

export default app;
