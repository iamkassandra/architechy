
import React, { useState, useRef, useEffect } from 'react';
import * as gemini from '../services/geminiService';
import { Chat } from "@google/genai";
import BrandIcon from './BrandIcon';

interface ArchitechBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ArchitechBot: React.FC<ArchitechBotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'architech', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !session) {
      setTimeout(() => {
        setSession(gemini.createArchitechSession());
        setMessages([{ 
          role: 'architech', 
          text: "ARCHITECH COUNSEL - awaiting the architechs command." 
        }]);
      }, 0);
    }
  }, [isOpen, session]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !session) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await session.sendMessage({ message: userMsg });
      const text = result.text || "Synchronizing nodes... architech is momentarily occupied.";
      setMessages(prev => [...prev, { role: 'architech', text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'architech', text: "Signal disruption detected. Re-establishing secure link." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 50% reduced blur and transparency as requested */}
      <div 
        className={`fixed inset-0 bg-white/5 backdrop-blur-[2px] z-[90] transition-opacity duration-700 pointer-events-none ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`} 
        onClick={onClose}
      />

      {/* Floating Intelligence Suite - Slim and properly formatted */}
      <div className={`fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] max-w-[340px] bg-white z-[100] rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-neutral-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden ${isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 scale-95 pointer-events-none'}`}>
        
        {/* Header - Restored Wording, Blue Dot Removed */}
        <div className="p-6 flex justify-between items-center border-b border-neutral-50 bg-white">
          <div className="flex items-center gap-3">
            <BrandIcon className="w-10 h-10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.4em] text-black uppercase">OFFICE OF ARCHITECH</span>
              <span className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest">DIRECT LINK STABLE</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Intelligence Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-hide bg-white">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-1 duration-500`}>
              {m.role === 'architech' && <BrandIcon className="w-8 h-8 flex-shrink-0 mt-2" />}
              <div className={`max-w-[85%] p-5 rounded-[1.5rem] ${
                m.role === 'user' 
                ? 'bg-black text-white rounded-tr-none' 
                : 'bg-neutral-50 text-neutral-800 rounded-tl-none border border-neutral-100'
              }`}>
                <p className="text-[11px] leading-relaxed font-medium whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-1.5">
                <div className="w-1 h-1 bg-neutral-300 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-neutral-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-neutral-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Interface - Footer writing removed as requested */}
        <div className="p-6 bg-white border-t border-neutral-50">
          <div className="relative flex flex-col gap-3">
             <div className="bg-neutral-50 border border-neutral-100 rounded-[1.5rem] p-4 focus-within:border-neutral-300 focus-within:bg-white transition-all">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Communicate..."
                  className="w-full bg-transparent px-2 py-1 text-[11px] font-medium focus:outline-none resize-none h-[50px] placeholder:text-neutral-300"
                />
             </div>
             <button 
                onClick={handleSend} 
                className="w-full bg-black text-white py-4 rounded-xl font-black text-[9px] tracking-[0.3em] uppercase hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
             >
                Send
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArchitechBot;
