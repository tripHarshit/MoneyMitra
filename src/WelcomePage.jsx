import React, { useState } from 'react';
import { Wallet, Shield, Bot, TrendingUp, ArrowRight } from 'lucide-react';

const WelcomePage = ({ onStart, isLoading = false }) => {
  const [formData, setFormData] = useState({
    occupation: '',
    ageGroup: '',
    financialGoal: '',
  });

  const occupationOptions = [
    'Student',
    'Working Professional',
    'Freelancer',
    'Small Business Owner',
    'Homemaker',
    'Retired',
    'Self-Employed',
    'Other',
  ];

  const ageGroupOptions = ['18-25', '26-35', '36-45', '46-55', '55+'];

  const financialGoals = [
    { id: 'Wealth Growth', icon: Wallet, description: 'Aggressive portfolio expansion' },
    { id: 'Save Money', icon: Shield, description: 'Secure liquidity and emergency safety' },
    { id: 'Manage Debt', icon: TrendingUp, description: 'Systematic debt reduction planning' },
    { id: 'Learn Basics', icon: Bot, description: 'Build strong personal finance fundamentals' },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
    <div className="min-h-screen bg-[#f2fcf8] text-[#141d1b]">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col bg-gradient-to-b from-[#ecf6f2] to-white px-6">
        <header className="pb-8 pt-12 text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-700" />
            <span className="font-headline text-2xl font-bold tracking-tight text-emerald-800">MoneyMitra AI</span>
          </div>

          <div className="mb-8">
            <div className="mb-2 flex items-end justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Step 1 of 1</span>
              <span className="text-xs text-[#3d4a42]">Profile Setup</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#dbe5e1]">
              <div className="h-full w-full rounded-full bg-emerald-700"></div>
            </div>
          </div>

          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-[#141d1b]">Welcome to your Fiscal Sanctuary</h1>
          <p className="mt-2 text-lg text-[#3d4a42]">Let&apos;s tailor your wealth curation experience.</p>
        </header>

        <main className="flex-grow space-y-10 pb-28">
          <section className="space-y-3">
            <label className="ml-1 block text-sm font-semibold text-[#3d4a42]">What describes you best?</label>
            <select
              value={formData.occupation}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-2xl border border-transparent bg-[#dbe5e1] px-5 py-4 text-[#141d1b] outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
              required
            >
              <option value="" disabled>
                Select Occupation
              </option>
              {occupationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </section>

          <section className="space-y-3">
            <label className="ml-1 block text-sm font-semibold text-[#3d4a42]">Select your age group</label>
            <div className="flex flex-wrap gap-3">
              {ageGroupOptions.map((option) => {
                const selected = formData.ageGroup === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleInputChange('ageGroup', option)}
                    className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                      selected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#dbe5e1] text-[#3d4a42] hover:bg-[#cfdad5]'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <label className="ml-1 block text-sm font-semibold text-[#3d4a42]">Primary Financial Goal</label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {financialGoals.map((goal) => {
                const IconComponent = goal.icon;
                const selected = formData.financialGoal === goal.id;

                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleInputChange('financialGoal', goal.id)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      selected
                        ? 'border-emerald-500 bg-white shadow-md'
                        : 'border-[#dbe5e1] bg-white hover:border-emerald-200'
                    }`}
                  >
                    <IconComponent className={`mb-3 h-7 w-7 ${selected ? 'text-emerald-700' : 'text-[#6d7a72]'}`} />
                    <h3 className="font-headline font-bold text-[#141d1b]">{goal.id}</h3>
                    <p className="mt-1 text-xs text-[#3d4a42]">{goal.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-3 gap-4 pt-2">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ecf6f2] text-emerald-700">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#3d4a42]">Encrypted</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ecf6f2] text-emerald-700">
                <Bot className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#3d4a42]">AI Powered</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ecf6f2] text-emerald-700">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#3d4a42]">Growth First</span>
            </div>
          </section>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 mx-auto max-w-2xl border-t border-emerald-100 bg-white/90 p-6 backdrop-blur-xl">
          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={!isFormComplete || isLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold text-white transition ${
                isFormComplete && !isLoading
                  ? 'gradient-emerald shadow-lg shadow-emerald-900/20 hover:brightness-105'
                  : 'cursor-not-allowed bg-[#bccac0]'
              }`}
            >
              {isLoading ? 'Setting up your account...' : 'Get Started'}
              {!isLoading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default WelcomePage;
