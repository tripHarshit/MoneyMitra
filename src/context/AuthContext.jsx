import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        console.log('✅ User authenticated:', currentUser.email);
      } else {
        console.log('❌ No user authenticated');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Register with Email and Password
  const registerWithEmail = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Registration successful:', result.user.email);
      
      // Create user document in Firestore (non-blocking - don't fail auth if this fails)
      try {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || 'User',
          createdAt: new Date().toISOString(),
          authMethod: 'email'
        });
        console.log('✅ User profile saved to Firestore');
      } catch (firestoreError) {
        // Log warning but don't fail the auth - user can still use the app
        console.warn('⚠️ Failed to save user profile to Firestore:', firestoreError.message);
        console.warn('This is likely due to a browser extension blocking the request. The app will still work.');
      }

      return result.user;
    } catch (error) {
      console.error('❌ Registration error:', error.code);
      throw new Error(formatAuthError(error.code));
    }
  };

  // Login with Email and Password
  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful:', result.user.email);
      return result.user;
    } catch (error) {
      console.error('❌ Login error:', error.code);
      throw new Error(formatAuthError(error.code));
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists, if not create it (non-blocking)
      try {
        const userDocRef = doc(db, 'users', result.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName || 'User',
            photoURL: result.user.photoURL || '',
            createdAt: new Date().toISOString(),
            authMethod: 'google'
          });
        }
      } catch (firestoreError) {
        // Log warning but don't fail the auth
        console.warn('Failed to save user profile to Firestore:', firestoreError.message);
        console.warn('This is likely due to a browser extension blocking the request. The app will still work.');
      }

      return result.user;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Google login popup was closed. Please try again.');
      }
      throw new Error(formatAuthError(error.code));
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      throw new Error('Failed to logout. Please try again.');
    }
  };

  // Helper function to format Firebase error messages
  const formatAuthError = (code) => {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered. Please login instead.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/user-not-found': 'No account found with this email. Please register first.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.',
    };
    return errorMessages[code] || 'An authentication error occurred. Please try again.';
  };

  const value = {
    user,
    loading,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
