
import React, { useState, useEffect, useRef } from 'react';
import { IconSearch, IconTerminal, IconChart, IconBook, IconGlobe } from './Icons';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCommand: (cmd: string) => void;
}

const OmniBar: React.FC<Props> = ({ isOpen, onClose, onCommand }) => {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onCommand(input);
            setInput('');
            onClose();
        }
        if (e.key === 'Escape') onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#020205]/60 backdrop-blur-2xl z-[99999] flex items-start justify-center pt-[15vh] animate-in fade-in zoom-in-95 duration-200 p-4">
            <div className="w-[700px] max-w-full glass-panel rounded-[32px] overflow-hidden flex flex-col scale-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
                <div className="flex items-center px-8 py-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
                    <IconSearch className="w-6 h-6 text-zinc-400 mr-4" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="SEARCH_COMMAND..."
                        className="flex-1 text-2xl font-black text-zinc-100 focus:outline-none placeholder-zinc-700 bg-transparent uppercase tracking-tighter"
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-white/10 text-zinc-400 px-2 py-1 rounded font-black tracking-widest border border-white/5">CTRL+K</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-black tracking-widest border border-emerald-500/20">READY</span>
                    </div>
                </div>
                
                <div className="p-6 bg-transparent">
                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-4 mb-4 opacity-50">Neural_Intelligence_Suggestions</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            { cmd: "/scan BTCUSD", label: "Market_Structure_Pulse", icon: <IconChart className="text-emerald-500" /> },
                            { cmd: "Check global news impact", label: "Sentiment_Core_Scraper", icon: <IconGlobe className="text-blue-500" /> },
                            { cmd: "/exec long XAUUSD", label: "Risk_Weighted_Execution", icon: <IconTerminal className="text-amber-500" /> },
                            { cmd: "Optimize neural weights", label: "System_Evolution_Kernel", icon: <IconBook className="text-purple-500" /> }
                        ].map((item, i) => (
                            <button 
                                key={i}
                                onClick={() => { onCommand(item.cmd); onClose(); }} 
                                className="group flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/5 transition-all text-left border border-transparent hover:border-white/10 glass-card"
                            >
                                <div className="bg-white/5 p-3 rounded-xl group-hover:scale-110 transition-transform border border-white/5">
                                    {React.cloneElement(item.icon as React.ReactElement, { className: 'w-4 h-4 ' + (item.icon as any).props.className })}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-zinc-100 tracking-widest uppercase">{item.label}</span>
                                    <span className="text-[9px] text-zinc-500 font-mono">{item.cmd}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 px-8 py-4 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-zinc-600 tracking-widest uppercase">
                    <span>NANGGROE_QUANT_OS_9.0</span>
                    <span className="text-emerald-500/50">SECURE_CHANNEL_ENCRYPTED</span>
                </div>
            </div>
        </div>
    );
};

export default OmniBar;
