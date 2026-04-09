import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createChat } from '../services/chatService';
import { X, BookOpen, PiggyBank, CreditCard, TrendingUp, Palmtree, BarChart3, Check, Sparkles } from 'lucide-react';

const NewChatModal = ({ onClose, onChatCreated, userPreferences }) => {
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const goals = [
    { id: 'Learn Basics', icon: BookOpen, description: 'Foundation of finance' },
    { id: 'Save Money', icon: PiggyBank, description: 'Optimization strategies' },
    { id: 'Manage Debt', icon: CreditCard, description: 'Clearance and consolidation' },
    { id: 'Invest & Grow', icon: TrendingUp, description: 'Portfolio scaling' },
    { id: 'Plan Retirement', icon: Palmtree, description: 'Long-term security' },
    { id: 'Budget Management', icon: BarChart3, description: 'Daily flow control' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!primaryGoal) {
      setError('Please select a goal for this chat');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const chatId = await createChat(user.uid, {
        occupation: userPreferences?.occupation || 'Not specified',
        ageGroup: userPreferences?.ageGroup || 'Not specified',
        goal: primaryGoal,
      });

      onChatCreated(chatId);
    } catch (err) {
      setError(err.message || 'Failed to create chat');
      console.error('Error creating chat:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-emerald-100 bg-white panel-shadow">
        <div className="px-8 pb-6 pt-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-headline text-3xl font-extrabold tracking-tight text-[#141d1b]">Start a New Chat</h2>
              <p className="mt-1 text-[#3d4a42]">What would you like to focus on today?</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-full p-2 text-[#6d7a72] transition hover:bg-[#ecf6f2] hover:text-[#141d1b]"
              aria-label="Close new chat modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-10">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
              const IconComponent = goal.icon;
              const selected = primaryGoal === goal.id;

              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setPrimaryGoal(goal.id)}
                  disabled={loading}
                  className={`relative rounded-2xl border p-5 text-left transition ${
                    selected
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-emerald-100 bg-[#ecf6f2]/45 hover:border-emerald-300'
                  }`}
                >
                  {selected && (
                    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div className="mb-3 inline-flex rounded-xl bg-white p-2.5 text-emerald-700 shadow-sm">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <p className="font-headline text-base font-bold text-[#141d1b]">{goal.id}</p>
                  <p className="mt-1 text-xs text-[#3d4a42]">{goal.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-between gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-[#ffdcc3]/40 px-3 py-1.5 text-xs font-semibold text-[#6e3900] md:inline-flex">
              <Sparkles className="h-3.5 w-3.5" />
              AI Analysis Enabled
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-[#ecf6f2] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !primaryGoal}
                className="gradient-emerald rounded-xl px-7 py-2.5 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {loading ? 'Creating...' : 'Start Chat'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChatModal;
