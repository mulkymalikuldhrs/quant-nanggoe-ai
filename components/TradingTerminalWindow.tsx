
import React, { useState, useEffect, useCallback } from 'react';
import { getMarketPrices } from '../services/marketDataService';
import MarketPrices from './MarketPrices';
import AICommandInterface from './AICommandInterface';
import CustomChartingWidget from './CustomChartingWidget';
import MiSiScreener from './MiSiScreener';
import CorrelationMatrixWidget from './CorrelationMatrixWidget';
import AccountStatusWidget from './AccountStatusWidget';
import ExecutionLogWidget from './ExecutionLogWidget';
import SignalLog from './SignalLog';
import TabbedWidget from './TabbedWidget';
import OrderFlowWidget from './OrderFlowWidget';
import FundamentalAnalysisWidget from './FundamentalAnalysisWidget';
import NewsTerminalWidget from './NewsTerminalWidget';
import { ChartIcon, ActivityIcon, CommandLineIcon, BookOpenIcon, IconTerminal, IconChart } from './Icons';
import { AgentLogEntry, MarketPrice, FundamentalAnalysisData, NewsEvent } from '../types';
import { getSignalLog } from '../services/signalLogService';
import { extractSignalFromJSON } from '../services/signalParser';

const TradingTerminalWindow: React.FC = () => {
  const [mode, setMode] = useState<'dhaher' | 'mt5'>('dhaher');
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutonomousMode, setIsAutonomousMode] = useState(false);
  const [accountBalance, setAccountBalance] = useState(100000);
  const [riskPerTrade, setRiskPerTrade] = useState(1.0);
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);
  const [signalLog, setSignalLog] = useState(getSignalLog());
  
  const [aiFundamentalData, setAiFundamentalData] = useState<FundamentalAnalysisData | undefined>(undefined);
  const [aiNewsFeed, setAiNewsFeed] = useState<NewsEvent[] | undefined>(undefined);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const updatePrices = async () => {
        const p = await getMarketPrices();
        setPrices(p);
    };
    updatePrices();
    const interval = setInterval(updatePrices, 3000); 
    return () => clearInterval(interval);
  }, []);

  const refreshSignalLog = useCallback(() => {
    setSignalLog(getSignalLog());
  }, []);

  const addLog = useCallback((message: string, type: AgentLogEntry['type'] = 'INFO') => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      message,
      type
    };
    setAgentLogs(prev => [...prev, newLog].slice(-100));
  }, []);

  const handleAnalysisUpdate = (pair: string, fullResponse: string) => {
      addLog(`Quant Decision Synthesis complete for ${pair}`, 'SUCCESS');
      refreshSignalLog();
      
      const signalData = extractSignalFromJSON(fullResponse);
      if (signalData) {
          if (signalData.ai_fundamental_data) {
              setAiFundamentalData(signalData.ai_fundamental_data);
              addLog(`UI Updated: Fundamental Data for ${pair}`, 'INFO');
          }
          if (signalData.ai_news_feed) {
              setAiNewsFeed(signalData.ai_news_feed);
              addLog(`UI Updated: News Feed for ${pair}`, 'INFO');
          }
      }
  };

  const currentPrice = prices.find(p => p.id === selectedPair)?.price || null;

  return (
    <div className="h-full w-full flex flex-col bg-[#010101] text-[#F0F0F0] overflow-hidden select-none font-sans">
        {/* Mode Switcher */}
        <div className="flex-none h-10 bg-[#080808] border-b border-white/5 flex items-center justify-between px-4">
            <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/10">
                <button 
                    onClick={() => setMode('dhaher')}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'dhaher' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <IconChart className="w-3 h-3" /> Dhaher Quant
                </button>
                <button 
                    onClick={() => setMode('mt5')}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'mt5' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <IconTerminal className="w-3 h-3" /> MT5 Web
                </button>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-[10px] font-mono text-gray-400">
                        {mode === 'dhaher' ? (isLoading ? 'QUANT PROCESSING' : 'TERMINAL READY') : 'METAQUOTES GATEWAY'}
                    </span>
                </div>
            </div>
        </div>

        <div className="flex-1 min-h-0">
            {mode === 'dhaher' ? (
                <main className="h-full grid grid-cols-12 grid-rows-12 gap-2 p-2">
                    {/* Sidebar Left: Screener & Data Feed */}
                    <div className="col-span-3 row-span-12 flex flex-col gap-2 min-h-0">
                        <div className="flex-grow min-h-0">
                            <MiSiScreener 
                                prices={prices} 
                                onSelect={(id) => {
                                    setSelectedPair(id);
                                    addLog(`Switching primary quant analysis focus to ${id}`, 'INFO');
                                }} 
                            />
                        </div>
                        <div className="h-48 flex-shrink-0">
                            <CorrelationMatrixWidget />
                        </div>
                    </div>

                    {/* Center Area: Charting & Decision Engine */}
                    <div className="col-span-6 row-span-12 flex flex-col gap-2 min-h-0">
                        <div className="flex-grow bg-black rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl relative">
                            <div className="flex items-center justify-between p-2.5 bg-[#080808] border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <ChartIcon className="w-4 h-4 text-blue-500" />
                                    <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">
                                    Institutional OS Terminal <span className="text-white/20">|</span> <span className="text-white">{selectedPair}</span>
                                    </span>
                                </div>
                                <div className="flex gap-4 text-[9px] text-gray-600 font-mono font-black">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> STRATEGY_LINK: SECURE</span>
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> FEED: TICK_STABLE</span>
                                </div>
                            </div>
                            <div className="flex-grow relative">
                                <CustomChartingWidget pair={selectedPair} theme={theme} />
                            </div>
                        </div>
                        
                        <div className="h-[35%] min-h-0">
                            <AICommandInterface 
                                onAnalysisUpdate={handleAnalysisUpdate}
                                onLoadingChange={setIsLoading}
                                selectedPair={selectedPair}
                                isAutonomousMode={isAutonomousMode}
                                accountBalance={accountBalance}
                                riskPerTrade={riskPerTrade}
                                currentPrice={currentPrice}
                            />
                        </div>
                    </div>

                    {/* Sidebar Right: Microstructure, Agent Logs & Risk */}
                    <div className="col-span-3 row-span-12 flex flex-col gap-2 min-h-0">
                        <div className="h-[20%] flex-shrink-0">
                            <OrderFlowWidget />
                        </div>
                        
                        <div className="h-[25%] flex-shrink-0">
                            <TabbedWidget 
                                tabs={[
                                    { id: 'fund', label: 'FUNDAMENTAL AI', icon: <BookOpenIcon className="w-3.5 h-3.5"/>, content: <FundamentalAnalysisWidget pair={selectedPair} aiData={aiFundamentalData} aiNews={aiNewsFeed} /> },
                                    { id: 'news', label: 'LIVE NEWS', icon: <ActivityIcon className="w-3.5 h-3.5"/>, content: <NewsTerminalWidget aiNews={aiNewsFeed} /> }
                                ]}
                            />
                        </div>

                        <div className="flex-grow min-h-0">
                            <TabbedWidget 
                                tabs={[
                                    { id: 'logs', label: 'QUANT LOG', icon: <ActivityIcon className="w-3.5 h-3.5"/>, content: <ExecutionLogWidget log={agentLogs} /> },
                                    { id: 'signals', label: 'MiSi SIGNALS', icon: <CommandLineIcon className="w-3.5 h-3.5"/>, content: <SignalLog signals={signalLog} /> }
                                ]}
                            />
                        </div>

                        <div className="h-44 flex-shrink-0">
                        <AccountStatusWidget 
                                balance={accountBalance}
                                riskPerTrade={riskPerTrade}
                                onRiskChange={setRiskPerTrade}
                                onBalanceChange={setAccountBalance}
                            />
                        </div>
                    </div>
                </main>
            ) : (
                <div className="h-full w-full flex flex-col">
                    <div className="flex-none bg-[#fdfdfd] border-b border-gray-200 px-4 py-2 text-[10px] text-gray-500 flex justify-between">
                        <span>Provider: <strong>MetaQuotes Software Corp.</strong></span>
                        <span>Secure Connection (SSL)</span>
                    </div>
                    <iframe 
                        src="https://trade.mql5.com/trade?servers=MetaQuotes-Demo&trade_server=MetaQuotes-Demo&demo_all_servers=1&startup_mode=open_demo&lang=en" 
                        className="w-full h-full border-none"
                        allowFullScreen={true}
                        title="MetaTrader 5 Web Terminal"
                    />
                </div>
            )}
        </div>
    </div>
  );
};

export default TradingTerminalWindow;
