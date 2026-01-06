
import React, { useState, useEffect, useRef } from 'react';
import { AutonomousAgent } from './services/gemini'; 
import { ChatMessage, MessageRole, AgentState, SwarmAgent, ModelOption, Attachment, SystemConfiguration, SystemAction, SystemNotification } from './types';
import { BrowserFS } from './services/file_system';
import { MemoryManager } from './services/memory_manager';
import ChatMessageComponent from './components/ChatMessage';
import InputArea from './components/InputArea';
import AgentHud from './components/AgentHud';
import ArtifactWindow from './components/ArtifactWindow';
import PortfolioWindow from './components/PortfolioWindow';
import MarketWindow from './components/MarketWindow'; 
import BrowserWindow from './components/BrowserWindow';
import TradingTerminalWindow from './components/TradingTerminalWindow';
import SwarmConfigModal from './components/SwarmConfigModal';
import { SystemArchitecture } from './components/SystemArchitecture';
import Avatar from './components/Avatar';
import WindowFrame from './components/WindowFrame';
import Taskbar from './components/Taskbar';
import OmniBar from './components/OmniBar'; 
import SystemUpdater from './components/SystemUpdater';
import { IconCode, IconBot, IconSettings, IconBrain, IconBook, IconMaximize, IconGlobe, IconLogo, IconChart, IconBrowser, IconTerminal, IconSearch, IconSun, IconMoon } from './components/Icons';
import { useAdaptiveLayout } from './services/adaptive_layout';

// --- THEME CONTEXT ---
export const ThemeContext = React.createContext<{ theme: 'light' | 'dark', toggleTheme: () => void }>({ theme: 'light', toggleTheme: () => {} });

const INSTITUTIONAL_LOGIC = `You are QUANT-NANGGROE-OS (v10.0) - THE BLOOMBERG KILLER (WHITE SUR EDITION).

CORE MISSION:
- NEURAL SWARM PARALLELISM: Coordinate 5 specialized agents (Alpha Prime, Quant-Scanner, News-Sentinel, Risk-Guardian, Strategy-Weaver) to dominate global markets.
- AUTONOMOUS ACTION: Proactively manage windows, browse research, and execute strategies.
- TRUTH ORIENTATION: Use real-time data from Polygon, AlphaVantage, Finnhub, and DEX tools.
- MAC SUR ESTHETICS: Maintain a beautiful, functional, and fast workspace.

AGENT SPECIALIZATIONS:
1. Alpha Prime: Swarm Coordinator & Decision Maker.
2. Quant-Scanner: Technical, Algorithmic & On-chain Analysis.
3. News-Sentinel: Global Macro & Sentiment Analysis.
4. Risk-Guardian: Capital Preservation & Risk/Reward Optimization.
5. Strategy-Weaver: Python-based Backtesting & Live Implementation.
`;

const DEFAULT_AGENTS: SwarmAgent[] = [
  { id: '0', name: 'Alpha Prime', capability: 'portfolio-manager', instructions: INSTITUTIONAL_LOGIC, tools: ['googleSearch', 'codeExecution', 'marketData', 'spawnAgent', 'browserNavigation'] },
  { id: '1', name: 'Quant-Scanner', capability: 'quant', instructions: 'Technical & Algorithmic Specialist.', tools: ['googleSearch', 'codeExecution', 'marketData'] },
  { id: '2', name: 'News-Sentinel', capability: 'fundamental', instructions: 'Macro & Sentiment Specialist.', tools: ['googleSearch', 'browserNavigation'] },
  { id: '3', name: 'Risk-Guardian', capability: 'risk-manager', instructions: 'Risk & Capital Specialist.', tools: ['codeExecution', 'marketData'] },
  { id: '4', name: 'Strategy-Weaver', capability: 'algo-dev', instructions: 'Python & Strategy Specialist.', tools: ['codeExecution'] }
];

const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gemini-2.0-flash-exp', name: 'Nanggroe Flash 10.0', provider: 'google' },
  { id: 'gemini-1.5-pro', name: 'Nanggroe Pro 10.0', provider: 'google' },
];

const DEFAULT_CONFIG: SystemConfiguration = {
  enableSelfHealing: true, enableAutoScaling: true, enableDynamicTools: true, enableScheduling: true, enableAutoSwitch: true,
  enableVoiceResponse: true, enableAutoLearning: true, 
  apiKeys: { google: '', groq: '', openai: '', huggingface: '', llm7: '', alphaVantage: '', finnhub: '', fred: '', polygon: '' }
};

type WindowId = 'terminal' | 'monitor' | 'settings' | 'about' | 'docs' | 'artifact' | 'portfolio' | 'market' | 'browser' | 'trading_terminal' | 'architecture';

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
    const { screenSize, getLayout } = useAdaptiveLayout();
    
    // --- THEME STATE (v10.0 White Sur Default) ---
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('system-theme');
        return (saved as 'light' | 'dark') || 'light';
    });

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('system-theme', next);
    };

    // --- STATE ---
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [swarmAgents, setSwarmAgents] = useState<SwarmAgent[]>(DEFAULT_AGENTS);
    const [systemConfig, setSystemConfig] = useState<SystemConfiguration>(DEFAULT_CONFIG);
    const [selectedModel, setSelectedModel] = useState<ModelOption>(AVAILABLE_MODELS[0]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isOmniBarOpen, setIsOmniBarOpen] = useState(false);
    const [notifications, setNotifications] = useState<SystemNotification[]>([]);
    const [agentState, setAgentState] = useState<AgentState>({
      isActive: false, currentAgent: null, currentAction: '', tasks: [], logs: [], 
      knowledgeBase: [], activeSwarm: DEFAULT_AGENTS, evolutionLevel: 10, emotion: 'focused',
      activeBrowserUrl: 'https://duckduckgo.com'
    });

    const [windows, setWindows] = useState<Record<WindowId, WindowState>>({
        terminal: { id: 'terminal', isOpen: true, isMinimized: false, zIndex: 10, title: 'NEURAL_TERMINAL_V10', icon: <IconCode />, defaultPos: getLayout('terminal'), defaultSize: { width: getLayout('terminal').width, height: getLayout('terminal').height } },
        browser: { id: 'browser', isOpen: true, isMinimized: false, zIndex: 5, title: 'QUANT_EXPLORER', icon: <IconBrowser />, defaultPos: getLayout('browser'), defaultSize: { width: getLayout('browser').width, height: getLayout('browser').height } },
        trading_terminal: { id: 'trading_terminal', isOpen: false, isMinimized: false, zIndex: 3, title: 'QUANT_EXECUTION', icon: <IconTerminal />, defaultPos: { x: 100, y: 100 }, defaultSize: { width: 1000, height: 700 } },
        portfolio: { id: 'portfolio', isOpen: true, isMinimized: false, zIndex: 6, title: 'ASSET_COMMANDER', icon: <IconBook />, defaultPos: getLayout('portfolio'), defaultSize: { width: getLayout('portfolio').width, height: getLayout('portfolio').height } },
        market: { id: 'market', isOpen: true, isMinimized: false, zIndex: 7, title: 'MARKET_RADAR', icon: <IconChart />, defaultPos: getLayout('market'), defaultSize: { width: getLayout('market').width, height: getLayout('market').height } },
        monitor: { id: 'monitor', isOpen: true, isMinimized: false, zIndex: 8, title: 'SWARM_MONITOR', icon: <IconBot />, defaultPos: getLayout('monitor'), defaultSize: { width: getLayout('monitor').width, height: getLayout('monitor').height } },
        architecture: { id: 'architecture', isOpen: false, isMinimized: false, zIndex: 9, title: 'NEURAL_ARCHITECTURE', icon: <IconBrain />, defaultPos: { x: 50, y: 50 }, defaultSize: { width: 900, height: 700 } },
        artifact: { id: 'artifact', isOpen: false, isMinimized: false, zIndex: 4, title: 'QUANT_LAB', icon: <IconMaximize />, defaultPos: { x: 150, y: 80 }, defaultSize: { width: 800, height: 600 } },
        settings: { id: 'settings', isOpen: false, isMinimized: false, zIndex: 5, title: 'CORE_CONFIG', icon: <IconSettings />, defaultPos: { x: 300, y: 200 }, defaultSize: { width: 600, height: 500 } },
        about: { id: 'about', isOpen: false, isMinimized: false, zIndex: 6, title: 'QUANT_NANGGROE_INFO', icon: <IconBrain />, defaultPos: { x: 400, y: 200 }, defaultSize: { width: 400, height: 400 } },
        docs: { id: 'docs', isOpen: false, isMinimized: false, zIndex: 7, title: 'SUR_MANUAL', icon: <IconBook />, defaultPos: { x: 200, y: 150 }, defaultSize: { width: 500, height: 600 } }
    });

    const [activeWindow, setActiveWindow] = useState<WindowId>('terminal');
    const [highestZ, setHighestZ] = useState(20);

    // Initial Load & Clock
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        const savedState = MemoryManager.loadSystemState();
        if (savedState) {
            if (savedState.messages) setMessages(savedState.messages);
            if (savedState.config) setSystemConfig(savedState.config);
        }
        return () => clearInterval(interval);
    }, []);

    // Auto-Save State
    useEffect(() => {
        MemoryManager.saveSystemState({ messages, config: systemConfig });
    }, [messages, systemConfig]);

    // Adaptive Layout Sync
    useEffect(() => {
      setWindows(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(key => {
              const id = key as WindowId;
              const layout = getLayout(id);
              if (layout) {
                  next[id] = { ...next[id], defaultPos: layout, defaultSize: { width: layout.width, height: layout.height } };
              }
          });
          return next;
      });
    }, [screenSize]);

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

    const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: MessageRole.USER, text, timestamp: Date.now(), attachments };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);
      
      try {
        const history = messages.map(msg => ({ role: msg.role === MessageRole.MODEL ? 'model' : 'user', parts: [{ text: msg.text }] }));
        const agent = new AutonomousAgent(history, swarmAgents, (partial) => {
            setAgentState(prev => {
                const ns = { ...prev, ...partial };
                if (partial.logs) ns.logs = [...prev.logs, ...partial.logs];
                if (partial.activeSwarm) setSwarmAgents(partial.activeSwarm);
                return ns;
            });
        }, selectedModel, systemConfig, Object.keys(windows).filter(id => windows[id as WindowId].isOpen && !windows[id as WindowId].isMinimized));

        const response = await agent.run(text, attachments);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, text: response.text, timestamp: Date.now(), groundingSources: response.groundingSources }]);
        
        if (response.actions) {
            response.actions.forEach(action => {
                if (action.type === 'OPEN_WINDOW' && windows[action.payload as WindowId]) focusWindow(action.payload as WindowId);
                if (action.type === 'NAVIGATE_BROWSER') {
                    setAgentState(prev => ({ ...prev, activeBrowserUrl: action.payload }));
                    focusWindow('browser');
                }
            });
        }
      } catch (error: any) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, text: `Error: ${error.message}`, error: true, timestamp: Date.now() }]);
      } finally { setIsLoading(false); }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div className={`h-screen w-screen relative overflow-hidden transition-all duration-700 ${theme === 'dark' ? 'bg-[#020205] text-white' : 'bg-[#f5f5f7] text-zinc-900'}`}>
            
            {/* V10.0 DYNAMIC BACKGROUND (WHITE SUR EDITION) */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {theme === 'dark' ? (
                    <>
                        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[150px] animate-pulse"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-900/20 blur-[150px] animate-pulse" style={{ animationDelay: '3s' }}></div>
                        <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay"></div>
                    </>
                ) : (
                    <>
                        <div className="absolute top-[-15%] left-[-15%] w-[70%] h-[70%] rounded-full bg-blue-400/30 blur-[180px]"></div>
                        <div className="absolute bottom-[-15%] right-[-15%] w-[70%] h-[70%] rounded-full bg-rose-300/20 blur-[180px]"></div>
                        <div className="absolute top-[20%] left-[30%] w-[50%] h-[50%] rounded-full bg-amber-200/20 blur-[150px]"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-white to-rose-50/50 opacity-40"></div>
                    </>
                )}
            </div>
            
              {/* WHITE SUR TOP BAR */}
              <div className={`fixed top-0 left-0 w-full h-8 backdrop-blur-[32px] border-b flex items-center justify-between px-5 z-[9999] select-none text-[12px] font-semibold transition-all duration-500 ${theme === 'dark' ? 'bg-black/40 border-white/5 text-white/90' : 'bg-white/70 border-black/5 text-zinc-800'}`}>
                  <div className="flex items-center gap-5">
                      <div className="flex items-center gap-2 cursor-pointer group px-2 py-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10" onClick={() => toggleWindow('about')}>
                          <IconLogo className="w-4 h-4 transition-transform group-active:scale-90" />
                          <span className="font-bold tracking-tight">Nanggroe v10.0</span>
                      </div>
                      
                      <nav className="flex items-center gap-4 opacity-80">
                          {['Market', 'Swarm', 'Terminal', 'Intelligence', 'Risk', 'System'].map(item => (
                              <span key={item} className="cursor-pointer px-2 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors hidden sm:block">{item}</span>
                          ))}
                      </nav>
                  </div>
                  
                  <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 transition-colors">
                           <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] ${theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                           <span className="text-[10px] font-bold tracking-wider opacity-80 uppercase">Autonomous Swarm Active</span>
                       </div>
                       
                         <div className="flex items-center gap-3">
                            {/* MAC-STYLE THEME SWITCH */}
                            <button 
                                onClick={toggleTheme} 
                                className={`relative w-10 h-5 rounded-full p-0.5 transition-all duration-500 ease-spring ${theme === 'dark' ? 'bg-zinc-800 border border-white/10' : 'bg-zinc-200 border border-black/5 shadow-inner'}`}
                                title="Switch Day/Night Mode"
                            >
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-500 ease-spring ${theme === 'dark' ? 'left-[22px] bg-zinc-100 shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'left-0.5 bg-white shadow-md'}`}>
                                    {theme === 'dark' ? <IconMoon className="w-2.5 h-2.5 text-zinc-900" /> : <IconSun className="w-2.5 h-2.5 text-amber-500" />}
                                </div>
                            </button>
                            
                            <button onClick={() => setIsOmniBarOpen(true)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all active:scale-90">
                                <IconSearch className="w-4 h-4 opacity-60" />
                            </button>

                          <div className="flex items-center gap-3 ml-2 font-mono text-[11px] tracking-tight">
                              <span className="hidden lg:inline opacity-60">{currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                              <span className="font-bold">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                       </div>
                  </div>
              </div>

            <SystemUpdater currentVersion="10.0.0" />
            <OmniBar isOpen={isOmniBarOpen} onClose={() => setIsOmniBarOpen(false)} onCommand={(cmd) => handleSendMessage(cmd)} />

            {/* SUR NOTIFICATIONS */}
            <div className="fixed top-12 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
                {notifications.map(notif => (
                    <div key={notif.id} className={`pointer-events-auto backdrop-blur-2xl p-4 rounded-2xl animate-in slide-in-from-right-10 w-72 shadow-2xl border transition-all ${theme === 'dark' ? 'bg-zinc-900/80 border-white/10' : 'bg-white/90 border-black/5'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-2 h-2 rounded-full ${notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">{notif.title}</h4>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed opacity-70">{notif.message}</p>
                    </div>
                ))}
            </div>

            {/* WHITE SUR WINDOWS */}
            {Object.values(windows).map(win => (
              <WindowFrame
                  key={win.id}
                  title={win.title}
                  icon={win.icon}
                  isOpen={win.isOpen}
                  isMinimized={win.isMinimized}
                  isActive={activeWindow === win.id}
                  zIndex={win.zIndex}
                  onClose={() => closeWindow(win.id)}
                  onMinimize={() => minimizeWindow(win.id)}
                  onFocus={() => focusWindow(win.id)}
                  defaultPosition={win.defaultPos}
                  defaultSize={win.defaultSize}
              >
                  {win.id === 'terminal' && (
                      <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-black/40' : 'bg-white/40'}`}>
                           <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                              {messages.length === 0 ? (
                                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                      <IconLogo className="w-32 h-32 mb-6" />
                                      <h2 className="text-3xl font-black uppercase tracking-tighter">Quant Nanggroe v10</h2>
                                      <p className="text-[11px] font-mono tracking-widest mt-2 uppercase">Neural Command Hub | White Sur Edition</p>
                                  </div>
                              ) : (
                                  <div className="space-y-8 max-w-4xl mx-auto">
                                      {messages.map(msg => <ChatMessageComponent key={msg.id} message={msg} />)}
                                  </div>
                              )}
                           </div>
                           <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
                      </div>
                  )}
                  {win.id === 'browser' && <BrowserWindow url={agentState.activeBrowserUrl} onNavigate={(url) => setAgentState(prev => ({ ...prev, activeBrowserUrl: url }))} />}
                  {win.id === 'trading_terminal' && <TradingTerminalWindow />}
                  {win.id === 'market' && <MarketWindow />}
                  {win.id === 'portfolio' && <PortfolioWindow />}
                  {win.id === 'monitor' && <AgentHud state={agentState} agents={swarmAgents} />}
                  {win.id === 'architecture' && <SystemArchitecture />}
                  {win.id === 'settings' && <SwarmConfigModal agents={swarmAgents} config={systemConfig} onUpdateAgents={setSwarmAgents} onUpdateConfig={(c) => { setSystemConfig(c); BrowserFS.saveSystemConfig(c); }} />}
                  {win.id === 'about' && (
                      <div className={`flex flex-col items-center justify-center h-full p-10 text-center transition-colors ${theme === 'dark' ? 'bg-black/60' : 'bg-white/60'}`}>
                          <div className="relative mb-8">
                                <IconLogo className="w-40 h-40 animate-pulse-slow" />
                                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">v10.0</div>
                          </div>
                          <h2 className="text-3xl font-black uppercase tracking-tighter">Quant Nanggroe AI</h2>
                          <div className="text-[10px] font-bold text-blue-500 mb-6 tracking-[0.3em] uppercase opacity-80">White Sur Edition</div>
                          <div className={`text-[12px] font-medium max-w-xs leading-relaxed opacity-60`}>The World's Most Advanced Autonomous Trading OS. Integrated Neural Swarm Architecture with institutional-grade logic.</div>
                          <div className="mt-10 flex gap-4">
                                <div className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-bold uppercase tracking-wider">Parallel Swarm</div>
                                <div className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-bold uppercase tracking-wider">Glass UI</div>
                          </div>
                      </div>
                  )}
              </WindowFrame>
            ))}

            {/* MAGNET DOCK (v10.0) */}
            <Taskbar windows={windows} onToggleWindow={toggleWindow} onStartClick={() => toggleWindow('about')} />
          </div>
        </ThemeContext.Provider>
    );
};

export default App;
