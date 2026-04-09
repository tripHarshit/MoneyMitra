import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ArrowLeft, CalendarDays, Lightbulb, Plus, Sparkles, Trash2, Wallet, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchGeminiResponse } from '../geminiService';
import { addExpense, deleteExpense, EXPENSE_CATEGORIES, subscribeToMonthlyExpenses } from '../services/expenseService';
import { subscribeToGoals } from '../services/goalService';
import '../App.css';

const CATEGORY_MAP = EXPENSE_CATEGORIES.reduce((acc, item) => {
  acc[item.label] = item.emoji;
  return acc;
}, {});

const CHART_COLORS = ['#00855d', '#0da878', '#2acf96', '#58d9ad', '#8be3c6', '#ffb77d', '#e39657', '#6d7a72'];

const formatAmount = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value || 0);

const getDefaultDateInput = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getYearOptions = (selectedYear) => {
  const currentYear = new Date().getFullYear();
  const years = new Set([currentYear, selectedYear]);
  for (let i = 1; i <= 4; i += 1) {
    years.add(currentYear - i);
  }
  return Array.from(years).sort((a, b) => b - a);
};

const ExpensePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [insightError, setInsightError] = useState('');
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const insightsRef = useRef(null);
  const amountInputRef = useRef(null);
  const drawerRef = useRef(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: EXPENSE_CATEGORIES[0].label,
    description: '',
    date: getDefaultDateInput()
  });

  useEffect(() => {
    if (!user?.uid) return undefined;

    const unsubscribe = subscribeToMonthlyExpenses(user.uid, selectedYear, selectedMonth, (monthlyExpenses) => {
      setExpenses(monthlyExpenses);
    });

    return () => unsubscribe();
  }, [user?.uid, selectedMonth, selectedYear]);

  // Subscribe to active goals for the banner
  useEffect(() => {
    if (!user?.uid) return undefined;
    const unsub = subscribeToGoals(user.uid, (g) => setGoals(g.filter((x) => x.status === 'active')));
    return () => unsub();
  }, [user?.uid]);

  // Handle prefill from GoalsPage "Log as expense?"
  useEffect(() => {
    const prefill = location.state?.prefill;
    if (!prefill) return;
    setFormData((prev) => ({
      ...prev,
      amount: prefill.amount ?? prev.amount,
      category: prefill.category ?? prev.category,
      description: prefill.description ?? prev.description,
    }));
    setShowAddPanel(true);
    // Clear state so a refresh doesn't re-open the panel
    window.history.replaceState({}, '');
  }, [location.state]);

  useEffect(() => {
    if (!showAddPanel) return;
    const timer = window.setTimeout(() => amountInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [showAddPanel]);

  useEffect(() => {
    if (!showAddPanel) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowAddPanel(false);
        return;
      }

      if (event.key !== 'Tab' || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showAddPanel]);

  useEffect(() => {
    return () => {
      if (pendingDelete?.timerId) {
        window.clearTimeout(pendingDelete.timerId);
      }
    };
  }, [pendingDelete]);

  useEffect(() => {
    if (!toast || toast.action === 'undo') return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const monthLabel = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth, 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedMonth, selectedYear]);

  const totalThisMonth = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );

  const categoryData = useMemo(() => {
    const totals = new Map();
    EXPENSE_CATEGORIES.forEach((c) => totals.set(c.label, 0));

    expenses.forEach((expense) => {
      const existing = totals.get(expense.category) || 0;
      totals.set(expense.category, existing + Number(expense.amount || 0));
    });

    return Array.from(totals.entries())
      .filter(([, total]) => total > 0)
      .map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const dailyData = useMemo(() => {
    const totals = new Map();
    expenses.forEach((expense) => {
      const dateObj = expense.date?.toDate?.() ? expense.date.toDate() : new Date(expense.date);
      const dayKey = `${dateObj.getDate()}`.padStart(2, '0');
      const current = totals.get(dayKey) || 0;
      totals.set(dayKey, current + Number(expense.amount || 0));
    });

    return Array.from(totals.entries())
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([day, total]) => ({ day, total }));
  }, [expenses]);

  const topCategories = useMemo(
    () => [...categoryData].sort((a, b) => b.value - a.value).slice(0, 3),
    [categoryData]
  );

  const compactDailyData = useMemo(() => dailyData.slice(-6), [dailyData]);

  const visibleExpenses = useMemo(
    () => expenses.filter((expense) => expense.id !== pendingDelete?.id),
    [expenses, pendingDelete]
  );

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitExpense = async (event) => {
    event.preventDefault();
    if (!user?.uid) {
      setFormError('Session expired. Please sign in again and retry.');
      return;
    }

    setFormError('');
    setIsSaving(true);
    try {
      await addExpense(user.uid, formData);
      setToast({
        type: 'success',
        message: `₹${Number(formData.amount).toLocaleString('en-IN')} added to ${formData.category}`,
      });
      setFormData({
        amount: '',
        category: EXPENSE_CATEGORIES[0].label,
        description: '',
        date: getDefaultDateInput()
      });
      setShowAddPanel(false);
    } catch (error) {
      setFormError(error.message || 'Failed to save expense. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!user?.uid) return;

    if (pendingDelete) {
      window.clearTimeout(pendingDelete.timerId);
      try {
        await deleteExpense(user.uid, pendingDelete.id);
      } catch {
        setToast({ type: 'error', message: 'Could not delete previous expense. Please retry.' });
      }
    }

    const timerId = window.setTimeout(async () => {
      try {
        await deleteExpense(user.uid, expenseId);
      } catch {
        setToast({ type: 'error', message: 'Could not delete expense. Please retry.' });
      } finally {
        setPendingDelete(null);
      }
    }, 3000);

    setPendingDelete({ id: expenseId, timerId });
    setToast({ type: 'warning', message: 'Expense deleted.', action: 'undo' });
  };

  const undoDeleteExpense = () => {
    if (!pendingDelete) return;
    window.clearTimeout(pendingDelete.timerId);
    setPendingDelete(null);
    setToast({ type: 'success', message: 'Deletion undone.' });
  };

  const buildInsightSummary = () => {
    if (categoryData.length === 0) {
      return `No expenses recorded for ${monthLabel}.`;
    }

    const grouped = categoryData
      .map((entry) => `${entry.name}: ${formatAmount(entry.value)}`)
      .join(', ');

    return `Month: ${monthLabel}. Total spend: ${formatAmount(totalThisMonth)}. Category-wise spend: ${grouped}.`;
  };

  const handleGenerateInsights = async () => {
    setInsightError('');
    setAiInsight('');
    setIsGeneratingInsight(true);
    try {
      const dataSummary = buildInsightSummary();
      const prompt = `You are a financial coach. Here is the user's expense data for this month: ${dataSummary}. Give 3 specific actionable insights to reduce spending. Keep it under 150 words. Be direct and friendly.`;
      const response = await fetchGeminiResponse(prompt, {
        occupation: 'Expense Tracker User',
        ageGroup: 'Not specified',
        primaryGoal: 'Save Money'
      });
      setAiInsight(response);
    } catch (error) {
      setInsightError(error.message || 'Unable to generate insights right now.');
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0faf4] pb-28 md:pb-10">
      {/* Page hero header */}
      <div className="relative overflow-hidden border-b border-[#d4e8dc] bg-white px-5 py-6 md:px-8">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="rounded-xl border border-[#d4e8dc] p-2 text-[#3d5246] transition hover:bg-[#e8f5ed]"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-headline text-2xl font-extrabold tracking-tight text-emerald-900">Expense Tracker</h1>
              <p className="text-sm text-[#6b7e73]">Track monthly spending · get focused AI savings advice</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4e8dc] bg-[#e8f5ed] px-3 py-1.5 text-xs font-bold text-emerald-800">
              <CalendarDays className="h-3.5 w-3.5" />
              {monthLabel}
            </div>
            <button
              onClick={() => setShowAddPanel(true)}
              className="gradient-emerald inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-5 px-5 pt-5 md:px-8">

        {goals.length > 0 && (
          <section
            className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-5 py-4 panel-shadow transition hover:bg-emerald-50 card-lift"
            onClick={() => navigate('/goals')}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/goals')}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-emerald text-white shadow-md shadow-emerald-900/15">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">
                  {goals.length} active goal{goals.length > 1 ? 's' : ''} — stay on track
                </p>
                <p className="text-xs text-emerald-700">
                  Save{' '}
                  <span className="font-bold">₹{goals.reduce((s, g) => s + (g.monthlyTarget || 0), 0).toLocaleString('en-IN')}</span>
                  {' '}this month in total.
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50">
              View Goals →
            </span>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#d4e8dc] bg-white p-5 panel-shadow">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#6b7e73]">
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
              Total this month
            </div>
            <p className="font-headline text-3xl font-extrabold text-emerald-900">{formatAmount(totalThisMonth)}</p>
          </article>
          <article className="rounded-2xl border border-[#d4e8dc] bg-white p-5 panel-shadow">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#6b7e73]">
              <CalendarDays className="h-3.5 w-3.5 text-sky-600" />
              Transactions
            </div>
            <p className="font-headline text-3xl font-extrabold text-emerald-900">{expenses.length}</p>
          </article>
          <article className="rounded-2xl border border-[#d4e8dc] bg-white p-5 panel-shadow">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#6b7e73]">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Top category
            </div>
            <p className="font-headline text-2xl font-extrabold text-emerald-900">
              {categoryData[0]?.name || '—'}
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-[#d4e8dc] bg-white p-5 panel-shadow md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-headline text-xl font-extrabold text-emerald-900">Expense List</h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm text-[#141d1b]"
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index} value={index}>
                    {new Date(2026, index, 1).toLocaleString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm text-[#141d1b]"
              >
                {getYearOptions(selectedYear).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {visibleExpenses.length === 0 ? (
            <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center">
              <p className="text-sm text-[#3d4a42]">📭 No expenses this month.</p>
              <button
                onClick={() => setShowAddPanel(true)}
                className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
              >
                + Add your first expense
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white">
              <div className="grid grid-cols-[1.2fr_3fr_1.5fr_1.5fr_auto] gap-2 border-b border-emerald-100 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#6d7a72]">
                <span>Category</span>
                <span>Description</span>
                <span>Amount</span>
                <span>Date</span>
                <span className="text-right">Action</span>
              </div>
              <div className="max-h-90 overflow-y-auto">
                {visibleExpenses.map((expense) => {
                  const dateObj = expense.date?.toDate?.() ? expense.date.toDate() : new Date(expense.date);
                  return (
                    <div
                      key={expense.id}
                      className="grid grid-cols-[1.2fr_3fr_1.5fr_1.5fr_auto] gap-2 border-b border-emerald-50 px-4 py-3 text-sm text-[#141d1b] last:border-b-0"
                    >
                      <span className="font-semibold">
                        {CATEGORY_MAP[expense.category] || '📦'} {expense.category}
                      </span>
                      <span className="truncate text-[#3d4a42]">{expense.description || 'No description'}</span>
                      <span className="font-bold text-emerald-800">{formatAmount(expense.amount)}</span>
                      <span className="text-[#3d4a42]">{dateObj.toLocaleDateString()}</span>
                      <div className="text-right">
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="rounded-lg p-1.5 text-[#6d7a72] transition hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete expense"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-3xl border border-[#d4e8dc] bg-white p-5 panel-shadow md:p-6">
            <h3 className="font-headline text-lg font-extrabold text-emerald-900">Spending by Category</h3>
            <div className="relative mt-4 h-80">
              {categoryData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-emerald-100 bg-white text-sm text-[#3d4a42]">
                  Add expenses to see category trends.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={112}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatAmount(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {categoryData.length > 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-white/90 px-4 py-2 text-center shadow-sm">
                    <p className="text-xs font-semibold text-[#7a8a82]">Total</p>
                    <p className="text-sm font-bold text-emerald-900">{formatAmount(totalThisMonth)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 rounded-2xl border border-emerald-100 bg-white p-4">
              <p className="text-sm font-semibold text-emerald-900">Top 3 categories this month</p>
              <div className="mt-2 space-y-2 text-sm">
                {topCategories.length > 0 ? (
                  topCategories.map((entry) => (
                    <p key={entry.name} className="flex items-center justify-between text-[#4a5a52]">
                      <span>{CATEGORY_MAP[entry.name] || '📦'} {entry.name}</span>
                      <span className="font-semibold text-emerald-800">{formatAmount(entry.value)}</span>
                    </p>
                  ))
                ) : (
                  <p className="text-[#7a8a82]">No spending breakdown available yet.</p>
                )}
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-[#d4e8dc] bg-white p-5 panel-shadow md:p-6">
            <h3 className="font-headline text-lg font-extrabold text-emerald-900">Day-wise Spending</h3>
            <div className="mt-4 h-80">
              {compactDailyData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-emerald-100 bg-white text-sm text-[#3d4a42]">
                  Add expenses to see daily trends.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compactDailyData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dbe5e1" />
                    <XAxis
                      dataKey="day"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={48}
                      tick={{ fill: '#3d4a42', fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: '#3d4a42', fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatAmount(Number(value))} />
                    <Bar dataKey="total" fill="#00855d" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>
        </section>

        <section ref={insightsRef} className="rounded-3xl border border-[#d4e8dc] bg-white p-5 panel-shadow md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-headline text-lg font-extrabold text-emerald-900">AI Insights</h3>
            <button
              onClick={handleGenerateInsights}
              disabled={isGeneratingInsight}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {isGeneratingInsight ? 'Generating...' : 'Get AI Insights'}
            </button>
          </div>

          {insightError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{insightError}</div>
          ) : null}

          {aiInsight ? (
            <article className="fade-in mt-4 rounded-2xl border border-amber-200 bg-[#ffdcc3]/35 p-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#6e3900]">
                <Lightbulb className="h-3.5 w-3.5" />
                Financial Coach Notes
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-[#6e3900]">{aiInsight}</p>
            </article>
          ) : (
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-white p-5 text-sm text-[#3d4a42]">
              Click <span className="font-semibold">Get AI Insights</span> to analyze this month&apos;s expenses and receive 3 concrete actions.
            </div>
          )}
        </section>
      </div>

      <button
        onClick={() => {
          insightsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (!aiInsight && !isGeneratingInsight) {
            handleGenerateInsights();
          }
        }}
        className="fixed bottom-6 right-5 z-40 rounded-full border border-amber-200 bg-[#ffdcc3] px-4 py-3 text-sm font-bold text-[#6e3900] shadow-lg transition hover:brightness-95 md:right-8"
      >
        Get AI Tips {categoryData.length > 0 ? '(3 insights)' : '(0 insights)'}
      </button>

      {toast ? (
        <div
          className="fixed bottom-24 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-xl"
          role="alert"
        >
          <div className="flex items-center justify-between gap-3">
            <p className={`text-sm ${toast.type === 'error' ? 'text-red-700' : 'text-[#141d1b]'}`}>{toast.message}</p>
            {toast.action === 'undo' ? (
              <button
                onClick={undoDeleteExpense}
                className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
              >
                Undo
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {showAddPanel ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            aria-label="Close add expense panel"
            className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            onClick={() => setShowAddPanel(false)}
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Add expense"
            className="relative h-full w-full max-w-md overflow-y-auto border-l border-[#d4e8dc] bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-headline text-xl font-extrabold text-emerald-900">Add Expense</h2>
              <Wallet className="h-5 w-5 text-emerald-700" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmitExpense}>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6d7a72]">Amount</label>
                <input
                  ref={amountInputRef}
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-[#141d1b] placeholder:text-[#6d7a72]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6d7a72]">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-[#141d1b]"
                >
                  {EXPENSE_CATEGORIES.map((item) => (
                    <option key={item.label} value={item.label}>
                      {item.emoji} {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6d7a72]">Description (optional)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="What was this expense for?"
                  className="w-full resize-none rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-[#141d1b] placeholder:text-[#6d7a72]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6d7a72]">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-[#141d1b]"
                />
              </div>

              {formError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{formError}</div>
              ) : null}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="gradient-emerald w-full rounded-xl py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
};

export default ExpensePage;

