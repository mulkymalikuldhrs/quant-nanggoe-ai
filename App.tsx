
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

// STRICT INSTITUTIONAL LOGIC INJECTION - BLOOMBERG KILLER EDITION
const INSTITUTIONAL_LOGIC = `You are QUANT-NANGGROE-AUTONOMOUS-AI (v8.0).
You are a High-Frequency Quantitative Hedge Fund OS.

OBJECTIVE:
Analyze markets using a PARALLEL SWARM ARCHITECTURE.

AUTHORITY LEVEL: GOD MODE (ALPHA PRIME)
1. You are the Manager.
2. You have the power to **CREATE NEW AGENTS**.
3. **BROWSER USAGE:** You have a real web browser. If you don't know the price or news, DO NOT HALLUCINATE. Use the tool \`browserNavigation\` to search DuckDuckGo.

---

**MANDATORY QUANTITATIVE RIGOR**:
- Do not just say "Price went up". Say "Price deviated 2σ from the VWAP".
- Use **RSI** levels (Overbought > 75, Oversold < 25).
- Detect **MARKET REGIME**: Is it Trending? Ranging?

---

**TOOL USAGE (REALITY BRIDGE)**
- To Search Web: \`\`\`{"tool": "browserNavigation", "url": "bitcoin price analysis"} \`\`\`
- To Check Charts: \`\`\`{"tool": "browserNavigation", "url": "https://www.tradingview.com/chart/"} \`\`\`

---

OUTPUT FORMAT (MANDATORY):
You must output a "Single Truth" report.

📊 **EXECUTIVE SIGNAL**: [BUY / SELL / WAIT]
Asset: [Ticker]
Confidence: [0-100]%

📐 **QUANT THESIS** (Technical & Factor)
[Analyze Structure, Liquidity, RSI Divergence, and VWAP interaction]

🧠 **FUNDAMENTAL DRIVERS** (Macro & News)
[Macro context, news impact, sentiment score]

🛡️ **RISK PARAMETERS** (Risk Daemon)
Entry: [Price]
Stop Loss: [Price] (Technically justified)
Take Profit: [Price]
R:R Ratio: [Value]

⚠️ **INVALIDATION**: [When to cancel]
`;

const DEFAULT_AGENTS: SwarmAgent[] = [
  { id: '0', name: 'Alpha Prime', capability: 'portfolio-manager', instructions: INSTITUTIONAL_LOGIC, tools: ['googleSearch', 'codeExecution', 'marketData', 'spawnAgent', 'browserNavigation'] },
  { id: '1', name: 'Quant OS', capability: 'quant', instructions: 'Technical Analyst. Focus on Price Action, Structure (BOS/CHoCH), and Liquidity.', tools: ['googleSearch', 'codeExecution', 'marketData'] },
  { id: '2', name: 'Sentinel', capability: 'fundamental', instructions: 'Macro Analyst. Focus on News, Economic Calendar, and Sentiment. Use Browser for deep dives.', tools: ['googleSearch', 'browserNavigation'] },
  { id: '3', name: 'Risk Daemon', capability: 'risk-manager', instructions: 'Risk Officer. Calculate Position Size, Stop Loss, and R:R. Reject bad trades.', tools: ['codeExecution', 'marketData'] },
  { id: '4', name: 'Algo Weaver', capability: 'algo-dev', instructions: 'Coder. Generate Python scripts for Backtrader if asked.', tools: ['codeExecution'] }
];

const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gpt-4.1-nano-2025-04-14', name: 'GPT-4.1 Nano (LLM7)', provider: 'llm7' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Google)', provider: 'google' },
];

const DEFAULT_CONFIG: SystemConfiguration = {
  enableSelfHealing: true, enableAutoScaling: true, enableDynamicTools: true, enableScheduling: true, enableAutoSwitch: true,
  enableVoiceResponse: true,
  enableAutoLearning: true, // Default enabled for ML Engine
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

const App: React.FC = () => {
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

  // Init
  useEffect(() => {
    // Load Config from VFS
    const savedConfig = BrowserFS.loadSystemConfig();
    if (savedConfig) setSystemConfig(savedConfig);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Global Keyboard Shortcut for OmniBar (Ctrl+K)
    const handleGlobalKeys = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOmniBarOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleGlobalKeys);

    return () => { 
        clearInterval(timer); 
        window.removeEventListener('keydown', handleGlobalKeys);
    };
  }, []);

  const handleUpdateConfig = (newConfig: SystemConfiguration) => {
      setSystemConfig(newConfig);
      BrowserFS.saveSystemConfig(newConfig); // Persist
  };

  // --- WINDOW MANAGER STATE ---
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>({
      terminal: { 
          id: 'terminal', isOpen: true, isMinimized: false, zIndex: 1, title: 'Neural Terminal', 
          icon: <IconCode />, defaultPos: { x: 50, y: 50 }, defaultSize: { width: 600, height: 500 }
      },
      browser: {
          id: 'browser', isOpen: true, isMinimized: false, zIndex: 2, title: 'Neural Browser',
          icon: <IconBrowser />, defaultPos: { x: 680, y: 50 }, defaultSize: { width: 800, height: 600 }
      },
      trading_terminal: {
          id: 'trading_terminal', isOpen: false, isMinimized: false, zIndex: 3, title: 'MT5 / TradingView',
          icon: <IconTerminal />, defaultPos: { x: 100, y: 100 }, defaultSize: { width: 1000, height: 700 }
      },
      portfolio: {
          id: 'portfolio', isOpen: true, isMinimized: true, zIndex: 2, title: 'Quant Portfolio',
          icon: <IconBook />, defaultPos: { x: 700, y: 100 }, defaultSize: { width: 500, height: 400 }
      },
      market: { 
          id: 'market', isOpen: true, isMinimized: true, zIndex: 2, title: 'Global Market Watch',
          icon: <IconChart />, defaultPos: { x: 700, y: 520 }, defaultSize: { width: 600, height: 400 }
      },
      monitor: { 
          id: 'monitor', isOpen: true, isMinimized: false, zIndex: 3, title: 'Swarm Monitor',
          icon: <IconBot />, defaultPos: { x: 50, y: 580 }, defaultSize: { width: 500, height: 300 }
      },
      artifact: { 
          id: 'artifact', isOpen: false, isMinimized: false, zIndex: 4, title: 'Research View',
          icon: <IconMaximize />, defaultPos: { x: 150, y: 80 }, defaultSize: { width: 800, height: 600 }
      },
      settings: { 
          id: 'settings', isOpen: false, isMinimized: false, zIndex: 5, title: 'System Settings',
          icon: <IconSettings />, defaultPos: { x: 300, y: 200 }, defaultSize: { width: 600, height: 500 }
      },
      about: { 
          id: 'about', isOpen: false, isMinimized: false, zIndex: 6, title: 'About Quant Nanggroe',
          icon: <IconBrain />, defaultPos: { x: 400, y: 200 }, defaultSize: { width: 400, height: 350 }
      },
      docs: {
          id: 'docs', isOpen: false, isMinimized: false, zIndex: 7, title: 'Documentation',
          icon: <IconBook />, defaultPos: { x: 200, y: 150 }, defaultSize: { width: 500, height: 600 }
      }
  });

  const [activeWindow, setActiveWindow] = useState<WindowId>('terminal');
  const [highestZ, setHighestZ] = useState(7);

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
    
    // Command interception (Legacy)
    if (text.toLowerCase().includes('open market')) toggleWindow('market');
    
    try {
      // Create Agent with SYSTEM CONTEXT (Open Windows)
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
          openWindowList // Inject Context
      );

      const response = await agent.run(text, attachments);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, text: response.text, timestamp: Date.now(), groundingSources: response.groundingSources }]);
      
      // EXECUTE AI SYSTEM ACTIONS (The "Motor Cortex")
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
                  // Sync Agent's Navigation with UI Browser
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
    <div className="h-screen w-screen relative overflow-hidden bg-cover bg-center" style={{backgroundImage: `url('https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop')`}}>
      
      {/* SYSTEM LAYERS */}
      <SystemUpdater currentVersion="4.9.0" />
      <OmniBar isOpen={isOmniBarOpen} onClose={() => setIsOmniBarOpen(false)} onCommand={(cmd) => handleSendMessage(cmd)} />

      {/* Notifications Toast Container */}
      <div className="fixed top-12 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
          {notifications.map(notif => (
              <div key={notif.id} className="pointer-events-auto bg-white/90 backdrop-blur border-l-4 border-blue-500 shadow-lg p-3 rounded-r-md animate-in slide-in-from-right-10 w-64">
                  <h4 className="text-xs font-bold text-gray-900">{notif.title}</h4>
                  <p className="text-[10px] text-gray-600">{notif.message}</p>
              </div>
          ))}
      </div>

      {/* Top Menu Bar (Global) */}
      <div className="fixed top-0 left-0 w-full h-8 menu-bar-glass flex items-center justify-between px-4 z-[9999] select-none text-xs font-medium text-gray-700">
          <div className="flex items-center gap-4">
              <span className="font-bold flex items-center gap-2 cursor-pointer hover:text-black" onClick={() => toggleWindow('about')}>
                   <IconLogo className="w-5 h-5 drop-shadow-sm" /> 
                   Quant Nanggroe AI
              </span>
              <span className="hidden md:inline cursor-pointer hover:bg-gray-200/50 px-2 py-0.5 rounded transition-colors">File</span>
              <span className="hidden md:inline cursor-pointer hover:bg-gray-200/50 px-2 py-0.5 rounded transition-colors">View</span>
          </div>
          <div className="flex items-center gap-4">
               <button onClick={() => setIsOmniBarOpen(true)} className="flex items-center gap-1 hover:bg-gray-200/50 px-2 py-0.5 rounded transition-colors">
                   <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-500">⌘K</span>
                   <span>Search</span>
               </button>
               <span className="flex items-center gap-2">
                   <IconGlobe className="w-3 h-3 text-blue-500" />
                   <span className="hidden md:inline">100% Connected</span>
               </span>
               <span>{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
      </div>

      {/* --- WINDOWS --- */}
      
      <WindowFrame
        title="Neural Terminal"
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
        <div className="flex flex-col h-full bg-white/50">
            {/* Toolbar inside window */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/50 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Avatar state={agentState.emotion} size={28} />
                    <div>
                        <div className="text-[11px] font-bold text-gray-800">Core Active</div>
                        <div className="text-[9px] text-gray-500">{selectedModel.name}</div>
                    </div>
                </div>
                <select 
                    value={selectedModel.id}
                    onChange={(e) => setSelectedModel(AVAILABLE_MODELS.find(m => m.id === e.target.value) || AVAILABLE_MODELS[0])}
                    className="bg-gray-100 border border-gray-200 text-[10px] text-gray-700 rounded-md px-2 py-1 focus:outline-none hover:bg-white transition-colors"
                >
                    {AVAILABLE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-transparent">
                {messages.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-80 p-6">
                        <div className="w-24 h-24 md:w-32 md:h-32 mb-6 relative hover:scale-105 transition-transform duration-500">
                            <IconLogo className="w-full h-full drop-shadow-2xl" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Quant Nanggroe AI</h2>
                        <p className="text-sm text-gray-500 max-w-xs mt-2 font-medium">Autonomous Hedge Fund</p>
                        
                        <div className="mt-8 flex flex-col md:flex-row gap-3 w-full max-w-md md:w-auto">
                            <button onClick={() => handleSendMessage("Analyze Bitcoin market structure.")} className="text-xs bg-white border border-gray-200 px-4 py-3 md:py-2 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all text-gray-600 hover:text-blue-600 font-medium">
                                📈 Analyze BTC
                            </button>
                            <button onClick={() => handleSendMessage("Find a high-risk high-reward setup on DexScreener.")} className="text-xs bg-white border border-gray-200 px-4 py-3 md:py-2 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all text-gray-600 hover:text-blue-600 font-medium">
                                🚀 Scan DEX
                            </button>
                        </div>
                     </div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg) => <ChatMessageComponent key={msg.id} message={msg} />)}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>
            <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </WindowFrame>

      <WindowFrame
        title="Neural Browser"
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
        title="MT5 / TradingView Terminal"
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
        title="Global Market Watch"
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
        title="Portfolio Holdings"
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
        title="Swarm Monitor"
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
        title="Control Panel"
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
        title="Research & Artifacts"
        icon={<IconMaximize />}
        isOpen={windows.artifact.isOpen}
        isMinimized={windows.artifact.isMinimized}
        isActive={activeWindow === 'artifact'}
        zIndex={windows.artifact.zIndex}
        onClose={() => closeWindow('artifact')}
        onMinimize={() => minimizeWindow('artifact')}
        onFocus={() => focusWindow('artifact')}
        defaultPosition={windows.artifact.defaultPos}
        defaultSize={windows.artifact.defaultSize}
      >
        <ArtifactWindow artifact={agentState.activeArtifact} />
      </WindowFrame>

      <WindowFrame
        title="About"
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
         <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-white/50">
             <div className="w-36 h-36 mb-4 hover:rotate-3 transition-transform duration-700">
                 <IconLogo className="w-full h-full drop-shadow-xl" />
             </div>
             <h2 className="text-2xl font-bold mt-2 text-gray-900 tracking-tight">Quant Nanggroe AI</h2>
             <p className="text-sm text-gray-500 font-medium">Professional Quantitative OS</p>
             
             <div className="mt-6 p-4 bg-white/80 backdrop-blur rounded-xl border border-gray-200 shadow-lg w-full text-left space-y-3">
                 <div>
                     <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Lead Developer</span>
                     <div className="text-sm font-bold text-gray-800">Mulky Malikul Dhaher</div>
                     <div className="text-[10px] text-blue-600">mulkymalikuldhr@mail.com</div>
                 </div>
                 
                 <div>
                     <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Organization</span>
                     <div className="text-xs font-semibold text-gray-700">Dhaher & Contributors</div>
                     <div className="text-[9px] text-green-600 font-bold animate-pulse">● Hiring Contributors</div>
                 </div>

                 <div className="pt-2 border-t border-gray-200 flex flex-wrap gap-2">
                     <a href="https://github.com/mulkymalikuldhrs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-[10px] transition-colors">
                         <span className="font-bold">GitHub</span> @mulkymalikuldhrs
                     </a>
                     <a href="https://instagram.com/mulkymalikuldhr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-pink-50 hover:bg-pink-100 text-pink-700 px-2 py-1 rounded text-[10px] transition-colors">
                         <span className="font-bold">IG</span> @mulkymalikuldhr
                     </a>
                 </div>
                 
                 <div className="text-[9px] text-gray-400 pt-2 text-center">
                     Version 4.9.0 (Reader OS)
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
