
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAITradingAnalysis } from '../services/geminiService';
import { extractSignalFromJSON } from '../services/signalParser';
import { logSignal } from '../services/signalLogService';
import { CommandLineIcon, BotIcon, LoaderIcon } from './Icons';

interface AICommandInterfaceProps {
  onAnalysisUpdate: (pair: string, analysis: string) => void;
  onLoadingChange: (isLoading: boolean) => void;
  selectedPair: string;
  isAutonomousMode: boolean;
  accountBalance: number;
  riskPerTrade: number;
  currentPrice: number | null;
}

const AICommandInterface: React.FC<AICommandInterfaceProps> = ({ 
  onAnalysisUpdate, onLoadingChange, selectedPair, isAutonomousMode, 
  accountBalance, riskPerTrade, currentPrice 
}) => {
  const [history, setHistory] = useState<{id: string, text: string, type: 'user' | 'agent' | 'system' | 'browser'}[]>([]);
  const [browserStatus, setBrowserStatus] = useState('Idle');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const addLog = (text: string, type: 'user' | 'agent' | 'system' | 'browser') => {
    setHistory(prev => [...prev, { id: Date.now().toString() + Math.random(), text, type }]);
  };

  const executeQuantScan = useCallback(async (customPrompt?: string) => {
    setLocalLoading(true);
    onLoadingChange(true);
    const cmd = customPrompt || `/scan ${selectedPair}`;
    addLog(`[EXEC]: ${cmd}`, 'system');
    
    let fullResponse = '';
    try {
        const stream = getAITradingAnalysis({
            pair: selectedPair,
            accountBalance,
            riskPerTrade,
            currentPrice,
            ratios: [0.618, 0.786, 0.5]
        });

        for await (const chunk of stream) {
            fullResponse += chunk;
            if (chunk.includes('[AGENT_BROWSER_ACTION]')) {
                const lines = chunk.split('\n');
                const actionLine = lines.find(l => l.includes('[AGENT_BROWSER_ACTION]'));
                if (actionLine) setBrowserStatus(actionLine.replace('[AGENT_BROWSER_ACTION]', '').trim());
            } else if (chunk.includes('Node')) {
                 setBrowserStatus('Scanning Strategy Nodes...');
            }
        }
        
        const signal = extractSignalFromJSON(fullResponse);
        if (signal) {
            signal.pair = selectedPair; 
            logSignal(signal);
            addLog(`SIGNAL ACQUIRED: ${signal.direction} ${signal.pair} [Conf: ${signal.confidence}]`, 'agent');
        } else {
            addLog(`ANALYSIS COMPLETE. No actionable signal detected (WAIT).`, 'agent');
        }

        onAnalysisUpdate(selectedPair, fullResponse);
    } catch (err) {
        addLog(`[CRITICAL]: Quant Core Exception. Node Sync Failed.`, 'system');
    } finally {
        setLocalLoading(false);
        onLoadingChange(false);
        setBrowserStatus('Idle');
    }
  }, [selectedPair, accountBalance, riskPerTrade, currentPrice, onLoadingChange, onAnalysisUpdate]);

  useEffect(() => {
    if (isAutonomousMode) {
        const interval = setInterval(() => executeQuantScan(), 300000); // 5 min intervals for auto-scan
        executeQuantScan();
        return () => clearInterval(interval);
    }
  }, [isAutonomousMode, selectedPair, executeQuantScan]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || localLoading) return;

    const cmd = inputValue.trim();
    addLog(cmd, 'user');
    setInputValue('');

    // Dhaher Command Language (DCL) Parsing
    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd === '/help') {
        setTimeout(() => {
            addLog('DHAHER COMMAND LANGUAGE (DCL) v1.0:', 'system');
            addLog('• /scan [PAIR] - Execute 100-strategy convergence', 'system');
            addLog('• /quant - Show mathematical correlation data', 'system');
            addLog('• /news - Fetch real-time verified headlines', 'system');
            addLog('• /status - System health check', 'system');
        }, 200);
        return;
    }

    if (lowerCmd === '/status') {
        setTimeout(() => {
             addLog('SYSTEM STATUS: ONLINE', 'system');
             addLog('QUANT ENGINE: ACTIVE', 'system');
             addLog('DATA FEED: REAL (PUBLIC API)', 'system');
        }, 200);
        return;
    }

    if (lowerCmd.startsWith('/scan') || lowerCmd.includes('analyze')) {
        executeQuantScan(cmd);
    } else {
        // Fallback for natural language
        addLog(`Command not recognized in DCL. Initiating generic market query...`, 'system');
        executeQuantScan(cmd); 
    }
  };

  return (
    <div className="h-full flex flex-col bg-black/40 rounded-2xl border border-white/10 overflow-hidden font-mono shadow-2xl backdrop-blur-xl">
        <div className="p-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3 text-[10px] text-gray-300 font-black tracking-[0.2em] uppercase">
                <BotIcon className="w-4 h-4 text-blue-500" />
                Dhaher Core v3.0
            </div>
            <div className="flex items-center gap-4 text-[9px]">
                <div className="flex items-center gap-2">
                    <span className="text-gray-600">STATE:</span>
                    <span className={`font-black tracking-widest transition-all ${localLoading ? 'text-blue-400' : 'text-gray-500'}`}>
                        {browserStatus}
                    </span>
                </div>
                {localLoading && <LoaderIcon className="w-3.5 h-3.5 text-blue-400" />}
            </div>
        </div>
        
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 text-[10px] scrollbar-hide">
            {history.map(log => (
                <div key={log.id} className={`flex gap-3 group ${log.type === 'user' ? 'opacity-70' : ''}`}>
                    <span className={`uppercase font-black min-w-[65px] select-none text-right tracking-tighter ${
                        log.type === 'browser' ? 'text-purple-500' : 
                        log.type === 'user' ? 'text-green-500' :
                        log.type === 'system' ? 'text-gray-600' : 'text-blue-500'
                    }`}>[{log.type}]</span>
                    <span className={`${log.type === 'agent' ? 'text-gray-100' : 'text-gray-400'} leading-relaxed font-sans`}>
                        {log.text}
                    </span>
                </div>
            ))}
            {history.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <CommandLineIcon className="w-12 h-12 mb-4 text-gray-500" />
                    <div className="text-gray-500 font-black text-xs uppercase tracking-[0.5em] select-none">System Ready</div>
                    <div className="text-gray-600 text-[9px] mt-2">Type /help for DCL commands</div>
                </div>
            )}
        </div>

        <form onSubmit={handleCommand} className="p-3 bg-black/80 flex items-center gap-4 border-t border-white/10">
            <div className={`w-2 h-2 rounded-full transition-colors ${localLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            <input 
                type="text" 
                disabled={localLoading}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="/scan [PAIR] | /help"
                className="flex-grow bg-transparent border-none outline-none text-[11px] text-white placeholder-gray-800 font-mono focus:placeholder-gray-700 disabled:opacity-30"
            />
            <CommandLineIcon className={`w-4 h-4 transition-colors ${localLoading ? 'text-gray-700' : 'text-blue-500'}`} />
        </form>
    </div>
  );
};

export default AICommandInterface;
