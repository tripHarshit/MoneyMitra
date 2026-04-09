import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProfileDropdown from './components/ProfileDropdown';
import MessageBubble from './MessageBubble';
import { fetchGeminiResponse } from './geminiService';
import { subscribeToMessages, addMessage, updateChatTitle } from './services/chatService';
import { Send, Sparkles, Newspaper, ArrowLeft, Paperclip, Mic, Bot } from 'lucide-react';

const ChatInterface = ({ userDetails, chatId, chatData, userPreferences, onUpdatePreferences }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid || !chatId) return;

    setMessages([]);
    setIsLoadingMessages(true);

    const unsubscribe = subscribeToMessages(user.uid, chatId, (updatedMessages) => {
      const formattedMessages = updatedMessages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.role === 'user' ? 'user' : 'bot',
        timestamp: msg.timestamp?.toDate?.() || new Date(),
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
  }, [messages, isTyping]);

  const getProfileText = () => {
    const occupation = userDetails?.occupation || '';
    const goal =
      userDetails?.primaryGoal === 'save'
        ? 'Save Money'
        : userDetails?.primaryGoal === 'debt'
          ? 'Manage Debt'
          : userDetails?.primaryGoal === 'Save Money'
            ? 'Save Money'
            : userDetails?.primaryGoal === 'Manage Debt'
              ? 'Manage Debt'
              : userDetails?.primaryGoal === 'Learn Basics'
                ? 'Learn Basics'
                : userDetails?.primaryGoal || '';
    return `${occupation}${goal ? ` • ${goal}` : ''}`;
  };

  const getSuggestedQuestions = () => {
    const { occupation, primaryGoal } = userDetails || {};

    const suggestions = ['Create a budget for me', 'Analyze my daily habit cost'];

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

    if (primaryGoal === 'save' || primaryGoal === 'Save Money') {
      suggestions.push('What are the best savings strategies for beginners?');
    } else if (primaryGoal === 'debt' || primaryGoal === 'Manage Debt') {
      suggestions.push('How do I create a debt repayment plan?');
    } else if (primaryGoal === 'learn' || primaryGoal === 'Learn Basics') {
      suggestions.push('What are the financial basics I should know?');
    }

    return suggestions.slice(0, 5);
  };

  const getConversationHistory = () => {
    return messages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      text: msg.text,
    }));
  };

  const handleSendMessage = async (message, hiddenPrompt = null) => {
    if (!message.trim() || !user?.uid || !chatId) return;

    const tempUserMessage = {
      id: 'temp_' + Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      await addMessage(user.uid, chatId, 'user', message);

      const conversationHistory = getConversationHistory();
      const promptToSend = hiddenPrompt || message;
      const botResponseText = await fetchGeminiResponse(promptToSend, userDetails, conversationHistory);

      await addMessage(user.uid, chatId, 'assistant', botResponseText);

      if (messages.length === 0) {
        const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
        await updateChatTitle(user.uid, chatId, title);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.message || "I apologize, but I'm having trouble processing your request right now. Please try again.";

      try {
        await addMessage(user.uid, chatId, 'assistant', errorMessage);
      } catch (saveError) {
        console.error('Error saving error message:', saveError);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: errorMessage,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
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

  if (isLoadingMessages) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f2fcf8]">
        <div className="w-72 space-y-4">
          <div className="h-12 rounded-2xl shimmer"></div>
          <div className="h-24 rounded-2xl shimmer"></div>
          <div className="h-12 w-3/4 rounded-2xl shimmer"></div>
          <p className="text-center text-sm font-semibold text-[#3d4a42]">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#f2fcf8] text-[#141d1b]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-emerald-100 bg-white/85 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="rounded-full p-2 text-[#3d4a42] transition hover:bg-[#ecf6f2]"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-emerald-900">
                {chatData?.title || 'Portfolio Optimization'}
              </h2>
              <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-700/60">{getProfileText()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => navigate('/news')}
            className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-[#ecf6f2] px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-white sm:flex"
          >
            <Newspaper className="h-4 w-4" />
            Latest News
          </button>
          <ProfileDropdown userPreferences={userPreferences} onUpdatePreferences={onUpdatePreferences} />
        </div>
      </header>

      <main className="message-area-bg flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="gradient-emerald rounded-xl p-2 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <p className="font-semibold text-emerald-900">MoneyMitra AI</p>
              </div>
              <p className="leading-relaxed text-[#3d4a42]">
                Based on your profile as a <span className="font-semibold text-emerald-700">{userDetails?.occupation}</span>,
                I can help you with practical, personalized financial actions.
              </p>
              <p className="mt-2 text-sm text-[#6d7a72]">Ask a question or start with one of the guided prompts below.</p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              text={message.text}
              sender={message.sender}
              timestamp={message.timestamp}
            />
          ))}

          {isTyping && (
            <div className="flex items-center gap-3 rounded-full border border-emerald-100 bg-white/80 px-4 py-3 w-fit">
              <div className="gradient-emerald rounded-lg p-1.5 text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-emerald-100 bg-white px-4 py-4 md:px-8">
        <div className="mx-auto max-w-4xl">
          {messages.length === 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {getSuggestedQuestions().map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            <button
              type="button"
              onClick={() =>
                handleSendMessage(
                  'Generate a budget table',
                  'Create a highly structured and detailed personalized monthly budget table for me based on my profile, following the 50/30/20 rule. Output it as a clean Markdown table.'
                )
              }
              disabled={isTyping}
              className="whitespace-nowrap rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate Budget Table
            </button>
            <button
              type="button"
              onClick={() =>
                handleSendMessage(
                  'Calculate my Latte Factor',
                  'I want to calculate my Latte Factor. Please ask me to input a small daily habit I spend money on (like coffee, snacks). Wait for my answer. After I provide it, show me a table of how much it costs me in 10, 20, and 30 years considering an opportunity cost of 7% annual return.'
                )
              }
              disabled={isTyping}
              className="whitespace-nowrap rounded-full border border-amber-200 bg-[#ffdcc3]/45 px-4 py-2 text-xs font-semibold text-[#6e3900] transition hover:bg-[#ffdcc3]/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Latte Factor Calculator
            </button>
            <button
              type="button"
              onClick={() => setInputValue('I want to mirror a purchase: I am thinking of buying [Item] for ₹[Amount].')}
              disabled={isTyping}
              className="whitespace-nowrap rounded-full border border-emerald-100 bg-[#ecf6f2] px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mirror a Purchase
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask MoneyMitra about your wealth..."
                className="w-full rounded-2xl border border-emerald-100 bg-[#e0eae6] px-5 py-4 pr-24 text-sm text-[#141d1b] placeholder:text-[#6d7a72] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                disabled={isTyping}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <button type="button" className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100" aria-label="Attach file">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button type="button" className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100" aria-label="Voice input">
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`h-14 w-14 rounded-2xl text-white transition ${
                inputValue.trim() && !isTyping
                  ? 'gradient-emerald shadow-lg shadow-emerald-900/20 hover:brightness-105'
                  : 'bg-[#bccac0] cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="mx-auto h-5 w-5" />
            </button>
          </form>

          <p className="mt-2 text-center text-[10px] font-medium text-[#6d7a72]">
            MoneyMitra AI can make mistakes. Verify critical financial data.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
