
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
        <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-xl z-[99999] flex items-start justify-center pt-[15vh] animate-in fade-in zoom-in-95 duration-200 p-4">
            <div className="w-[700px] max-w-full bg-[#121214] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden flex flex-col scale-100 ring-1 ring-white/10">
                <div className="flex items-center px-6 py-5 border-b border-white/5 bg-black/20">
                    <IconSearch className="w-6 h-6 text-zinc-500 mr-4" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="SYSTEM_COMMAND_INPUT..."
                        className="flex-1 text-xl font-black text-zinc-100 focus:outline-none placeholder-zinc-700 bg-transparent uppercase tracking-tighter"
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-white/5 text-zinc-500 px-2 py-1 rounded font-black tracking-widest border border-white/5">CTRL+K</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-black tracking-widest border border-emerald-500/20">READY</span>
                    </div>
                </div>
                
                <div className="bg-[#09090b] p-4">
                    <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] px-4 mb-4">Neural_Suggestions</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                            { cmd: "/scan BTCUSD", label: "Analyze_Market_Structure", icon: <IconChart className="text-emerald-500" /> },
                            { cmd: "Check global news impact", label: "Sentiment_Intelligence", icon: <IconGlobe className="text-blue-500" /> },
                            { cmd: "/exec long XAUUSD", label: "Direct_Execution_Plan", icon: <IconTerminal className="text-amber-500" /> },
                            { cmd: "Optimize neural weights", label: "Evolution_Engine_Manual", icon: <IconBook className="text-purple-500" /> }
                        ].map((item, i) => (
                            <button 
                                key={i}
                                onClick={() => { onCommand(item.cmd); onClose(); }} 
                                className="group flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all text-left border border-transparent hover:border-white/5"
                            >
                                <div className="bg-zinc-900 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                    {React.cloneElement(item.icon as React.ReactElement, { className: 'w-4 h-4 ' + (item.icon as any).props.className })}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-zinc-100 tracking-widest uppercase">{item.label}</span>
                                    <span className="text-[9px] text-zinc-600 font-mono">{item.cmd}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-black/40 px-6 py-3 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-zinc-700 tracking-widest uppercase">
                    <span>Nanggroe_Quant_Kernel_v9.0</span>
                    <span>Secure_Uplink_Direct</span>
                </div>
            </div>
        </div>
    );
};

export default OmniBar;
