import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import WelcomePage from './WelcomePage'
import NewsPage from './pages/NewsPage'
import LearningHub from './pages/LearningHub'
import ChatInterface from './ChatInterface'
import NewChatModal from './components/NewChatModal'
import { getUserProfile, saveUserPreferences } from './services/userService'
import { createChat, subscribeToChats, deleteChat } from './services/chatService'
import { Plus, Menu, X, MessageSquare, Trash2, TrendingUp, Wallet, GraduationCap, BookOpen, Sparkles } from 'lucide-react'
import './App.css'

function MainApp() {
  const { user } = useAuth();
  
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const [activeChatId, setActiveChatId] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Check if user has completed initial setup
  useEffect(() => {
    const checkUserSetup = async () => {
      if (!user?.uid) return;
      
      setIsLoading(true);
      try {
        const profile = await getUserProfile(user.uid);
        
        if (profile && profile.preferences && profile.setupCompleted) {
          // User has completed setup
          setUserPreferences(profile.preferences);
          setUserLevel(profile.currentLevel || 1);
          setShowSetup(false);
        } else {
          // First time user - show setup
          setShowSetup(true);
        }
      } catch (error) {
        console.error('Error checking user setup:', error);
        setShowSetup(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSetup();
  }, [user?.uid]);

  // Subscribe to chat list
  useEffect(() => {
    if (!user?.uid || showSetup) return;

    const unsubscribe = subscribeToChats(user.uid, (updatedChats) => {
      setChats(updatedChats);
      
      // Auto-select first chat if none selected
      if (!activeChatId && updatedChats.length > 0) {
        setActiveChatId(updatedChats[0].id);
      }
    });

    return () => unsubscribe();
  }, [user?.uid, showSetup, activeChatId]);

  // Handle initial setup completion
  const handleSetupComplete = async (formData) => {
    if (!user?.uid) {
      console.error('No user ID available');
      return;
    }
    
    setSetupLoading(true);
    
    try {
      console.log('Starting setup with data:', formData);
      
      const preferences = {
        occupation: formData.occupation,
        ageGroup: formData.ageGroup,
        financialGoal: formData.financialGoal
      };
      
      console.log('Saving preferences...');
      await saveUserPreferences(user.uid, preferences);
      setUserPreferences(preferences);
      
      console.log('Creating first chat...');
      // Create first chat automatically
      const chatId = await createChat(user.uid, {
        occupation: preferences.occupation,
        ageGroup: preferences.ageGroup,
        goal: preferences.financialGoal
      });
      
      console.log('Chat created:', chatId);
      setActiveChatId(chatId);
      setShowSetup(false);
    } catch (error) {
      console.error('Error completing setup:', error);
      alert('Failed to complete setup. Please try again. Error: ' + error.message);
    } finally {
      setSetupLoading(false);
    }
  };

  // Handle preferences update from profile
  const handlePreferencesUpdate = async (newPreferences) => {
    if (!user?.uid) return;
    
    try {
      await saveUserPreferences(user.uid, newPreferences);
      setUserPreferences(newPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  // Handle new chat creation
  const handleNewChat = async (chatId) => {
    setActiveChatId(chatId);
    setShowNewChatModal(false);
  };

  // Handle chat selection
  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Handle chat deletion
  const handleDeleteChat = async (chatId) => {
    if (!user?.uid) return;
    
    try {
      await deleteChat(user.uid, chatId);
      
      // If deleted chat was active, select another one
      if (activeChatId === chatId) {
        const remainingChats = chats.filter(c => c.id !== chatId);
        setActiveChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f2fcf8]">
        <div className="text-center">
          <div className="space-y-4 w-64">
            <div className="h-16 rounded-2xl shimmer"></div>
            <div className="h-12 rounded-2xl shimmer"></div>
            <div className="h-12 rounded-2xl shimmer w-3/4 mx-auto"></div>
          </div>
          <p className="text-[#3d4a42] font-semibold mt-6 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // First time setup
  if (showSetup) {
    return <WelcomePage onStart={handleSetupComplete} isLoading={setupLoading} />;
  }

  // Get active chat data
  const activeChat = chats.find(c => c.id === activeChatId);
  
  // Build user details for chat interface
  const userDetails = {
    occupation: userPreferences?.occupation || 'Not specified',
    ageGroup: userPreferences?.ageGroup || 'Not specified',
    primaryGoal: userPreferences?.financialGoal || 'save'
  };

  return (
    <div className="h-screen bg-[#f2fcf8] text-[#141d1b]">
      {isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm md:hidden"
          aria-label="Close sidebar backdrop"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[280px] border-r border-emerald-100 bg-emerald-50 p-6 transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="mb-8 px-2">
            <div className="mb-4 flex items-center justify-between md:hidden">
              <h2 className="text-base font-bold text-emerald-900">Menu</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-100"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h1 className="font-headline text-2xl font-bold tracking-tight text-emerald-900">MoneyMitra AI</h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/70">Wealth Curation</p>
          </div>

          <button
            onClick={() => setShowNewChatModal(true)}
            className="gradient-emerald mb-7 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:brightness-105"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>

          <div className="mb-6 rounded-2xl border border-amber-200/40 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8d4b00]">Market Pulse</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] font-medium text-[#3d4a42]">NIFTY 50</p>
                <p className="font-headline text-xl font-extrabold text-emerald-900">22,419.50</p>
              </div>
              <p className="text-xs font-bold text-emerald-700">+0.85%</p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-[#ecf6f2] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <GraduationCap className="h-4 w-4 text-[#8d4b00]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#141d1b]">Learning Progress</p>
                <p className="text-[10px] text-[#3d4a42]">Level {userLevel}: Strategic Planner</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full w-[65%] rounded-full bg-emerald-700"></div>
            </div>
            <button
              onClick={() => navigate('/learn')}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Continue Learning
            </button>
          </div>

          <div className="mb-2 px-1">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3d4a42]/70">Recent Chats</p>
            <div className="max-h-[calc(100vh-450px)] space-y-1.5 overflow-y-auto pr-1">
              {chats.length === 0 && (
                <div className="rounded-xl border border-emerald-100 bg-white px-3 py-4 text-center">
                  <MessageSquare className="mx-auto mb-2 h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-medium text-[#3d4a42]">No conversations yet</p>
                </div>
              )}

              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative overflow-hidden rounded-xl border px-3 py-3 transition ${
                    activeChatId === chat.id
                      ? 'border-emerald-200 bg-white shadow-sm'
                      : 'border-transparent bg-transparent hover:border-emerald-100 hover:bg-white/70'
                  }`}
                >
                  <button
                    onClick={() => handleSelectChat(chat.id)}
                    className="w-full text-left"
                  >
                    <p className={`truncate text-sm font-semibold ${activeChatId === chat.id ? 'text-emerald-800' : 'text-[#3d4a42]'}`}>
                      {chat.title || 'Financial Chat'}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#6d7a72]">{chat.lastMessage || 'No messages yet'}</p>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this chat?')) {
                        handleDeleteChat(chat.id);
                      }
                    }}
                    className="absolute right-2 top-2 rounded-lg p-1 text-[#6d7a72] opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-700 p-4 text-white">
            <p className="text-xs font-medium text-emerald-100/80">Exclusive Benefits</p>
            <p className="mb-3 mt-1 text-sm font-bold">Upgrade to Premium</p>
            <button className="w-full rounded-lg bg-white py-2 text-xs font-bold text-emerald-800 transition hover:brightness-95">
              Get Started
            </button>
          </div>
        </div>
      </aside>

      <div className="relative h-screen md:ml-[280px]">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="fixed left-4 top-4 z-[60] rounded-xl border border-emerald-200 bg-white p-2 text-emerald-800 shadow md:hidden"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {activeChatId ? (
          <ChatInterface
            userDetails={userDetails}
            chatId={activeChatId}
            chatData={activeChat}
            userPreferences={userPreferences}
            onUpdatePreferences={handlePreferencesUpdate}
          />
        ) : (
          <main className="h-full overflow-y-auto px-5 pb-24 pt-6 md:px-8">
            <header className="mb-8 rounded-2xl border border-emerald-100 bg-white/80 px-6 py-4 backdrop-blur-xl panel-shadow">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-headline text-2xl font-extrabold tracking-tight text-emerald-900">Dashboard</h2>
                  <p className="text-sm text-[#3d4a42]">Your personal wealth curator is ready.</p>
                </div>
                <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 md:flex">
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-800">AI Insight Active</span>
                </div>
              </div>
            </header>

            <section className="mx-auto max-w-5xl">
              <div className="mb-8 rounded-3xl border border-emerald-100 bg-white p-8 text-center panel-shadow">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl gradient-emerald shadow-lg shadow-emerald-900/20">
                  <Wallet className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-headline text-4xl font-extrabold tracking-tight text-emerald-900">Good Morning</h3>
                <p className="mx-auto mt-3 max-w-xl text-lg text-[#3d4a42]">Start a new conversation to get personalized plans for saving, investing, and long-term wealth growth.</p>

                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="gradient-emerald mt-7 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:brightness-105"
                >
                  <Plus className="h-4 w-4" />
                  Start New Chat
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="rounded-2xl border border-emerald-100 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-emerald-50 p-2 text-emerald-700">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <p className="font-headline text-lg font-bold text-emerald-900">Analyze Portfolio</p>
                  <p className="mt-1 text-xs text-[#3d4a42]">Review your asset allocation and risk exposure.</p>
                </button>

                <button
                  onClick={() => navigate('/news')}
                  className="rounded-2xl border border-emerald-100 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-amber-50 p-2 text-amber-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <p className="font-headline text-lg font-bold text-emerald-900">Market Pulse</p>
                  <p className="mt-1 text-xs text-[#3d4a42]">Track the latest macro and sector trends.</p>
                </button>

                <button
                  onClick={() => navigate('/learn')}
                  className="rounded-2xl border border-emerald-100 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-[#ffdcc3] p-2 text-[#8d4b00]">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <p className="font-headline text-lg font-bold text-emerald-900">Learning Progress</p>
                  <p className="mt-1 text-xs text-[#3d4a42]">Level {userLevel} unlocked. Continue your path.</p>
                </button>
              </div>

              <div className="mt-6 rounded-full border border-amber-200 bg-[#ffdcc3]/40 px-4 py-2 text-xs text-[#6e3900]">
                <span className="mr-2 font-bold uppercase tracking-[0.16em]">AI Insight</span>
                Markets are volatile today. Consider hedging your tech exposure.
              </div>
            </section>
          </main>
        )}
      </div>

      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={handleNewChat}
          userPreferences={userPreferences}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />
          <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
          <Route path="/learn" element={<ProtectedRoute><LearningHub /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
