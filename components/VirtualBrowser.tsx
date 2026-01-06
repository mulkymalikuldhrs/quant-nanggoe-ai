
import React from 'react';
import { BotIcon, LoaderIcon, ExternalLinkIcon } from './Icons';

interface VirtualBrowserProps {
    currentUrl?: string;
    isNavigating: boolean;
    logs: string[];
}

const VirtualBrowser: React.FC<VirtualBrowserProps> = ({ currentUrl = "https://trade.mql5.com/trade", isNavigating, logs }) => {
    return (
        <div className="h-full flex flex-col bg-[#08080A] rounded-xl border border-white/10 overflow-hidden font-sans shadow-2xl">
            {/* Browser Navigation Bar */}
            <div className="bg-[#18181B] p-2 flex items-center gap-3 border-b border-white/10">
                <div className="flex gap-1.5 ml-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] shadow-sm"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] shadow-sm"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] shadow-sm"></div>
                </div>
                <div className="flex-grow flex items-center bg-black/40 rounded-md px-3 py-1.5 border border-white/5 gap-3 group">
                    <div className={`w-1.5 h-1.5 rounded-full ${isNavigating ? 'bg-blue-400 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-[10px] text-gray-500 font-mono truncate flex-grow group-hover:text-gray-300 transition-colors">
                        {currentUrl}
                    </span>
                    {isNavigating && <LoaderIcon className="w-3 h-3 text-blue-400" />}
                </div>
                <button className="p-1.5 hover:bg-white/10 rounded transition-all">
                    <ExternalLinkIcon className="w-3.5 h-3.5 text-gray-500" />
                </button>
            </div>

            {/* Browser Content & Agent Overlay */}
            <div className="flex-grow relative bg-[#020202] overflow-hidden">
                {/* Agent Activity Panel */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl border border-blue-500/20 rounded-lg p-3 w-64 shadow-2xl z-20 animate-fade-in">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                        <span className="text-[9px] font-bold text-blue-400 tracking-[0.2em] uppercase flex items-center gap-2">
                            <BotIcon className="w-3 h-3" />
                            AI Agent Live
                        </span>
                        <div className="flex gap-1">
                           <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
                        </div>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono scrollbar-hide">
                        {logs.length > 0 ? logs.map((log, i) => (
                            <div key={i} className="text-[9px] text-gray-400 leading-tight border-l border-blue-500/30 pl-2">
                                <span className="text-blue-500/50 mr-1">$</span>{log}
                            </div>
                        )) : (
                            <div className="text-[9px] text-gray-700 italic">Agent listening for commands...</div>
                        )}
                    </div>
                </div>

                {/* Simulated Webpage Interface */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                   {!isNavigating ? (
                        <div className="text-center opacity-10">
                            <div className="text-5xl font-black text-white tracking-tighter mb-2">METATRADER 5</div>
                            <div className="text-[10px] text-white font-mono tracking-[0.5em]">SECURE GATEWAY : CONNECTED</div>
                        </div>
                   ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="text-[10px] text-blue-400 font-mono animate-pulse uppercase">Fetching Ground Data...</div>
                        </div>
                   )}
                </div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>
            </div>
            
            {/* Browser Metadata Footer */}
            <div className="p-1.5 bg-[#18181B] border-t border-white/5 flex items-center justify-between text-[8px] text-gray-600 font-mono uppercase px-3">
                <div className="flex gap-3">
                    <span>PROXY: ON</span>
                    <span>SSL: TLS 1.3</span>
                </div>
                <span>NODE: {isNavigating ? 'BUSY' : 'IDLE'}</span>
            </div>
        </div>
    );
};

export default VirtualBrowser;
