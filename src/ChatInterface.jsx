import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MessageBubble from './MessageBubble';
import { fetchGeminiResponse } from './geminiService';
import { subscribeToMessages, addMessage, updateChatTitle } from './services/chatService';
import { Send, Sparkles, Newspaper, ArrowLeft, Paperclip, Mic, Bot, Zap } from 'lucide-react';

const ChatInterface = ({ userDetails, chatId, chatData, userPreferences, onUpdatePreferences }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = '0px';
    const nextHeight = Math.min(inputRef.current.scrollHeight, 180);
    inputRef.current.style.height = `${nextHeight}px`;
  }, [inputValue]);

  const getProfileText = () => {
    const occupation = userDetails?.occupation || '';
    const goal = userDetails?.primaryGoal || '';
    return `${occupation}${goal ? ` • ${goal}` : ''}`;
  };

  const getSuggestedQuestions = () => {
    const { occupation, primaryGoal } = userDetails || {};
    const suggestions = ['Create a budget for me', 'Analyze my daily habit cost'];
    if (occupation === 'Student') {
      suggestions.push('How do I save pocket money effectively?', 'Best student banking options?', 'How to build credit as a student?');
    } else if (occupation === 'Working Professional' || occupation === 'Early-career Professional') {
      suggestions.push('How much should I save from my salary?', 'What is an emergency fund?', 'Stocks vs mutual funds?');
    } else if (occupation === 'Freelancer' || occupation === 'Self-Employed') {
      suggestions.push('Saving with irregular income?', 'Best tax-saving options for freelancers?', 'Plan finances without fixed income?');
    } else if (occupation === 'Homemaker') {
      suggestions.push('Manage household budget effectively?', 'Safe investment options for homemakers?', 'Save for family emergencies?');
    } else if (occupation === 'Retired') {
      suggestions.push('Manage retirement savings?', 'Low-risk investment options?', 'Create passive income streams?');
    } else {
      suggestions.push('How do I create a monthly budget?', 'Basics of personal finance?', 'How much should I save?');
    }
    if (primaryGoal === 'save' || primaryGoal === 'Save Money') suggestions.push('Best savings strategies for beginners?');
    else if (primaryGoal === 'debt' || primaryGoal === 'Manage Debt') suggestions.push('How to create a debt repayment plan?');
    else if (primaryGoal === 'learn' || primaryGoal === 'Learn Basics') suggestions.push('Financial basics I should know?');
    return suggestions.slice(0, 5);
  };

  const getConversationHistory = () =>
    messages.map((msg) => ({ role: msg.sender === 'user' ? 'user' : 'assistant', text: msg.text }));

  const handleSendMessage = async (message, hiddenPrompt = null) => {
    if (!message.trim() || !user?.uid || !chatId) return;
    const tempUserMessage = { id: 'temp_' + Date.now(), text: message, sender: 'user', timestamp: new Date() };
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
      const errorMessage = error.message || "I apologize, but I'm having trouble processing your request right now. Please try again.";
      try {
        await addMessage(user.uid, chatId, 'assistant', errorMessage);
      } catch {
        setMessages((prev) => [...prev, { id: Date.now() + 1, text: errorMessage, sender: 'bot', timestamp: new Date() }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); handleSendMessage(inputValue); };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(inputValue); }
  };

  const wordCount = inputValue.trim() ? inputValue.trim().split(/\s+/).length : 0;

  if (isLoadingMessages) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f0faf4]">
        <div className="w-80 space-y-3">
          <div className="flex gap-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-xl shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 rounded-xl shimmer" />
              <div className="h-14 rounded-2xl shimmer" />
            </div>
          </div>
          <div className="ml-12 h-4 w-3/4 rounded-xl shimmer" />
          <div className="flex justify-end gap-3">
            <div className="h-12 w-2/3 rounded-2xl shimmer" />
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-[#6b7e73]">Loading conversation…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#f0faf4] text-[#0e1c16]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#d4e8dc] bg-white/90 px-4 py-3 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app')}
            className="rounded-xl border border-[#d4e8dc] p-2 text-[#3d5246] transition hover:bg-[#e8f5ed]"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-emerald shadow shadow-emerald-900/20">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h2 className="font-headline text-sm font-bold text-emerald-900 leading-tight">
                {chatData?.title || 'AI Financial Coach'}
              </h2>
              <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-700/50 leading-none">{getProfileText()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/news')}
            className="hidden items-center gap-1.5 rounded-full border border-[#d4e8dc] bg-[#e8f5ed] px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 sm:flex"
          >
            <Newspaper className="h-3.5 w-3.5" />
            News
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="message-area-bg chat-scroll flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 && (
            <div className="fade-in space-y-4">
              {/* Welcome card */}
              <div className="overflow-hidden rounded-2xl border border-[#d4e8dc] bg-white panel-shadow">
                <div className="gradient-emerald px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">MoneyMitra AI</p>
                      <p className="text-xs text-emerald-100/70">Your personal finance coach</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      Online
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm leading-relaxed text-[#3d5246]">
                    Based on your profile as a{' '}
                    <span className="font-semibold text-emerald-700">{userDetails?.occupation}</span>,
                    I can give you practical, personalized financial guidance. What would you like to work on?
                  </p>
                </div>
              </div>

              {/* Suggested prompts */}
              <div>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#6b7e73]">Suggested prompts</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {getSuggestedQuestions().map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(question)}
                      className="group flex items-center gap-2 rounded-xl border border-[#d4e8dc] bg-white px-4 py-3 text-left text-sm font-medium text-[#0e1c16] transition hover:border-emerald-300 hover:bg-emerald-50 panel-shadow"
                    >
                      <Zap className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500 opacity-60 transition group-hover:opacity-100" />
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-2 space-y-1">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                text={message.text}
                sender={message.sender}
                timestamp={message.timestamp}
              />
            ))}
          </div>

          {isTyping && (
            <div className="message-enter mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl gradient-emerald shadow shadow-emerald-900/20">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl border border-[#d4e8dc] bg-white px-4 py-3 shadow-sm">
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:0.15s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:0.3s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input footer */}
      <footer className="border-t border-[#d4e8dc] bg-white px-4 py-3 md:px-6">
        <div className="mx-auto max-w-3xl">
          {/* Quick action chips */}
          <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {[
              {
                label: 'Generate Budget',
                style: 'border-emerald-200 bg-emerald-50 text-emerald-800',
                onPress: () =>
                  handleSendMessage(
                    'Generate a budget table',
                    'Create a personalized monthly budget table based on my profile following the 50/30/20 rule. Output as clean Markdown table.'
                  ),
              },
              {
                label: 'Latte Factor',
                style: 'border-amber-200 bg-amber-50 text-amber-800',
                onPress: () =>
                  handleSendMessage(
                    'Calculate my Latte Factor',
                    'I want to calculate my Latte Factor. Ask me about a small daily habit I spend on. After I answer, show a table of how much it costs over 10, 20, 30 years at 7% annual return.'
                  ),
              },
              {
                label: 'Mirror a Purchase',
                style: 'border-sky-200 bg-sky-50 text-sky-800',
                onPress: () => setInputValue('I want to mirror a purchase: I am thinking of buying [Item] for ₹[Amount].'),
              },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.onPress}
                disabled={isTyping}
                className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 ${chip.style}`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input row */}
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="relative flex-1">
              <label htmlFor="chat-input" className="sr-only">Ask MoneyMitra</label>
              <textarea
                id="chat-input"
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about budgets, investments, debt, savings…"
                rows={1}
                className="min-h-[52px] w-full resize-none overflow-y-auto rounded-2xl border border-[#d4e8dc] bg-[#e8f5ed] px-4 py-3.5 pr-20 text-sm text-[#0e1c16] placeholder:text-[#9aada3] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 transition"
                disabled={isTyping}
              />
              <div className="absolute bottom-2.5 right-3 flex items-center gap-1">
                <button type="button" className="rounded-lg p-1.5 text-emerald-700/60 hover:bg-emerald-100 hover:text-emerald-700 transition" aria-label="Attach file">
                  <Paperclip className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="rounded-lg p-1.5 text-emerald-700/60 hover:bg-emerald-100 hover:text-emerald-700 transition" aria-label="Voice input">
                  <Mic className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`h-[52px] w-[52px] flex-shrink-0 rounded-2xl text-white transition ${
                inputValue.trim() && !isTyping
                  ? 'gradient-emerald shadow-lg shadow-emerald-900/20 hover:brightness-110'
                  : 'bg-[#c0d4ca] cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="mx-auto h-4 w-4" />
            </button>
          </form>

          {/* Footer meta */}
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#9aada3]">
            <span>{wordCount > 0 ? `${wordCount} word${wordCount > 1 ? 's' : ''}` : 'Start typing…'}</span>
            <span>↵ Send • Shift+↵ Newline</span>
          </div>
          <p className="mt-1 text-center text-[11px] text-[#9aada3]">
            MoneyMitra AI can make mistakes. Verify critical financial decisions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
