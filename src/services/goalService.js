import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

export const GOAL_CATEGORIES = [
  { id: 'emergency', label: 'Emergency Fund', emoji: '🛡️' },
  { id: 'vacation', label: 'Vacation', emoji: '✈️' },
  { id: 'gadget', label: 'Gadget', emoji: '📱' },
  { id: 'vehicle', label: 'Vehicle', emoji: '🚗' },
  { id: 'education', label: 'Education', emoji: '🎓' },
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'wedding', label: 'Wedding', emoji: '💍' },
  { id: 'other', label: 'Other', emoji: '🎯' },
];

export const getCategoryMeta = (categoryId) =>
  GOAL_CATEGORIES.find((c) => c.id === categoryId) || GOAL_CATEGORIES[7];

export const createGoal = async (userId, goalData) => {
  const goalsRef = collection(db, 'users', userId, 'goals');
  const docRef = await addDoc(goalsRef, {
    ...goalData,
    savedAmount: 0,
    status: 'active',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const subscribeToGoals = (userId, callback) => {
  const goalsRef = collection(db, 'users', userId, 'goals');
  const q = query(goalsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const goals = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(goals);
  });
};

export const updateSavedAmount = async (userId, goalId, newAmount, targetAmount) => {
  const goalRef = doc(db, 'users', userId, 'goals', goalId);
  const update = { savedAmount: newAmount };
  if (newAmount >= targetAmount) update.status = 'completed';
  await updateDoc(goalRef, update);
};

export const deleteGoal = async (userId, goalId) => {
  await deleteDoc(doc(db, 'users', userId, 'goals', goalId));
};
