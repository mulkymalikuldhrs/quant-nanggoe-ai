
import React, { useState, useEffect, useCallback } from 'react';
import { getMarketPrices } from './services/marketDataService';
import Header from './components/TerminalHeader';
import MarketPrices from './components/MarketPrices';
import AICommandInterface from './components/AICommandInterface';
import CustomChartingWidget from './components/CustomChartingWidget';
import VirtualBrowser from './components/VirtualBrowser';
import MiSiScreener from './components/MiSiScreener';
import CorrelationMatrixWidget from './components/CorrelationMatrixWidget';
import AccountStatusWidget from './components/AccountStatusWidget';
import ExecutionLogWidget from './components/ExecutionLogWidget';
import SignalLog from './components/SignalLog';
import TabbedWidget from './components/TabbedWidget';
import OrderFlowWidget from './components/OrderFlowWidget';
import FundamentalAnalysisWidget from './components/FundamentalAnalysisWidget';
import NewsTerminalWidget from './components/NewsTerminalWidget';
import { ChartIcon, ActivityIcon, CommandLineIcon, LayersIcon, BookOpenIcon } from './components/Icons';
import { AgentLogEntry, MarketPrice, FundamentalAnalysisData, NewsEvent } from './types';
import { getSignalLog } from './services/signalLogService';
import { extractSignalFromJSON } from './services/signalParser';

const App: React.FC = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutonomousMode, setIsAutonomousMode] = useState(false);
  const [accountBalance, setAccountBalance] = useState(100000);
  const [riskPerTrade, setRiskPerTrade] = useState(1.0);
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);
  const [browserLogs, setBrowserLogs] = useState<string[]>([]);
  const [signalLog, setSignalLog] = useState(getSignalLog());
  
  // New State for AI-Driven Data (Replacing fake services)
  const [aiFundamentalData, setAiFundamentalData] = useState<FundamentalAnalysisData | undefined>(undefined);
  const [aiNewsFeed, setAiNewsFeed] = useState<NewsEvent[] | undefined>(undefined);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('dhaher_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('dhaher_theme', theme);
  }, [theme]);

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
    
    if (message.includes('[AGENT_BROWSER_ACTION]') || message.includes('Navigating') || message.includes('Scraping') || message.includes('Aggregating')) {
        setBrowserLogs(prev => [message.replace('[AGENT_BROWSER_ACTION]', '').trim(), ...prev].slice(0, 20));
    }
  }, []);

  const handleAnalysisUpdate = (pair: string, fullResponse: string) => {
      addLog(`Quant Decision Synthesis complete for ${pair}`, 'SUCCESS');
      refreshSignalLog();
      
      // Parse the response to extract Fundamental/News data to populate UI
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
    <div className="h-screen flex flex-col p-2 gap-2 bg-[#010101] text-[#F0F0F0] overflow-hidden select-none font-sans">
        <Header 
            isLoading={isLoading} 
            selectedPair={selectedPair} 
            onSelectedPairChange={setSelectedPair}
            onToggleAutonomousMode={() => setIsAutonomousMode(!isAutonomousMode)}
            isAutonomousMode={isAutonomousMode}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            agentStatus={isLoading ? 'EXECUTING' : 'CONNECTED'}
            onManualAnalysis={() => addLog(`User triggered manual 100-strategy convergence sweep for ${selectedPair}`, 'COMMAND')}
            onToggleSpecModal={() => {}}
            onTogglePhilosophyModal={() => {}}
            isReplayMode={false} // Disabled Replay Mode as we are now Real-Time Focused
            onToggleReplayMode={() => {}}
        />
        
        <main className="flex-grow grid grid-cols-12 grid-rows-12 gap-2 min-h-0">
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
                
                {/* Replaced Browser Log with Fundamental/News Analysis sourced from AI */}
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
    </div>
  );
};

export default App;
