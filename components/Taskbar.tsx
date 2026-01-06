
import React, { useState, useRef, useEffect } from 'react';
import { IconSettings, IconBot, IconCode, IconBook, IconSearch, IconLogo, IconChart, IconBrowser, IconTerminal } from './Icons';

interface Props {
  windows: Record<string, { isOpen: boolean; isMinimized: boolean; isActive: boolean }>;
  onToggleWindow: (id: string) => void;
  onStartClick: () => void;
}

const Taskbar: React.FC<Props> = ({ windows, onToggleWindow, onStartClick }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [mousePos, setMousePos] = useState<number | null>(null);
    const dockRef = useRef<HTMLDivElement>(null);

    const dockItems = [
        { id: 'terminal', icon: <IconCode className="w-5 h-5 md:w-6 md:h-6 text-[#00D1FF]" />, label: 'Neural Terminal', bg: 'bg-black/20' },
        { id: 'browser', icon: <IconBrowser className="w-5 h-5 md:w-6 md:h-6 text-[#FF3B30]" />, label: 'Neural Browser', bg: 'bg-black/20' },
        { id: 'trading_terminal', icon: <IconTerminal className="w-5 h-5 md:w-6 md:h-6 text-[#FFCC00]" />, label: 'MT5 Terminal', bg: 'bg-black/20' },
        { id: 'market', icon: <IconChart className="w-5 h-5 md:w-6 md:h-6 text-[#34C759]" />, label: 'Market Feed', bg: 'bg-black/20' },
        { id: 'portfolio', icon: <IconBook className="w-5 h-5 md:w-6 md:h-6 text-[#5856D6]" />, label: 'Portfolio', bg: 'bg-black/20' },
        { id: 'monitor', icon: <IconBot className="w-5 h-5 md:w-6 md:h-6 text-[#FF2D55]" />, label: 'Swarm Monitor', bg: 'bg-black/20' },
        { id: 'artifact', icon: <IconSearch className="w-5 h-5 md:w-6 md:h-6 text-[#AF52DE]" />, label: 'Research Lab', bg: 'bg-black/20' },
        { id: 'settings', icon: <IconSettings className="w-5 h-5 md:w-6 md:h-6 text-[#8E8E93]" />, label: 'Sys Config', bg: 'bg-black/20' },
    ];

    const handleMouseMove = (e: React.MouseEvent) => {
        if (dockRef.current) {
            const rect = dockRef.current.getBoundingClientRect();
            setMousePos(e.clientX - rect.left);
        }
    };

    const getScale = (index: number) => {
        if (mousePos === null) return 1;
        
        // Simplified magnification logic
        const itemWidth = 64; // Approx width of icon + gap
        const itemCenter = index * itemWidth + itemWidth / 2 + 40; // 40 for the start logo + separator
        const distance = Math.abs(mousePos - itemCenter);
        const maxDistance = 150;
        
        if (distance > maxDistance) return 1;
        return 1 + (0.5 * (1 - distance / maxDistance));
    };

    return (
      <div className="fixed bottom-4 md:bottom-6 w-full flex justify-center z-[9999] pointer-events-none">
          <div 
            className="pointer-events-auto max-w-[95%] overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { setMousePos(null); setHoveredIndex(null); }}
            ref={dockRef}
          >
              <div className="dock-glass px-4 py-2 rounded-[24px] flex items-end gap-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] min-w-min shadow-2xl border border-white/10 hover:py-3">
                  
                  {/* Start / About (The Logo) */}
                  <div 
                    className="group relative flex flex-col items-center gap-1 app-icon shrink-0"
                    style={{ transform: `scale(${getScale(-1)})`, transition: 'transform 0.2s ease-out' }}
                  >
                      <button 
                          onClick={onStartClick}
                          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all bg-gradient-to-br from-[#121214] to-[#09090b] border border-white/10 hover:border-[var(--accent-primary)]/50 active:scale-90"
                      >
                      <IconLogo className="w-8 h-8 md:w-10 md:h-10 group-hover:brightness-125 transition-all" />
                      </button>
                      <div className="w-1.5 h-1.5 rounded-full bg-transparent"></div>
                  </div>

                  <div className="w-[1px] h-10 md:h-12 bg-white/10 mx-1 mb-2 shrink-0"></div>

                  {/* App Icons */}
                  {dockItems.map((app, index) => {
                      const state = windows[app.id];
                      const isOpen = state?.isOpen;
                      const isActive = state?.isActive;
                      const scale = getScale(index);
                      
                      return (
                          <div 
                            key={app.id} 
                            className="group relative flex flex-col items-center gap-1 app-icon shrink-0"
                            style={{ 
                                transform: `scale(${scale}) translateY(${isActive ? '-8px' : '0'})`, 
                                transition: 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)' 
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                          >
                              <button 
                                  onClick={() => onToggleWindow(app.id)}
                                  className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all border border-white/5 hover:border-white/20 active:scale-90 ${app.bg} ${isActive ? 'ring-2 ring-[var(--accent-primary)]/30' : ''}`}
                              >
                                  {app.icon}
                              </button>
                              
                              {/* Status Indicator (macOS style dot) */}
                              <div className="h-1 flex items-center justify-center">
                                <div className={`w-1 h-1 rounded-full transition-all duration-500 ${isOpen ? 'bg-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-transparent'}`}></div>
                              </div>
                              
                              {/* Tooltip (macOS style) */}
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-lg text-[9px] font-black tracking-[0.2em] text-zinc-100 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap pointer-events-none shadow-2xl z-[10000]">
                                  {app.label.toUpperCase()}
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
