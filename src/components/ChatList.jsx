import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToChats } from '../services/chatService';
import NewChatModal from './NewChatModal';

const ChatList = ({ activeChatId, onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const { user } = useAuth();

  // Subscribe to real-time chat updates
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    
    // Subscribe to chat list
    const unsubscribe = subscribeToChats(user.uid, (updatedChats) => {
      setChats(updatedChats);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user?.uid]);

  // Format timestamp to readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Chats</h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Start new chat"
          >
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Search Bar Placeholder */}
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full px-3 py-2 rounded-full bg-gray-100 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
          disabled
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          // Loading State
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading chats...</p>
            </div>
          </div>
        ) : chats.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-gray-800 font-semibold mb-2">No chats yet</h3>
            <p className="text-gray-500 text-sm mb-4">Start a new chat to begin your financial journey</p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all text-sm font-medium"
            >
              New Chat
            </button>
          </div>
        ) : (
          // Chat List
          <div className="divide-y divide-gray-100">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  activeChatId === chat.id ? 'bg-blue-50 border-l-4 border-teal-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 truncate flex-1">
                    {chat.title || 'Chat'}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatTime(chat.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={(chatId) => {
            setShowNewChatModal(false);
            onSelectChat(chatId);
          }}
        />
      )}
    </div>
  );
};

export default ChatList;
