import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Copy, Check } from 'lucide-react';

const MessageBubble = ({ text, sender, timestamp }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    return ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isUser = sender === 'user';
  const isMirrorMode = !isUser && typeof text === 'string' && text.includes('### Purchase Mirror Reality Check');

  const handleCopy = async () => {
    if (isUser || !text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  };

  const markdownComponents = {
    h1: (props) => <h1 className="mb-2 mt-4 font-headline text-lg font-bold text-[#0e1c16]" {...props} />,
    h2: (props) => <h2 className="mb-2 mt-3 font-headline text-base font-bold text-[#0e1c16]" {...props} />,
    h3: (props) => <h3 className="mb-1.5 mt-3 font-headline text-sm font-bold text-[#0e1c16]" {...props} />,
    strong: (props) => <strong className="font-semibold text-emerald-700" {...props} />,
    em: (props) => <em className="italic text-[#3d5246]" {...props} />,
    ul: (props) => <ul className="my-2 list-inside list-disc space-y-1" {...props} />,
    ol: (props) => <ol className="my-2 list-inside list-decimal space-y-1" {...props} />,
    li: (props) => <li className="ml-2 text-[#3d5246]" {...props} />,
    p: (props) => <p className="my-2 leading-relaxed text-[#3d5246]" {...props} />,
    code: ({ inline, ...props }) =>
      inline ? (
        <code className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-mono text-xs text-emerald-800" {...props} />
      ) : (
        <code className="my-2 block rounded-xl bg-emerald-50 p-3 font-mono text-xs text-emerald-800 leading-relaxed" {...props} />
      ),
    table: (props) => (
      <div className="my-4 overflow-x-auto rounded-xl border border-[#d4e8dc] bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-[#3d5246]" {...props} />
      </div>
    ),
    thead: (props) => <thead className="border-b border-[#d4e8dc] bg-[#e8f5ed] text-[#0e1c16]" {...props} />,
    tbody: (props) => <tbody className="divide-y divide-emerald-50" {...props} />,
    tr: (props) => <tr className="transition-colors hover:bg-emerald-50/40" {...props} />,
    th: (props) => <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-emerald-900" {...props} />,
    td: (props) => <td className="px-4 py-3 align-top leading-relaxed" {...props} />,
    blockquote: ({ node, children, ...props }) => {
      let isAha = false;
      try {
        const textContent = JSON.stringify(node);
        isAha = textContent.includes('Aha! Moment') || textContent.includes('💡');
      } catch {}

      if (isAha) {
        return (
          <div className="relative my-4 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/60" {...props}>
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-linear-to-b from-amber-400 to-amber-600" />
            <div className="relative z-10 p-4 text-sm font-medium leading-relaxed text-amber-900">{children}</div>
          </div>
        );
      }
      return (
        <blockquote className="my-2 border-l-4 border-emerald-400 pl-4 italic text-[#6b7e73]" {...props}>
          {children}
        </blockquote>
      );
    },
  };

  return (
    <div
      className={`group/message message-enter mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : 'translateY(8px)',
        transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
      }}
    >
      {/* Bot layout */}
      {!isUser && (
        <div className="flex w-full max-w-3xl items-start gap-3">
          {/* Avatar */}
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl gradient-emerald shadow shadow-emerald-900/20">
            <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
          </div>

          {/* Bubble */}
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700/50">
              MoneyMitra AI
            </span>
            <div
              className={`relative rounded-2xl rounded-tl-sm px-5 py-4 text-sm ${
                isMirrorMode
                  ? 'mirror-highlight'
                  : 'border border-[#d4e8dc] bg-white shadow-sm'
              }`}
            >
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-[#d4e8dc] bg-white px-2 py-1 text-[11px] font-semibold text-[#6b7e73] opacity-0 transition hover:border-emerald-300 hover:text-emerald-700 group-hover/message:opacity-100"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {text}
                </ReactMarkdown>
              </div>

              {/* Timestamp */}
              <p className="mt-1.5 text-[11px] text-[#9aada3] opacity-0 transition-opacity group-hover/message:opacity-100">
                {formatTimestamp(timestamp)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User layout */}
      {isUser && (
        <div className="flex max-w-xs items-start gap-2 sm:max-w-sm lg:max-w-md">
          <div className="flex flex-col items-end gap-1">
            <div className="rounded-2xl rounded-br-sm gradient-emerald px-5 py-3.5 text-sm text-white shadow-md shadow-emerald-900/15">
              <p className="leading-relaxed wrap-break-word">{text}</p>
              <p className="mt-1.5 text-[11px] text-emerald-200/60 opacity-0 transition-opacity group-hover/message:opacity-100">
                {formatTimestamp(timestamp)}
              </p>
            </div>
          </div>
          {/* Invisible spacer to keep right alignment tidy */}
          <div className="h-8 w-8 shrink-0" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
