
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { getConstructionAdvice } from '../../../services/gemini';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

const AIView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your CDE-ONE AI assistant. How can I help you with Skyline Tower Phase 2 today? I can analyze RFI patterns, provide regulatory advice, or help with document searches.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const advice = await getConstructionAdvice(userMsg, "Project: Skyline Tower, Stage: Construction, Location: NY");
    setMessages(prev => [...prev, { role: 'assistant', content: advice }]);
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="p-8 border-b border-slate-200 bg-white shadow-sm flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <Bot className="mr-3 text-red-600" size={28} />
            Construction Intel Assistant
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">ISO 19650 standards Compiance</p>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <span className="flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
            <Sparkles size={12} className="mr-1.5" />
            Live Project Insights
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'ml-4 bg-slate-900 text-white' : 'mr-4 bg-white border border-slate-200 text-red-600'
                }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                ? 'bg-red-600 text-white font-medium rounded-tr-none'
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none font-medium'
                }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%] items-center">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-red-600 mr-4 shadow-sm">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Assistant is thinking...</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-slate-200 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center bg-slate-50 border border-slate-200 p-2 rounded-2xl focus-within:ring-4 focus-within:ring-red-500/5 focus-within:border-red-500 transition-all shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about project delays, regulatory codes, or snag trends..."
            className="flex-1 bg-transparent px-4 py-3 outline-none text-sm font-medium text-slate-700"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-900/10"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="max-w-4xl mx-auto mt-4 flex flex-wrap gap-2">
          <button onClick={() => setInput("What are the ISO 19650 folder requirements?")} className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-200 transition uppercase tracking-widest">ISO 19650 Folders</button>
          <button onClick={() => setInput("Identify high-risk snags in phase 2.")} className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-200 transition uppercase tracking-widest">Risk Analysis</button>
          <button onClick={() => setInput("Suggest HVAC clash resolution strategies.")} className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-200 transition uppercase tracking-widest">Clash Mitigation</button>
        </div>
      </div>
    </div>
  );
};

export default AIView;
