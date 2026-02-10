import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createChat } from '../services/chatService';
import { X, BookOpen, PiggyBank, CreditCard, TrendingUp, Palmtree, BarChart3, Check } from 'lucide-react';

const NewChatModal = ({ onClose, onChatCreated, userPreferences }) => {
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const goals = [
    { id: 'Learn Basics', icon: BookOpen, description: 'Understand financial fundamentals' },
    { id: 'Save Money', icon: PiggyBank, description: 'Build savings and emergency fund' },
    { id: 'Manage Debt', icon: CreditCard, description: 'Pay off and manage debts' },
    { id: 'Invest & Grow', icon: TrendingUp, description: 'Learn about investments' },
    { id: 'Plan Retirement', icon: Palmtree, description: 'Prepare for retirement' },
    { id: 'Budget Management', icon: BarChart3, description: 'Create and manage budgets' }
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
        goal: primaryGoal
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal */}
      <div className="bg-[#1A1D23] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-white/5 float-shadow">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Start New Chat</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors duration-300 p-1 hover:bg-white/10 rounded-lg"
              disabled={loading}
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">What would you like help with?</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Goal Selection - Card Style */}
          <div className="space-y-2">
            {goals.map(goal => {
              const IconComponent = goal.icon;
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setPrimaryGoal(goal.id)}
                  disabled={loading}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-4 hover:-translate-y-0.5 ${
                    primaryGoal === goal.id
                      ? 'border-indigo-500/50 bg-indigo-500/10'
                      : 'border-white/5 hover:border-white/10 bg-[#22262E] hover:bg-[#2A2F38]'
                  } disabled:opacity-50 disabled:hover:translate-y-0`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    primaryGoal === goal.id 
                      ? 'bg-indigo-500/20' 
                      : 'bg-white/5'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${primaryGoal === goal.id ? 'text-indigo-400' : 'text-gray-400'}`} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${primaryGoal === goal.id ? 'text-indigo-300' : 'text-gray-200'}`}>
                      {goal.id}
                    </p>
                    <p className={`text-xs ${primaryGoal === goal.id ? 'text-indigo-400/70' : 'text-gray-500'}`}>
                      {goal.description}
                    </p>
                  </div>
                  {primaryGoal === goal.id && (
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-white/10 rounded-2xl text-gray-300 font-medium text-sm hover:bg-white/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !primaryGoal}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-medium text-sm hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Start Chat'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChatModal;
