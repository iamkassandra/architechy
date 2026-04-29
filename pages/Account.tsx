
import React, { useEffect, useState } from 'react';
import { AppRoute } from '../types';
import BrandIcon from '../components/BrandIcon';
import Meta from '../components/Meta';
import { useAuth } from '../AuthContext';
import { db, collection, query, where, getDocs, deleteDoc, doc, handleFirestoreError, OperationType } from '../services/firebase';

interface SavedItem {
  id: string;
  resourceId: string;
  resourceTitle: string;
  resourceType: string;
  savedAt: unknown;
}

const Account: React.FC<{ navigate: (r: AppRoute) => void }> = ({ navigate }) => {
  const { user, loading, signIn, signOut } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchSaved = async () => {
        setItemsLoading(true);
        const path = 'reading_lists';
        try {
          const q = query(collection(db, path), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          setSavedItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, path);
        } finally {
          setItemsLoading(false);
        }
      };
      fetchSaved();
    }
  }, [user]);

  const removeSavedItem = async (itemId: string) => {
    const path = `reading_lists/${itemId}`;
    try {
      const d = doc(db, 'reading_lists', itemId);
      await deleteDoc(d);
      setSavedItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const insights = [
    { date: 'APR 16, 2026', text: 'MULTI-AGENT ORCHESTRATION NODES SEEING 40% EFFICIENCY GAINS IN LOW-LATENCY ENVS.' },
    { date: 'APR 12, 2026', text: 'STRATEGIC PIVOT DETECTED: SOVEREIGNTY OVER SUBSCRIPTION IS THE 2026 META.' },
    { date: 'APR 08, 2026', text: 'NEW PROMPT MATRIX REFINEMENT: SEMANTIC CLARITY > LENGTH.' },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
        <BrandIcon className="w-16 h-16 animate-pulse" />
        <span className="text-[10px] font-black text-red tracking-widest uppercase animate-pulse">Synchronizing Identity...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-[70vh] space-y-16">
        <div className="text-center space-y-8 max-w-2xl">
          <BrandIcon className="w-24 h-24 mx-auto mb-12 grayscale opacity-20" />
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-tight">Initialization <br /> Required</h1>
          <p className="text-white/40 font-bold text-sm uppercase leading-relaxed tracking-wide">
            Access to proprietary intelligence nodes and your secured asset vault requires identity verification.
          </p>
        </div>
        <button 
          onClick={() => signIn()}
          className="bg-white text-black px-16 py-6 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-red hover:text-white transition-all shadow-[0_20px_40px_-5px_rgba(255,255,255,0.1)] active:scale-95"
        >
          Initialize Account / Verify Identity
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <Meta 
        title="IDENTITY NODE | Access Authorized"
        description="Your secure portal for vault asset orchestration and intelligence history."
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-16 mb-32">
        <div className="flex items-center gap-10">
          <BrandIcon className="w-24 h-24 lg:w-32 lg:h-32" />
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-red text-[10px] font-black tracking-[0.6em] uppercase">Status: Terminal Active</span>
              <div className="w-2 h-2 bg-red animate-pulse"></div>
            </div>
            <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.8]">Identity <br /> Node</h1>
          </div>
        </div>
        <div className="text-left md:text-right space-y-4">
           <div className="flex items-center gap-4 justify-end">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Operator Node: {user.email?.split('@')[0]}</p>
              <img src={user.photoURL || ''} className="w-10 h-10 border border-white/10 grayscale hover:grayscale-0 transition-opacity" alt="" />
           </div>
           <button 
            onClick={() => signOut()} 
            className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-red transition-all block ml-auto"
           >
             [ PURGE_SESSION ]
           </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 border border-white/5 p-12 space-y-16">
          <div className="space-y-8">
            <h2 className="text-4xl font-black tracking-tighter uppercase">Secured Protocols</h2>
            <div className="h-px w-full bg-white/5"></div>
          </div>

          <div className="space-y-8 min-h-[300px]">
            {itemsLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-red border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : savedItems.length === 0 ? (
              <div className="py-24 text-center space-y-12">
                <p className="text-white/40 font-bold text-sm uppercase leading-relaxed max-w-sm mx-auto">
                  Your library node is currently empty. Assets and intelligence saved for review will be decrypted here.
                </p>
                <button 
                  onClick={() => navigate(AppRoute.SHOP)} 
                  className="bg-red text-black px-12 py-5 text-[10px] font-black tracking-widest uppercase hover:bg-white transition-all shadow-2xl"
                >
                  Access The Vault
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {savedItems.map((item) => (
                  <div key={item.id} className="p-8 border border-white/10 bg-white/5 space-y-6 group">
                     <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-red uppercase tracking-widest">{item.resourceType}</span>
                        <button 
                          onClick={() => removeSavedItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-white/20 hover:text-red transition-all uppercase font-black"
                        >
                          [ DELETE ]
                        </button>
                     </div>
                     <h3 className="text-xl font-black uppercase tracking-tighter leading-tight">{item.resourceTitle}</h3>
                     <button 
                        onClick={() => navigate(item.resourceType === 'article' ? AppRoute.BLOG : AppRoute.SHOP)}
                        className="w-full bg-white/5 border border-white/10 text-white/40 py-3 text-[10px] font-black uppercase hover:bg-red hover:text-black hover:border-red transition-all"
                     >
                       Access Source Node
                     </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
          <div className="p-12 border border-white/5 bg-white text-black space-y-12">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-widest">Neural Feed</h3>
                <div className="w-2 h-2 bg-black animate-ping"></div>
             </div>
             <div className="space-y-8">
                {insights.map((insight, idx) => (
                  <div key={idx} className="space-y-2 pb-6 border-b border-black/10 last:border-0 last:pb-0">
                    <p className="text-[8px] font-black text-black/40 uppercase">{insight.date}</p>
                    <p className="text-xs font-bold leading-relaxed uppercase">{insight.text}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="p-12 border border-white/5 space-y-8">
             <h3 className="text-xl font-black uppercase tracking-widest">System_Log</h3>
             <div className="space-y-4 font-mono text-[10px] opacity-40">
                <p>[PING] // CLOUD_INSTANCE_STABLE</p>
                <p>[FIRESTORE] // SYNC_COMPLETE</p>
                <p>[AGENTS] // 3_ACTIVE_NODES</p>
                <p>[IDENTITY] // DECRYPTED</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
