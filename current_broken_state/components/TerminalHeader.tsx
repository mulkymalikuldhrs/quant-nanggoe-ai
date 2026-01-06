
import React, { useMemo } from 'react';
import { BookOpenIcon, BotIcon, LoaderIcon, SunIcon, MoonIcon, CogIcon, ExternalLinkIcon } from './Icons';
import { INSTRUMENTS } from '../constants/instruments';
import { Instrument, AgentStatus } from '../types';
import TimezoneClock from './TimezoneClock';
import MarketSessionWidget from './MarketSessionWidget';

interface HeaderProps {
  isLoading: boolean;
  onToggleSpecModal: () => void;
  onTogglePhilosophyModal: () => void;
  isAutonomousMode: boolean;
  onToggleAutonomousMode: () => void;
  agentStatus: AgentStatus;
  selectedPair: string;
  onSelectedPairChange: (pair: string) => void;
  onManualAnalysis: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isReplayMode: boolean;
  onToggleReplayMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    isLoading, onToggleSpecModal, onTogglePhilosophyModal,
    isAutonomousMode, onToggleAutonomousMode, agentStatus,
    selectedPair, onSelectedPairChange, onManualAnalysis,
    theme, onToggleTheme, isReplayMode, onToggleReplayMode
}) => {

  const groupedInstruments = useMemo(() => {
    const groups: Record<string, Instrument[]> = {
        major: [], minor: [], crypto: [], index: [], commodity: [], stock: []
    };
    INSTRUMENTS.forEach(inst => {
        if(groups[inst.category]) groups[inst.category].push(inst);
    });
    return groups;
  }, []);

  return (
    <header className="widget-container p-2.5 border-b border-white/5 bg-[#121212]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-black tracking-tighter text-gold-gradient">DHAHER QUANT PRO</h1>
                    <div className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        CORE_UPGRADE: 2.5
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-500 font-mono mt-0.5">
                    <ExternalLinkIcon className="w-2.5 h-2.5" />
                    STATUS: {agentStatus} | MEMORY: 1.2GB
                </div>
            </div>
            
            <div className="flex-grow flex justify-center items-center gap-4">
                <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                    <select
                      value={selectedPair}
                      onChange={(e) => onSelectedPairChange(e.target.value)}
                      disabled={isLoading}
                      className="bg-transparent text-[11px] font-bold font-mono text-white focus:outline-none cursor-pointer"
                    >
                      {/* Fixed: Added explicit type assertion for Object.entries to ensure 'insts' is typed as Instrument[] instead of unknown */}
                      {(Object.entries(groupedInstruments) as [string, Instrument[]][]).map(([cat, insts]) => (
                        <optgroup key={cat} label={cat.toUpperCase()} className="bg-[#1A1A1A] text-white">
                          {insts.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                </div>

                <button 
                    onClick={onManualAnalysis}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                    {isLoading ? <LoaderIcon className="w-3 h-3"/> : <BotIcon className="w-3 h-3"/>}
                    ANALYZE_MARKET
                </button>

                <div className="h-6 w-px bg-white/10"></div>

                <button 
                    onClick={onToggleAutonomousMode}
                    className={`px-3 py-1.5 text-[10px] font-black rounded transition-all border ${
                        isAutonomousMode 
                        ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    }`}
                >
                    {isAutonomousMode ? 'STOP_AGENT' : 'START_AUTONOMOUS'}
                </button>
            </div>

            <div className="flex items-center gap-2">
                 <button onClick={onToggleTheme} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                    {theme === 'dark' ? <MoonIcon className="w-3.5 h-3.5"/> : <SunIcon className="w-3.5 h-3.5"/>}
                </button>
                <button onClick={onToggleSpecModal} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                    <CogIcon className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-gray-500">
           <TimezoneClock />
           <MarketSessionWidget />
           <div className="flex items-center gap-3">
                <span>GATEWAY: <span className="text-green-500">ENCRYPTED</span></span>
                <span>DATA_STREAM: <span className="text-blue-500">OPTIMIZED</span></span>
           </div>
        </div>
    </header>
  );
};

export default Header;
