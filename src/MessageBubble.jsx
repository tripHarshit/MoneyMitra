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

  // Custom markdown styling components for learning-friendly chat output.
  const markdownComponents = {
    h1: ({node, ...props}) => <h1 className="mt-3 mb-2 text-xl font-semibold text-[#141d1b]" {...props} />,
    h2: ({node, ...props}) => <h2 className="mt-2 mb-2 text-lg font-semibold text-[#141d1b]" {...props} />,
    h3: ({node, ...props}) => <h3 className="mt-2 mb-2 text-base font-semibold text-[#141d1b]" {...props} />,
    strong: ({node, ...props}) => <strong className="font-semibold text-emerald-700" {...props} />,
    em: ({node, ...props}) => <em className="italic text-[#3d4a42]" {...props} />,
    ul: ({node, ...props}) => <ul className="my-2 list-inside list-disc space-y-1" {...props} />,
    ol: ({node, ...props}) => <ol className="my-2 list-inside list-decimal space-y-1" {...props} />,
    li: ({node, ...props}) => <li className="ml-2 text-[#3d4a42]" {...props} />,
    p: ({node, ...props}) => <p className="my-2 text-[#3d4a42]" {...props} />,
    code: ({node, inline, ...props}) => 
      inline ? 
        <code className="rounded bg-[#ecf6f2] px-2 py-1 font-mono text-sm text-emerald-800" {...props} /> :
        <code className="my-2 block rounded-xl bg-[#ecf6f2] p-3 font-mono text-sm text-emerald-800" {...props} />,
    td: ({node, ...props}) => <td className="px-4 py-3 align-top leading-relaxed" {...props} />,
    table: ({node, ...props}) => (
      <div className="my-4 overflow-x-auto rounded-xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-[#3d4a42]" {...props} />
      </div>
    ),
    thead: ({node, ...props}) => <thead className="border-b border-emerald-100 bg-[#ecf6f2] text-[#141d1b]" {...props} />,
    tbody: ({node, ...props}) => <tbody className="divide-y divide-emerald-100/80" {...props} />,
    tr: ({node, ...props}) => <tr className="transition-colors hover:bg-emerald-50/40" {...props} />,
    th: ({node, ...props}) => <th className="whitespace-nowrap px-4 py-3 font-semibold text-emerald-900" {...props} />,
    blockquote: ({node, children, ...props}) => {
      let isAha = false;
      try {
        const textContent = JSON.stringify(node);
        isAha = textContent.includes('Aha! Moment') || textContent.includes('💡');
      } catch (e) {}

      if (isAha) {
        return (
          <div className="relative my-4 overflow-hidden rounded-xl border border-amber-200 bg-[#ffdcc3]/35" {...props}>
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-amber-400 to-amber-600"></div>
            <div className="relative z-10 p-4 text-[15px] font-medium leading-relaxed text-[#6e3900] sm:p-5">
              {children}
            </div>
          </div>
        );
      }
      return <blockquote className="my-2 border-l-4 border-emerald-500 pl-4 italic text-[#6d7a72]" {...props}>{children}</blockquote>;
    },
  };

  return (
    <div className={`message-enter mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
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
              <div className="gradient-emerald flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md shadow-emerald-900/20">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
            </div>
          )}

          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? '' : 'flex-1'}`}>
            
            {/* Bot Name Label - Only for bot messages */}
            {!isUser && (
              <div className="mb-1 ml-1">
                <span className="text-xs font-semibold text-emerald-700/70">MoneyMitra AI</span>
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`px-5 py-4 font-sans text-sm leading-relaxed ${
                isUser
                  ? 'gradient-emerald rounded-2xl rounded-br-md text-white shadow-md shadow-emerald-900/20'
                  : isMirrorMode
                    ? 'mirror-highlight rounded-2xl rounded-tl-md text-[#3d4a42]'
                    : 'rounded-2xl rounded-tl-md border border-emerald-100 bg-white text-[#3d4a42]'
              }`}
            >
              {isUser ? (
                <p className="break-words">{text}</p>
              ) : (
                <div className="prose prose-sm max-w-none">
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
                isUser ? 'text-emerald-100' : 'text-[#6d7a72]'
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