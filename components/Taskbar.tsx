
import React, { useState, useRef, useEffect, useContext } from 'react';
import { IconSettings, IconBot, IconCode, IconBook, IconSearch, IconLogo, IconChart, IconBrowser, IconTerminal, IconBrain } from './Icons';
import { ThemeContext } from '../App';

interface Props {
  windows: Record<string, { isOpen: boolean; isMinimized: boolean; isActive: boolean }>;
  onToggleWindow: (id: string) => void;
  onStartClick: () => void;
}

const Taskbar: React.FC<Props> = ({ windows, onToggleWindow, onStartClick }) => {
    const { theme } = useContext(ThemeContext);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [mousePos, setMousePos] = useState<number | null>(null);
    const dockRef = useRef<HTMLDivElement>(null);

    const dockItems = [
        { id: 'terminal', icon: <IconCode className="w-4 h-4 md:w-5 md:h-5 text-[#00D1FF]" />, label: 'Neural Terminal' },
        { id: 'browser', icon: <IconBrowser className="w-4 h-4 md:w-5 md:h-5 text-[#FF3B30]" />, label: 'Neural Browser' },
        { id: 'trading_terminal', icon: <IconTerminal className="w-4 h-4 md:w-5 md:h-5 text-[#FFCC00]" />, label: 'MT5 Terminal' },
        { id: 'market', icon: <IconChart className="w-4 h-4 md:w-5 md:h-5 text-[#34C759]" />, label: 'Market Feed' },
        { id: 'portfolio', icon: <IconBook className="w-4 h-4 md:w-5 md:h-5 text-[#5856D6]" />, label: 'Portfolio' },
        { id: 'monitor', icon: <IconBot className="w-4 h-4 md:w-5 md:h-5 text-[#FF2D55]" />, label: 'Swarm Monitor' },
        { id: 'architecture', icon: <IconBrain className="w-4 h-4 md:w-5 md:h-5 text-[#10b981]" />, label: 'Visual Guide' },
        { id: 'artifact', icon: <IconSearch className="w-4 h-4 md:w-5 md:h-5 text-[#AF52DE]" />, label: 'Research Lab' },
        { id: 'settings', icon: <IconSettings className="w-4 h-4 md:w-5 md:h-5 text-[#8E8E93]" />, label: 'Sys Config' },
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
              <div className={`px-4 py-2 rounded-[24px] flex items-end gap-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] min-w-min shadow-2xl border backdrop-blur-3xl hover:py-3 ${theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/40 border-black/10'}`}>
                  
                  {/* Start / About (The Logo) */}
                  <div 
                    className="group relative flex flex-col items-center gap-1 app-icon shrink-0"
                    style={{ transform: `scale(${getScale(-1)})`, transition: 'transform 0.2s ease-out' }}
                  >
                        <button 
                            onClick={onStartClick}
                            className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl shadow-xl flex items-center justify-center transition-all border active:scale-90 ${theme === 'dark' ? 'bg-gradient-to-br from-[#121214] to-[#09090b] border-white/10 hover:border-emerald-500/50' : 'bg-gradient-to-br from-white to-[#f0f0f0] border-black/10 hover:border-emerald-500/50 shadow-md'}`}
                        >
                          <IconLogo className="w-6 h-6 md:w-8 md:h-8 transition-all" />
                        </button>

                      <div className="w-1.5 h-1.5 rounded-full bg-transparent"></div>
                  </div>
  
                  <div className={`w-[1px] h-10 md:h-12 mx-1 mb-2 shrink-0 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}></div>
  
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
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all border active:scale-90 ${theme === 'dark' ? 'bg-black/20 border-white/5 hover:border-white/20' : 'bg-white/60 border-black/5 hover:border-black/20 shadow-md'} ${isActive ? 'ring-2 ring-emerald-500/30' : ''}`}
                                >

                                  {app.icon}
                              </button>
                              
                              {/* Status Indicator (macOS style dot) */}
                              <div className="h-1 flex items-center justify-center">
                                <div className={`w-1 h-1 rounded-full transition-all duration-500 ${isOpen ? (theme === 'dark' ? 'bg-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-zinc-800 shadow-[0_0_8px_rgba(0,0,0,0.3)]') : 'bg-transparent'}`}></div>
                              </div>
                              
                              {/* Tooltip (macOS style) */}
                              <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 backdrop-blur-2xl border rounded-lg text-[9px] font-black tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap pointer-events-none shadow-2xl z-[10000] ${theme === 'dark' ? 'bg-zinc-900/90 border-white/10 text-zinc-100' : 'bg-white/90 border-black/10 text-zinc-800'}`}>
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
