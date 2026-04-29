
import React, { useState } from 'react';
import { AppRoute } from '../types';
import BrandIcon from './BrandIcon';

interface NavbarProps {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  onToggleBot: () => void;
  isBotOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate, onToggleBot, isBotOpen }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'JOURNAL', route: AppRoute.BLOG },
    { label: 'VAULT', route: AppRoute.SHOP },
    { label: 'IDENTITY', route: AppRoute.ACCOUNT },
    { label: 'ORCHESTRATOR', route: AppRoute.HUB },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-black/80 neo-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-20 items-center">
          {/* Brand */}
          <div className="flex-shrink-0 cursor-pointer group flex items-center gap-3" onClick={() => navigate(AppRoute.HOME)}>
            <BrandIcon className="w-10 h-10 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-lg font-black tracking-[0.2em] text-white">THE ARCHITECH</span>
          </div>
          
          {/* Internal Navigation */}
          <div className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                className={`text-[10px] font-black tracking-widest transition-all hover:text-red ${
                  currentRoute === item.route ? 'text-red' : 'text-white/40'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
             <button 
                onClick={onToggleBot}
                className={`flex items-center gap-2 px-4 py-2 border ${isBotOpen ? 'bg-red text-black border-red' : 'border-white/10 text-white/40 hover:text-white hover:border-white/40 transition-all'}`}
             >
                <div className={`w-2 h-2 rounded-full ${isBotOpen ? 'bg-black animate-pulse' : 'bg-red'}`}></div>
                <span className="text-[10px] font-black tracking-widest uppercase">Consult Agent</span>
             </button>

             <button 
                onClick={() => navigate(AppRoute.SHOP)}
                className="hidden md:block bg-white text-black px-6 py-2 text-[10px] font-black tracking-widest hover:bg-red transition-all uppercase"
             >
                Access Vault
             </button>

             <div className="lg:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 border border-white/10 hover:border-red transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-black border-b border-white/10 p-8 space-y-6 animate-in slide-in-from-top-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { navigate(item.route); setIsOpen(false); }}
              className={`block w-full text-left text-2xl font-black tracking-tighter uppercase ${currentRoute === item.route ? 'text-red' : 'text-white/40'}`}
            >
              {item.label}
            </button>
          ))}
          <button 
            onClick={() => { navigate(AppRoute.SHOP); setIsOpen(false); }}
            className="w-full bg-red text-black py-4 font-black tracking-widest uppercase text-[10px]"
          >
            Access Vault
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
