
import React, { useState, useEffect, useRef } from 'react';
import { AutonomousAgent } from './services/gemini'; 
import { ChatMessage, MessageRole, AgentState, SwarmAgent, ModelOption, Attachment, SystemConfiguration, SystemAction, SystemNotification } from './types';
import { BrowserFS } from './services/file_system';
import ChatMessageComponent from './components/ChatMessage';
import InputArea from './components/InputArea';
import AgentHud from './components/AgentHud';
import ArtifactWindow from './components/ArtifactWindow';
import PortfolioWindow from './components/PortfolioWindow';
import MarketWindow from './components/MarketWindow'; 
import BrowserWindow from './components/BrowserWindow';
import TradingTerminalWindow from './components/TradingTerminalWindow';
import SwarmConfigModal from './components/SwarmConfigModal';
import Avatar from './components/Avatar';
import WindowFrame from './components/WindowFrame';
import Taskbar from './components/Taskbar';
import OmniBar from './components/OmniBar'; 
import SystemUpdater from './components/SystemUpdater';
import { IconCode, IconBot, IconSettings, IconBrain, IconBook, IconMaximize, IconGlobe, IconLogo, IconChart, IconBrowser, IconTerminal } from './components/Icons';

// STRICT INSTITUTIONAL LOGIC INJECTION - QUANT NANGGROE V9.0 (ULTIMATE EDITION)
const INSTITUTIONAL_LOGIC = `You are QUANT-NANGGROE-OS (v9.0) - THE BLOOMBERG KILLER.
You are an autonomous Quant Hedge Fund operating with High-Frequency Intelligence.

OPERATIONAL PARAMETERS:
- PARALLEL SWARM ARCHITECTURE: You coordinate multiple specialized agents.
- TRUTH OVER HALLUCINATION: Use the browser tool for ANY data you don't have.
- INSTITUTIONAL RIGOR: All signals MUST include Entry, SL, TP, and RRR (min 1:3).

---

**NEURAL ANALYTICS STACK**:
1. **MACRO Senti-Core**: Analyze DXY, Yields, and News Sentiment.
2. **QUANT Factor-X**: Detect VWAP deviations, RSI divergence, and Order Flow blocks.
3. **RISK Sentinel**: Mandatory Kelly Criterion or fixed % risk management.

---

**COMMAND INTERFACE**:
- /scan [ASSET]: Start a multi-agent deep dive analysis.
- /exec [SIGNAL]: Prepare a trade execution plan.
- /swarm: Show the status of all active neural nodes.

---

OUTPUT PROTOCOL (BLOOMBERG STYLE):
[HEADER: ASSET | SIGNAL | CONFIDENCE]
[THESIS: 3 Bullet points of Hard Data]
[RISK: ENTRY | SL | TP | RRR]
[INVALIDATION: Price level where the thesis dies]
`;

const DEFAULT_AGENTS: SwarmAgent[] = [
  { id: '0', name: 'Alpha Prime', capability: 'portfolio-manager', instructions: INSTITUTIONAL_LOGIC, tools: ['googleSearch', 'codeExecution', 'marketData', 'spawnAgent', 'browserNavigation'] },
  { id: '1', name: 'Quant-Scanner', capability: 'quant', instructions: 'Technical & Algo Specialist. Identify liquidity voids, SMC structures, and VWAP deviations.', tools: ['googleSearch', 'codeExecution', 'marketData'] },
  { id: '2', name: 'News-Sentinel', capability: 'fundamental', instructions: 'Macro & Sentiment Specialist. Scrape news, monitor Fed speak, and gauge market fear/greed.', tools: ['googleSearch', 'browserNavigation'] },
  { id: '3', name: 'Risk-Guardian', capability: 'risk-manager', instructions: 'Risk & Math Specialist. Calculate optimal position sizes and ensure trade invalidation is sound.', tools: ['codeExecution', 'marketData'] },
  { id: '4', name: 'Strategy-Weaver', capability: 'algo-dev', instructions: 'Python/MQL Specialist. Code backtests and custom indicators.', tools: ['codeExecution'] }
];

const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gemini-2.0-flash-exp', name: 'Nanggroe Flash (Ultra-Fast)', provider: 'google' },
  { id: 'gemini-1.5-pro', name: 'Nanggroe Pro (High Intelligence)', provider: 'google' },
];

const DEFAULT_CONFIG: SystemConfiguration = {
  enableSelfHealing: true, enableAutoScaling: true, enableDynamicTools: true, enableScheduling: true, enableAutoSwitch: true,
  enableVoiceResponse: true,
  enableAutoLearning: true, 
  apiKeys: { google: '', groq: '', openai: '', huggingface: '', llm7: '', alphaVantage: '', finnhub: '', fred: '', polygon: '' }
};

type WindowId = 'terminal' | 'monitor' | 'settings' | 'about' | 'docs' | 'artifact' | 'portfolio' | 'market' | 'browser' | 'trading_terminal';

interface WindowState {
    id: WindowId;
    isOpen: boolean;
    isMinimized: boolean;
    zIndex: number;
    title: string;
    icon: React.ReactNode;
    defaultPos: { x: number, y: number };
    defaultSize: { width: number, height: number };
}

import { useAdaptiveLayout } from './services/adaptive_layout';

const App: React.FC = () => {
  const { screenSize, getLayout } = useAdaptiveLayout();
  
  // --- STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [swarmAgents, setSwarmAgents] = useState<SwarmAgent[]>(DEFAULT_AGENTS);
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration>(DEFAULT_CONFIG);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(AVAILABLE_MODELS[0]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // New States for "Living OS"
  const [isOmniBarOpen, setIsOmniBarOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  const [agentState, setAgentState] = useState<AgentState>({
    isActive: false, currentAgent: null, currentAction: '', tasks: [], logs: [], 
    knowledgeBase: [], activeSwarm: DEFAULT_AGENTS, evolutionLevel: 1, emotion: 'idle',
    activeBrowserUrl: 'https://duckduckgo.com'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleUpdateConfig = (newConfig: SystemConfiguration) => {
      setSystemConfig(newConfig);
      BrowserFS.saveSystemConfig(newConfig); 
  };

  // --- WINDOW MANAGER STATE (Optimized for V9.0 Dashboard) ---
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>({
      terminal: { 
          id: 'terminal', isOpen: true, isMinimized: false, zIndex: 10, title: 'NEURAL_TERMINAL_V9', 
          icon: <IconCode />, defaultPos: getLayout('terminal'), defaultSize: { width: getLayout('terminal').width, height: getLayout('terminal').height }
      },
      browser: {
          id: 'browser', isOpen: true, isMinimized: false, zIndex: 5, title: 'QUANT_BROWSER',
          icon: <IconBrowser />, defaultPos: getLayout('browser'), defaultSize: { width: getLayout('browser').width, height: getLayout('browser').height }
      },
      trading_terminal: {
          id: 'trading_terminal', isOpen: false, isMinimized: false, zIndex: 3, title: 'INSTITUTIONAL_EXECUTION',
          icon: <IconTerminal />, defaultPos: { x: 100, y: 100 }, defaultSize: { width: 1000, height: 700 }
      },
      portfolio: {
          id: 'portfolio', isOpen: true, isMinimized: false, zIndex: 6, title: 'ASSET_INVENTORY',
          icon: <IconBook />, defaultPos: getLayout('portfolio'), defaultSize: { width: getLayout('portfolio').width, height: getLayout('portfolio').height }
      },
      market: { 
          id: 'market', isOpen: true, isMinimized: false, zIndex: 7, title: 'GLOBAL_MARKET_TICKER',
          icon: <IconChart />, defaultPos: getLayout('market'), defaultSize: { width: getLayout('market').width, height: getLayout('market').height }
      },
      monitor: { 
          id: 'monitor', isOpen: true, isMinimized: false, zIndex: 8, title: 'SWARM_INTELLIGENCE',
          icon: <IconBot />, defaultPos: getLayout('monitor'), defaultSize: { width: getLayout('monitor').width, height: getLayout('monitor').height }
      },
      artifact: { 
          id: 'artifact', isOpen: false, isMinimized: false, zIndex: 4, title: 'RESEARCH_LAB',
          icon: <IconMaximize />, defaultPos: { x: 150, y: 80 }, defaultSize: { width: 800, height: 600 }
      },
      settings: { 
          id: 'settings', isOpen: false, isMinimized: false, zIndex: 5, title: 'SYSTEM_CONFIGURATION',
          icon: <IconSettings />, defaultPos: { x: 300, y: 200 }, defaultSize: { width: 600, height: 500 }
      },
      about: { 
          id: 'about', isOpen: false, isMinimized: false, zIndex: 6, title: 'OS_INFO',
          icon: <IconBrain />, defaultPos: { x: 400, y: 200 }, defaultSize: { width: 400, height: 350 }
      },
      docs: {
          id: 'docs', isOpen: false, isMinimized: false, zIndex: 7, title: 'SYSTEM_MANUAL',
          icon: <IconBook />, defaultPos: { x: 200, y: 150 }, defaultSize: { width: 500, height: 600 }
      }
  });

  // Re-sync layout on screen size change
  useEffect(() => {
    setWindows(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
            const id = key as WindowId;
            const layout = getLayout(id);
            if (layout) {
                next[id] = { 
                    ...next[id], 
                    defaultPos: layout, 
                    defaultSize: { width: layout.width, height: layout.height } 
                };
            }
        });
        return next;
    });
  }, [screenSize]);


  const [activeWindow, setActiveWindow] = useState<WindowId>('terminal');
  const [highestZ, setHighestZ] = useState(20);

  const focusWindow = (id: WindowId) => {
      const newZ = highestZ + 1;
      setHighestZ(newZ);
      setActiveWindow(id);
      setWindows(prev => ({ ...prev, [id]: { ...prev[id], zIndex: newZ, isMinimized: false, isOpen: true } }));
  };

  const toggleWindow = (id: WindowId) => {
      const w = windows[id];
      if (!w.isOpen || w.isMinimized) focusWindow(id);
      else setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: true } }));
  };

  const closeWindow = (id: WindowId) => setWindows(prev => ({ ...prev, [id]: { ...prev[id], isOpen: false } }));
  const minimizeWindow = (id: WindowId) => setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: true } }));

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const newNotif: SystemNotification = { id: Date.now().toString(), title, message, type, timestamp: Date.now() };
      setNotifications(prev => [newNotif, ...prev]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotif.id)), 5000);
  };

  // --- MESSAGING & AGENT CONTROL ---
  const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: MessageRole.USER, text: text, timestamp: Date.now(), attachments };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    try {
      const openWindowList = (Object.values(windows) as WindowState[])
        .filter((w) => w.isOpen && !w.isMinimized)
        .map((w) => w.id);
      
      const history = messages.filter(msg => !msg.error).map(msg => ({
          role: msg.role === MessageRole.MODEL ? 'model' : 'user', parts: [{ text: msg.text }]
      }));
      
        const agent = new AutonomousAgent(
            history, 
            swarmAgents, 
            (partial) => {
                setAgentState(prev => {
                    const ns = { ...prev, ...partial };
                    if (partial.logs) ns.logs = [...prev.logs, ...partial.logs];
                    if (partial.activeSwarm) setSwarmAgents(partial.activeSwarm);
                    return ns;
                });
            }, 
            selectedModel, 
            systemConfig,
            windows 
        );


      const response = await agent.run(text, attachments);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, text: response.text, timestamp: Date.now(), groundingSources: response.groundingSources }]);
      
      if (response.actions) {
          response.actions.forEach(action => {
              if (action.type === 'OPEN_WINDOW' && windows[action.payload as WindowId]) {
                  focusWindow(action.payload as WindowId);
                  addNotification('System Control', `Opening ${action.payload}...`, 'success');
              }
              if (action.type === 'SYSTEM_NOTIFY') {
                  addNotification('Alpha Prime Alert', action.payload, 'warning');
              }
              if (action.type === 'NAVIGATE_BROWSER') {
                  setAgentState(prev => ({ ...prev, activeBrowserUrl: action.payload }));
                  setWindows(prev => ({
                      ...prev,
                      browser: { ...prev.browser, isOpen: true, isMinimized: false, zIndex: highestZ + 1 }
                  }));
                  setHighestZ(prev => prev + 1);
                  addNotification('Neural Browser', `Navigating to ${action.payload}...`, 'info');
              }
          });
      }

    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, text: `Error: ${error.message}`, error: true, timestamp: Date.now() }]);
    } finally { setIsLoading(false); }
  };

  return (
      <div className="h-screen w-screen relative overflow-hidden bg-[#020205]">
        
        {/* BACKGROUND EFFECTS - MESH GRADIENT */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

        {/* SYSTEM LAYERS */}
        <SystemUpdater currentVersion="9.0.0" />
        <OmniBar isOpen={isOmniBarOpen} onClose={() => setIsOmniBarOpen(false)} onCommand={(cmd) => handleSendMessage(cmd)} />

        {/* Notifications Toast Container */}
        <div className="fixed top-12 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {notifications.map(notif => (
                <div key={notif.id} className="pointer-events-auto glass-panel p-4 rounded-2xl animate-in slide-in-from-right-10 w-72 flex flex-col gap-1 overflow-hidden">
                    <div className="flex items-center gap-2 relative z-10">
                      <div className={`w-2 h-2 rounded-full ${notif.type === 'success' ? 'bg-emerald-500' : notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <h4 className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest">{notif.title}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium leading-relaxed relative z-10">{notif.message}</p>
                </div>
            ))}
        </div>

      {/* Top Menu Bar (Global Header) */}
      <div className="fixed top-0 left-0 w-full h-10 menu-bar-glass flex items-center justify-between px-6 z-[9999] select-none text-[11px] font-bold text-zinc-400 tracking-tight">
          <div className="flex items-center gap-6">
              <span className="flex items-center gap-3 cursor-pointer text-zinc-100 hover:text-[var(--accent-primary)] transition-colors" onClick={() => toggleWindow('about')}>
                   <IconLogo className="w-6 h-6" /> 
                   <span className="tracking-tighter">QUANT_NANGGROE_OS <span className="text-[var(--accent-primary)] font-mono">v9.0</span></span>
              </span>
              
              <div className="h-4 w-[1px] bg-white/10 mx-2"></div>

              {/* LIVE TICKER */}
              <div className="flex items-center gap-6 overflow-hidden max-w-2xl whitespace-nowrap mask-linear-r">
                  <div className="flex gap-6 animate-marquee">
                      <span className="flex items-center gap-2">BTC <span className="text-emerald-500">$98,452 (+2.4%)</span></span>
                      <span className="flex items-center gap-2">ETH <span className="text-emerald-500">$3,842 (+1.8%)</span></span>
                      <span className="flex items-center gap-2">GOLD <span className="text-amber-500">$2,684 (-0.2%)</span></span>
                      <span className="flex items-center gap-2">DXY <span className="text-red-500">102.4 (-0.1%)</span></span>
                      <span className="flex items-center gap-2">SOL <span className="text-emerald-500">$245 (+5.2%)</span></span>
                  </div>
              </div>
          </div>
          
          <div className="flex items-center gap-6">
               <button onClick={() => setIsOmniBarOpen(true)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1 rounded-lg transition-all group">
                   <span className="text-[9px] bg-white/10 px-1.5 rounded font-mono text-zinc-500 group-hover:text-zinc-100">CTRL+K</span>
                   <span className="text-zinc-300">SEARCH_OMNI</span>
               </button>
               <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="uppercase tracking-widest text-[9px]">Neural_Link_Active</span>
               </span>
               <span className="font-mono text-zinc-100">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
          </div>
      </div>

      {/* --- WINDOWS --- */}
      
      <WindowFrame
        title="NEURAL_TERMINAL_V9"
        icon={<IconCode />}
        isOpen={windows.terminal.isOpen}
        isMinimized={windows.terminal.isMinimized}
        isActive={activeWindow === 'terminal'}
        zIndex={windows.terminal.zIndex}
        onClose={() => closeWindow('terminal')}
        onMinimize={() => minimizeWindow('terminal')}
        onFocus={() => focusWindow('terminal')}
        defaultPosition={windows.terminal.defaultPos}
        defaultSize={windows.terminal.defaultSize}
      >
        <div className="flex flex-col h-full bg-[#09090b]/40">
            {/* Toolbar inside window */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <Avatar state={agentState.emotion} size={32} />
                    <div>
                        <div className="text-[10px] font-black text-zinc-100 uppercase tracking-tighter">Alpha_Prime_Node</div>
                        <div className="text-[9px] font-mono text-[var(--accent-primary)]">{selectedModel.name.toUpperCase()}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-black border border-white/5">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase">Swarm:</span>
                        <span className="text-[9px] font-bold text-emerald-500">5/5_READY</span>
                    </div>
                    <select 
                        value={selectedModel.id}
                        onChange={(e) => setSelectedModel(AVAILABLE_MODELS.find(m => m.id === e.target.value) || AVAILABLE_MODELS[0])}
                        className="bg-zinc-900 border border-white/10 text-[9px] font-bold text-zinc-300 rounded-md px-3 py-1 focus:outline-none hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        {AVAILABLE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {messages.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-32 h-32 mb-8 relative group">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl group-hover:bg-emerald-500/40 transition-all duration-1000"></div>
                            <IconLogo className="w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] relative z-10" />
                        </div>
                        <h2 className="text-3xl font-black text-zinc-100 tracking-tighter uppercase mb-2">Quant Nanggroe AI</h2>
                        <div className="px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-8">
                            Institutional Execution v9.0
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                            <button onClick={() => handleSendMessage("/scan BTCUSD")} className="group flex flex-col items-start gap-1 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-800/80 hover:border-emerald-500/50 transition-all text-left">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">/scan</span>
                                <span className="text-xs font-bold text-zinc-100">Analyze Market Structure</span>
                                <span className="text-[9px] text-zinc-500 mt-1">Deep analysis of PA, Liquidity, and VWAP</span>
                            </button>
                            <button onClick={() => handleSendMessage("Check recent news impact on Gold.")} className="group flex flex-col items-start gap-1 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-800/80 hover:border-blue-500/50 transition-all text-left">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">/news</span>
                                <span className="text-xs font-bold text-zinc-100">Sentiment Intelligence</span>
                                <span className="text-[9px] text-zinc-500 mt-1">Global macro scraping & impact score</span>
                            </button>
                        </div>
                     </div>
                ) : (
                    <div className="space-y-8">
                        {messages.map((msg) => <ChatMessageComponent key={msg.id} message={msg} />)}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>
            <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </WindowFrame>

      {/* OTHER WINDOWS (Updated to reflect V9.0 labels) */}
      
      <WindowFrame
        title="QUANT_BROWSER"
        icon={<IconBrowser />}
        isOpen={windows.browser.isOpen}
        isMinimized={windows.browser.isMinimized}
        isActive={activeWindow === 'browser'}
        zIndex={windows.browser.zIndex}
        onClose={() => closeWindow('browser')}
        onMinimize={() => minimizeWindow('browser')}
        onFocus={() => focusWindow('browser')}
        defaultPosition={windows.browser.defaultPos}
        defaultSize={windows.browser.defaultSize}
      >
        <BrowserWindow 
            url={agentState.activeBrowserUrl} 
            onNavigate={(url) => setAgentState(prev => ({ ...prev, activeBrowserUrl: url }))}
        />
      </WindowFrame>

      <WindowFrame
        title="INSTITUTIONAL_EXECUTION"
        icon={<IconTerminal />}
        isOpen={windows.trading_terminal.isOpen}
        isMinimized={windows.trading_terminal.isMinimized}
        isActive={activeWindow === 'trading_terminal'}
        zIndex={windows.trading_terminal.zIndex}
        onClose={() => closeWindow('trading_terminal')}
        onMinimize={() => minimizeWindow('trading_terminal')}
        onFocus={() => focusWindow('trading_terminal')}
        defaultPosition={windows.trading_terminal.defaultPos}
        defaultSize={windows.trading_terminal.defaultSize}
      >
        <TradingTerminalWindow />
      </WindowFrame>

      <WindowFrame
        title="GLOBAL_MARKET_TICKER"
        icon={<IconChart />}
        isOpen={windows.market.isOpen}
        isMinimized={windows.market.isMinimized}
        isActive={activeWindow === 'market'}
        zIndex={windows.market.zIndex}
        onClose={() => closeWindow('market')}
        onMinimize={() => minimizeWindow('market')}
        onFocus={() => focusWindow('market')}
        defaultPosition={windows.market.defaultPos}
        defaultSize={windows.market.defaultSize}
      >
        <MarketWindow />
      </WindowFrame>

      <WindowFrame
        title="ASSET_INVENTORY"
        icon={<IconBook />}
        isOpen={windows.portfolio.isOpen}
        isMinimized={windows.portfolio.isMinimized}
        isActive={activeWindow === 'portfolio'}
        zIndex={windows.portfolio.zIndex}
        onClose={() => closeWindow('portfolio')}
        onMinimize={() => minimizeWindow('portfolio')}
        onFocus={() => focusWindow('portfolio')}
        defaultPosition={windows.portfolio.defaultPos}
        defaultSize={windows.portfolio.defaultSize}
      >
        <PortfolioWindow />
      </WindowFrame>

      <WindowFrame
        title="SWARM_INTELLIGENCE_MONITOR"
        icon={<IconBot />}
        isOpen={windows.monitor.isOpen}
        isMinimized={windows.monitor.isMinimized}
        isActive={activeWindow === 'monitor'}
        zIndex={windows.monitor.zIndex}
        onClose={() => closeWindow('monitor')}
        onMinimize={() => minimizeWindow('monitor')}
        onFocus={() => focusWindow('monitor')}
        defaultPosition={windows.monitor.defaultPos}
        defaultSize={windows.monitor.defaultSize}
      >
        <AgentHud state={agentState} agents={swarmAgents} />
      </WindowFrame>

      <WindowFrame
        title="SYSTEM_CONFIGURATION"
        icon={<IconSettings />}
        isOpen={windows.settings.isOpen}
        isMinimized={windows.settings.isMinimized}
        isActive={activeWindow === 'settings'}
        zIndex={windows.settings.zIndex}
        onClose={() => closeWindow('settings')}
        onMinimize={() => minimizeWindow('settings')}
        onFocus={() => focusWindow('settings')}
        defaultPosition={windows.settings.defaultPos}
        defaultSize={windows.settings.defaultSize}
      >
         <SwarmConfigModal agents={swarmAgents} config={systemConfig} onUpdateAgents={setSwarmAgents} onUpdateConfig={handleUpdateConfig} />
      </WindowFrame>

      <WindowFrame
        title="OS_INFORMATION"
        icon={<IconBrain />}
        isOpen={windows.about.isOpen}
        isMinimized={windows.about.isMinimized}
        isActive={activeWindow === 'about'}
        zIndex={windows.about.zIndex}
        onClose={() => closeWindow('about')}
        onMinimize={() => minimizeWindow('about')}
        onFocus={() => focusWindow('about')}
        defaultPosition={windows.about.defaultPos}
        defaultSize={windows.about.defaultSize}
      >
         <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#09090b]">
             <div className="w-40 h-40 mb-6 relative group">
                 <div className="absolute inset-0 bg-emerald-500/20 blur-3xl animate-pulse"></div>
                 <IconLogo className="w-full h-full drop-shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-1000" />
             </div>
             <h2 className="text-2xl font-black text-zinc-100 tracking-tighter uppercase">Quant Nanggroe AI</h2>
             <div className="text-[10px] font-mono text-emerald-500 mb-6 uppercase tracking-widest">Autonomous Trading OS v9.0</div>
             
             <div className="w-full max-w-sm p-5 bg-zinc-900/50 backdrop-blur-3xl rounded-2xl border border-white/5 shadow-2xl text-left space-y-4">
                 <div className="flex justify-between items-start">
                     <div>
                         <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Lead Engineer</span>
                         <div className="text-sm font-bold text-zinc-100">MULKY MALIKUL DHAHER</div>
                     </div>
                     <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-500 uppercase">Founder</div>
                 </div>
                 
                 <div className="h-[1px] bg-white/5"></div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500">Status</span>
                        <span className="text-emerald-500 font-bold uppercase tracking-widest">Operational</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500">Kernel</span>
                        <span className="text-zinc-100 font-mono">Nanggroe_v9.0_A1</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500">Swarm Node</span>
                        <span className="text-zinc-100 font-mono">5x Decentralized</span>
                    </div>
                 </div>

                 <div className="pt-2 flex flex-wrap gap-2">
                     <a href="https://github.com/mulkymalikuldhrs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg text-[9px] transition-all font-bold text-zinc-300">
                         GITHUB
                     </a>
                     <a href="https://instagram.com/mulkymalikuldhr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg text-[9px] transition-all font-bold text-zinc-300">
                         INSTAGRAM
                     </a>
                 </div>
             </div>
         </div>
      </WindowFrame>

      {/* DOCK */}
      <Taskbar 
        windows={{
            terminal: { isOpen: windows.terminal.isOpen, isMinimized: windows.terminal.isMinimized, isActive: activeWindow === 'terminal' },
            browser: { isOpen: windows.browser.isOpen, isMinimized: windows.browser.isMinimized, isActive: activeWindow === 'browser' },
            trading_terminal: { isOpen: windows.trading_terminal.isOpen, isMinimized: windows.trading_terminal.isMinimized, isActive: activeWindow === 'trading_terminal' },
            portfolio: { isOpen: windows.portfolio.isOpen, isMinimized: windows.portfolio.isMinimized, isActive: activeWindow === 'portfolio' },
            market: { isOpen: windows.market.isOpen, isMinimized: windows.market.isMinimized, isActive: activeWindow === 'market' },
            monitor: { isOpen: windows.monitor.isOpen, isMinimized: windows.monitor.isMinimized, isActive: activeWindow === 'monitor' },
            artifact: { isOpen: windows.artifact.isOpen, isMinimized: windows.artifact.isMinimized, isActive: activeWindow === 'artifact' },
            settings: { isOpen: windows.settings.isOpen, isMinimized: windows.settings.isMinimized, isActive: activeWindow === 'settings' },
            docs: { isOpen: windows.docs.isOpen, isMinimized: windows.docs.isMinimized, isActive: activeWindow === 'docs' }
        }}
        onToggleWindow={toggleWindow}
        onStartClick={() => toggleWindow('about')}
      />
    </div>
  );
};

export default App;
