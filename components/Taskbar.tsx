
import React from 'react';
import { IconSettings, IconBot, IconCode, IconBook, IconSearch, IconLogo, IconChart, IconBrowser, IconTerminal } from './Icons';

interface Props {
  windows: Record<string, { isOpen: boolean; isMinimized: boolean; isActive: boolean }>;
  onToggleWindow: (id: string) => void;
  onStartClick: () => void;
}

const Taskbar: React.FC<Props> = ({ windows, onToggleWindow, onStartClick }) => {
  
  const dockItems = [
    { id: 'terminal', icon: <IconCode className="w-5 h-5 md:w-6 md:h-6 text-white" />, label: 'Terminal', bg: 'bg-gray-800' },
    { id: 'browser', icon: <IconBrowser className="w-5 h-5 md:w-6 md:h-6 text-white" />, label: 'Neural Browser', bg: 'bg-blue-600' },
    { id: 'trading_terminal', icon: <IconTerminal className="w-5 h-5 md:w-6 md:h-6 text-white" />, label: 'MT5 Proxy', bg: 'bg-[#131722]' },
    { id: 'market', icon: <IconChart className="w-5 h-5 md:w-6 md:h-6 text-white" />, label: 'Market', bg: 'bg-orange-500' },
    { id: 'portfolio', icon: <IconBook className="w-5 h-5 md:w-6 md:h-6 text-white" />, label: 'Portfolio', bg: 'bg-emerald-500' },
    { id: 'monitor', icon: <IconBot className="w-5 h-5 md:w-6 md:h-6 text-white" />, label: 'Monitor', bg: 'bg-indigo-500' },
    { id: 'artifact', icon: <IconSearch className="w-5 h-5 md:w-6 md:h-6 text-white" />, label: 'Research', bg: 'bg-purple-500' },
    { id: 'settings', icon: <IconSettings className="w-5 h-5 md:w-6 md:h-6 text-white" />, label: 'Settings', bg: 'bg-gray-500' },
  ];

  return (
    <div className="fixed bottom-4 md:bottom-6 w-full flex justify-center z-50 pointer-events-none">
        {/* Container for Dock - Scrollable on mobile */}
        <div className="pointer-events-auto max-w-[95%] overflow-x-auto custom-scrollbar flex justify-center">
            <div className="dock-glass px-3 py-2 md:px-4 md:py-3 rounded-2xl flex items-end gap-2 md:gap-3 transition-all duration-300 min-w-min">
                
                {/* Start / About (The Logo) */}
                <div className="group relative flex flex-col items-center gap-1 app-icon shrink-0">
                    <button 
                        onClick={onStartClick}
                        className="w-10 h-10 md:w-14 md:h-14 rounded-xl shadow-lg flex items-center justify-center transition-all bg-[#0f172a] border border-gray-700/50"
                    >
                    <IconLogo className="w-6 h-6 md:w-10 md:h-10" />
                    </button>
                    <div className="w-1 h-1 rounded-full bg-transparent"></div>
                </div>

                <div className="w-px h-8 md:h-10 bg-gray-400/30 mx-1 mb-1 md:mb-2 shrink-0"></div>

                {/* App Icons */}
                {dockItems.map(app => {
                    const state = windows[app.id];
                    const isOpen = state?.isOpen;
                    
                    return (
                        <div key={app.id} className="group relative flex flex-col items-center gap-1 app-icon shrink-0">
                            <button 
                                onClick={() => onToggleWindow(app.id)}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${app.bg} ${isOpen ? 'ring-2 ring-white/30' : ''}`}
                            >
                                {app.icon}
                            </button>
                            {/* Active Dot indicator */}
                            <div className={`w-1 h-1 rounded-full bg-black/60 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}></div>
                            
                            {/* Tooltip (Desktop Only) */}
                            <div className="hidden md:block absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1d1d1f]/90 backdrop-blur rounded-lg text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                                {app.label}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1d1d1f]/90 rotate-45"></div>
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
