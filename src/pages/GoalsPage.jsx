import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  createGoal,
  subscribeToGoals,
  updateSavedAmount,
  deleteGoal,
  GOAL_CATEGORIES,
  getCategoryMeta,
} from '../services/goalService';
import { GoogleGenAI } from '@google/genai';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Plus,
  X,
  Trash2,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Receipt,
} from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0);

const monthsUntil = (deadline) => {
  if (!deadline) return 1;
  const now = new Date();
  const d = deadline.toDate ? deadline.toDate() : new Date(deadline);
  const diff =
    (d.getFullYear() - now.getFullYear()) * 12 +
    (d.getMonth() - now.getMonth());
  return Math.max(1, diff);
};

const daysUntil = (deadline) => {
  if (!deadline) return 0;
  const d = deadline.toDate ? deadline.toDate() : new Date(deadline);
  return Math.max(0, Math.ceil((d - new Date()) / 86400000));
};

const toDate = (value) => {
  if (!value) return new Date();
  return value.toDate ? value.toDate() : new Date(value);
};

const monthDiff = (fromDate, toDateValue) => {
  const from = toDate(fromDate);
  const to = toDate(toDateValue);
  return Math.max(1, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1);
};

const addMonths = (baseDate, months) => {
  const d = new Date(baseDate);
  d.setMonth(d.getMonth() + Math.max(0, months));
  return d;
};

async function callGemini(prompt) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  if (response.text && typeof response.text === 'string') return response.text;
  if (response.candidates?.[0]?.content?.parts)
    return response.candidates[0].content.parts.map((p) => p.text).join('');
  return '';
}

// ─── Create Goal Modal ────────────────────────────────────────────────────────
function CreateGoalModal({ onClose, userId }) {
  const [form, setForm] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    category: 'emergency',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.targetAmount || !form.deadline) {
      setError('Please fill all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const target = parseFloat(form.targetAmount);
      const deadlineDate = new Date(form.deadline);
      const months = Math.max(
        1,
        (deadlineDate.getFullYear() - new Date().getFullYear()) * 12 +
          (deadlineDate.getMonth() - new Date().getMonth())
      );
      const monthly = Math.ceil(target / months);

      let aiTip = '';
      try {
        aiTip = await callGemini(
          `User wants to save ₹${fmt(target)} for ${form.title} in ${months} months. Their monthly target is ₹${fmt(monthly)}. Give one practical saving tip specific to this goal in under 25 words.`
        );
        aiTip = aiTip.trim().replace(/^"|"$/g, '');
      } catch {
        // Keep goal creation non-blocking if the tip request fails.
      }

      await createGoal(userId, {
        title: form.title,
        targetAmount: target,
        deadline: deadlineDate,
        category: form.category,
        monthlyTarget: monthly,
        aiTip,
      });
      onClose();
    } catch (err) {
      setError('Failed to create goal. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-7 panel-shadow">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline text-xl font-extrabold text-emerald-900">New Goal</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#6d7a72] hover:bg-emerald-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3d4a42]">
              Goal Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handle}
              placeholder="e.g. Buy a MacBook"
              className="w-full rounded-2xl border border-emerald-100 bg-[#e0eae6] px-4 py-3 text-sm text-[#141d1b] placeholder:text-[#6d7a72] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3d4a42]">
              Target Amount (₹)
            </label>
            <input
              name="targetAmount"
              type="number"
              min="1"
              value={form.targetAmount}
              onChange={handle}
              placeholder="e.g. 150000"
              className="w-full rounded-2xl border border-emerald-100 bg-[#e0eae6] px-4 py-3 text-sm text-[#141d1b] placeholder:text-[#6d7a72] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3d4a42]">
              Target Deadline
            </label>
            <input
              name="deadline"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={form.deadline}
              onChange={handle}
              className="w-full rounded-2xl border border-emerald-100 bg-[#e0eae6] px-4 py-3 text-sm text-[#141d1b] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3d4a42]">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {GOAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                  className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-center transition ${
                    form.category === cat.id
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                      : 'border-emerald-100 bg-white text-[#3d4a42] hover:bg-emerald-50'
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-[9px] font-semibold leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs font-medium text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="gradient-emerald mt-2 w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Add Savings Modal ────────────────────────────────────────────────────────
function AddSavingsModal({ goal, onClose, userId }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedAmount, setSavedAmount] = useState(null); // non-null = success step

  const submit = async (e) => {
    e.preventDefault();
    const add = parseFloat(amount);
    if (!add || add <= 0) return;
    setLoading(true);
    try {
      const newAmount = Math.min(goal.savedAmount + add, goal.targetAmount);
      await updateSavedAmount(userId, goal.id, newAmount, goal.targetAmount);
      setSavedAmount(add); // show success + log-as-expense step
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogAsExpense = () => {
    navigate('/expenses', {
      state: {
        prefill: {
          amount: savedAmount,
          category: 'Savings',
          description: `Savings: ${goal.title}`,
        },
      },
    });
  };

  const remaining = goal.targetAmount - goal.savedAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-7 panel-shadow">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-headline text-lg font-extrabold text-emerald-900">Add Savings</h3>
            <p className="text-xs text-[#3d4a42]">{getCategoryMeta(goal.category).emoji} {goal.title}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#6d7a72] hover:bg-emerald-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        {savedAmount !== null ? (
          // ── Success + log-as-expense step ──
          <div className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-4 text-center">
              <p className="text-2xl mb-1">✅</p>
              <p className="font-bold text-emerald-900">₹{fmt(savedAmount)} saved!</p>
              <p className="text-xs text-emerald-700 mt-0.5">Also log this as an expense?</p>
            </div>
            <button
              onClick={handleLogAsExpense}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
            >
              <Receipt className="h-4 w-4" />
              Log ₹{fmt(savedAmount)} as Expense
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-emerald-100 py-3 text-sm font-semibold text-[#3d4a42] transition hover:bg-emerald-50"
            >
              No thanks, done
            </button>
          </div>
        ) : (
          // ── Input step ──
          <>
            <p className="mb-4 rounded-xl bg-[#ecf6f2] px-4 py-2.5 text-sm text-emerald-700">
              Remaining: <span className="font-bold">₹{fmt(remaining)}</span>
            </p>
            <form onSubmit={submit} className="space-y-4">
              <input
                type="number"
                min="1"
                max={remaining}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Up to ₹${fmt(remaining)}`}
                className="w-full rounded-2xl border border-emerald-100 bg-[#e0eae6] px-4 py-3 text-sm text-[#141d1b] placeholder:text-[#6d7a72] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="gradient-emerald w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:brightness-105 disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Add Amount'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ goal, onAddSavings, onDelete }) {
  const cat = getCategoryMeta(goal.category);
  const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
  const days = daysUntil(goal.deadline);
  const isCompleted = goal.status === 'completed';
  const monthsLeft = monthsUntil(goal.deadline);
  const monthlyRequired = Math.max(0, (goal.targetAmount - goal.savedAmount) / monthsLeft);
  const monthsElapsed = monthDiff(goal.createdAt || new Date(), new Date());
  const actualMonthly = goal.savedAmount / monthsElapsed;
  const delta = actualMonthly - (goal.monthlyTarget || 0);

  const status =
    actualMonthly >= (goal.monthlyTarget || 0) * 1.05
      ? 'ahead'
      : actualMonthly >= (goal.monthlyTarget || 0) * 0.9
        ? 'on-track'
        : 'behind';

  const projectionDate =
    actualMonthly > 0
      ? addMonths(new Date(), Math.ceil((goal.targetAmount - goal.savedAmount) / actualMonthly))
      : null;

  if (isCompleted) return null; // completed goals shown separately

  const ringColor = status === 'ahead' ? '#059669' : status === 'on-track' ? '#d97706' : '#dc2626';
  const paceTextColor = status === 'ahead' ? 'text-emerald-700' : status === 'on-track' ? 'text-amber-700' : 'text-red-700';

  return (
    <div className="group rounded-2xl border border-emerald-100 bg-white p-5 panel-shadow transition hover:-translate-y-0.5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecf6f2] text-xl">
            {cat.emoji}
          </div>
          <div>
            <p className="font-semibold text-[#141d1b]">{goal.title}</p>
            <p className="text-xs text-[#6d7a72]">{cat.label}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(goal)}
          className="rounded-lg p-1.5 text-[#6d7a72] opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
          aria-label={`Delete ${goal.title}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div
          className="relative h-16 w-16 rounded-full"
          style={{
            background: `conic-gradient(${ringColor} ${pct * 3.6}deg, #e0eae6 0deg)`,
          }}
        >
          <div className="absolute inset-1.5 flex items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-900">
            {pct}%
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm text-[#3d4a42]">
            Saved <span className="font-bold text-emerald-700">₹{fmt(goal.savedAmount)}</span> of{' '}
            <span className="font-semibold text-emerald-900">₹{fmt(goal.targetAmount)}</span>
          </p>
          <p className={`mt-1 text-xs font-semibold ${paceTextColor}`}>
            {status === 'ahead' ? 'Ahead of pace' : status === 'on-track' ? 'On track' : 'Behind pace'}
          </p>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-[#ecf6f2] px-3 py-2">
          <p className="text-[#7a8a82]">Monthly required</p>
          <p className="font-semibold text-emerald-900">₹{fmt(monthlyRequired)}</p>
        </div>
        <div className="rounded-xl bg-[#ecf6f2] px-3 py-2">
          <p className="text-[#7a8a82]">Monthly actual</p>
          <p className="font-semibold text-emerald-900">₹{fmt(actualMonthly)}</p>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <p className={`text-sm font-bold ${days <= 30 ? 'text-red-700' : days <= 60 ? 'text-amber-700' : 'text-emerald-700'}`}>
          {days} days remaining
        </p>
        <p className={`text-xs font-semibold ${delta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
          {delta >= 0 ? 'Monthly surplus' : 'Monthly shortfall'}: ₹{fmt(Math.abs(delta))}
        </p>
        <p className="text-xs text-[#4a5a52]">
          At this rate, you&apos;ll reach goal by{' '}
          <span className="font-semibold text-emerald-900">
            {projectionDate ? projectionDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
          </span>
        </p>
      </div>

      {goal.aiTip && (
        <div className="mb-4 rounded-xl border border-amber-200/60 bg-[#ffdcc3]/30 px-3 py-2.5 text-xs text-[#6e3900]">
          <span className="mr-1.5 font-bold">💡 AI Tip:</span>{goal.aiTip}
        </div>
      )}

      <button
        onClick={() => onAddSavings(goal)}
        className="gradient-emerald w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105"
      >
        + Add Savings
      </button>
    </div>
  );
}

// ─── Goals Page ───────────────────────────────────────────────────────────────
export default function GoalsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [addSavingsGoal, setAddSavingsGoal] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [celebrateId, setCelebrateId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [hiddenGoalIds, setHiddenGoalIds] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToGoals(user.uid, (g) => {
      // detect newly completed
      setGoals((prev) => {
        const prevIds = new Set(prev.filter((x) => x.status === 'completed').map((x) => x.id));
        g.forEach((goal) => {
          if (goal.status === 'completed' && !prevIds.has(goal.id)) {
            setCelebrateId(goal.id);
            setTimeout(() => setCelebrateId(null), 4000);
          }
        });
        return g;
      });
    });
    return () => unsub();
  }, [user?.uid]);

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

  const visibleGoals = goals.filter((goal) => !hiddenGoalIds.includes(goal.id));

  const active = visibleGoals.filter((g) => g.status === 'active');
  const completed = visibleGoals.filter((g) => g.status === 'completed');

  const totalTarget = active.reduce((s, g) => s + (g.targetAmount || 0), 0);
  const totalSaved = active.reduce((s, g) => s + (g.savedAmount || 0), 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const radialData = [{ name: 'Progress', value: overallPct, fill: '#006948' }];

  const requestDeleteGoal = async (goal) => {
    if (!user?.uid) return;

    if (pendingDelete) {
      window.clearTimeout(pendingDelete.timerId);
      try {
        await deleteGoal(user.uid, pendingDelete.id);
      } catch {
        setToast({ type: 'error', message: 'Could not delete previous goal. Try again.' });
      }
    }

    const timerId = window.setTimeout(async () => {
      try {
        await deleteGoal(user.uid, goal.id);
      } catch {
        setToast({ type: 'error', message: 'Could not delete goal. Try again.' });
      } finally {
        setPendingDelete(null);
      }
    }, 3000);

    setHiddenGoalIds((prev) => [...new Set([...prev, goal.id])]);
    setPendingDelete({ id: goal.id, timerId });
    setToast({ type: 'warning', message: `"${goal.title}" deleted.`, action: 'undo' });
  };

  const undoDeleteGoal = () => {
    if (!pendingDelete) return;
    window.clearTimeout(pendingDelete.timerId);
    setHiddenGoalIds((prev) => prev.filter((id) => id !== pendingDelete.id));
    setPendingDelete(null);
    setToast({ type: 'success', message: 'Deletion undone.' });
  };

  const getMonthlyAdvice = async () => {
    setAiLoading(true);
    setAiAdvice('');
    try {
      const summary = goals
        .map(
          (g) =>
            `${g.title} (${getCategoryMeta(g.category).label}): ₹${fmt(g.savedAmount)} saved of ₹${fmt(g.targetAmount)} (${Math.round((g.savedAmount / g.targetAmount) * 100)}%)`
        )
        .join(', ');
      const text = await callGemini(
        `Here are the user's financial goals and progress: ${summary}. Give 2-3 sentences of coaching advice on which goal to prioritize and why. Be specific and encouraging.`
      );
      setAiAdvice(text.trim());
    } catch {
      setAiAdvice('Unable to fetch advice right now. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2fcf8] text-[#141d1b]">
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-6 md:px-8">
        {/* Header */}
        <header className="mb-8 rounded-2xl border border-emerald-100 bg-white/80 px-6 py-4 backdrop-blur-xl panel-shadow">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/app')}
                className="rounded-lg p-1.5 text-[#6d7a72] hover:bg-emerald-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="font-headline text-2xl font-extrabold tracking-tight text-emerald-900">
                  Goal Tracker
                </h2>
                <p className="text-sm text-[#3d4a42]">Track your savings milestones</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="gradient-emerald flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              New Goal
            </button>
          </div>
        </header>

        {/* Summary Section */}
        {goals.length > 0 && (
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {/* Radial progress */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-white p-5 panel-shadow">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#3d4a42]/70">
                Overall Progress
              </p>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    data={radialData}
                    startAngle={90}
                    endAngle={90 - 360 * (overallPct / 100)}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#e0eae6' }} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Progress']} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="font-headline text-3xl font-extrabold text-emerald-900">{overallPct}%</p>
              <p className="text-xs text-[#6d7a72]">of all targets</p>
            </div>

            {/* Stats */}
            <div className="col-span-1 flex flex-col justify-between gap-3 md:col-span-2">
              <div className="grid grid-cols-3 gap-3 h-full">
                <div className="rounded-2xl border border-emerald-100 bg-white p-5 panel-shadow flex flex-col justify-center">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3d4a42]/70">Active Goals</p>
                  <p className="font-headline mt-1 text-3xl font-extrabold text-emerald-900">{active.length}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white p-5 panel-shadow flex flex-col justify-center">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3d4a42]/70">Total Target</p>
                  <p className="font-headline mt-1 text-2xl font-extrabold text-emerald-900">₹{fmt(totalTarget)}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white p-5 panel-shadow flex flex-col justify-center">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3d4a42]/70">Total Saved</p>
                  <p className="font-headline mt-1 text-2xl font-extrabold text-emerald-700">₹{fmt(totalSaved)}</p>
                </div>
              </div>

              {/* Overall progress bar */}
              <div className="rounded-2xl border border-emerald-100 bg-white px-5 py-4 panel-shadow">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#3d4a42]">Combined Progress</span>
                  <span className="font-bold text-emerald-700">{overallPct}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#e0eae6]">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-700"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Monthly Check-in */}
        <div className="mb-8">
          <button
            onClick={getMonthlyAdvice}
            disabled={aiLoading || goals.length === 0}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {aiLoading ? 'Thinking…' : 'Get Monthly Advice'}
          </button>

          {aiAdvice && (
            <div className="mt-3 rounded-2xl border border-emerald-100 bg-white p-5 panel-shadow">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg gradient-emerald p-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">AI Coaching</p>
              </div>
              <p className="text-sm leading-relaxed text-[#3d4a42]">{aiAdvice}</p>
            </div>
          )}
        </div>

        {/* Active Goals Grid */}
        {active.length === 0 ? (
          <div className="rounded-3xl border border-emerald-100 bg-white p-10 text-center panel-shadow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ecf6f2]">
              <Target className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-headline text-xl font-bold text-emerald-900">No active goals yet</h3>
            <p className="mt-2 text-sm text-[#3d4a42]">Create your first savings goal to start tracking.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="gradient-emerald mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" /> Create Goal
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {active.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onAddSavings={setAddSavingsGoal}
                onDelete={requestDeleteGoal}
              />
            ))}
          </div>
        )}

        {/* Completed Goals */}
        {completed.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowCompleted((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl border border-emerald-100 bg-white px-5 py-4 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 panel-shadow"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Completed Goals ({completed.length})
              </span>
              {showCompleted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showCompleted && (
              <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {completed.map((g) => {
                  const cat = getCategoryMeta(g.category);
                  return (
                    <div
                      key={g.id}
                      className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 opacity-80"
                    >
                      <div className="absolute right-3 top-3 text-xs font-bold text-emerald-600">
                        ✅ Done
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecf6f2] text-xl">
                          {cat.emoji}
                        </div>
                        <div>
                          <p className="font-semibold text-[#141d1b]">{g.title}</p>
                          <p className="text-xs text-emerald-700 font-bold">₹{fmt(g.targetAmount)} saved!</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && <CreateGoalModal onClose={() => setShowCreate(false)} userId={user.uid} />}
      {addSavingsGoal && (
        <AddSavingsModal
          goal={addSavingsGoal}
          userId={user.uid}
          onClose={() => setAddSavingsGoal(null)}
        />
      )}

      {/* Celebration overlay */}
      {celebrateId && (
        <div className="pointer-events-none fixed inset-0 z-100 flex items-center justify-center">
          <div className="animate-bounce rounded-3xl border border-emerald-200 bg-white px-10 py-8 text-center panel-shadow">
            <p className="text-5xl">🎉</p>
            <p className="mt-3 font-headline text-xl font-extrabold text-emerald-900">Goal Achieved!</p>
            <p className="mt-1 text-sm text-[#3d4a42]">Congratulations on reaching your target!</p>
          </div>
        </div>
      )}

      {toast ? (
        <div
          className="fixed bottom-24 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-xl"
          role="alert"
        >
          <div className="flex items-center justify-between gap-3">
            <p className={`text-sm ${toast.type === 'error' ? 'text-red-700' : 'text-[#141d1b]'}`}>{toast.message}</p>
            {toast.action === 'undo' ? (
              <button
                onClick={undoDeleteGoal}
                className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
              >
                Undo
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
