"use client";

import { useState, useRef, useEffect } from 'react';

type MessageItem = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

export default function Home() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [displayMessages, setDisplayMessages] = useState<{role: string, content: string}[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    
    // For display (only user and assistant text)
    setDisplayMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    // For API state
    const newMessages: MessageItem[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Allow override for local development if not in Docker
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, message: userMsg })
      });
      
      const data = await res.json();
      
      if (data.reply) {
        setDisplayMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
      if (data.messages) {
        setMessages(data.messages);
      }
      if (data.logs) {
        setLogs(prev => [...prev, ...data.logs, "---"]);
      }
    } catch (error) {
      setLogs(prev => [...prev, `Network error: ${error}`, "---"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      <header className="px-6 py-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
            AI
          </div>
          <h1 className="text-xl font-medium tracking-tight text-white">RefundAgent<span className="text-indigo-400">.pro</span></h1>
        </div>
        <div className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Online
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Chat Interface */}
        <div className="w-full md:w-1/2 flex flex-col border-r border-white/5 bg-slate-950 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 custom-scrollbar">
            {displayMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-2 shadow-inner border border-white/5">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-white">Welcome to Support</h2>
                <p className="max-w-xs text-sm">I can help you process refunds. Please provide your email and order ID to get started.</p>
              </div>
            )}
            
            {displayMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : 'bg-slate-800 border border-white/10 text-slate-200 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-white/10 text-slate-200 rounded-2xl rounded-bl-sm px-5 py-4 flex gap-1.5 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-slate-900 border-t border-white/5 z-10">
            <form onSubmit={sendMessage} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="absolute right-2 p-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Admin Dashboard */}
        <div className="hidden md:flex w-1/2 bg-[#0A0E17] flex-col border-l border-white/5 font-mono text-xs overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.333 14.667a4.667 4.667 0 00-4.666 4.666h4.666v-4.666zM14.667 4.667a4.667 4.667 0 00-4.667-4.667v4.667h4.667zM14.667 9.333v4.667h4.666A4.667 4.667 0 0014.667 9.333zM9.333 4.667V0a4.667 4.667 0 00-4.666 4.667h4.666zM4.667 9.333H0a4.667 4.667 0 004.667 4.667V9.333zM9.333 14.667H4.667A4.667 4.667 0 009.333 19.333v-4.666zM14.667 14.667h-4.667v4.666h4.667v-4.666z" />
            </svg>
          </div>
          
          <div className="px-5 py-3 border-b border-white/5 bg-slate-900/50 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold tracking-wider">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              AGENT REASONING LOGS
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar text-emerald-400/90 z-10">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 italic">
                Awaiting agent activity...
              </div>
            ) : (
              <div className="space-y-1.5 break-words">
                {logs.map((log, idx) => (
                  <div key={idx} className={`${
                    log === "---" ? "my-4 border-b border-white/10" : 
                    log.includes("Error") ? "text-red-400" :
                    log.includes("Agent invoked tool") ? "text-amber-300" :
                    log.includes("Tool") && log.includes("returned") ? "text-cyan-300" :
                    "text-emerald-400/90"
                  }`}>
                    {log !== "---" && <span className="opacity-50 mr-2 text-slate-500">{`>`}</span>}
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
