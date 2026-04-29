
import React, { useState, useEffect } from 'react';
import { AppRoute, DigitalProduct } from '../types';
import { PRODUCTS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import BrandIcon from '../components/BrandIcon';
import Meta from '../components/Meta';
import { useAuth } from '../AuthContext';
import { db, collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, handleFirestoreError, OperationType } from '../services/firebase';

const Shop: React.FC<{ navigate: (route: AppRoute) => void }> = ({ navigate }) => {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<DigitalProduct | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const fetchWishlist = async () => {
        const path = 'reading_lists';
        try {
          const q = query(collection(db, path), where('userId', '==', user.uid), where('resourceType', '==', 'product'));
          const snapshot = await getDocs(q);
          setWishlist(snapshot.docs.map(doc => doc.data().resourceId));
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, path);
        }
      };
      fetchWishlist();
    }
  }, [user]);

  const handleToggleWishlist = async (product: DigitalProduct) => {
    if (!user) return alert("Identity verification required.");
    
    if (wishlist.includes(product.id)) {
      const path = 'reading_lists';
      try {
        const q = query(collection(db, path), where('userId', '==', user.uid), where('resourceId', '==', product.id));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (d) => {
          try {
            await deleteDoc(d.ref);
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `${path}/${d.id}`);
          }
        });
        setWishlist(prev => prev.filter(id => id !== product.id));
      } catch (err) { 
        handleFirestoreError(err, OperationType.LIST, path);
      }
    } else {
      const path = 'reading_lists';
      try {
        await addDoc(collection(db, path), {
          userId: user.uid,
          resourceId: product.id,
          resourceType: 'product',
          resourceTitle: product.name,
          savedAt: serverTimestamp()
        });
        setWishlist(prev => [...prev, product.id]);
      } catch (err) { 
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  const handleAcquire = async () => {
    if (!email) return alert("Identification required.");
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct?.id, email })
      });
      const data = await response.json();
      
      // Simulate redirection to "Success" or wait for webhook
      // For this high-fidelity flow, we show the "Accessing" state
      setTimeout(() => {
        localStorage.setItem('ARCHITECH_ORDER_ID', data.orderId);
        navigate(AppRoute.SUCCESS);
      }, 2000);
    } catch (error) {
       console.error(error);
       setIsProcessing(false);
    }
  };

  return (
    <div className="pb-24 pt-12">
      <Meta 
        title="THE VAULT | Enterprise Asset Node"
        description="Exclusive digital assets and systems for the next generation of AI-driven business."
      />
      <div className="px-6 mb-24 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
        <div className="space-y-6">
          <span className="text-red text-[10px] font-black tracking-[0.6em] uppercase">Security Level: Clear</span>
          <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.8]">The Vault</h1>
        </div>
        <p className="text-white/40 max-w-xs text-xs font-bold leading-relaxed uppercase">
          Precision-engineered digital assets. 
          No redirects. 
          Immediate fulfillment.
        </p>
      </div>

      <div className="border-y border-white/5 divide-y md:divide-y-0 md:divide-x border-white/5 grid grid-cols-1 md:grid-cols-3">
        {PRODUCTS.map((product) => (
          <div 
            key={product.id} 
            className="p-12 hover:bg-white/5 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-8">
               <div className="aspect-square bg-white/5 overflow-hidden border border-white/5 group-hover:border-red/20 transition-colors">
                  <img src={product.image} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt={product.name} />
               </div>
               <div className="flex justify-between items-baseline">
                  <h3 className="text-3xl font-black tracking-tighter uppercase">{product.name}</h3>
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleToggleWishlist(product)}
                        className={`text-[10px] uppercase font-black tracking-widest ${wishlist.includes(product.id) ? 'text-red' : 'text-white/20 hover:text-white'} transition-colors`}
                      >
                         {wishlist.includes(product.id) ? '[ QUEUED ]' : '[ QUEUE ]'}
                      </button>
                      <span className="text-red font-bold text-sm">${product.price}</span>
                   </div>
               </div>
               <p className="text-white/40 text-[10px] uppercase font-bold leading-relaxed">{product.description}</p>
            </div>
            <button 
              onClick={() => setSelectedProduct(product)}
              className="mt-12 w-full border border-white/20 py-4 hover:bg-red hover:text-black hover:border-red transition-all uppercase font-black tracking-widest text-[10px]"
            >
              Acquire Protocol
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-md border border-white/10 p-12 space-y-8 relative">
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="absolute top-6 right-6 text-white/40 hover:text-white"
              >
                [ESC]
              </button>

              <div className="flex items-center gap-6 mb-8">
                 <BrandIcon className="w-12 h-12" />
                 <div className="space-y-1">
                   <span className="text-[10px] text-red font-black tracking-widest uppercase">ID_VERIFICATION</span>
                   <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Initialize</h2>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-white/40">Identification Node (Email)</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 py-3 outline-none focus:border-red transition-colors text-sm"
                    placeholder="OPERATOR@ARCHITECH.COM"
                  />
                </div>

                <div className="bg-white/5 p-6 space-y-4 border border-white/5">
                  <div className="flex justify-between text-[10px] uppercase font-bold">
                    <span className="text-white/40 line-clamp-1">{selectedProduct.name}</span>
                    <span>${selectedProduct.price}</span>
                  </div>
                  <div className="h-px bg-white/5"></div>
                  <div className="flex justify-between text-xs font-black uppercase">
                    <span className="text-red">Total</span>
                    <span>${selectedProduct.price}.00</span>
                  </div>
                </div>

                <button 
                  disabled={isProcessing}
                  onClick={handleAcquire}
                  className="w-full bg-red text-black py-4 font-black tracking-[0.2em] uppercase hover:bg-white transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "ENCRYPTING_TRANSACTION..." : "Initialize Order"}
                </button>
                
                <p className="text-[8px] text-center text-white/20 uppercase font-black">
                  Secure wise bridge initialized // No external redirects
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
