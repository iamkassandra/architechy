
import React, { useState } from 'react';
import OracleAgent from '../components/OracleAgent';
import { OrchestrationLog } from '../types';
import BrandIcon from '../components/BrandIcon';

const Hub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'oracle' | 'forge' | 'matrix'>('oracle');
  const [logs, setLogs] = useState<OrchestrationLog[]>(() => [
    { id: '1', timestamp: new Date().toLocaleTimeString(), action: 'NEXUS TERMINAL ONLINE', status: 'success', platform: 'SYSTEM' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), action: 'ENCRYPTED BRIDGE STABLE', status: 'success', platform: 'NETWORK' },
  ]);

  const tabs = [
    { id: 'oracle', label: 'THE_ORACLE', sub: 'Neural Interface' },
    { id: 'forge', label: 'THE_FORGE', sub: 'Deployment Node' },
    { id: 'matrix', label: 'THE_MATRIX', sub: 'System Pulse' }
  ];

  const addLog = (action: string, platform: string = 'System') => {
    const newLog: OrchestrationLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      action,
      status: 'processing',
      platform
    };
    setLogs(prev => [newLog, ...prev]);
    setTimeout(() => {
      setLogs(prev => prev.map(l => l.id === newLog.id ? {...l, status: 'success'} : l));
    }, 1500);
  };

  const _deployToBlog = async (data: { title: string, content: string }) => {
    try {
      addLog(`INITIATING_BLOG_DEPLOYMENT: ${data.title}`, 'SCRIBE');
      const response = await fetch('/api/blog/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const result = await response.json();
        addLog(`PUBLISHED: ${result.id}`, 'GLOBAL_NODE');
        return true;
      }
    } catch (err) {
      console.error("Blog deployment failure:", err);
      addLog('DEPLOYMENT_FAILURE', 'ERROR');
    }
    return false;
  };

  const _deployToVault = async (data: { name: string, fileUrl: string }) => {
    try {
      addLog(`INITIATING_VAULT_MINT: ${data.name}`, 'LIBRARIAN');
      const response = await fetch('/api/vault/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const result = await response.json();
        addLog(`ASSET_STAGED: ${result.id}`, 'VAULT_NODE');
        return true;
      }
    } catch (err) {
      console.error("Vault minting failure:", err);
      addLog('MINTING_FAILURE', 'ERROR');
    }
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Sidebar Controls */}
      <div className="lg:col-span-3 space-y-12">
        <div className="space-y-6">
          <BrandIcon className="w-16 h-16 animate-pulse" />
          <span className="text-red text-[10px] font-black tracking-[0.6em] uppercase border-l-2 border-red pl-4">Management Protocol</span>
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.8] mb-12">Orchestrator</h1>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'oracle' | 'forge' | 'matrix')}
              className={`w-full group text-left p-8 border hover:border-red transition-all ${
                activeTab === tab.id ? 'bg-red text-black border-red' : 'border-white/5 text-white/40'
              }`}
            >
              <p className="text-[10px] font-black tracking-[0.4em] mb-1">{tab.label}</p>
              <p className="text-[8px] opacity-60 font-mono italic">:: {tab.sub}</p>
            </button>
          ))}
        </nav>

        <div className="p-8 border border-white/5 space-y-8">
           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
              <span>Cloud_Resources</span>
              <span className="text-red">Online</span>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-end">
                 <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Compute_Load</span>
                 <span className="text-xs font-mono text-red">14%</span>
              </div>
              <div className="w-full h-px bg-white/5 overflow-hidden">
                 <div className="w-[14%] h-full bg-red shadow-[0_0_10px_var(--color-red)]"></div>
              </div>
           </div>
        </div>

        <button 
           onClick={() => window.location.hash = '#/'}
           className="w-full py-6 text-[10px] font-black tracking-[0.4em] uppercase border border-red/40 text-red hover:bg-red hover:text-black transition-all"
        >
          [ DISCONNECT_TERMINAL ]
        </button>
      </div>

      {/* Main Terminal Area */}
      <div className="lg:col-span-9 border border-white/5 shadow-2xl min-h-[800px] bg-white/1">
        {activeTab === 'oracle' && (
          <div className="h-full flex flex-col">
            <header className="p-12 border-b border-white/5 flex justify-between items-center">
               <h2 className="text-2xl font-black tracking-tighter uppercase">NEURAL_COMMAND_CENTER</h2>
               <div className="flex gap-4">
                  <div className="w-2 h-2 bg-red shadow-[0_0_10px_var(--color-red)]"></div>
                  <div className="w-2 h-2 bg-red shadow-[0_0_10px_var(--color-red)] opacity-40"></div>
                  <div className="w-2 h-2 bg-red shadow-[0_0_10px_var(--color-red)] opacity-10"></div>
               </div>
            </header>
            <div className="flex-1 overflow-hidden">
               <OracleAgent />
            </div>
          </div>
        )}

        {activeTab === 'forge' && (
          <div className="p-12 space-y-12">
            <header className="space-y-4">
               <h2 className="text-4xl font-black tracking-tighter uppercase">Deployment Forge</h2>
               <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Stage assets for vault or publication.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div 
                onClick={() => _deployToBlog({ title: 'NEW_INTELLIGENCE_REPORT', content: '...' })}
                className="p-12 border border-white/5 hover:border-red transition-all space-y-8 bg-white/2 cursor-pointer group"
               >
                  <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:bg-red group-hover:text-black transition-all">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-widest">Editorial Node</h3>
                  <p className="text-[10px] text-white/40 uppercase font-bold leading-relaxed">Publish to the architech journal.</p>
               </div>
               
               <div 
                onClick={() => _deployToVault({ name: 'NEW_ASSET', fileUrl: '...' })}
                className="p-12 border border-white/5 hover:border-red transition-all space-y-8 bg-white/2 cursor-pointer group"
               >
                  <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:bg-red group-hover:text-black transition-all">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-widest">Vault Node</h3>
                  <p className="text-[10px] text-white/40 uppercase font-bold leading-relaxed">Mint new digital assets to the shop.</p>
               </div>
            </div>

            <div className="py-24 border-t border-white/5 flex flex-col items-center justify-center text-center space-y-8 opacity-20">
               <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
               <p className="text-[10px] font-black tracking-widest uppercase">Select A Node To Initialize Deployment</p>
            </div>
          </div>
        )}

        {activeTab === 'matrix' && (
          <div className="p-12 space-y-12">
             <header className="flex justify-between items-center border-b border-white/5 pb-8">
                <h2 className="text-4xl font-black tracking-tighter uppercase">System Pulse</h2>
                <span className="text-[10px] font-mono text-red uppercase tracking-widest">[ REAL_TIME_SYNC ]</span>
             </header>
             
             <div className="space-y-6">
                {logs.map(log => (
                  <div key={log.id} className="grid grid-cols-12 gap-8 items-center border border-white/5 p-6 hover:bg-white/5 transition-all font-mono text-[10px]">
                     <div className="col-span-2 text-white/20">[{log.timestamp}]</div>
                     <div className="col-span-2 text-red uppercase tracking-widest">{log.platform}</div>
                     <div className="col-span-6 text-white uppercase">{log.action}</div>
                     <div className="col-span-2 text-right">
                        <span className="text-red opacity-40 uppercase">Synced</span>
                     </div>
                  </div>
                ))}
                
                {/* Simulated live logs */}
                <div className="grid grid-cols-12 gap-8 items-center border border-white/5 p-6 opacity-40 font-mono text-[10px]">
                   <div className="col-span-2">[{new Date().toLocaleTimeString()}]</div>
                   <div className="col-span-2">TRAFFIC</div>
                   <div className="col-span-6 italic uppercase">INBOUND_REQUEST // ASIA-EAST1_NODE</div>
                   <div className="col-span-2 text-right text-red animate-pulse">LIVE</div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hub;
