
import React, { useState } from 'react';
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType } from '../services/firebase';

const EmailSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    const path = 'newsletter';
    try {
      await addDoc(collection(db, path), {
        email: email.toLowerCase(),
        subscribedAt: serverTimestamp(),
        source: 'homepage_footer'
      });
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error("Newsletter sync failure:", error);
      setStatus('error');
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch (err) {
        console.error("Firestore sync detail log failure:", err);
      }
    }
  };

  return (
    <section className="px-6 py-24 bg-white border-y border-neutral-100">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <span className="text-[10px] font-black tracking-[0.5em] text-neutral-400 uppercase">Proprietary Insight Loop</span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Join the <span className="serif italic font-light">Intelligence</span> Dispatch.</h2>
          <p className="text-neutral-500 text-lg font-light max-w-xl mx-auto">Receive weekly high-reasoning orchestration notes and secret vault access codes directly from the Oracle.</p>
        </div>

        {status === 'success' ? (
          <div className="p-8 bg-neutral-50 rounded-[2rem] border border-neutral-100 animate-in zoom-in-95">
            <p className="text-sm font-black tracking-widest uppercase">Node Synchronized. Welcome to the Network.</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <input 
              type="email" 
              required
              placeholder="IDENTITY@PROTOCOL.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-8 py-5 rounded-2xl bg-neutral-50 border border-neutral-100 focus:border-black focus:outline-none transition-all text-xs font-black tracking-widest uppercase"
            />
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="px-12 py-5 bg-red text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-black transition-all shadow-xl disabled:opacity-50"
            >
              {status === 'loading' ? 'Syncing...' : 'Authorize'}
            </button>
          </form>
        )}
        {status === 'error' && <p className="text-[10px] text-red mt-4 uppercase font-black">Transmission Interrupted. Retry Protocol.</p>}
        <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest mt-8">End-to-End Encrypted Intelligence Transmission</p>
      </div>
    </section>
  );
};

export default EmailSignup;
