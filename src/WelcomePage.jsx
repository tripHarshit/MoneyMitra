import React, { useState } from 'react';
import { Wallet, Shield, Bot, TrendingUp, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const WelcomePage = ({ onStart, isLoading = false, error = '' }) => {
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

  const ageGroupOptions = ['18–25', '26–35', '36–45', '46–55', '55+'];

  const financialGoals = [
    { id: 'Wealth Growth',  icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', description: 'Aggressive portfolio expansion' },
    { id: 'Save Money',     icon: Wallet,     color: 'text-sky-600',     bg: 'bg-sky-50',     border: 'border-sky-200',     description: 'Build a secure safety net' },
    { id: 'Manage Debt',    icon: Shield,     color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   description: 'Systematic debt reduction' },
    { id: 'Learn Basics',   icon: Bot,        color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-200',  description: 'Build personal finance fundamentals' },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormComplete = formData.occupation && formData.financialGoal;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormComplete && onStart) onStart(formData);
  };

  const trustBadges = [
    { icon: Shield, label: 'End-to-end encrypted' },
    { icon: Bot,    label: 'Powered by Gemini AI' },
    { icon: Sparkles, label: 'Personalized for you' },
  ];

  return (
    <div className="min-h-screen bg-[#f0faf4] text-[#0e1c16]">
      {/* Split layout on large screens */}
      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* Left panel – brand/hero */}
        <div className="sidebar-bg relative hidden flex-col justify-between px-12 py-16 lg:flex lg:w-[42%]">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-400/10 blur-2xl" />
          </div>

          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-emerald shadow-lg shadow-emerald-900/30">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-headline text-lg font-extrabold text-white">MoneyMitra</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/60">AI Financial Coach</p>
            </div>
          </div>

          {/* Hero copy */}
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3 w-3" /> Personalised just for you
            </div>
            <h1 className="font-headline text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              Your Fiscal<br />Sanctuary
            </h1>
            <p className="text-base leading-relaxed text-emerald-100/60">
              Tell us a little about yourself and we'll tailor your AI coach, insights, and goals to fit your life perfectly.
            </p>

            {/* Trust badges */}
            <div className="space-y-3 pt-2">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                    <Icon className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                  <p className="text-sm font-medium text-emerald-200/70">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom caption */}
          <p className="relative text-xs text-emerald-400/40">
            Used by 1,200+ students &amp; professionals across India
          </p>
        </div>

        {/* Right panel – form */}
        <div className="flex flex-1 flex-col">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 px-6 pt-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-emerald">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="font-headline text-lg font-extrabold text-emerald-900">MoneyMitra</span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-36 pt-8 md:px-10 lg:px-14 lg:pt-16">
            <div className="mx-auto max-w-lg">
              <div className="mb-8">
                <h2 className="font-headline text-3xl font-extrabold tracking-tight text-[#0e1c16]">Set up your profile</h2>
                <p className="mt-1.5 text-sm text-[#6b7e73]">Takes 30 seconds — personalises everything.</p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Occupation */}
                <section>
                  <label className="mb-2 block text-sm font-semibold text-[#0e1c16]">
                    What best describes you?
                  </label>
                  <div className="relative">
                    <select
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-2xl border border-[#d4e8dc] bg-white px-5 py-4 text-sm text-[#0e1c16] shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                      required
                    >
                      <option value="" disabled>Choose your occupation…</option>
                      {occupationOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9aada3]">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                        <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </section>

                {/* Age group */}
                <section>
                  <label className="mb-2 block text-sm font-semibold text-[#0e1c16]">Age group</label>
                  <div className="flex flex-wrap gap-2">
                    {ageGroupOptions.map((option) => {
                      const selected = formData.ageGroup === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleInputChange('ageGroup', option)}
                          className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                            selected
                              ? 'border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-900/15'
                              : 'border-[#d4e8dc] bg-white text-[#3d5246] hover:border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Financial goal */}
                <section>
                  <label className="mb-2 block text-sm font-semibold text-[#0e1c16]">Primary financial goal</label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {financialGoals.map((goal) => {
                      const Icon = goal.icon;
                      const selected = formData.financialGoal === goal.id;
                      return (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => handleInputChange('financialGoal', goal.id)}
                          className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                            selected
                              ? `${goal.border} ${goal.bg} shadow-md`
                              : 'border-[#d4e8dc] bg-white hover:border-emerald-200 hover:bg-emerald-50/50'
                          }`}
                        >
                          {selected && (
                            <div className="absolute right-3 top-3">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </div>
                          )}
                          <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${selected ? goal.bg : 'bg-[#f0faf4]'}`}>
                            <Icon className={`h-4.5 w-4.5 ${goal.color}`} />
                          </div>
                          <p className="font-headline text-sm font-bold text-[#0e1c16]">{goal.id}</p>
                          <p className="mt-0.5 text-xs text-[#6b7e73]">{goal.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </form>
            </div>
          </div>

          {/* Fixed CTA */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-[#d4e8dc] bg-white/92 px-6 py-5 backdrop-blur-xl lg:left-[42%] md:px-10 lg:px-14">
            <div className="mx-auto max-w-lg">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!isFormComplete || isLoading}
                className={`flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-bold text-white transition ${
                  isFormComplete && !isLoading
                    ? 'gradient-emerald shadow-xl shadow-emerald-900/20 hover:brightness-110'
                    : 'cursor-not-allowed bg-[#c0d4ca]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Setting up your account…
                  </>
                ) : (
                  <>
                    Start with MoneyMitra
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              <p className="mt-2.5 text-center text-xs text-[#9aada3]">
                Free to use · No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
