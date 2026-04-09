import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles } from 'lucide-react';

const MessageBubble = ({ text, sender, timestamp }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isUser = sender === 'user';
  const isMirrorMode = !isUser && typeof text === 'string' && text.includes('### Purchase Mirror Reality Check');

  // Custom markdown styling components for dark theme
  const markdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-xl font-semibold mt-3 mb-2 text-gray-100" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-lg font-semibold mt-2 mb-2 text-gray-100" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-2 mb-2 text-gray-100" {...props} />,
    strong: ({node, ...props}) => <strong className="font-semibold text-indigo-300" {...props} />,
    em: ({node, ...props}) => <em className="italic text-gray-300" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
    li: ({node, ...props}) => <li className="ml-2 text-gray-300" {...props} />,
    p: ({node, ...props}) => <p className="my-2 text-gray-300" {...props} />,
    code: ({node, inline, ...props}) => 
      inline ? 
        <code className="bg-[#22262E] px-2 py-1 rounded text-sm font-mono text-indigo-300" {...props} /> :
        <code className="bg-[#22262E] p-3 rounded-xl block text-sm font-mono my-2 text-indigo-300" {...props} />,
    td: ({node, ...props}) => <td className="px-4 py-3 align-top leading-relaxed" {...props} />,
    table: ({node, ...props}) => (
      <div className="overflow-x-auto my-4 rounded-xl shadow-lg border border-gray-700/50 bg-[#1e2128]">
        <table className="w-full text-left border-collapse text-sm text-gray-300" {...props} />
      </div>
    ),
    thead: ({node, ...props}) => <thead className="bg-[#2a2e37] text-gray-200 border-b border-gray-700/50" {...props} />,
    tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-700/30" {...props} />,
    tr: ({node, ...props}) => <tr className="hover:bg-white/[0.02] transition-colors" {...props} />,
    th: ({node, ...props}) => <th className="px-4 py-3 font-semibold whitespace-nowrap text-indigo-200" {...props} />,
    blockquote: ({node, children, ...props}) => {
      // Check if this blockquote is an 'Aha! Moment'
      let isAha = false;
      try {
        const textContent = JSON.stringify(node);
        isAha = textContent.includes('Aha! Moment') || textContent.includes('💡');
      } catch (e) {}

      if (isAha) {
        return (
          <div className="aha-moment-box my-4 relative rounded-xl overflow-hidden shadow-lg border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 group" {...props}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-500 rounded-l-xl opacity-90"></div>
            <div className="p-4 sm:p-5 text-amber-100/90 leading-relaxed text-[15px] relative z-10 font-medium">
              {children}
            </div>
          </div>
        );
      }
      return <blockquote className="border-l-4 border-indigo-500 pl-4 italic my-2 text-gray-400" {...props}>{children}</blockquote>;
    },
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 message-enter`}>
      <div
        className={`transform transition-all duration-300 ease-out ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-2.5 opacity-0'
        } ${isUser ? '' : 'w-full'}`}
      >
        <div className={`flex items-start ${isUser ? 'flex-row-reverse max-w-xs sm:max-w-sm lg:max-w-md' : 'flex-row w-full'}`}>
          
          {/* Bot Avatar - Only for bot messages */}
          {!isUser && (
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
            </div>
          )}

          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? '' : 'flex-1'}`}>
            
            {/* Bot Name Label - Only for bot messages */}
            {!isUser && (
              <div className="mb-1 ml-1">
                <span className="text-xs font-medium text-gray-500">MoneyMitra</span>
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`px-5 py-4 font-sans text-sm leading-relaxed ${
                isUser
                  ? // User bubble: indigo gradient, white text
                    'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl rounded-br-md shadow-lg shadow-indigo-500/20'
                  : isMirrorMode
                    ? // Bot bubble: mirror highlight amber effect
                      'mirror-highlight rounded-2xl rounded-tl-md text-gray-200'
                    : // Bot bubble: glass effect, light gray text
                    'glass rounded-2xl rounded-tl-md'
              }`}
            >
              {isUser ? (
                <p className="break-words">{text}</p>
              ) : (
                <div className="prose prose-sm max-w-none prose-invert">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    components={markdownComponents}
                  >
                    {text}
                  </ReactMarkdown>
                </div>
              )}
              
              {/* Timestamp */}
              <div className={`text-xs mt-2 font-mono ${
                isUser ? 'text-indigo-200' : 'text-gray-500'
              }`}>
                {formatTimestamp(timestamp)}
              </div>
            </div>
          </div>

          {/* User Avatar Space - Invisible but maintains alignment */}
          {isUser && (
            <div className="flex-shrink-0 ml-3 w-10 h-10" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;