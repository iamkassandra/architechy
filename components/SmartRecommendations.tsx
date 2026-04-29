
import React, { useState, useEffect } from 'react';
import * as gemini from '../services/geminiService';
import { AppRoute } from '../types';

const ALL_CONTENT = [
  { id: '1', name: 'THE OMNI PROTOCOL', category: 'SYSTEMS' },
  { id: '2', name: 'STRATEGIC ALIGNMENT', category: 'ASSETS' },
  { id: '3', name: 'THE AGENTIC STACK', category: 'COURSES' },
  { id: '4', name: 'VISION ARCHITECHURE', category: 'DESIGN' },
  { id: '5', name: 'ARCHITECH INNER CIRCLE', category: 'ACCESS' },
  { id: '6', name: 'PROMPT MATRIX 3.0', category: 'ASSETS' },
];

const SmartRecommendations: React.FC<{ navigate: (r: AppRoute) => void }> = ({ navigate }) => {
  const [recs, setRecs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      setIsLoading(true);
      // Mock history from local storage or just provide a default set
      const history = ['Vault', 'Systems', 'Blog'];
      try {
        const suggestedIds = await gemini.getSmartRecommendations(history, ALL_CONTENT);
        setRecs(suggestedIds);
      } catch (err) {
        console.error("Smart rec failure:", err);
        setRecs(['1', '3', '5']); // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (isLoading) return (
    <div className="flex items-center gap-4 animate-pulse px-10 py-24">
       <div className="w-12 h-12 bg-neutral-100 rounded-full"></div>
       <div className="space-y-2">
          <div className="w-32 h-2 bg-neutral-100 rounded-full"></div>
          <div className="w-48 h-2 bg-neutral-100 rounded-full"></div>
       </div>
    </div>
  );

  const matchedContent = ALL_CONTENT.filter(c => recs.includes(c.id));

  return (
    <section className="px-6 py-32 bg-neutral-900 text-white rounded-[4rem] mx-6 mb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20">
          <div className="space-y-6">
            <span className="text-[10px] font-black tracking-[0.5em] text-blue-500 uppercase">Personalized Curation</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">Recommended <br />for your <span className="serif italic font-light text-neutral-500">Node</span>.</h2>
          </div>
          <p className="text-neutral-400 max-w-sm text-lg font-light leading-relaxed">AI analysis of your interaction history suggests these protocols for maximum leverage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {matchedContent.map((item, idx) => (
            <div 
              key={item.id} 
              onClick={() => navigate(AppRoute.SHOP)}
              className="group cursor-pointer bg-white/5 border border-white/10 p-10 rounded-[3rem] hover:bg-white hover:text-black transition-all duration-700"
            >
              <div className="flex justify-between items-start mb-12">
                 <span className="text-[9px] font-black tracking-widest uppercase py-2 px-4 bg-white/10 rounded-full group-hover:bg-black/5">{item.category}</span>
                 <span className="serif italic text-3xl text-neutral-700 group-hover:text-neutral-300">0{idx + 1}</span>
              </div>
              <h3 className="text-2xl font-black tracking-tighter mb-8 group-hover:text-black transition-colors">{item.name}</h3>
              <button className="text-[10px] font-black tracking-widest uppercase underline underline-offset-8 decoration-neutral-700 group-hover:decoration-black transition-all">Examine Protocol</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartRecommendations;
