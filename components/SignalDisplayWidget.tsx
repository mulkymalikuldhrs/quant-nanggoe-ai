
import React from 'react';
import { AlertTriangleIcon, ActivityIcon, BotIcon } from './Icons';
import { SignalLogEntry } from '../types';

interface SignalDisplayWidgetProps {
    signal: SignalLogEntry | null;
    onManualExecute: (signal: SignalLogEntry) => void;
    isAutonomousMode: boolean;
}

const ClusterScore: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
    <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
            <span>{label}</span>
            <span className="text-gray-300">{score}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
                className={`h-full ${color} transition-all duration-1000 ease-out shadow-[0_0_8px]`} 
                style={{ width: `${score}%`, boxShadow: `0 0 8px ${color.replace('bg-', '')}` }}
            ></div>
        </div>
    </div>
);

const SignalDisplayWidget: React.FC<SignalDisplayWidgetProps> = ({ signal, onManualExecute, isAutonomousMode }) => {
    
    if (!signal) {
         return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border border-blue-500/10 flex items-center justify-center">
                        <ActivityIcon className="w-6 h-6 text-gray-800" />
                    </div>
                    <div className="absolute inset-0 w-16 h-16 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                </div>
                <div className="space-y-1">
                    <p className="text-[var(--color-text-tertiary)] font-mono text-[9px] uppercase tracking-[0.4em]">-- Aggregating Node Data --</p>
                    <p className="text-gray-700 text-[8px] font-mono">100 MICRO-STRATEGIES PENDING</p>
                </div>
            </div>
        );
    }

    const isBuy = signal.direction === 'BUY';
    const confidenceValue = parseInt(signal.confidence, 10);
    const isExecuted = signal.status === 'EXECUTED';

    const scores = signal.strategy_breakdown || {
        smc_score: 82,
        orderflow_score: 75,
        macro_score: 88,
        volatility_score: 64,
        fundamental_score: 70
    };

    return (
         <div className="h-full flex flex-col p-1 font-sans">
            {/* Probability Header */}
            <div className="flex items-center justify-between mb-4 bg-white/[0.03] p-3 rounded-xl border border-white/5 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isBuy ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500 shadow-[0_0_15px_#ef4444]'}`}></div>
                    <div className="flex flex-col">
                        <span className="font-black text-lg text-white tracking-tighter leading-none">{signal.direction} {signal.pair}</span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">PROBABILITY CONVERGENCE</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Score</div>
                    <div className={`text-xl font-black tracking-tighter leading-none ${confidenceValue > 80 ? 'text-yellow-500' : 'text-blue-400'}`}>
                        {confidenceValue}%
                    </div>
                </div>
            </div>
            
            {/* Strategy Convergence Grid (100 Nodes Aggregated) */}
            <div className="grid grid-cols-1 gap-3 mb-5 px-1 bg-black/20 p-3 rounded-xl border border-white/5">
                <h4 className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Node Convergence Results</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <ClusterScore label="SMC / ICT" score={scores.smc_score} color="bg-blue-500" />
                    <ClusterScore label="Orderflow" score={scores.orderflow_score} color="bg-purple-600" />
                    <ClusterScore label="Macro / DXY" score={scores.macro_score} color="bg-amber-500" />
                    <ClusterScore label="Volatility" score={scores.volatility_score} color="bg-emerald-500" />
                </div>
            </div>

            {/* Execution Levels */}
            <div className="grid grid-cols-3 gap-2 mb-4 bg-black/60 p-3 rounded-xl border border-white/5">
                <div className="text-center">
                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Entry</div>
                    <div className="text-white font-mono font-bold text-[11px]">{signal.entry.toLocaleString(undefined, { minimumFractionDigits: 5 })}</div>
                </div>
                <div className="text-center border-x border-white/10">
                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Stop Loss</div>
                    <div className="text-red-400 font-mono font-bold text-[11px]">{signal.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 5 })}</div>
                </div>
                <div className="text-center">
                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Take Profit</div>
                    <div className="text-green-400 font-mono font-bold text-[11px]">{signal.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 5 })}</div>
                </div>
            </div>
            
            {/* Reasoning Nodes */}
            <div className="flex-grow overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-hide">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <h4 className="font-black text-gray-400 mb-2 text-[8px] uppercase tracking-[0.2em] flex items-center gap-2">
                        <BotIcon className="w-3 h-3 text-blue-500" />
                        Aggregated Reasoning
                    </h4>
                    <ul className="space-y-1.5">
                        {signal.keyDrivers && signal.keyDrivers.map((driver, i) => (
                            <li key={i} className="text-[9px] text-gray-300 leading-snug flex gap-2">
                                <span className="text-blue-500 font-bold">»</span>
                                {driver}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="p-3 border-l-2 border-red-500/30 bg-red-500/5 rounded-r-xl">
                    <h4 className="font-bold text-red-400/80 mb-1 text-[8px] uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangleIcon className="w-3 h-3" />
                        Invalidation Node
                    </h4>
                    <p className="text-[9px] text-gray-500 italic leading-relaxed">{signal.riskAnalysis}</p>
                </div>
            </div>

            {/* Manual MT5 Bridge */}
            {!isAutonomousMode && (
                 <div className="mt-auto">
                    <button
                        onClick={() => onManualExecute(signal)}
                        disabled={isExecuted}
                        className={`w-full py-3 text-[10px] font-black tracking-[0.2em] rounded-xl transition-all duration-300 border shadow-2xl ${
                            isExecuted 
                            ? 'bg-green-500/10 border-green-500/20 text-green-500/50 cursor-not-allowed' 
                            : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-[0.98]'
                        }`}
                    >
                        {isExecuted ? 'EXECUTION SYNCED' : 'MANUAL MT5 BRIDGE EXECUTION'}
                    </button>
                </div>
            )}
        </div>
    )
};

export default SignalDisplayWidget;
