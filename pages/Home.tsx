
import React from 'react';
import { AppRoute } from '../types';
import { motion } from 'framer-motion';
import BrandIcon from '../components/BrandIcon';
import Meta from '../components/Meta';

const Home: React.FC<{ navigate: (route: AppRoute) => void }> = ({ navigate }) => {
  const products = [
    { id: "01", title: "THE SINGULARITY PROTOCOL", cat: "SYSTEMS", price: 49 },
    { id: "02", title: "NON-LINEAR COMMERCE", cat: "BUSINESS", price: 89 },
    { id: "03", title: "ORCHESTRATING AGENTS", cat: "DEV OPS", price: 129 },
  ];

  const marqueeText = "THE ARCHITECH // INTELLIGENCE ORCHESTRATION // AUTONOMOUS AGENT FLEET // THE ARCHITECH // INTELLIGENCE ORCHESTRATION // AUTONOMOUS AGENT FLEET // ";

  return (
    <div className="pb-24">
      <Meta 
        title="THE ARCHITECH | Intelligence Orchestration"
        description="The elite authority on enterprise AI orchestration and digital asset deployment."
      />
      {/* Hero Section */}
      <section className="px-6 pt-32 pb-48 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12 flex items-center gap-6"
          >
            <BrandIcon className="w-16 h-16 md:w-24 md:h-24 hover:rotate-12 transition-transform duration-700" />
            <span className="text-[10px] font-black text-red tracking-[0.6em] border-l-2 border-red pl-4 uppercase">
              STATUS: OPERATIONAL // V4.0.0
            </span>
          </motion.div>

          <h1 className="text-[12vw] md:text-[15rem] font-black tracking-tighter leading-[0.75] uppercase mb-12">
            DESIGNING <br />
            <span className="text-white/20">ADVANTAGE.</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
            <p className="text-xl md:text-2xl text-white/50 max-w-xl leading-snug">
              WE ARCHITECT INTELLIGENCE PROTOCOLS FOR THOSE BUILDING AT THE ABSOLUTE FRONTIER OF BUSINESS AND ENGINEERING.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={() => navigate(AppRoute.SHOP)}
                className="bg-red text-black px-12 py-5 text-sm font-black tracking-widest uppercase hover:bg-white transition-colors"
              >
                Enter The Vault
              </button>
              <button 
                onClick={() => navigate(AppRoute.BLOG)}
                className="border border-white/20 px-12 py-5 text-sm font-black tracking-widest uppercase hover:bg-white/10 transition-colors"
              >
                Engineering Journal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee">
        <div className="marquee-content text-[15vh] font-black opacity-5 select-none italic">
          {marqueeText}{marqueeText}
        </div>
      </div>

      {/* Featured Products / Grid */}
      <section className="px-6 py-48 grid grid-cols-1 md:grid-cols-3 border-y border-white/5">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="group p-12 border-r border-white/5 last:border-r-0 hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => navigate(AppRoute.SHOP)}
          >
            <span className="text-6xl font-black text-white/10 group-hover:text-red/20 transition-colors absolute top-12 right-12">
              {product.id}
            </span>
            <div className="space-y-8 relative z-10">
              <span className="text-[10px] text-red font-bold tracking-widest">{product.cat}</span>
              <h3 className="text-4xl font-black tracking-tighter leading-none uppercase">{product.title}</h3>
              <div className="pt-12 flex justify-between items-center">
                <span className="text-2xl font-light">${product.price}</span>
                <span className="text-[10px] font-black border border-white/20 px-4 py-2 hover:bg-white hover:text-black uppercase">Initialize Access</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Philosophy Section */}
      <section className="px-6 py-64 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <span className="text-[10px] font-black tracking-[0.6em] mb-12 block uppercase">AESTHETIC_INTEL</span>
          <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85] mb-24">
            TO ARCHITECH <br />
            IS TO <span className="italic">FORESEE.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <span className="text-2xl font-black">01</span>
              <p className="text-sm uppercase font-bold text-black/60">AUTONOMOUS_OPERATIONS</p>
            </div>
            <div className="space-y-4">
              <span className="text-2xl font-black">02</span>
              <p className="text-sm uppercase font-bold text-black/60">SYSTEMS_INTEGRITY</p>
            </div>
            <div className="space-y-4">
              <span className="text-2xl font-black">03</span>
              <p className="text-sm uppercase font-bold text-black/60">ABSOLUTE_CONTROL</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Log Segment */}
      <section className="px-6 py-48 border-t border-white/10">
        <div className="max-w-3xl mx-auto space-y-8 font-mono text-[10px] leading-relaxed opacity-40">
           <p>[SYSTEM_INIT] // BOOTING ARCHITECH v4.0.0...</p>
           <p>[DATABASE] // CONNECTED TO FIRESTORE INSTANCE: {process.env.VITE_FIREBASE_PROJECT_ID || 'PENDING'}</p>
           <p>[AGENTS] // MERCHANT.SCRIBE.LIBRIARIAN STATUS: ACTIVE</p>
           <p>[ENCRYPTION] // 256-BIT RSA OVERRIDES ENABLED</p>
           <p>[READY] // AWAITING OPERATOR INPUT</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
