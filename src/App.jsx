import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter as Router,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import WelcomePage from './WelcomePage'
import ChatInterface from './ChatInterface'
import NewChatModal from './components/NewChatModal'
import { getUserProfile, saveUserPreferences } from './services/userService'
import ProfileDropdown from './components/ProfileDropdown'
import { createChat, subscribeToChats, deleteChat } from './services/chatService'
import { subscribeToMonthlyExpenses } from './services/expenseService'
import { subscribeToGoals } from './services/goalService'
import {
  BookOpen,
  Calculator,
  GraduationCap,
  Home,
  Menu,
  MessageSquare,
  Newspaper,
  Plus,
  ReceiptIndianRupee,
  Sparkles,
  Target,
  Trash2,
  Wallet,
  X,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Bot,
  Zap,
} from 'lucide-react';
import './App.css'

const NewsPage = lazy(() => import('./pages/NewsPage'));
const LearningHub = lazy(() => import('./pages/LearningHub'));
const ExpensePage = lazy(() => import('./pages/ExpensePage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));

const TOOLS = [
  { to: '/expenses',   label: 'Expenses',   icon: ReceiptIndianRupee, color: 'text-emerald-300' },
  { to: '/goals',      label: 'Goals',      icon: Target,             color: 'text-amber-300' },
  { to: '/calculator', label: 'Calculator', icon: Calculator,         color: 'text-sky-300' },
  { to: '/news',       label: 'News',       icon: Newspaper,          color: 'text-purple-300' },
  { to: '/learn',      label: 'Learn',      icon: BookOpen,           color: 'text-rose-300' },
];

// Mobile nav — Home + Chat + Spend + Goals
const MOBILE_NAV = [
  { to: '/app',        label: 'Home',  icon: Home },
  { to: '/app/chat',   label: 'Chat',  icon: MessageSquare },
  { to: '/expenses',   label: 'Spend', icon: ReceiptIndianRupee },
  { to: '/goals',      label: 'Goals', icon: Target },
];

function RouteFallback() {
  return (
    <div className="h-full min-h-[60vh] px-5 py-6 md:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-16 rounded-2xl shimmer" />
        <div className="h-36 rounded-2xl shimmer" />
        <div className="h-56 rounded-2xl shimmer" />
      </div>
    </div>
  );
}

function AppBootLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0faf4]">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-emerald shadow-lg shadow-emerald-900/20">
          <Wallet className="h-7 w-7 text-white" />
        </div>
        <div className="mx-auto h-1 w-24 overflow-hidden rounded-full bg-emerald-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-600" />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#3d5246]">Preparing MoneyMitra…</p>
      </div>
    </div>
  );
}

function SidebarNavLink({ to, label, icon, color, onClick, end }) {
  const Icon = icon;
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `sidebar-item mb-0.5 ${isActive ? 'active' : ''}`}
    >
      <span className="icon-wrap">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </span>
      {label}
    </NavLink>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Home dashboard ────────────────────────────────────────────────────────────
function AppHome() {
  const navigate = useNavigate();
  const { monthlySpend, activeGoalsCount, openNewChat, userLevel, userPreferences } = useOutletContext();

  const spendFormatted = monthlySpend > 0 ? `₹${monthlySpend.toLocaleString('en-IN')}` : '₹0';

  const quickActions = [
    { icon: ReceiptIndianRupee, label: 'Log Expense',   desc: "Track today's spending",   to: '/expenses',  iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700' },
    { icon: Target,             label: 'Set Goal',      desc: 'Define savings targets',   to: '/goals',     iconBg: 'bg-amber-50',   iconColor: 'text-amber-700' },
    { icon: Sparkles,           label: 'Ask AI Coach',  desc: 'Get smart money advice',   action: openNewChat, iconBg: 'bg-violet-50', iconColor: 'text-violet-700' },
    { icon: BookOpen,           label: 'Learn Finance', desc: 'Build your knowledge',     to: '/learn',     iconBg: 'bg-sky-50',     iconColor: 'text-sky-700' },
  ];

  return (
    <main className="h-full overflow-y-auto pb-28 md:pb-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1f16] via-[#0f2e1e] to-[#0b1f16] px-6 pb-10 pt-10 md:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-400/8 blur-2xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400/70">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {getGreeting()} 👋
            </h1>
            <p className="mt-1.5 text-sm text-emerald-100/60">
              {userPreferences?.occupation
                ? `${userPreferences.occupation} • ${userPreferences.financialGoal || 'Building wealth'}`
                : 'Your financial command center'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/8 px-5 py-3 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300/70">This month</p>
              <p className="mt-0.5 font-headline text-2xl font-extrabold text-white">{spendFormatted}</p>
              <p className="text-xs text-emerald-200/50">total expenses</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 px-5 py-3 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-300/70">Goals</p>
              <p className="mt-0.5 font-headline text-2xl font-extrabold text-white">{activeGoalsCount}</p>
              <p className="text-xs text-emerald-200/50">active</p>
            </div>
          </div>
        </div>

        {/* Level badge */}
        <div className="relative mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/5 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-emerald-bright text-white">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Level {userLevel} • Finance Learner</p>
              <p className="text-xs text-emerald-300/60">Keep going to unlock premium insights</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/learn')}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-400/25 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/25"
          >
            Continue <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="space-y-6 px-5 pt-6 md:px-8">
        {/* AI Coach CTA */}
        <div
          onClick={() => { openNewChat(); navigate('/app/chat'); }}
          className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-emerald-200 bg-white p-5 panel-shadow card-lift transition"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gradient-emerald text-white shadow-lg shadow-emerald-900/20">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-headline text-base font-bold text-emerald-900">Chat with AI Coach</p>
            <p className="text-sm text-[#6b7e73]">Ask anything about your money — budgets, savings, debt, goals.</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-emerald text-white opacity-70 transition group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        {/* Quick actions */}
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#6b7e73]">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.action || (() => navigate(action.to))}
                  className="group flex flex-col items-start rounded-2xl border border-[#d4e8dc] bg-white p-4 text-left panel-shadow card-lift transition"
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${action.iconBg}`}>
                    <Icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <p className="text-sm font-bold text-[#0e1c16]">{action.label}</p>
                  <p className="mt-0.5 text-xs text-[#6b7e73]">{action.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Getting started checklist */}
        <section className="rounded-2xl border border-[#d4e8dc] bg-white p-5 panel-shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline text-base font-bold text-emerald-900">Getting Started</h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              {1 + (monthlySpend > 0 ? 1 : 0) + (activeGoalsCount > 0 ? 1 : 0)}/3 done
            </span>
          </div>
          <div className="space-y-2">
            {[
              { done: true,             label: 'Complete your profile',                                                                      sub: 'Personalized advice enabled', action: null },
              { done: monthlySpend > 0, label: monthlySpend > 0 ? `₹${monthlySpend.toLocaleString('en-IN')} tracked this month` : 'Log your first expense', sub: monthlySpend > 0 ? 'Great! Keep it up' : 'Takes 10 seconds',   action: () => navigate('/expenses') },
              { done: activeGoalsCount > 0, label: activeGoalsCount > 0 ? `${activeGoalsCount} goal${activeGoalsCount > 1 ? 's' : ''} active` : 'Set a savings goal', sub: activeGoalsCount > 0 ? 'On track!' : 'Define your target', action: () => navigate('/goals') },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action || undefined}
                disabled={!item.action}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  item.done ? 'border-emerald-100 bg-emerald-50/60' : 'border-[#e4f0e8] bg-[#f8fcfa]'
                } ${item.action ? 'hover:bg-emerald-50' : ''}`}
              >
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${item.done ? 'border-emerald-500 bg-emerald-500' : 'border-[#d4e8dc] bg-white'}`}>
                  {item.done && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${item.done ? 'text-emerald-800' : 'text-[#0e1c16]'}`}>{item.label}</p>
                  <p className="text-xs text-[#6b7e73]">{item.sub}</p>
                </div>
                {item.action && !item.done && <ChevronRight className="h-4 w-4 shrink-0 text-[#9aada3]" />}
              </button>
            ))}
          </div>
        </section>

        {/* Premium + Learn row */}
        <div className="grid gap-4 md:grid-cols-2">
          <section className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 panel-shadow">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                <Zap className="h-3 w-3" /> Premium
              </div>
              <p className="text-sm text-[#3d5246]">Unlock deep projections &amp; priority AI.</p>
            </div>
            <button className="shrink-0 rounded-xl gradient-emerald px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:brightness-110">
              Upgrade
            </button>
          </section>

          <section
            onClick={() => navigate('/learn')}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-5 panel-shadow card-lift transition hover:bg-amber-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#7a4c00]">Learning Hub</p>
              <p className="text-xs text-[#9a6c30]">Level {userLevel} — keep building.</p>
            </div>
            <ChevronRight className="ml-auto h-4 w-4 text-[#c49040]" />
          </section>
        </div>
      </div>
    </main>
  );
}

// ── Chat view ─────────────────────────────────────────────────────────────────
function AppChat() {
  const { activeChat, activeChatId, userPreferences, onUpdatePreferences, openNewChat } = useOutletContext();
  const navigate = useNavigate();

  const userDetails = {
    occupation: userPreferences?.occupation || 'Not specified',
    ageGroup: userPreferences?.ageGroup || 'Not specified',
    primaryGoal: userPreferences?.financialGoal || 'Save Money',
  };

  if (!activeChatId) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#f0faf4] px-6 pb-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-emerald shadow-lg shadow-emerald-900/20">
          <MessageSquare className="h-7 w-7 text-white" />
        </div>
        <h2 className="font-headline text-xl font-bold text-emerald-900">No conversation open</h2>
        <p className="mt-2 max-w-xs text-sm text-[#6b7e73]">
          Start a new chat with your AI coach or pick one from the sidebar.
        </p>
        <button
          onClick={openNewChat}
          className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-emerald px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Start New Chat
        </button>
        <button
          onClick={() => navigate('/app')}
          className="mt-3 text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <ChatInterface
      userDetails={userDetails}
      chatId={activeChatId}
      chatData={activeChat}
      userPreferences={userPreferences}
      onUpdatePreferences={onUpdatePreferences}
    />
  );
}

function AppRecentChats() {
  const { visibleChats, onSelectChat, openNewChat } = useOutletContext();

  return (
    <div className="h-full overflow-y-auto bg-[#f0faf4] px-5 pb-24 pt-6 md:px-8 md:pb-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-headline text-2xl font-extrabold text-emerald-900">Recent Chats</h1>
            <p className="text-sm text-[#6b7e73]">Pick any conversation to open it in the chat panel.</p>
          </div>
          <button
            onClick={openNewChat}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl gradient-emerald px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {visibleChats.length === 0 ? (
          <div className="rounded-2xl border border-[#d4e8dc] bg-white p-8 text-center panel-shadow">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-emerald-300" />
            <p className="text-base font-semibold text-[#0e1c16]">No conversations yet</p>
            <p className="mt-1 text-sm text-[#6b7e73]">Start a new chat and your recent chats will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="w-full rounded-2xl border border-[#d4e8dc] bg-white px-4 py-3 text-left panel-shadow transition hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                <p className="truncate text-sm font-bold text-[#0e1c16]">{chat.title || 'Financial Chat'}</p>
                <p className="mt-1 truncate text-xs text-[#6b7e73]">{chat.lastMessage || 'No messages yet'}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Protected layout ──────────────────────────────────────────────────────────
function ProtectedAppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [userPreferences, setUserPreferences] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const [activeChatId, setActiveChatId] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [activeGoalsCount, setActiveGoalsCount] = useState(0);
  const [pendingChatDeletion, setPendingChatDeletion] = useState(null);
  const [hiddenChatIds, setHiddenChatIds] = useState([]);

  useEffect(() => {
    const checkUserSetup = async () => {
      if (!user?.uid) return;
      setIsLoading(true);
      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.preferences && profile?.setupCompleted) {
          setUserPreferences(profile.preferences);
          setUserLevel(profile.currentLevel || 1);
          setShowSetup(false);
        } else {
          setShowSetup(true);
        }
      } catch {
        setShowSetup(true);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserSetup();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || showSetup) return;
    const unsubscribe = subscribeToChats(user.uid, (updatedChats) => {
      setChats(updatedChats);
    });
    return () => unsubscribe();
  }, [user?.uid, showSetup]);

  useEffect(() => {
    if (!user?.uid || showSetup) return;
    const now = new Date();
    const unsub = subscribeToMonthlyExpenses(user.uid, now.getFullYear(), now.getMonth(), (expenses) => {
      setMonthlySpend(expenses.reduce((s, e) => s + Number(e.amount || 0), 0));
    });
    return () => unsub();
  }, [user?.uid, showSetup]);

  useEffect(() => {
    if (!user?.uid || showSetup) return;
    const unsub = subscribeToGoals(user.uid, (goals) => {
      setActiveGoalsCount(goals.filter((g) => g.status === 'active').length);
    });
    return () => unsub();
  }, [user?.uid, showSetup]);

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    return () => { if (pendingChatDeletion?.timerId) window.clearTimeout(pendingChatDeletion.timerId); };
  }, [pendingChatDeletion]);

  const handleSetupComplete = async (formData) => {
    if (!user?.uid) return;
    setSetupError('');
    setSetupLoading(true);
    try {
      const preferences = { occupation: formData.occupation, ageGroup: formData.ageGroup, financialGoal: formData.financialGoal };
      await saveUserPreferences(user.uid, preferences);
      setUserPreferences(preferences);
      const chatId = await createChat(user.uid, { occupation: preferences.occupation, ageGroup: preferences.ageGroup, goal: preferences.financialGoal });
      setActiveChatId(chatId);
      setShowSetup(false);
      navigate('/app/chat', { replace: true });
    } catch (error) {
      setSetupError(error.message || 'Failed to complete setup. Please try again.');
    } finally {
      setSetupLoading(false);
    }
  };

  const handlePreferencesUpdate = async (newPreferences) => {
    if (!user?.uid) return;
    try { await saveUserPreferences(user.uid, newPreferences); setUserPreferences(newPreferences); }
    catch (e) { console.error(e); }
  };

  const handleNewChat = (chatId) => {
    setActiveChatId(chatId);
    setShowNewChatModal(false);
    navigate('/app/chat');
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    navigate('/app/chat');
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const completePendingDeletionNow = async () => {
    if (!pendingChatDeletion || !user?.uid) return;
    window.clearTimeout(pendingChatDeletion.timerId);
    try { await deleteChat(user.uid, pendingChatDeletion.chatId); }
    catch { setHiddenChatIds((prev) => prev.filter((id) => id !== pendingChatDeletion.chatId)); }
    finally { setPendingChatDeletion(null); }
  };

  const requestDeleteChat = async (chat) => {
    if (!user?.uid) return;
    if (pendingChatDeletion) await completePendingDeletionNow();
    setHiddenChatIds((prev) => [...new Set([...prev, chat.id])]);
    if (activeChatId === chat.id) {
      const remaining = visibleChats.filter((c) => c.id !== chat.id);
      const next = remaining[0];
      if (next) { setActiveChatId(next.id); }
      else { setActiveChatId(null); if (location.pathname === '/app/chat') navigate('/app'); }
    }
    const timerId = window.setTimeout(async () => {
      try { await deleteChat(user.uid, chat.id); }
      catch { setHiddenChatIds((prev) => prev.filter((id) => id !== chat.id)); }
      finally { setPendingChatDeletion(null); }
    }, 3000);
    setPendingChatDeletion({ chatId: chat.id, title: chat.title || 'Financial Chat', timerId });
  };

  const undoDeleteChat = () => {
    if (!pendingChatDeletion) return;
    window.clearTimeout(pendingChatDeletion.timerId);
    setHiddenChatIds((prev) => prev.filter((id) => id !== pendingChatDeletion.chatId));
    setPendingChatDeletion(null);
  };

  const visibleChats = useMemo(() => {
    const hiddenSet = new Set(hiddenChatIds);
    return chats.filter((c) => !hiddenSet.has(c.id));
  }, [chats, hiddenChatIds]);

  const closeSidebarOnMobile = () => { if (window.innerWidth < 768) setIsSidebarOpen(false); };
  const openNewChat = () => setShowNewChatModal(true);

  if (isLoading) return <AppBootLoader />;
  if (showSetup) return <WelcomePage onStart={handleSetupComplete} isLoading={setupLoading} error={setupError} />;

  const activeChat = visibleChats.find((c) => c.id === activeChatId);
  const userInitial = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const outletContext = {
    activeChat, activeChatId, monthlySpend, activeGoalsCount,
    onUpdatePreferences: handlePreferencesUpdate,
    openNewChat,
    onSelectChat: handleSelectChat,
    visibleChats,
    setActiveChatId,
    userLevel, userPreferences,
  };

  return (
    <div className="h-screen overflow-hidden text-[#0e1c16]" style={{ background: 'var(--bg)' }}>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className={`sidebar-bg fixed left-0 top-0 z-50 flex h-screen w-72 flex-col transition-transform duration-300 ease-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 pb-3 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-emerald shadow-lg shadow-emerald-900/30">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-headline text-base font-extrabold leading-none text-white">MoneyMitra</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400/60">AI Financial Coach</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-1.5 text-emerald-400/60 transition hover:bg-white/8 hover:text-emerald-300 md:hidden" aria-label="Close sidebar">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mini stats */}
        <div className="mx-4 mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/60">Spend</p>
            <p className="mt-0.5 font-headline text-sm font-bold text-white">{monthlySpend > 0 ? `₹${(monthlySpend / 1000).toFixed(1)}k` : '₹0'}</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/60">Goals</p>
            <p className="mt-0.5 font-headline text-sm font-bold text-white">{activeGoalsCount}</p>
          </div>
        </div>

        {/* New Chat */}
        <div className="px-4">
          <button
            onClick={() => { openNewChat(); navigate('/app/chat'); closeSidebarOnMobile(); }}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl gradient-emerald-bright py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/25 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> New Chat
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4">
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400/50">Navigate</p>
          <SidebarNavLink to="/app" label="Home" icon={Home} color="text-emerald-300" onClick={closeSidebarOnMobile} end />
          <SidebarNavLink to="/app/recent-chats" label="Recent Chats" icon={MessageSquare} color="text-violet-300" onClick={closeSidebarOnMobile} />
        </div>

        <div className="mx-4 my-2 border-t border-white/8" />

        {/* Tools */}
        <div className="px-4 pb-2">
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400/50">Tools</p>
          {TOOLS.map((tool) => (
            <SidebarNavLink key={tool.to} to={tool.to} label={tool.label} icon={tool.icon} color={tool.color} onClick={closeSidebarOnMobile} />
          ))}
        </div>

        {/* Profile strip */}
        <div className="border-t border-white/8 p-4">
          <ProfileDropdown
            userPreferences={userPreferences}
            onUpdatePreferences={handlePreferencesUpdate}
            trigger={
              <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-2.5 cursor-pointer hover:bg-white/10 transition">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-emerald text-xs font-bold text-white">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-emerald-100">{userName}</p>
                  <p className="truncate text-[10px] text-emerald-400/50">{user?.email || 'Signed in'}</p>
                </div>
                <div className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Lv{userLevel}
                </div>
              </div>
            }
          />
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────── */}
      <div className="relative flex h-screen flex-col md:ml-72">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-[#d4e8dc] bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen((p) => !p)}
              className="rounded-xl border border-[#d4e8dc] bg-white p-2 text-emerald-800 shadow-sm"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-700" />
              <span className="font-headline text-base font-bold text-emerald-900">MoneyMitra</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet context={outletContext} />
        </main>
      </div>

      {/* New chat modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={handleNewChat}
          userPreferences={userPreferences}
        />
      )}

      {/* Undo delete toast */}
      {pendingChatDeletion && (
        <div className="fixed bottom-20 left-1/2 z-70 w-[92%] max-w-md -translate-x-1/2 scale-in rounded-2xl border border-[#d4e8dc] bg-white px-4 py-3 shadow-modal" role="alert">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[#0e1c16]"><span className="font-semibold">{pendingChatDeletion.title}</span> removed.</p>
            <button onClick={undoDeleteChat} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100">Undo</button>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-65 border-t border-[#d4e8dc] bg-white/96 px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-sm items-center justify-around gap-1">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const isChat = item.to === '/app/chat';
            const active = isChat
              ? location.pathname === '/app/chat'
              : item.to === '/app'
              ? location.pathname === '/app'
              : location.pathname.startsWith(item.to);
            return (
              <button
                key={item.to}
                onClick={() => { if (isChat && !activeChatId) { openNewChat(); } navigate(item.to); }}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition ${
                  active ? 'bg-emerald-50 text-emerald-800' : 'text-[#6b7e73] hover:bg-[#f0faf4]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <AppBootLoader />;
  if (!user) return <LandingPage />;
  return <Navigate to="/app" replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomeRoute />} />
          <Route
            element={
              <ProtectedRoute>
                <ProtectedAppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/app" element={<AppHome />} />
            <Route path="/app/chat" element={<AppChat />} />
            <Route path="/app/recent-chats" element={<AppRecentChats />} />
            <Route path="/news"       element={<Suspense fallback={<RouteFallback />}><NewsPage /></Suspense>} />
            <Route path="/learn"      element={<Suspense fallback={<RouteFallback />}><LearningHub /></Suspense>} />
            <Route path="/expenses"   element={<Suspense fallback={<RouteFallback />}><ExpensePage /></Suspense>} />
            <Route path="/goals"      element={<Suspense fallback={<RouteFallback />}><GoalsPage /></Suspense>} />
            <Route path="/calculator" element={<Suspense fallback={<RouteFallback />}><CalculatorPage /></Suspense>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App
