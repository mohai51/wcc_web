'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  HeartHandshake,
  Stethoscope,
  BookOpen,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const QUICK_PROMPTS_BN = [
  'আসন্ন ইভেন্টসমূহ কি কি?',
  'ফ্রি স্বাস্থ্য ক্যাম্প ও ডাক্তার সেবা',
  'রক্তদাতা ও ব্লাড ব্যাংক কীভাবে পাব?',
  'কীভাবে মেম্বার বা ভলান্টিয়ার হব?',
  'শিক্ষা উইংয়ের ফ্রি কোর্সসমূহ'
];

const QUICK_PROMPTS_EN = [
  'What are the upcoming events?',
  'Free health camps & medical care',
  'How to find blood donors in Jhalokathi?',
  'How do I register as a member/volunteer?',
  'Education Wing free IT courses'
];

export default function AIChatbot() {
  const { lang, tx } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: lang === 'bn'
        ? 'আসসালামু আলাইকুম! আমি উই ক্যান চেঞ্জ (WCC)-এর স্মার্ট এআই সহকারী। WCC-এর কার্যক্রম, ৫টি উইং, ফ্রি স্বাস্থ্য ক্যাম্প, ব্লাড ব্যাংক বা আসন্ন ইভেন্ট সম্পর্কিত যে কোনো প্রশ্ন করতে পারেন।'
        : 'Hello! I am the official AI Assistant for We Can Change (WCC). Ask me anything about our 5 wings, upcoming events, health camps, blood bank, or volunteer registration!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || input).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-6)
        })
      });

      const data = await res.json();
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || (lang === 'bn' ? 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।' : 'Sorry, no response available.'),
        guardrailBlocked: data.guardrailBlocked
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: lang === 'bn'
            ? 'সার্ভারে সংযোগে কিছুটা সমস্যা হচ্ছে। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন।'
            : 'Connection error. Please try again shortly.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to render text with clickable internal markdown links [label](path)
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Text before the link
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const label = match[1];
      const url = match[2];
      parts.push(
        <Link
          key={`${match.index}-${url}`}
          href={url}
          onClick={() => setIsOpen(false)}
          className="inline-flex items-center gap-1 font-bold text-[#B62A35] hover:text-[#9E1F2A] underline underline-offset-2 transition-colors mx-0.5"
        >
          <span>{label}</span>
          <ExternalLink className="w-3 h-3 inline-block" />
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return (
      <div className="whitespace-pre-line leading-relaxed text-[13px]">
        {parts.map((part, idx) => (
          <span key={idx}>{part}</span>
        ))}
      </div>
    );
  };

  const quickPrompts = lang === 'bn' ? QUICK_PROMPTS_BN : QUICK_PROMPTS_EN;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Toggle Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-linear-to-r from-[#B62A35] via-[#851620] to-slate-900 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
          aria-label="Open WCC AI Chatbot"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#F1AD1A] group-hover:text-slate-950 transition-colors">
            <Sparkles className="w-4 h-4 text-[#F1AD1A] group-hover:text-slate-950 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-black tracking-tight leading-tight flex items-center gap-1">
              <span>WCC AI Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] text-slate-300 font-medium">
              {tx('যেকোনো তথ্য জানতে ক্লিক করুন', 'Ask any question')}
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[400px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-linear-to-r from-[#B62A35] via-[#9E1F2A] to-slate-900 text-white p-4 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles className="w-5 h-5 text-[#F1AD1A]" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>WCC AI Assistant</span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] rounded-full font-bold">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[10px] text-slate-300">
                  {tx('উই ক্যান চেঞ্জ (WCC) স্মার্ট হেল্পডেস্ক', 'We Can Change Official Helpdesk')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome-reset',
                      sender: 'bot',
                      text: lang === 'bn'
                        ? 'চ্যাট হিস্ট্রি রিসেট করা হয়েছে। আপনি আমাকে WCC সম্পর্কিত যেকোনো প্রশ্ন করতে পারেন।'
                        : 'Chat reset. Ask me anything about WCC!'
                    }
                  ])
                }
                title={lang === 'bn' ? 'চ্যাট রিসেট করুন' : 'Reset Chat'}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Notice Guardrail Bar */}
          <div className="bg-slate-50 border-b border-slate-200/80 px-3 py-1.5 text-[10px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1 truncate">
              <ShieldAlert className="w-3 h-3 text-[#B62A35] shrink-0" />
              <span>{tx('শুধুমাত্র WCC সংশ্লিষ্ট তথ্যের উত্তর দেওয়া হয়', 'Strictly answers WCC inquiries only')}</span>
            </span>
            <span className="text-[9px] text-[#B62A35] font-bold">Jhalokathi</span>
          </div>

          {/* Message List */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 items-start ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#B62A35] to-[#F1AD1A] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl shadow-xs ${
                      isBot
                        ? msg.guardrailBlocked
                          ? 'bg-rose-50/90 text-rose-950 border border-rose-200 rounded-tl-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                        : 'bg-[#B62A35] text-white rounded-tr-xs'
                    }`}
                  >
                    {isBot ? renderFormattedText(msg.text) : <div className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</div>}
                  </div>

                  {!isBot && (
                    <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#B62A35] to-[#F1AD1A] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#B62A35] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#F1AD1A] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-800 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-[#B62A35] hover:border-rose-200 border border-slate-200 text-slate-700 rounded-full font-medium transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tx('WCC সম্পর্কে কিছু জানতে চান? লিখুন...', 'Ask anything about WCC...')}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#B62A35] focus:bg-white transition-all"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
