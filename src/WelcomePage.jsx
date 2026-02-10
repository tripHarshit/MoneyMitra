import React, { useState } from 'react';
import { Wallet, Shield, BookOpen, PiggyBank, CreditCard, TrendingUp, Sparkles, Lock, Check } from 'lucide-react';

const WelcomePage = ({ onStart, isLoading = false }) => {
  const [formData, setFormData] = useState({
    occupation: '',
    ageGroup: '',
    financialGoal: ''
  });

  const occupationOptions = [
    'Student',
    'Working Professional',
    'Freelancer',
    'Small Business Owner',
    'Homemaker',
    'Retired',
    'Self-Employed',
    'Other'
  ];

  const ageGroupOptions = [
    '18-25',
    '26-35',
    '36-45',
    '46-55',
    '55+'
  ];

  const financialGoals = [
    { 
      id: 'Save Money', 
      label: 'Save Money', 
      icon: PiggyBank,
      description: 'Build your savings and emergency fund'
    },
    { 
      id: 'Manage Debt', 
      label: 'Manage Debt', 
      icon: CreditCard,
      description: 'Manage and eliminate your debts'
    },
    { 
      id: 'Learn Basics', 
      label: 'Learn Basics', 
      icon: BookOpen,
      description: 'Understand personal finance fundamentals'
    },
    { 
      id: 'Invest & Grow', 
      label: 'Invest & Grow', 
      icon: TrendingUp,
      description: 'Learn to grow your money wisely'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormComplete = formData.occupation && formData.financialGoal;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormComplete && onStart) {
      onStart(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-purple-500/10 to-indigo-500/5 rounded-full blur-3xl translate-x-40 translate-y-40"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        {/* Glassmorphism Card */}
        <div className="w-full max-w-lg mx-auto">
          <div className="glass rounded-3xl float-shadow p-8 relative">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              {/* Logo */}
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                <Wallet className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              
              {/* Title */}
              <h1 className="text-3xl font-semibold text-white mb-2">MoneyMitra</h1>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Your Personal AI Financial Guide.<br />
                <span className="text-indigo-400 font-medium">Simplified.</span>
              </p>
              
              {/* Features List */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center justify-center space-x-3 text-gray-300">
                  <Sparkles className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
                  <span className="text-sm font-medium">AI-Powered Financial Guidance</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-gray-300">
                  <Shield className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Secure & Private</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-gray-300">
                  <BookOpen className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Educational Focus</span>
                </div>
              </div>
            </div>

            {/* Context Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Occupation Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What describes you best?
                </label>
                <select
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full px-4 py-3 bg-[#22262E] border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 text-gray-200 appearance-none cursor-pointer outline-none"
                  required
                >
                  <option value="" className="bg-[#22262E]">Select your occupation</option>
                  {occupationOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#22262E]">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Group Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age Group
                </label>
                <select
                  value={formData.ageGroup}
                  onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                  className="w-full px-4 py-3 bg-[#22262E] border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 text-gray-200 appearance-none cursor-pointer outline-none"
                >
                  <option value="" className="bg-[#22262E]">Select your age group</option>
                  {ageGroupOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#22262E]">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Financial Goal Cards */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  What's your primary financial goal?
                </label>
                <div className="space-y-2">
                  {financialGoals.map((goal) => {
                    const IconComponent = goal.icon;
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => handleInputChange('financialGoal', goal.id)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 transform hover:-translate-y-0.5 ${
                          formData.financialGoal === goal.id
                            ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                            : 'border-white/5 bg-[#22262E] hover:border-white/10 hover:bg-[#2A2F38]'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            formData.financialGoal === goal.id 
                              ? 'bg-indigo-500/20' 
                              : 'bg-white/5'
                          }`}>
                            <IconComponent className={`w-5 h-5 ${
                              formData.financialGoal === goal.id ? 'text-indigo-400' : 'text-gray-400'
                            }`} strokeWidth={1.5} />
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium text-sm ${
                              formData.financialGoal === goal.id ? 'text-indigo-300' : 'text-gray-200'
                            }`}>{goal.label}</div>
                            <div className={`text-xs mt-0.5 ${
                              formData.financialGoal === goal.id ? 'text-indigo-400/70' : 'text-gray-500'
                            }`}>
                              {goal.description}
                            </div>
                          </div>
                          {formData.financialGoal === goal.id && (
                            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" strokeWidth={2} />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Get Started Button */}
              <button
                type="submit"
                disabled={!isFormComplete || isLoading}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 transform ${
                  isFormComplete && !isLoading
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:-translate-y-0.5 shadow-xl shadow-indigo-500/30'
                    : 'bg-gray-700 cursor-not-allowed text-gray-400'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Setting up your account...
                  </span>
                ) : (
                  'Start Your Financial Journey'
                )}
              </button>

              {/* Privacy Notice */}
              <div className="text-center pt-2">
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <Lock className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs">Private & Educational. No data stored permanently.</span>
                </div>
              </div>
              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;