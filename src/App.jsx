import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import WelcomePage from './WelcomePage'
import ChatInterface from './ChatInterface'
import ChatList from './components/ChatList'
import ProfileDropdown from './components/ProfileDropdown'
import NewChatModal from './components/NewChatModal'
import { getUserProfile, saveUserPreferences, hasCompletedSetup } from './services/userService'
import { createChat, subscribeToChats, deleteChat } from './services/chatService'
import { Plus, Menu, X, MessageSquare, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import './App.css'

function MainApp() {
  const { user } = useAuth();
  
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [chats, setChats] = useState([]);
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
  }, [user?.uid, showSetup]);

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
      <div className="flex items-center justify-center min-h-screen bg-[#0F1115]">
        <div className="text-center">
          {/* Shimmer Loading Cards */}
          <div className="space-y-4 w-64">
            <div className="h-16 rounded-2xl shimmer"></div>
            <div className="h-12 rounded-2xl shimmer"></div>
            <div className="h-12 rounded-2xl shimmer w-3/4 mx-auto"></div>
          </div>
          <p className="text-gray-400 font-medium mt-6 text-sm">Loading your profile...</p>
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
    <div className="flex h-screen bg-[#0F1115]">
      {/* Sidebar - Chat List */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-[#1A1D23] border-r border-white/5 flex-shrink-0`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="px-5 py-5 border-b border-white/5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Wallet className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <h1 className="text-lg font-semibold text-white tracking-tight">MoneyMitra</h1>
              </div>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="w-full py-3 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-2xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-indigo-500/20 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              New Chat
            </button>
          </div>

          {/* Financial Pulse Cards */}
          <div className="px-4 py-4 border-b border-white/5 space-y-3">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium">Market Pulse</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-white font-mono">NIFTY 50</span>
                <span className="text-xs text-emerald-400 font-mono">+1.24%</span>
              </div>
              {/* Mini Chart SVG */}
              <svg className="w-full h-8 mt-2" viewBox="0 0 100 20">
                <path 
                  d="M0,15 Q10,10 20,12 T40,8 T60,10 T80,5 T100,7" 
                  fill="none" 
                  stroke="url(#gradient)" 
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center py-8">
                <div className="w-16 h-16 bg-[#22262E] rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-7 h-7 text-gray-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-gray-300 font-semibold mb-2">No chats yet</h3>
                <p className="text-gray-500 text-sm">Start a new chat to begin</p>
              </div>
            ) : (
              <div className="py-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative mx-3 mb-1 rounded-xl transition-all duration-300 ${
                      activeChatId === chat.id 
                        ? 'bg-indigo-500/10 border border-indigo-500/20' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectChat(chat.id)}
                      className="w-full px-4 py-3 text-left"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`font-medium truncate flex-1 text-sm ${
                          activeChatId === chat.id ? 'text-indigo-400' : 'text-gray-200'
                        }`}>
                          {chat.title || 'Financial Chat'}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0 font-mono">
                          {chat.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-2">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-400/80 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          {chat.profile?.goal || 'Financial'}
                        </span>
                      </div>
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this chat?')) {
                          handleDeleteChat(chat.id);
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toggle button for sidebar on mobile */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1A1D23] rounded-xl border border-white/5 shadow-lg transition-all duration-300 hover:bg-[#22262E]"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
          ) : (
            <Menu className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
          )}
        </button>

        {/* Chat Interface */}
        {activeChatId ? (
          <ChatInterface 
            userDetails={userDetails} 
            chatId={activeChatId}
            chatData={activeChat}
            userPreferences={userPreferences}
            onUpdatePreferences={handlePreferencesUpdate}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#0F1115]">
            <div className="text-center px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
                <Wallet className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Welcome to MoneyMitra</h2>
              <p className="text-gray-400 mb-8 max-w-md">Start a new chat to get personalized financial advice powered by AI</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
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
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected App Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />
          
          {/* Fallback - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
