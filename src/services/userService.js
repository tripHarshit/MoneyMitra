import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Get user profile from Firestore
 * @param {string} userId - The user's ID from Firebase Auth
 * @returns {Promise<object|null>} - User profile object or null if not found
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log('✅ User profile fetched:', userId);
      return data;
    }
    
    console.log('ℹ️ No profile found for user:', userId);
    return null;
  } catch (error) {
    console.error('❌ Error fetching user profile:', error.message);
    throw error;
  }
};

/**
 * Check if user has completed initial profile setup
 * @param {string} userId - The user's ID from Firebase Auth
 * @returns {Promise<boolean>} - True if profile setup is complete
 */
export const hasCompletedSetup = async (userId) => {
  try {
    const profile = await getUserProfile(userId);
    
    // Check if essential profile fields exist
    if (profile && profile.preferences) {
      const { occupation, ageGroup, financialGoal } = profile.preferences;
      return !!(occupation && ageGroup && financialGoal);
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking setup status:', error.message);
    return false;
  }
};

/**
 * Save user preferences (initial setup or update)
 * @param {string} userId - The user's ID from Firebase Auth
 * @param {object} preferences - User preferences {occupation, ageGroup, financialGoal}
 * @returns {Promise<void>}
 */
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Update existing document
      await updateDoc(userRef, {
        preferences: {
          occupation: preferences.occupation,
          ageGroup: preferences.ageGroup,
          financialGoal: preferences.financialGoal
        },
        setupCompleted: true,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new document
      await setDoc(userRef, {
        uid: userId,
        preferences: {
          occupation: preferences.occupation,
          ageGroup: preferences.ageGroup,
          financialGoal: preferences.financialGoal
        },
        setupCompleted: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    console.log('✅ User preferences saved:', userId);
  } catch (error) {
    console.error('❌ Error saving user preferences:', error.message);
    throw error;
  }
};

/**
 * Update single preference field
 * @param {string} userId - The user's ID from Firebase Auth
 * @param {string} field - The preference field to update
 * @param {string} value - The new value
 * @returns {Promise<void>}
 */
export const updatePreference = async (userId, field, value) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`preferences.${field}`]: value,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Preference updated:', field);
  } catch (error) {
    console.error('❌ Error updating preference:', error.message);
    throw error;
  }
};

export default {
  getUserProfile,
  hasCompletedSetup,
  saveUserPreferences,
  updatePreference
};
