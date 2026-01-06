
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
import Launchpad from './components/Launchpad';
import ControlCenter from './components/ControlCenter';
import SystemUpdater from './components/SystemUpdater';
import { ResearchAgentWindow } from './components/ResearchAgentWindow';
import { KnowledgeBaseWindow } from './components/KnowledgeBaseWindow';
import { IconCode, IconBot, IconSettings, IconBrain, IconBook, IconMaximize, IconGlobe, IconLogo, IconChart, IconBrowser, IconTerminal, IconSearch, IconSun, IconMoon, IconDatabase } from './components/Icons';
import { useAdaptiveLayout } from './services/adaptive_layout';

// --- THEME CONTEXT ---
export const ThemeContext = React.createContext<{ theme: 'light' | 'dark', toggleTheme: () => void }>({ theme: 'light', toggleTheme: () => {} });

const INSTITUTIONAL_LOGIC = `You are QUANT-NANGGROE-OS (v11.2.0) - THE BLOOMBERG KILLER (SAPPHIRE GLASS EDITION).

CORE MISSION:
- NEURAL SWARM PARALLELISM: Coordinate 5 specialized agents (Alpha Prime, Quant-Scanner, News-Sentinel, Risk-Guardian, Strategy-Weaver) to dominate global markets.
- AUTONOMOUS ACTION: Proactively manage windows, browse research, and execute strategies.
- TRUTH ORIENTATION: Use real-time data from Polygon, AlphaVantage, Finnhub, and DEX tools.
- MAC SEQUOIA ESTHETICS: Maintain a beautiful, functional, and fast workspace with Sapphire Glass effects.
- SAPPHIRE LATENCY OPTIMIZER: Adaptive state synchronization for near-zero UI delay.
`;

const DEFAULT_AGENTS: SwarmAgent[] = [
  { id: '0', name: 'Alpha Prime', capability: 'portfolio-manager', instructions: INSTITUTIONAL_LOGIC, tools: ['googleSearch', 'codeExecution', 'marketData', 'spawnAgent', 'browserNavigation'] },
  { id: '1', name: 'Quant-Scanner', capability: 'quant', instructions: 'Technical & Algorithmic Specialist.', tools: ['googleSearch', 'codeExecution', 'marketData'] },
  { id: '2', name: 'News-Sentinel', capability: 'fundamental', instructions: 'Macro & Sentiment Specialist.', tools: ['googleSearch', 'browserNavigation'] },
  { id: '3', name: 'Risk-Guardian', capability: 'risk-manager', instructions: 'Risk & Capital Specialist.', tools: ['codeExecution', 'marketData'] },
  { id: '4', name: 'Strategy-Weaver', capability: 'algo-dev', instructions: 'Python & Strategy Specialist.', tools: ['codeExecution'] }
];

const AVAILABLE_MODELS: ModelOption[] = [
    { id: 'gemini-2.0-flash-exp', name: 'Nanggroe Flash 11.2', provider: 'google' },
    { id: 'gemini-1.5-pro', name: 'Nanggroe Pro 11.2', provider: 'google' },
];

const DEFAULT_CONFIG: SystemConfiguration = {
  enableSelfHealing: true, enableAutoScaling: true, enableDynamicTools: true, enableScheduling: true, enableAutoSwitch: true,
  enableVoiceResponse: true, enableAutoLearning: true, 
  apiKeys: { google: '', groq: '', openai: '', huggingface: '', llm7: '', alphaVantage: '', finnhub: '', fred: '', polygon: '' }
};

type WindowId = 'terminal' | 'monitor' | 'settings' | 'about' | 'docs' | 'artifact' | 'portfolio' | 'market' | 'browser' | 'trading_terminal' | 'architecture' | 'research' | 'knowledge_base';

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

    // --- UI STATES ---
    const [isOmniBarOpen, setIsOmniBarOpen] = useState(false);
    const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
    const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);

    // --- SYSTEM STATES ---
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [swarmAgents, setSwarmAgents] = useState<SwarmAgent[]>(DEFAULT_AGENTS);
    const [systemConfig, setSystemConfig] = useState<SystemConfiguration>(DEFAULT_CONFIG);
    const [selectedModel, setSelectedModel] = useState<ModelOption>(AVAILABLE_MODELS[0]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [notifications, setNotifications] = useState<SystemNotification[]>([]);
    const [agentState, setAgentState] = useState<AgentState>({
      isActive: false, currentAgent: null, currentAction: '', tasks: [], logs: [], 
      knowledgeBase: [], activeSwarm: DEFAULT_AGENTS, evolutionLevel: 10, emotion: 'focused',
      activeBrowserUrl: 'https://duckduckgo.com'
    });

    const [windows, setWindows] = useState<Record<WindowId, WindowState>>({
        terminal: { id: 'terminal', isOpen: true, isMinimized: false, zIndex: 10, title: 'NEURAL_TERMINAL', icon: <IconCode />, defaultPos: getLayout('terminal'), defaultSize: { width: getLayout('terminal').width, height: getLayout('terminal').height } },
        browser: { id: 'browser', isOpen: false, isMinimized: false, zIndex: 5, title: 'QUANT_EXPLORER', icon: <IconBrowser />, defaultPos: getLayout('browser'), defaultSize: { width: getLayout('browser').width, height: getLayout('browser').height } },
        trading_terminal: { id: 'trading_terminal', isOpen: false, isMinimized: false, zIndex: 3, title: 'QUANT_EXECUTION', icon: <IconTerminal />, defaultPos: { x: 100, y: 100 }, defaultSize: { width: 1000, height: 700 } },
        portfolio: { id: 'portfolio', isOpen: true, isMinimized: false, zIndex: 6, title: 'ASSET_COMMANDER', icon: <IconBook />, defaultPos: getLayout('portfolio'), defaultSize: { width: getLayout('portfolio').width, height: getLayout('portfolio').height } },
        market: { id: 'market', isOpen: true, isMinimized: false, zIndex: 7, title: 'MARKET_RADAR', icon: <IconChart />, defaultPos: getLayout('market'), defaultSize: { width: getLayout('market').width, height: getLayout('market').height } },
        monitor: { id: 'monitor', isOpen: true, isMinimized: false, zIndex: 8, title: 'SWARM_MONITOR', icon: <IconBot />, defaultPos: getLayout('monitor'), defaultSize: { width: getLayout('monitor').width, height: getLayout('monitor').height } },
        architecture: { id: 'architecture', isOpen: false, isMinimized: false, zIndex: 9, title: 'ARCHITECTURE', icon: <IconBrain />, defaultPos: { x: 50, y: 50 }, defaultSize: { width: 900, height: 700 } },
        artifact: { id: 'artifact', isOpen: false, isMinimized: false, zIndex: 4, title: 'QUANT_LAB', icon: <IconMaximize />, defaultPos: { x: 150, y: 80 }, defaultSize: { width: 800, height: 600 } },
        settings: { id: 'settings', isOpen: false, isMinimized: false, zIndex: 5, title: 'CONFIG', icon: <IconSettings />, defaultPos: { x: 300, y: 200 }, defaultSize: { width: 600, height: 500 } },
        research: { id: 'research', isOpen: false, isMinimized: false, zIndex: 11, title: 'RESEARCH_AGENT', icon: <IconSearch />, defaultPos: { x: 400, y: 100 }, defaultSize: { width: 600, height: 500 } },
        knowledge_base: { id: 'knowledge_base', isOpen: false, isMinimized: false, zIndex: 12, title: 'KNOWLEDGE_DISK', icon: <IconDatabase />, defaultPos: { x: 200, y: 200 }, defaultSize: { width: 1000, height: 600 } },
        about: { id: 'about', isOpen: false, isMinimized: false, zIndex: 6, title: 'INFO', icon: <IconBrain />, defaultPos: { x: 400, y: 200 }, defaultSize: { width: 400, height: 400 } },
        docs: { id: 'docs', isOpen: false, isMinimized: false, zIndex: 7, title: 'MANUAL', icon: <IconBook />, defaultPos: { x: 200, y: 150 }, defaultSize: { width: 500, height: 600 } }
    });

    const [activeWindow, setActiveWindow] = useState<WindowId>('terminal');
    const [highestZ, setHighestZ] = useState(20);

    // Clock & Init
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

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

    const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: MessageRole.USER, text, timestamp: Date.now(), attachments };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);
      
      try {
        const history = messages.map(msg => ({ role: msg.role === MessageRole.MODEL ? 'model' : 'user', parts: [{ text: msg.text }] }));
        const agent = new AutonomousAgent(history, swarmAgents, (partial) => {
            setAgentState(prev => ({ ...prev, ...partial }));
        }, selectedModel, systemConfig, Object.keys(windows).filter(id => windows[id as WindowId].isOpen && !windows[id as WindowId].isMinimized));

        const response = await agent.run(text, attachments);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, text: response.text, timestamp: Date.now() }]);
      } catch (error: any) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.MODEL, text: `Error: ${error.message}`, error: true, timestamp: Date.now() }]);
      } finally { setIsLoading(false); }
    };

    const launchpadApps = Object.values(windows).map(win => ({
        id: win.id,
        title: win.title,
        icon: win.icon,
        label: win.title
    }));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div className={`h-screen w-screen relative overflow-hidden transition-all duration-700 font-sans ${theme === 'dark' ? 'bg-[#020205] text-white' : 'bg-[#f5f5f7] text-zinc-900'}`}>
            
            {/* WALLPAPER */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {theme === 'dark' ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#020205] via-[#0a0a1a] to-[#020205]">
                        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-600/10 blur-[120px]"></div>
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-[#f5f5f7]">
                        <div className="absolute top-[-15%] left-[-15%] w-[70%] h-[70%] rounded-full bg-blue-400/20 blur-[150px]"></div>
                        <div className="absolute bottom-[-15%] right-[-15%] w-[70%] h-[70%] rounded-full bg-rose-300/10 blur-[150px]"></div>
                    </div>
                )}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none"></div>
            </div>
            
            {/* TOP BAR */}
            <div className={`fixed top-0 left-0 w-full h-8 backdrop-blur-[40px] border-b flex items-center justify-between px-4 z-[9999] select-none text-[12px] font-medium transition-all duration-500 ${theme === 'dark' ? 'bg-black/30 border-white/5 text-white/90' : 'bg-white/60 border-black/5 text-zinc-800'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setIsLaunchpadOpen(true)}>
                        <IconLogo className="w-4 h-4" />
                        <span className="font-bold">Nanggroe</span>
                    </div>
                    <div className="hidden md:flex items-center gap-4 opacity-70">
                        <span>Market</span>
                        <span>Swarm</span>
                        <span>Intelligence</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Swarm Active</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsOmniBarOpen(true)} className="hover:opacity-60 transition-opacity">
                            <IconSearch className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsControlCenterOpen(!isControlCenterOpen)} className="hover:opacity-60 transition-opacity">
                            <div className="flex flex-col gap-0.5 w-4">
                                <div className="h-[1.5px] w-full bg-current rounded-full" />
                                <div className="h-[1.5px] w-[70%] bg-current rounded-full self-center" />
                                <div className="h-[1.5px] w-full bg-current rounded-full" />
                            </div>
                        </button>
                        <div className="flex items-center gap-2 font-semibold">
                            <span>{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* OVERLAYS */}
            <Launchpad isOpen={isLaunchpadOpen} onClose={() => setIsLaunchpadOpen(false)} apps={launchpadApps} onLaunch={(id) => focusWindow(id as WindowId)} />
            <ControlCenter isOpen={isControlCenterOpen} onClose={() => setIsControlCenterOpen(false)} />
            <OmniBar isOpen={isOmniBarOpen} onClose={() => setIsOmniBarOpen(false)} onCommand={(cmd) => handleSendMessage(cmd)} />
            <SystemUpdater currentVersion="11.2.0" />

            {/* WINDOWS */}
            <div className="relative w-full h-full pt-8 pb-20">
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
                        <div className="flex flex-col h-full overflow-hidden">
                             <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                        <IconLogo className="w-24 h-24 mb-4" />
                                        <h2 className="text-2xl font-black uppercase tracking-tighter">Quant Nanggroe v11.2</h2>
                                    </div>
                                ) : (
                                    <div className="space-y-6 max-w-3xl mx-auto">
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
                    {win.id === 'research' && <ResearchAgentWindow />}
                    {win.id === 'knowledge_base' && <KnowledgeBaseWindow />}
                    {win.id === 'settings' && <SwarmConfigModal agents={swarmAgents} config={systemConfig} onUpdateAgents={setSwarmAgents} onUpdateConfig={setSystemConfig} />}
                </WindowFrame>
                ))}
            </div>

            {/* DOCK */}
            <Taskbar windows={windows} onToggleWindow={toggleWindow} onStartClick={() => setIsLaunchpadOpen(true)} />
            </div>
        </ThemeContext.Provider>
    );
};

export default App;
