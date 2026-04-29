
import React, { useState, useEffect } from 'react';
import { AppRoute } from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Shop from './pages/Shop';
import Hub from './pages/Hub';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Account from './pages/Account';
import Admin from './pages/Admin';
import ArchitechBot from './components/ArchitechBot';
import EmailSignup from './components/EmailSignup';
import { motion, AnimatePresence } from 'framer-motion';
import BrandIcon from './components/BrandIcon';
import { AuthProvider } from './AuthContext';

const STATIC_HASHES = [
  { h1: 'X79_KJ2', h2: '88_PRT_0' },
  { h1: '99_AX_V', h2: 'KL_92_Z' },
  { h1: 'BQ_71_M', h2: 'NM_10_X' },
  { h1: 'YI_88_Q', h2: 'PL_09_W' }
];

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AppRoute;
      if (Object.values(AppRoute).includes(hash)) {
        setIsDecrypting(true);
        setTimeout(() => {
          setCurrentRoute(hash);
          setIsDecrypting(false);
        }, 800);
      } else if (!hash) {
        setCurrentRoute(AppRoute.HOME);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: AppRoute) => {
    window.location.hash = route;
  };

  const renderPage = () => {
    switch (currentRoute) {
      case AppRoute.HOME: return <Home navigate={navigate} />;
      case AppRoute.BLOG: return <Blog />;
      case AppRoute.SHOP: return <Shop navigate={navigate} />;
      case AppRoute.HUB: return <Hub />;
      case AppRoute.CHECKOUT: return <Checkout navigate={navigate} />;
      case AppRoute.SUCCESS: return <Success navigate={navigate} />;
      case AppRoute.ACCOUNT: return <Account navigate={navigate} />;
      case AppRoute.ADMIN: return <Admin navigate={navigate} />;
      default: return <Home navigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-black text-white font-mono selection:bg-red selection:text-white overflow-x-hidden brutal-grid">
      <Navbar 
        currentRoute={currentRoute} 
        navigate={navigate} 
        onToggleBot={() => setIsBotOpen(!isBotOpen)} 
        isBotOpen={isBotOpen}
      />
      
      <main className="flex-grow pt-24 relative">
        <AnimatePresence mode="wait">
          {isDecrypting ? (
            <motion.div 
              key="decrypting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6"
            >
              <div className="w-full max-w-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] text-red animate-pulse">DECRYPTING_PROTOCOL_X...</span>
                  <span className="text-[10px] text-red">HASH_v4.2</span>
                </div>
                <div className="h-0.5 bg-white/10 w-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="h-full bg-red"
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {STATIC_HASHES.map((h, i) => (
                    <div key={i} className="text-[8px] text-white/20 uppercase">
                      {h.h1} :: {h.h2}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentRoute}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderPage()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {currentRoute === AppRoute.HOME && <EmailSignup />}

      <ArchitechBot isOpen={isBotOpen} onClose={() => setIsBotOpen(false)} />

      <footer className="bg-black border-t border-white/10 py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <BrandIcon className="w-12 h-12" />
              <h2 className="text-4xl font-black tracking-tighter italic">THE ARCHITECH<span className="text-red text-lg not-italic ml-2">v4.0</span></h2>
            </div>
            <p className="text-white/40 text-sm max-w-sm leading-relaxed">
              AUTONOMOUS INTELLIGENCE ORCHESTRATION. 
              PRODUCTION-GRADE ASSET DEPLOYMENT.
              NO REDIRECTS. NO FRICTION.
            </p>
          </div>
          
          <div className="space-y-6">
            <span className="block text-[10px] font-black text-red tracking-widest uppercase">Nodes</span>
            <div className="flex flex-col space-y-3">
              <button onClick={() => navigate(AppRoute.HOME)} className="text-xs hover:text-red transition-colors text-left uppercase font-bold">Base</button>
              <button onClick={() => navigate(AppRoute.BLOG)} className="text-xs hover:text-red transition-colors text-left uppercase font-bold">Archives</button>
              <button onClick={() => navigate(AppRoute.SHOP)} className="text-xs hover:text-red transition-colors text-left uppercase font-bold">Vault</button>
            </div>
          </div>

          <div className="space-y-6">
            <span className="block text-[10px] font-black text-red tracking-widest uppercase">System</span>
            <div className="flex flex-col space-y-3">
              <button onClick={() => navigate(AppRoute.ACCOUNT)} className="text-xs hover:text-red transition-colors text-left uppercase font-bold">Identity Node</button>
              <button onClick={() => navigate(AppRoute.HUB)} className="text-xs hover:text-red transition-colors text-left uppercase font-bold">Orchestrator</button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-bold text-white/20 tracking-widest uppercase">
          <span>&copy; {new Date().getFullYear()} ARCHITECH_SYSTEMS.ALL_RIGHTS_RESERVED.</span>
          <span className="text-red/40">LATENCY: 12ms // STATUS: OPERATIONAL</span>
        </div>
      </footer>
    </div>
    </AuthProvider>
  );
};

export default App;
