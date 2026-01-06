
import React from 'react';
import { ThemeContext } from '../App';
import { IconSun, IconMoon, IconLogo } from './Icons';

interface ControlCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

const ControlCenter: React.FC<ControlCenterProps> = ({ isOpen, onClose }) => {
    const { theme, toggleTheme } = React.useContext(ThemeContext);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[9998]" onClick={onClose}></div>
            <div className={`fixed top-10 right-4 w-80 backdrop-blur-[40px] rounded-[24px] shadow-2xl border p-5 z-[9999] animate-in slide-in-from-top-4 duration-300 ${
                theme === 'dark' ? 'bg-zinc-900/70 border-white/10' : 'bg-white/70 border-black/5 shadow-zinc-300'
            }`}>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Theme Toggle Button */}
                    <button 
                        onClick={toggleTheme}
                        className={`flex flex-col items-start p-3 rounded-2xl transition-all ${
                            theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-zinc-200/50 text-zinc-800'
                        }`}
                    >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 ${
                            theme === 'dark' ? 'bg-white/20' : 'bg-white shadow-sm'
                        }`}>
                            {theme === 'dark' ? <IconMoon className="w-4 h-4" /> : <IconSun className="w-4 h-4 text-amber-500" />}
                        </div>
                        <span className="text-[11px] font-bold">Theme</span>
                        <span className="text-[9px] opacity-70">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>

                    {/* System Status Button */}
                    <div className={`flex flex-col items-start p-3 rounded-2xl ${
                        theme === 'dark' ? 'bg-zinc-800/50 text-white' : 'bg-zinc-200/50 text-zinc-800'
                    }`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 bg-emerald-500 text-white`}>
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        </div>
                        <span className="text-[11px] font-bold">Network</span>
                        <span className="text-[9px] opacity-70">Connected</span>
                    </div>
                </div>

                {/* Brightness / Volume Sliders (Visual Only) */}
                <div className="space-y-4 mb-4">
                    <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-zinc-200/50'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold opacity-60">Display</span>
                        </div>
                        <div className={`h-6 w-full rounded-lg overflow-hidden relative ${theme === 'dark' ? 'bg-zinc-700' : 'bg-white shadow-inner'}`}>
                            <div className="absolute inset-y-0 left-0 w-[80%] bg-blue-500"></div>
                            <div className="absolute inset-0 flex items-center px-2">
                                <IconSun className={`w-3 h-3 ${theme === 'dark' ? 'text-white' : 'text-blue-500'}`} />
                            </div>
                        </div>
                    </div>

                    <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-zinc-200/50'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold opacity-60">Sound</span>
                        </div>
                        <div className={`h-6 w-full rounded-lg overflow-hidden relative ${theme === 'dark' ? 'bg-zinc-700' : 'bg-white shadow-inner'}`}>
                            <div className="absolute inset-y-0 left-0 w-[60%] bg-blue-500"></div>
                            <div className="absolute inset-0 flex items-center px-2">
                                <div className="w-3 h-3 border-2 border-white rounded-sm flex items-center justify-center">
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={`p-4 rounded-2xl flex items-center gap-4 ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white shadow-sm'}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <IconLogo className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold">Quant Nanggroe AI</span>
                        <span className="text-[9px] opacity-60">v15.1.0 Advanced Intelligence</span>
                    </div>
                </div>

                {/* Institutional Metrics (New in v15.1) */}
                <div className={`mt-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-zinc-800/30' : 'bg-zinc-100/50'} border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Security Matrix</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="opacity-60 italic">Risk Guardian</span>
                            <span className="font-mono text-emerald-500 font-bold">NOMINAL</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="opacity-60 italic">Data Integrity</span>
                            <span className="font-mono text-blue-500 font-bold">100%</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="opacity-60 italic">Neural Sync</span>
                            <span className="font-mono text-amber-500 font-bold">STABLE</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ControlCenter;
