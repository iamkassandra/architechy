import React, { useState, useEffect } from 'react';
import { AppRoute } from '../types';
import BrandIcon from '../components/BrandIcon';
import { useAuth } from '../AuthContext';
import { db, collection, query, orderBy, getDocs, addDoc, serverTimestamp, updateDoc, doc, onSnapshot, where } from '../services/firebase';

interface AdminLog {
  id: string;
  timestamp: unknown;
  command: string;
  response?: string;
  status: string;
}

interface AdminReport {
  id: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  generatedAt: unknown;
  blogVersion?: boolean;
  socialAssets?: boolean;
}

const Admin: React.FC<{ navigate: (r: AppRoute) => void }> = ({ navigate }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'agent' | 'reports' | 'system' | 'readiness'>('agent');
  const [diagnostics, setDiagnostics] = useState<unknown>(null);
  const [readiness, setReadiness] = useState<{ id: string, label: string, status: string, description: string }[]>([
    { id: 'env-keys', label: 'STRIPE_SECRET_KEY Synchronization', status: 'pending', description: 'Stripe API keys must be set in the platform secrets menu.' },
    { id: 'webhook-sec', label: 'STRIPE_WEBHOOK_SECRET Handshake', status: 'pending', description: 'Webhook secret must be synced for secure transaction fulfillment.' },
    { id: 'gemini-key', label: 'GEMINI_API_KEY Intelligence Link', status: 'pending', description: 'AI core requires key synchronization for autonomous orchestration.' },
    { id: 'storage-bucket', label: 'VITE_STORAGE_BUCKET Configuration', status: 'pending', description: 'Storage node must be targeted for digital asset distribution.' },
    { id: 'admin-access', label: 'Identity Provisioning (admins)', status: 'pending', description: 'Auckland Assistant UID must be present in the admins collection.' },
    { id: 'product-assets', label: 'Asset Master Uploads', status: 'pending', description: 'Vault products require their associated master files in GCS.' },
    { id: 'webhook-url', label: 'Public Webhook Endpoint Registry', status: 'pending', description: 'Register the production app URL in the Stripe dashboard.' },
    { id: 'seo-meta', label: 'Metadata & Social OpenGraph Hardening', status: 'pending', description: 'Finalize brand visibility metadata in config.' }
  ]);

  // Fetch Diagnostics
  useEffect(() => {
    if (activeTab === 'system' && isAdmin) {
      fetch('/api/admin/diagnostics')
        .then(res => res.json())
        .then(data => {
            setDiagnostics(data);
            // Update readiness based on real diagnostics
            setReadiness(prev => prev.map(task => {
                if (task.id === 'env-keys') return { ...task, status: data.stripe ? 'ready' : 'pending' };
                if (task.id === 'webhook-sec') return { ...task, status: data.stripeWebhook ? 'ready' : 'pending' };
                if (task.id === 'gemini-key') return { ...task, status: data.gemini ? 'ready' : 'pending' };
                return task;
            }));
        })
        .catch(err => console.error("Diagnostics failure:", err));
    }
  }, [activeTab, isAdmin]);

  // Verify Admin Status
  useEffect(() => {
    if (!user) {
      setTimeout(() => setIsAdmin(false), 0);
      return;
    }

    const checkAdmin = async () => {
      try {
        const adminQuery = query(collection(db, 'admins'), where('__name__', '==', user.uid));
        const adminSnap = await getDocs(adminQuery);
        if (adminSnap.empty) {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Admin verification node failure:", err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  // Listen for Reports & Logs
  useEffect(() => {
    if (!isAdmin) return;

    const unsubReports = onSnapshot(query(collection(db, 'agent_reports'), orderBy('generatedAt', 'desc')), (snap) => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubLogs = onSnapshot(query(collection(db, 'admin_commands'), orderBy('timestamp', 'desc')), (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubReports();
      unsubLogs();
    };
  }, [isAdmin]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isExecuting) return;

    setIsExecuting(true);
    const cmd = command;
    setCommand('');

    try {
        const res = await fetch('/api/admin/agent/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: cmd, userId: user?.uid })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
    } catch (err) {
        console.error("Command execution failure:", err);
    } finally {
        setIsExecuting(false);
    }
  };

  const publishReport = async (reportId: string) => {
    try {
        const report = reports.find(r => r.id === reportId);
        if (!report) return;

        // Add to Blog
        await addDoc(collection(db, 'blog'), {
            title: report.title,
            excerpt: report.summary,
            content: report.content,
            category: 'STRATEGIC_INTEL',
            level: 'ALPHA',
            author: 'ARCHITECH_AGENT',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase(),
            createdAt: serverTimestamp()
        });

        // Update Report Status
        await updateDoc(doc(db, 'agent_reports', reportId), {
            status: 'published'
        });
    } catch (err) {
        console.error("Publication failure:", err);
    }
  };

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8">
        <BrandIcon className="w-24 h-24 text-red opacity-10 animate-pulse" />
        <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-pre-wrap">Access Denied{"\n"}Protocol: Blacklist</h1>
        <button 
          onClick={() => navigate(AppRoute.HOME)}
          className="px-8 py-4 border border-red text-red text-xs font-black tracking-widest uppercase hover:bg-red hover:text-white transition-all"
        >
          Return to Base Node
        </button>
      </div>
    );
  }

  if (isAdmin === null) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-32">
        <div className="space-y-6">
          <span className="text-red text-[10px] font-black tracking-[0.6em] uppercase border-l-2 border-red pl-4">Security Level: Overlord</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">Admin_Control</h1>
        </div>
        <div className="flex gap-4">
          {['agent', 'reports', 'system', 'readiness'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as 'agent' | 'reports' | 'system' | 'readiness')}
              className={`px-6 py-3 text-[10px] font-black tracking-widest uppercase transition-all border ${activeTab === tab ? 'bg-red border-red text-white' : 'border-white/10 text-white/40 hover:border-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Panel: Active Command */}
        <div className="lg:col-span-2 space-y-12">
          {activeTab === 'agent' && (
            <section className="space-y-8">
              <div className="p-8 bg-neutral-900 border border-white/5 rounded-[2rem] space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-white/60">Management Agent: ONLINE</span>
                </div>
                
                <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  {logs.length === 0 ? (
                    <div className="py-24 text-center">
                      <p className="text-xs text-white/20 uppercase font-bold italic tracking-widest">Awaiting Strategic Commands...</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="space-y-4 border-l border-white/10 pl-6 py-4">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] text-white/40 font-bold uppercase">{new Date(log.timestamp?.toDate()).toLocaleTimeString()}</span>
                          <span className="text-[9px] text-red font-black uppercase tracking-widest">COMMAND::{log.id.substring(0,6)}</span>
                        </div>
                        <p className="text-sm font-black text-white/80 uppercase italic leading-relaxed">{log.command}</p>
                        {log.response && (
                          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-xs text-white/60 leading-relaxed font-bold">{log.response}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleCommand} className="relative pt-8 border-t border-white/5">
                  <input 
                    type="text" 
                    placeholder="Enter Strategic Command (e.g. 'Research AI news and draft a report')"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-2xl p-6 text-xs font-bold focus:outline-none focus:border-red transition-all uppercase tracking-widest"
                  />
                  <button 
                    disabled={isExecuting}
                    className="absolute right-4 top-[4.5rem] px-8 py-3 bg-red text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-black transition-all disabled:opacity-50"
                  >
                    {isExecuting ? 'Executing...' : 'Transmit'}
                  </button>
                </form>
              </div>
            </section>
          )}

          {activeTab === 'reports' && (
            <section className="space-y-8">
              {reports.length === 0 ? (
                <div className="py-48 text-center border border-dashed border-white/10 rounded-[3rem]">
                  <p className="text-xs text-white/20 uppercase font-black tracking-widest">No Strategic Intelligence Found</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {reports.map((report) => (
                    <div key={report.id} className="p-8 bg-neutral-900 border border-white/10 rounded-[3rem] space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <span className="text-[10px] text-red font-black tracking-[0.2em] uppercase">Intelligence Draft</span>
                          <h3 className="text-2xl font-black uppercase leading-none">{report.title}</h3>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-[8px] font-black tracking-widest uppercase ${report.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 font-bold leading-relaxed">{report.summary}</p>
                      
                      {report.blogVersion || report.socialAssets ? (
                        <div className="space-y-4">
                           <div className="flex gap-2">
                              {['Strategic', 'Blog', 'Social'].map(sub => (
                                <button key={sub} className="px-4 py-1 text-[8px] font-black uppercase tracking-widest border border-white/10 rounded-full hover:bg-white/5 transition-all text-white/40 hover:text-white">
                                  {sub}
                                </button>
                              ))}
                           </div>
                           <div className="max-h-60 overflow-y-auto text-xs text-white/60 leading-relaxed font-bold bg-black/50 p-6 rounded-2xl border border-white/5">
                             {report.content}
                           </div>
                        </div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto text-xs text-white/60 leading-relaxed font-bold bg-black/50 p-6 rounded-2xl border border-white/5">
                          {report.content}
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button 
                          onClick={() => publishReport(report.id)}
                          disabled={report.status === 'published'}
                          className="flex-1 py-4 bg-red text-white text-[10px] font-black tracking-widest uppercase hover:bg-black transition-all disabled:opacity-50 disabled:bg-neutral-800"
                        >
                          {report.status === 'published' ? 'Published' : 'Approve & Release'}
                        </button>
                        <button className="px-8 border border-white/10 text-white/40 text-[10px] font-black tracking-widest uppercase hover:text-white hover:border-white transition-all">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'system' && (
             <section className="p-12 border border-white/10 rounded-[4rem] space-y-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: 'Uptime', val: '99.98%' },
                    { label: 'Load', val: '12.4%' },
                    { label: 'Latency', val: '14ms' },
                    { label: 'Active Tasks', val: '43' }
                  ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                      <span className="text-[9px] text-white/20 font-black tracking-widest uppercase">{stat.label}</span>
                      <p className="text-2xl font-black">{stat.val}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-8">
                  <h3 className="text-sm font-black tracking-widest uppercase text-red">External Integrations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { name: 'Stripe API', status: diagnostics?.stripe },
                      { name: 'Stripe Webhook', status: diagnostics?.stripeWebhook },
                      { name: 'Gemini Engine', status: diagnostics?.gemini }
                    ].map((svc, i) => (
                      <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">{svc.name}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${svc.status ? 'bg-green-500' : 'bg-red animate-pulse'}`} />
                          <span className={`text-[8px] font-black uppercase tracking-widest ${svc.status ? 'text-green-500' : 'text-red'}`}>
                            {svc.status ? 'Synced' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-black tracking-widest uppercase text-red">Scaling Protocols</h3>
                  <div className="grid gap-4">
                    <button className="w-full text-left p-6 border border-white/5 bg-white/5 hover:bg-white/10 transition-all group flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="block text-[10px] font-black text-white/80 uppercase">Node Expansion Protocol</span>
                        <span className="text-[9px] text-white/20 uppercase font-medium italic">Current: 12 Nodes / Cap: 50</span>
                      </div>
                      <span className="text-[10px] font-black text-red opacity-0 group-hover:opacity-100 transition-all uppercase">Execute</span>
                    </button>
                    <button className="w-full text-left p-6 border border-white/5 bg-white/5 hover:bg-white/10 transition-all group flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="block text-[10px] font-black text-white/80 uppercase">Cache Purge System</span>
                        <span className="text-[9px] text-white/20 uppercase font-medium italic">Last Flush: 4h ago</span>
                      </div>
                      <span className="text-[10px] font-black text-red opacity-0 group-hover:opacity-100 transition-all uppercase">Execute</span>
                    </button>
                  </div>
                </div>
             </section>
          )}

          {activeTab === 'readiness' && (
            <section className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {readiness.map((task) => (
                  <div key={task.id} className="p-10 bg-neutral-900 border border-white/10 rounded-[4rem] space-y-6 hover:border-red/50 transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                         <span className={`text-[8px] font-black tracking-widest uppercase ${task.status === 'ready' ? 'text-green-500' : 'text-red'}`}>
                           Status: {task.status === 'ready' ? 'Operational' : 'Required'}
                         </span>
                         <h3 className="text-xl font-black uppercase tracking-tighter leading-none group-hover:text-red transition-all">{task.label}</h3>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${task.status === 'ready' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-red shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'}`} />
                    </div>
                    <p className="text-[11px] text-white/30 font-bold leading-relaxed">{task.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Panel: Destinations & Intelligence */}
        <div className="space-y-12">
            <section className="p-8 bg-neutral-900 border border-white/10 rounded-[2rem] space-y-8">
                <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-red border-l border-red pl-4">Approved_Feeds</h3>
                <div className="space-y-4">
                    {['X / AI Trends', 'LinkedIn / Enterprise', 'TechCrunch / Orchestration', 'OpenAI / Press'].map((dest, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-black/50 border border-white/5 rounded-xl">
                            <span className="text-[10px] font-bold text-white/60 uppercase">{dest}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                        </div>
                    ))}
                </div>
                <button className="w-full py-4 border border-white/10 text-white/40 text-[9px] font-black tracking-widest uppercase hover:text-white hover:border-white transition-all">
                    Establish New Connection
                </button>
            </section>

            <section className="p-8 border border-white/10 rounded-[2rem] space-y-6 italic text-white/40 text-[10px] leading-relaxed">
                "THE AGENT OPERATES WITHIN REPRODUCIBLE PARAMETERS. EVERY REPORT IS AUDITED FOR BRAND ALIGNMENT. PUBLICATION IS STOCHASTIC BUT AUTHORITATIVE."
            </section>
        </div>
      </div>
    </div>
  );
};

export default Admin;
