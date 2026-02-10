import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  query, 
  orderBy, 
  onSnapshot,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Generate a UUID for chat IDs
 */
const generateChatId = () => {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Create a new chat for a user
 * @param {string} userId - The user's ID from Firebase Auth
 * @param {object} profile - User profile object with occupation, ageGroup, goal
 * @returns {Promise<string>} - Returns the generated chatId
 */
export const createChat = async (userId, profile) => {
  try {
    const chatId = generateChatId();
    
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    
    await setDoc(chatRef, {
      chatId,
      title: 'New Financial Chat',
      goal: profile?.goal || 'Learn Financial Management',
      profile: {
        occupation: profile?.occupation || 'Not specified',
        ageGroup: profile?.ageGroup || 'Not specified',
        goal: profile?.goal || 'Not specified'
      },
      createdAt: serverTimestamp(),
      lastMessage: null,
      messageCount: 0
    });
    
    console.log('✅ Chat created:', chatId);
    return chatId;
  } catch (error) {
    console.error('❌ Error creating chat:', error.message);
    throw error;
  }
};

/**
 * Get all chats for a user (one-time fetch)
 * @param {string} userId - The user's ID from Firebase Auth
 * @returns {Promise<array>} - Array of chat objects ordered by createdAt (newest first)
 */
export const getChats = async (userId) => {
  try {
    const chatsRef = collection(db, 'users', userId, 'chats');
    const q = query(chatsRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('✅ Fetched chats:', chats.length);
    return chats;
  } catch (error) {
    console.error('❌ Error fetching chats:', error.message);
    throw error;
  }
};

/**
 * Subscribe to real-time chat list updates
 * @param {string} userId - The user's ID from Firebase Auth
 * @param {function} callback - Function to call with updated chats array
 * @returns {function} - Unsubscribe function
 */
export const subscribeToChats = (userId, callback) => {
  try {
    const chatsRef = collection(db, 'users', userId, 'chats');
    const q = query(chatsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(chats);
    }, (error) => {
      console.error('❌ Error subscribing to chats:', error.message);
    });
    
    console.log('✅ Subscribed to chats for user:', userId);
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up chat subscription:', error.message);
    throw error;
  }
};

/**
 * Add a message to a chat and update lastMessage
 * @param {string} userId - The user's ID from Firebase Auth
 * @param {string} chatId - The chat ID
 * @param {string} role - "user" or "assistant"
 * @param {string} text - The message text
 * @returns {Promise<string>} - Returns the message ID
 */
export const addMessage = async (userId, chatId, role, text) => {
  try {
    // Add message to messages subcollection
    const messagesRef = collection(db, 'users', userId, 'chats', chatId, 'messages');
    
    const docRef = await addDoc(messagesRef, {
      role,
      text,
      timestamp: serverTimestamp()
    });
    
    // Update chat's lastMessage and messageCount
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: text.substring(0, 100), // Store first 100 chars as preview
      lastMessageAt: serverTimestamp(),
      messageCount: serverTimestamp() // This will increment on backend
    });
    
    console.log('✅ Message added:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding message:', error.message);
    throw error;
  }
};

/**
 * Subscribe to real-time message updates for a specific chat
 * @param {string} userId - The user's ID from Firebase Auth
 * @param {string} chatId - The chat ID
 * @param {function} callback - Function to call with updated messages array
 * @returns {function} - Unsubscribe function
 */
export const subscribeToMessages = (userId, chatId, callback) => {
  try {
    const messagesRef = collection(db, 'users', userId, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    }, (error) => {
      console.error('❌ Error subscribing to messages:', error.message);
    });
    
    console.log('✅ Subscribed to messages for chat:', chatId);
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up message subscription:', error.message);
    throw error;
  }
};

/**
 * Delete a chat and all its messages
 * @param {string} userId - The user's ID from Firebase Auth
 * @param {string} chatId - The chat ID to delete
 * @returns {Promise<void>}
 */
export const deleteChat = async (userId, chatId) => {
  try {
    const batch = writeBatch(db);
    
    // Delete all messages in the chat
    const messagesRef = collection(db, 'users', userId, 'chats', chatId, 'messages');
    const messagesSnapshot = await getDocs(messagesRef);
    
    messagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete the chat document
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    batch.delete(chatRef);
    
    await batch.commit();
    
    console.log('✅ Chat deleted:', chatId);
  } catch (error) {
    console.error('❌ Error deleting chat:', error.message);
    throw error;
  }
};

/**
 * Update chat title
 * @param {string} userId - The user's ID from Firebase Auth
 * @param {string} chatId - The chat ID
 * @param {string} title - New title for the chat
 * @returns {Promise<void>}
 */
export const updateChatTitle = async (userId, chatId, title) => {
  try {
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    await updateDoc(chatRef, {
      title
    });
    
    console.log('✅ Chat title updated:', title);
  } catch (error) {
    console.error('❌ Error updating chat title:', error.message);
    throw error;
  }
};
