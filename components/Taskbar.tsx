
import React from 'react';
import { IconSettings, IconBot, IconCode, IconBook, IconSearch, IconLogo, IconChart, IconBrowser, IconTerminal } from './Icons';

interface Props {
  windows: Record<string, { isOpen: boolean; isMinimized: boolean; isActive: boolean }>;
  onToggleWindow: (id: string) => void;
  onStartClick: () => void;
}

const Taskbar: React.FC<Props> = ({ windows, onToggleWindow, onStartClick }) => {
  
    const dockItems = [
      { id: 'terminal', icon: <IconCode className="w-5 h-5 md:w-6 md:h-6 text-[var(--accent-primary)]" />, label: 'Neural Terminal', bg: 'bg-white/5' },
      { id: 'browser', icon: <IconBrowser className="w-5 h-5 md:w-6 md:h-6 text-[var(--accent-secondary)]" />, label: 'Neural Browser', bg: 'bg-white/5' },
      { id: 'trading_terminal', icon: <IconTerminal className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />, label: 'MT5 Terminal', bg: 'bg-white/5' },
      { id: 'market', icon: <IconChart className="w-5 h-5 md:w-6 md:h-6 text-[var(--accent-warning)]" />, label: 'Market Feed', bg: 'bg-white/5' },
      { id: 'portfolio', icon: <IconBook className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />, label: 'Portfolio', bg: 'bg-white/5' },
      { id: 'monitor', icon: <IconBot className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />, label: 'Swarm Monitor', bg: 'bg-white/5' },
      { id: 'artifact', icon: <IconSearch className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />, label: 'Research Lab', bg: 'bg-white/5' },
      { id: 'settings', icon: <IconSettings className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />, label: 'Sys Config', bg: 'bg-white/5' },
    ];

    return (
      <div className="fixed bottom-4 md:bottom-8 w-full flex justify-center z-50 pointer-events-none">
          <div className="pointer-events-auto max-w-[95%] overflow-x-auto custom-scrollbar flex justify-center">
              <div className="dock-glass px-4 py-3 rounded-3xl flex items-end gap-3 transition-all duration-300 min-w-min shadow-2xl border border-white/5">
                  
                  {/* Start / About (The Logo) */}
                  <div className="group relative flex flex-col items-center gap-1 app-icon shrink-0">
                      <button 
                          onClick={onStartClick}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-2xl shadow-xl flex items-center justify-center transition-all bg-gradient-to-br from-[#121214] to-[#09090b] border border-white/10 hover:border-[var(--accent-primary)]/50 group"
                      >
                      <IconLogo className="w-8 h-8 md:w-11 md:h-11 group-hover:scale-110 transition-transform" />
                      </button>
                      <div className="w-1.5 h-1.5 rounded-full bg-transparent"></div>
                  </div>

                  <div className="w-[1px] h-10 md:h-12 bg-white/10 mx-1 mb-2 shrink-0"></div>

                  {/* App Icons */}
                  {dockItems.map(app => {
                      const state = windows[app.id];
                      const isOpen = state?.isOpen;
                      const isActive = state?.isActive;
                      
                      return (
                          <div key={app.id} className="group relative flex flex-col items-center gap-1 app-icon shrink-0">
                              <button 
                                  onClick={() => onToggleWindow(app.id)}
                                  className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all border border-white/5 hover:border-white/20 ${app.bg} ${isActive ? 'scale-110 -translate-y-2' : ''}`}
                              >
                                  {app.icon}
                              </button>
                              
                              {/* Status Indicators */}
                              <div className="flex gap-1 mt-1">
                                <div className={`w-1 h-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-[var(--accent-primary)] shadow-[0_0_5px_var(--accent-primary)]' : 'bg-transparent'}`}></div>
                                {isActive && <div className="w-1 h-1 rounded-full bg-white animate-pulse"></div>}
                              </div>
                              
                              {/* Tooltip */}
                              <div className="hidden md:block absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl text-[10px] font-bold tracking-widest text-zinc-300 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap pointer-events-none shadow-2xl z-50">
                                  {app.label.toUpperCase()}
                                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-white/10 rotate-45"></div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>

  );
};

export default Taskbar;
