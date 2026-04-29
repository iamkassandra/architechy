
import React, { useState, useEffect } from 'react';
import * as gemini from '../services/geminiService';
import BrandIcon from '../components/BrandIcon';
import Meta from '../components/Meta';
import { useAuth } from '../AuthContext';
import { db, collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, handleFirestoreError, OperationType } from '../services/firebase';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  level: string;
}

const Blog: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  useEffect(() => {
     const fetchPosts = async () => {
        try {
           const response = await fetch('/api/blog');
           if (response.ok) {
              const data = await response.json();
              setPosts(data.length > 0 ? data : [
                { id: '1', title: 'THE NON-LINEAR ECONOMY', category: 'ECONOMY', date: 'FEB 15, 2025', excerpt: 'WE ARE MOVING AWAY FROM SIMPLE API INTEGRATIONS TO AUTONOMOUS AGENTS THAT MANAGE ENTIRE DEPARTMENTS.', content: 'FULL ANALYSIS OF AGENTIC WORKFLOWS...', level: 'STRATEGIC' },
                { id: '2', title: 'ORCHESTRATING INTELLIGENCE', category: 'TECH', date: 'FEB 12, 2025', excerpt: 'DEEP DIVE INTO VECTOR DATABASES AND SEMANTIC SEARCH FOR HIGH-PERFORMANCE APPLICATIONS.', content: 'TECHNICAL BREAKDOWN...', level: 'TECHNICAL' },
                { id: '3', title: 'THE SOVEREIGN AI STACK', category: 'STRATEGY', date: 'FEB 10, 2025', excerpt: 'HOW TO BUILD PROPRIETARY INTELLIGENCE WITHOUT VENDOR LOCK-IN.', content: 'STRATEGIC FRAMEWORK...', level: 'VISIONARY' },
              ]);
           }
        } catch (err) {
           console.error('Failed to sync intelligence feed:', err);
        } finally {
           setLoading(false);
        }
     };
     fetchPosts();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchSaved = async () => {
        const path = 'reading_lists';
        try {
          const q = query(collection(db, path), where('userId', '==', user.uid), where('resourceType', '==', 'article'));
          const snapshot = await getDocs(q);
          setSavedPosts(snapshot.docs.map(doc => doc.data().resourceId));
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, path);
        }
      };
      fetchSaved();
    }
  }, [user]);

  const handleSavePost = async (post: BlogPost) => {
    if (!user) return alert("Identity verification required to save resources.");
    
    if (savedPosts.includes(post.id)) {
      // Unsave
      const path = 'reading_lists';
      try {
        const q = query(collection(db, path), where('userId', '==', user.uid), where('resourceId', '==', post.id));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (d) => {
          try {
            await deleteDoc(d.ref);
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `${path}/${d.id}`);
          }
        });
        setSavedPosts(prev => prev.filter(id => id !== post.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
    } else {
      // Save
      const path = 'reading_lists';
      try {
        await addDoc(collection(db, path), {
          userId: user.uid,
          resourceId: post.id,
          resourceType: 'article',
          resourceTitle: post.title,
          savedAt: serverTimestamp()
        });
        setSavedPosts(prev => [...prev, post.id]);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  const handlePlayExcerpt = async (text: string) => {
    setAudioLoading(true);
    try {
      const base64Audio = await gemini.generateSpeech(text);
      if (base64Audio) {
        const audioBytes = gemini.decode(base64Audio);
        const SelectedAudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new SelectedAudioContext({ sampleRate: 24000 });
        const buffer = await gemini.decodeAudioData(audioBytes, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAudioLoading(false);
    }
  };

  if (loading) {
     return (
        <div className="pt-48 flex flex-col items-center justify-center gap-6">
           <BrandIcon className="w-16 h-16 animate-bounce" />
           <p className="text-[10px] font-black text-red tracking-widest uppercase animate-pulse">Initializing Intelligence Database...</p>
        </div>
     );
  }

  if (activePost) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24">
        <button 
          onClick={() => setActivePost(null)} 
          className="mb-12 text-[10px] font-black tracking-widest text-red border border-red px-6 py-2 hover:bg-red hover:text-black transition-all"
        >
          [ BACK_TO_JOURNAL ]
        </button>
        
        <article className="space-y-16">
          <header className="space-y-8">
            <div className="flex items-center gap-6 text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">
              <span>{activePost.date}</span>
              <div className="w-1 h-px bg-white/20"></div>
              <span>{activePost.category}</span>
              <div className="w-1 h-px bg-white/20"></div>
              <span className="text-red">{activePost.level}</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">{activePost.title}</h1>
          </header>

          <div className="bg-white/5 p-12 border-l-4 border-red text-xl md:text-2xl font-bold leading-relaxed uppercase opacity-80 italic">
             "{activePost.excerpt}"
          </div>

          <div className="prose prose-invert prose-red max-w-none font-mono text-sm leading-relaxed opacity-60">
             <p>THE CONVERGENCE OF GENERATIVE MODELS AND LOW-LATENCY INFERENCE IS CREATING A NEW PARADIGM FOR DIGITAL COMMERCE. WHAT WE ARE SEEING IS NOT JUST A REPLACEMENT FOR OLD TOOLS, BUT THE BIRTH OF COMPLETELY AUTONOMOUS BUSINESS UNITS.</p>
             <p>STRATEGIC POSITIONING REQUIRES MORE THAN JUST AN API KEY; IT REQUIRES A PROPRIETARY DATASET AND A UNIQUELY FINE-TUNED USER EXPERIENCE THAT LIVES AT THE EDGE OF WHAT IS POSSIBLE.</p>
             <p>IN THE NEXT 12 MONTHS, THE "THEORY OF THE FIRM" WILL BE REWRITTEN. THE ARCHITECH IS HERE TO ENABLE THAT TRANSFORMATION.</p>
          </div>

          <div className="h-px bg-white/10 pt-12"></div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <Meta 
        title="THE JOURNAL | Strategic Intelligence"
        description="Daily dispatches from the bleeding edge of AI orchestration and enterprise strategy."
      />
      <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-32">
        <div className="space-y-6">
          <span className="text-red text-[10px] font-black tracking-[0.6em] uppercase uppercase border-l-2 border-red pl-4">Protocol: Editorial</span>
          <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.8]">The Journal</h1>
        </div>
        <p className="text-white/40 max-w-xs text-xs font-bold leading-relaxed uppercase">
          Daily dispatches from the bleeding edge.
          Proprietary Intelligence.
          Absolute Advantage.
        </p>
      </div>

      <div className="grid grid-cols-1 divide-y border-y border-white/5">
        {posts.map((post) => (
          <article 
            key={post.id} 
            className="group grid grid-cols-1 md:grid-cols-12 gap-12 py-16 hover:bg-white/5 transition-all cursor-pointer px-6"
            onClick={() => setActivePost(post)}
          >
            <div className="md:col-span-1 text-2xl font-black text-white/20 group-hover:text-red transition-colors">
               0{post.id}
            </div>
            <div className="md:col-span-8 space-y-6">
               <div className="flex items-center gap-6 text-[10px] font-black tracking-widest text-red uppercase">
                  <span>{post.category}</span>
                  <div className="w-1 h-px bg-red/40"></div>
                  <span>{post.level}</span>
               </div>
               <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{post.title}</h3>
               <p className="text-white/40 text-[10px] uppercase font-bold leading-relaxed max-w-2xl">{post.excerpt}</p>
            </div>
            <div className="md:col-span-3 flex flex-col justify-between items-end">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{post.date}</span>
               <div className="flex gap-4">
                 <button 
                  onClick={(e) => { e.stopPropagation(); handleSavePost(post); }}
                  className={`w-12 h-12 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all ${savedPosts.includes(post.id) ? 'bg-white text-black' : ''}`}
                 >
                   <svg className="w-5 h-5" fill={savedPosts.includes(post.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                   </svg>
                 </button>
                 <button 
                  disabled={audioLoading}
                  onClick={(e) => { e.stopPropagation(); handlePlayExcerpt(post.excerpt); }}
                  className={`w-12 h-12 border border-white/10 flex items-center justify-center hover:bg-red hover:text-black hover:border-red transition-all ${audioLoading ? 'animate-pulse' : ''}`}
                 >
                   {audioLoading ? (
                     <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                   ) : (
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                   )}
                 </button>
               </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;
