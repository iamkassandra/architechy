
import React, { useState, useEffect } from 'react';

const FEED_ITEMS = [
  "ORACLE: Analyzing Q1 market shifts in agentic commerce...",
  "ARCHITECH: New protocol 'OMNI-01' deployed to Vault.",
  "SYSTEM: Node 742 synchronized with central intelligence.",
  "ORACLE: Refined 12 raw drafts into high-value insights.",
  "ARCHITECH: Inner Circle access codes rotating in 48h.",
  "SYSTEM: Latency optimized to 42ms across global edge nodes.",
  "ORACLE: Detecting emerging trend: Sovereign AI Stacks.",
];

const LiveIntelligenceFeed: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % FEED_ITEMS.length);
        setVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 py-2 px-4 bg-black/5 rounded-full border border-black/5 backdrop-blur-sm">
      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
      <p className={`text-[10px] font-black tracking-widest uppercase text-neutral-400 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {FEED_ITEMS[index]}
      </p>
    </div>
  );
};

export default LiveIntelligenceFeed;
