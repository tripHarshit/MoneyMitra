import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProfileDropdown from './components/ProfileDropdown';
import MessageBubble from './MessageBubble';
import { fetchGeminiResponse } from './geminiService';
import { subscribeToMessages, addMessage, updateChatTitle } from './services/chatService';
import { Send, Sparkles, Wallet } from 'lucide-react';

const ChatInterface = ({ userDetails, chatId, chatData, userPreferences, onUpdatePreferences }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Subscribe to messages for this chat
  useEffect(() => {
    if (!user?.uid || !chatId) return;

    // Clear messages when switching chats to prevent context mixing
    setMessages([]);
    setIsLoadingMessages(true);
    
    const unsubscribe = subscribeToMessages(user.uid, chatId, (updatedMessages) => {
      // Convert Firestore messages to local format
      const formattedMessages = updatedMessages.map(msg => ({
        id: msg.id,
        text: msg.text,
        sender: msg.role === 'user' ? 'user' : 'bot',
        timestamp: msg.timestamp?.toDate?.() || new Date()
      }));
      
      setMessages(formattedMessages);
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [user?.uid, chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get user profile display text
  const getProfileText = () => {
    const occupation = userDetails?.occupation || '';
    const goal = userDetails?.primaryGoal === 'save' ? 'Save Money' :
                 userDetails?.primaryGoal === 'debt' ? 'Manage Debt' :
                 userDetails?.primaryGoal === 'Save Money' ? 'Save Money' :
                 userDetails?.primaryGoal === 'Manage Debt' ? 'Manage Debt' :
                 userDetails?.primaryGoal === 'Learn Basics' ? 'Learn Basics' :
                 userDetails?.primaryGoal || '';
    return `${occupation}${goal ? ` • ${goal}` : ''}`;
  };

  // Generate context-aware suggested questions
  const getSuggestedQuestions = () => {
    const { occupation, ageGroup, primaryGoal } = userDetails || {};
    
    const suggestions = [];
    
    // Based on occupation
    if (occupation === 'Student') {
      suggestions.push(
        'How do I save pocket money effectively?',
        'What are the best student banking options?',
        'How can I build credit history as a student?'
      );
    } else if (occupation === 'Working Professional' || occupation === 'Early-career Professional') {
      suggestions.push(
        'How much should I save from my first salary?',
        'What is an emergency fund and why do I need one?',
        'Should I invest in stocks or mutual funds?'
      );
    } else if (occupation === 'Freelancer' || occupation === 'Self-Employed') {
      suggestions.push(
        'How can I save with irregular income?',
        'What are the best tax-saving options for freelancers?',
        'How do I plan finances without fixed income?'
      );
    } else if (occupation === 'Homemaker') {
      suggestions.push(
        'How can I manage household budget effectively?',
        'What are safe investment options for homemakers?',
        'How do I save for family emergencies?'
      );
    } else if (occupation === 'Retired') {
      suggestions.push(
        'How should I manage my retirement savings?',
        'What are low-risk investment options?',
        'How can I create passive income streams?'
      );
    } else {
      suggestions.push(
        'How do I create a monthly budget?',
        'What are the basics of personal finance?',
        'How much should I save each month?'
      );
    }

    // Add goal-specific suggestions
    if (primaryGoal === 'save' || primaryGoal === 'Save Money') {
      suggestions.push('What are the best savings strategies for beginners?');
    } else if (primaryGoal === 'debt' || primaryGoal === 'Manage Debt') {
      suggestions.push('How do I create a debt repayment plan?');
    } else if (primaryGoal === 'learn' || primaryGoal === 'Learn Basics') {
      suggestions.push('What are the financial basics I should know?');
    }

    return suggestions.slice(0, 3); // Return only first 3 suggestions
  };

  // Build conversation history for context-aware responses
  const getConversationHistory = () => {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      text: msg.text
    }));
  };

  const handleSendMessage = async (message) => {
    if (!message.trim() || !user?.uid || !chatId) return;

    // Create optimistic user message for immediate display
    const tempUserMessage = {
      id: 'temp_' + Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, tempUserMessage]);
    setInputValue('');
    
    // Show typing indicator immediately
    setIsTyping(true);
    
    try {
      // Save user message to Firestore
      await addMessage(user.uid, chatId, 'user', message);
      
      // Get conversation history for context (exclude the temp message)
      const conversationHistory = getConversationHistory();
      
      // Call Gemini API with conversation history
      const botResponseText = await fetchGeminiResponse(message, userDetails, conversationHistory);
      
      // Save bot response to Firestore
      await addMessage(user.uid, chatId, 'assistant', botResponseText);
      
      // Update chat title if this is the first message
      if (messages.length === 0) {
        const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
        await updateChatTitle(user.uid, chatId, title);
      }
      
    } catch (error) {
      console.error('Error:', error);
      // Display the actual error message from the API
      const errorMessage = error.message || "I apologize, but I'm having trouble processing your request right now. Please try again.";
      
      // Save error response to Firestore
      try {
        await addMessage(user.uid, chatId, 'assistant', errorMessage);
      } catch (saveError) {
        console.error('Error saving error message:', saveError);
        // Show error in UI directly if save fails
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: errorMessage,
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  // Loading state for messages
  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0F1115]">
        <div className="text-center space-y-4 w-72">
          {/* Shimmer Loading */}
          <div className="h-12 rounded-2xl shimmer"></div>
          <div className="h-24 rounded-2xl shimmer"></div>
          <div className="h-16 rounded-2xl shimmer w-4/5"></div>
          <p className="text-gray-500 text-sm font-medium mt-4">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0F1115]">
      {/* Header */}
      <header className="glass z-10 px-5 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          {/* Chat Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wallet className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white truncate max-w-xs">
                {chatData?.title || 'Financial Chat'}
              </h1>
              <p className="text-xs text-gray-500">{getProfileText()}</p>
            </div>
          </div>

          {/* Right - Profile Dropdown */}
          <ProfileDropdown 
            userPreferences={userPreferences} 
            onUpdatePreferences={onUpdatePreferences}
          />
        </div>
      </header>

      {/* Message Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="glass rounded-3xl p-6 float-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="font-medium text-gray-200">MoneyMitra Assistant</span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Hello! I'm your personalized financial companion. Based on your profile as a <span className="text-indigo-400 font-medium">{userDetails?.occupation}</span> in the <span className="text-indigo-400 font-medium">{userDetails?.ageGroup}</span> age group, I'm here to help you {userDetails?.primaryGoal === 'save' ? 'save money' : userDetails?.primaryGoal === 'debt' ? 'manage debt' : 'learn financial basics'}. 
                </p>
                <p className="text-gray-400 mt-3 text-sm">
                  Feel free to ask me anything about personal finance, or choose from the suggested questions below.
                </p>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                text={message.text}
                sender={message.sender}
                timestamp={message.timestamp}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start mb-4 message-enter">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="mb-1 ml-1">
                      <span className="text-xs font-medium text-gray-500">MoneyMitra</span>
                    </div>
                    <div className="glass px-5 py-4 rounded-2xl rounded-tl-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="glass border-t border-white/5 p-4">
        <div className="max-w-3xl mx-auto">
          
          {/* Suggested Questions - Only show when chat is empty */}
          {messages.length === 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
                Suggested questions for you
              </p>
              <div className="flex flex-wrap gap-2">
                {getSuggestedQuestions().map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-sm bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300 text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex items-end space-x-3 mb-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about savings, budget, or debt..."
                className="w-full px-5 py-4 bg-[#1A1D23] border border-white/5 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 text-gray-200 placeholder-gray-500 glow-indigo-focus"
                disabled={isTyping}
              />
              <style>{`
                .glow-indigo-focus:focus {
                  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
                }
              `}</style>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                inputValue.trim() && !isTyping
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-95'
                  : 'bg-[#22262E] text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </form>

          {/* Disclaimer */}
          <div className="text-center">
            <p className="text-xs text-gray-600 leading-relaxed">
              MoneyMitra is an educational tool. We do not provide professional financial or legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;