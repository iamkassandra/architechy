
import React, { useState, useEffect } from 'react';
import { AppRoute, DigitalProduct } from '../types';
import { useAuth } from '../AuthContext';

type PaymentStatus = 'idle' | 'verifying' | 'authorizing' | 'securing' | 'success' | 'failed';

const Checkout: React.FC<{ navigate: (route: AppRoute) => void }> = ({ navigate }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(user?.email || '');
  const [product, setProduct] = useState<DigitalProduct | null>(null);

  useEffect(() => {
    if (user?.email && !email) {
       setTimeout(() => setEmail(user.email || ''), 0);
    }
  }, [user, email]);

  useEffect(() => {
    const cartItem = localStorage.getItem('ARCHITECH_CHECKOUT_ITEM');
    if (cartItem) {
      setTimeout(() => setProduct(JSON.parse(cartItem)), 0);
    } else {
      navigate(AppRoute.SHOP); // Redirect if no item selected
    }
  }, [navigate]);

  const handlePay = async () => {
    if (!email) {
      setError("Identity node synchronization requires a valid email.");
      return;
    }
    if (!product) return;

    setStatus('verifying');
    
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          email,
          userId: user?.uid
        })
      });

      const session = await response.json();
      
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error("Financial orchestration failure");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Checkout failure:", error);
      setStatus('failed');
      setError(error.message || "Financial orchestration synchronization failed.");
    }
  };

  if (!product) return null;

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-6 py-24 page-transition">
      <div className="max-w-5xl w-full bg-white rounded-[4rem] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.1)] overflow-hidden border border-neutral-100">
        <div className="flex flex-col lg:flex-row">
          {/* Order Summary Sidebar */}
          <div className="lg:w-[40%] bg-neutral-50 p-16 space-y-12">
             <div className="space-y-4">
                <span className="text-[10px] font-black tracking-[0.4em] text-neutral-400 uppercase">Acquisition Protocol</span>
                <h2 className="text-4xl font-black tracking-tighter uppercase">Review<span className="serif italic text-neutral-300">.</span></h2>
             </div>
             
             <div className="space-y-10">
                <div className="flex gap-6 items-start">
                   <img src={product.image} className="w-20 h-24 object-cover rounded-2xl shadow-md" alt="" />
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Asset</p>
                      <p className="font-black text-xl leading-tight uppercase">{product.name}</p>
                   </div>
                </div>

                <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Vault Identity Sync</p>
                   </div>
                   <p className="text-[11px] text-blue-800 font-medium leading-relaxed uppercase tracking-tight">Linking this asset to your profile allows lifetime orchestration and version updates.</p>
                </div>
             </div>

             <div className="pt-12 border-t border-neutral-200">
                <div className="flex justify-between items-center mb-6 text-sm font-medium">
                   <span className="text-neutral-500">Protocol Fee</span>
                   <span className="font-mono">${product.price}.00</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-3xl font-black tracking-tighter">Total</span>
                   <span className="text-3xl font-black tracking-tighter font-mono text-black">${product.price}.00</span>
                </div>
             </div>
          </div>

          {/* Payment Form */}
          <div className="lg:w-[60%] p-16 space-y-16 bg-white relative">
             {/* Dynamic Status Overlays */}
             {(status !== 'idle' && status !== 'failed') && (
                <div className="absolute inset-0 bg-white/98 z-20 flex flex-col items-center justify-center space-y-12 p-16 text-center animate-in fade-in duration-700">
                   <div className="relative">
                      <div className="w-32 h-32 border border-neutral-100 rounded-full"></div>
                      <div className="absolute inset-0 border-t-2 border-blue-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-4 border border-neutral-50 rounded-full animate-pulse"></div>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-4xl font-black tracking-tighter uppercase">{status.toUpperCase()} NODE...</h3>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse">Secure Intelligence Transmission Active</p>
                   </div>
                </div>
             )}

             <div className="space-y-12">
                <div className="space-y-16">
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">1. Synchronize Identity [Email]</label>
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Verified Node</span>
                      </div>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="IDENTITY@ARCHITECH.COM" 
                        className="w-full px-0 py-6 border-b border-neutral-100 focus:border-black focus:outline-none transition-all text-3xl font-black tracking-tighter placeholder:text-neutral-100 uppercase" 
                      />
                      {error && <p className="text-[10px] font-black text-red uppercase tracking-widest">{error}</p>}
                   </div>
                   <div className="space-y-8 p-12 border border-neutral-100 rounded-[3rem] bg-neutral-50/50">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">2. Authorize Transfer [Stripe Protocol]</label>
                      <div className="space-y-6">
                         <p className="text-sm font-bold text-neutral-500 leading-relaxed uppercase">You will be redirected to the secure Stripe merchant node to finalize your asset acquisition.</p>
                         <div className="flex gap-4">
                            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-neutral-100">
                               <span className="text-[10px] font-black tracking-widest uppercase">Stripe</span>
                            </div>
                            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-neutral-100">
                               <span className="text-[10px] font-black tracking-widest uppercase">Secured</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="pt-8">
               <button 
                  disabled={status !== 'idle'}
                  onClick={handlePay}
                  className={`group relative w-full bg-black text-white py-10 rounded-[2.5rem] font-black text-[12px] tracking-[0.5em] uppercase transition-all flex items-center justify-center gap-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 overflow-hidden`}
               >
                  <span className="relative z-10">Finalize Acquisition</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <svg className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </button>
             </div>
             
             <div className="flex flex-col items-center gap-4">
               <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-[0.3em] leading-relaxed">
                 End-to-End PGP Encryption Active // Architech Proprietary Secure Link
               </p>
               <div className="flex gap-6 opacity-30 grayscale">
                  <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
