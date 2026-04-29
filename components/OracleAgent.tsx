import React, { useState, useRef, useEffect } from 'react';
import * as gemini from '../services/geminiService';
import { Chat } from '@google/genai';
import BrandIcon from './BrandIcon';

interface Message {
  role: 'user' | 'agent';
  text: string;
}

const OracleAgent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [session, setSession] = useState<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) {
      setTimeout(() => {
        const s = gemini.createOracleSession();
        setSession(s);
        setMessages([{ role: 'agent', text: 'NEXUS TERMINAL ONLINE. COMMAND THE ORACLE.' }]);
      }, 0);
    }
  }, [session]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || !session) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsThinking(true);

    try {
      const result = await session.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'agent', text: result.text || 'SIGNAL_LOST' }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'agent', text: 'ERROR: NEURAL_LINK_FAILED' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full border border-white/5 bg-black">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {m.role === 'agent' && <BrandIcon className="w-10 h-10 flex-shrink-0 mt-1" />}
            <div className={`max-w-[85%] p-8 border ${
              m.role === 'user' 
                ? 'border-red bg-red/5 text-red' 
                : 'border-white/10 text-white/60'
            }`}>
               <p className="text-xs font-mono leading-relaxed whitespace-pre-wrap uppercase">{m.text}</p>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex items-center gap-4">
            <BrandIcon className="w-10 h-10 animate-pulse" />
            <div className="text-[10px] font-black text-red tracking-widest uppercase animate-pulse">
              [ Oracle_Processing... ]
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-white/5 bg-white/2">
        <div className="flex gap-4 items-end border border-white/10 focus-within:border-red transition-all p-4">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="INPUT COMMAND..."
            className="flex-1 bg-transparent px-4 py-2 min-h-[40px] max-h-[200px] resize-none focus:outline-none text-sm font-mono text-white placeholder:text-white/20 uppercase"
          />
          <button 
            onClick={handleSend}
            className="w-12 h-12 flex items-center justify-center bg-red text-black hover:bg-white transition-all shadow-xl"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OracleAgent;
