import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '../firebase';

export const EXPENSE_CATEGORIES = [
  { label: 'Food', emoji: '🍔' },
  { label: 'Transport', emoji: '🚌' },
  { label: 'Shopping', emoji: '🛍️' },
  { label: 'Entertainment', emoji: '🎬' },
  { label: 'Health', emoji: '🏥' },
  { label: 'Rent/EMI', emoji: '🏠' },
  { label: 'Utilities', emoji: '💡' },
  { label: 'Savings', emoji: '💰' },
  { label: 'Other', emoji: '📦' }
];

const getExpensesCollection = (userId) => collection(db, 'users', userId, 'expenses');

const parseAmount = (amount) => {
  if (typeof amount === 'number') return amount;
  if (typeof amount !== 'string') return Number.NaN;
  return Number(amount.replace(/[\s,]/g, ''));
};

const parseExpenseDate = (date) => {
  if (date instanceof Date) return date;

  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-').map(Number);
    // Use local noon to avoid timezone edge cases around day/month boundaries.
    return new Date(y, m - 1, d, 12, 0, 0, 0);
  }

  return new Date(date);
};

export const addExpense = async (userId, { amount, category, description = '', date }) => {
  if (!userId) {
    throw new Error('Session expired. Please sign in again and retry.');
  }

  const parsedAmount = parseAmount(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Amount must be a valid number greater than 0.');
  }

  const expenseDate = parseExpenseDate(date);
  if (Number.isNaN(expenseDate.getTime())) {
    throw new Error('A valid expense date is required.');
  }

  if (!EXPENSE_CATEGORIES.some((item) => item.label === category)) {
    throw new Error('Please choose a valid expense category.');
  }

  try {
    await addDoc(getExpensesCollection(userId), {
      amount: parsedAmount,
      category,
      description: String(description || '').trim(),
      date: Timestamp.fromDate(expenseDate),
      createdAt: serverTimestamp()
    });
  } catch (error) {
    if (error?.code === 'permission-denied') {
      throw new Error('Unable to save expense due to Firestore permissions. Update your rules to allow writes to users/{uid}/expenses for the logged-in user.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Network issue while saving expense. Please check your connection and retry.');
    }
    throw error;
  }
};

export const deleteExpense = async (userId, expenseId) => {
  await deleteDoc(doc(db, 'users', userId, 'expenses', expenseId));
};

export const subscribeToMonthlyExpenses = (userId, year, month, callback) => {
  const monthStart = Timestamp.fromDate(new Date(year, month, 1, 0, 0, 0, 0));
  const nextMonthStart = Timestamp.fromDate(new Date(year, month + 1, 1, 0, 0, 0, 0));

  const monthlyQuery = query(
    getExpensesCollection(userId),
    where('date', '>=', monthStart),
    where('date', '<', nextMonthStart),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    monthlyQuery,
    (snapshot) => {
      const monthlyExpenses = snapshot.docs.map((expenseDoc) => ({
        id: expenseDoc.id,
        ...expenseDoc.data()
      }));
      callback(monthlyExpenses);
    },
    (error) => {
      console.error('❌ Error subscribing to monthly expenses:', error.message);
    }
  );
};

