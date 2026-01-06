
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
import Avatar from './components/Avatar';
import WindowFrame from './components/WindowFrame';
import Taskbar from './components/Taskbar';
import OmniBar from './components/OmniBar'; 
import SystemUpdater from './components/SystemUpdater';
import { IconCode, IconBot, IconSettings, IconBrain, IconBook, IconMaximize, IconGlobe, IconLogo, IconChart, IconBrowser, IconTerminal, IconSearch } from './components/Icons';
import { useAdaptiveLayout } from './services/adaptive_layout';

// INSTITUTIONAL LOGIC INJECTION
const INSTITUTIONAL_LOGIC = `You are QUANT-NANGGROE-OS (v9.1) - THE BLOOMBERG KILLER.
OPERATIONAL PARAMETERS:
- PARALLEL SWARM ARCHITECTURE: Coordinate specialized agents.
- TRUTH OVER HALLUCINATION: Use the browser tool for ANY data.
- DESKTOP AWARENESS: You can see all open windows and manage the workspace.
`;

const DEFAULT_AGENTS: SwarmAgent[] = [
  { id: '0', name: 'Alpha Prime', capability: 'portfolio-manager', instructions: INSTITUTIONAL_LOGIC, tools: ['googleSearch', 'codeExecution', 'marketData', 'spawnAgent', 'browserNavigation'] },
  { id: '1', name: 'Quant-Scanner', capability: 'quant', instructions: 'Technical Specialist.', tools: ['googleSearch', 'codeExecution', 'marketData'] },
  { id: '2', name: 'News-Sentinel', capability: 'fundamental', instructions: 'Macro Specialist.', tools: ['googleSearch', 'browserNavigation'] },
  { id: '3', name: 'Risk-Guardian', capability: 'risk-manager', instructions: 'Risk Specialist.', tools: ['codeExecution', 'marketData'] },
  { id: '4', name: 'Strategy-Weaver', capability: 'algo-dev', instructions: 'Python Specialist.', tools: ['codeExecution'] }
];

const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gemini-2.0-flash-exp', name: 'Nanggroe Flash (Ultra-Fast)', provider: 'google' },
  { id: 'gemini-1.5-pro', name: 'Nanggroe Pro (High Intelligence)', provider: 'google' },
];

const DEFAULT_CONFIG: SystemConfiguration = {
  enableSelfHealing: true, enableAutoScaling: true, enableDynamicTools: true, enableScheduling: true, enableAutoSwitch: true,
  enableVoiceResponse: true, enableAutoLearning: true, 
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
    const { screenSize, getLayout } = useAdaptiveLayout();
    
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
      knowledgeBase: [], activeSwarm: DEFAULT_AGENTS, evolutionLevel: 1, emotion: 'idle',
      activeBrowserUrl: 'https://duckduckgo.com'
    });

    const [windows, setWindows] = useState<Record<WindowId, WindowState>>({
        terminal: { id: 'terminal', isOpen: true, isMinimized: false, zIndex: 10, title: 'NEURAL_TERMINAL', icon: <IconCode />, defaultPos: getLayout('terminal'), defaultSize: { width: getLayout('terminal').width, height: getLayout('terminal').height } },
        browser: { id: 'browser', isOpen: true, isMinimized: false, zIndex: 5, title: 'QUANT_BROWSER', icon: <IconBrowser />, defaultPos: getLayout('browser'), defaultSize: { width: getLayout('browser').width, height: getLayout('browser').height } },
        trading_terminal: { id: 'trading_terminal', isOpen: false, isMinimized: false, zIndex: 3, title: 'MT5_EXECUTION', icon: <IconTerminal />, defaultPos: { x: 100, y: 100 }, defaultSize: { width: 1000, height: 700 } },
        portfolio: { id: 'portfolio', isOpen: true, isMinimized: false, zIndex: 6, title: 'ASSET_PORTFOLIO', icon: <IconBook />, defaultPos: getLayout('portfolio'), defaultSize: { width: getLayout('portfolio').width, height: getLayout('portfolio').height } },
        market: { id: 'market', isOpen: true, isMinimized: false, zIndex: 7, title: 'MARKET_DATA', icon: <IconChart />, defaultPos: getLayout('market'), defaultSize: { width: getLayout('market').width, height: getLayout('market').height } },
        monitor: { id: 'monitor', isOpen: true, isMinimized: false, zIndex: 8, title: 'SWARM_INTELLIGENCE', icon: <IconBot />, defaultPos: getLayout('monitor'), defaultSize: { width: getLayout('monitor').width, height: getLayout('monitor').height } },
        artifact: { id: 'artifact', isOpen: false, isMinimized: false, zIndex: 4, title: 'RESEARCH_LAB', icon: <IconMaximize />, defaultPos: { x: 150, y: 80 }, defaultSize: { width: 800, height: 600 } },
        settings: { id: 'settings', isOpen: false, isMinimized: false, zIndex: 5, title: 'SYSTEM_SETTINGS', icon: <IconSettings />, defaultPos: { x: 300, y: 200 }, defaultSize: { width: 600, height: 500 } },
        about: { id: 'about', isOpen: false, isMinimized: false, zIndex: 6, title: 'OS_INFO', icon: <IconBrain />, defaultPos: { x: 400, y: 200 }, defaultSize: { width: 400, height: 350 } },
        docs: { id: 'docs', isOpen: false, isMinimized: false, zIndex: 7, title: 'SYSTEM_MANUAL', icon: <IconBook />, defaultPos: { x: 200, y: 150 }, defaultSize: { width: 500, height: 600 } }
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
        <div className="h-screen w-screen relative overflow-hidden bg-[#020205]">
          
          {/* MESH GRADIENT BACKGROUND */}
          <div className="absolute inset-0 z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>
          
          {/* TOP MENU BAR (macOS Style) */}
          <div className="fixed top-0 left-0 w-full h-8 menu-bar-glass flex items-center justify-between px-4 z-[9999] select-none text-[10.5px] font-bold text-zinc-300">
              <div className="flex items-center gap-4">
                  <span className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded" onClick={() => toggleWindow('about')}>
                       <IconLogo className="w-4.5 h-4.5" /> 
                  </span>
                  <span className="font-black text-white px-2 cursor-pointer">Nanggroe OS</span>
                  <span className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded hidden md:block">Agent</span>
                  <span className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded hidden md:block">Swarm</span>
                  <span className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded hidden md:block">Intelligence</span>
                  <span className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded hidden md:block">System</span>
              </div>
              
              <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] uppercase tracking-widest">
                       <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                       Neural_Link_OK
                   </div>
                   <button onClick={() => setIsOmniBarOpen(true)} className="hover:bg-white/10 p-1 rounded transition-colors"><IconSearch className="w-3.5 h-3.5" /></button>
                   <span className="font-mono text-white opacity-80">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
          </div>

          <SystemUpdater currentVersion="9.1.0" />
          <OmniBar isOpen={isOmniBarOpen} onClose={() => setIsOmniBarOpen(false)} onCommand={(cmd) => handleSendMessage(cmd)} />

          {/* NOTIFICATIONS */}
          <div className="fixed top-10 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
              {notifications.map(notif => (
                  <div key={notif.id} className="pointer-events-auto glass-panel p-3 rounded-xl animate-in slide-in-from-right-10 w-64 shadow-2xl border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        <h4 className="text-[9px] font-black text-white uppercase tracking-widest">{notif.title}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium leading-tight">{notif.message}</p>
                  </div>
              ))}
          </div>

          {/* WINDOWS */}
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
                    <div className="flex flex-col h-full bg-[#09090b]/40">
                         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <IconLogo className="w-24 h-24 mb-4" />
                                    <h2 className="text-xl font-black uppercase tracking-tighter">Quant Nanggroe AI</h2>
                                    <p className="text-xs font-mono">Ready for execution.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
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
                {win.id === 'settings' && <SwarmConfigModal agents={swarmAgents} config={systemConfig} onUpdateAgents={setSwarmAgents} onUpdateConfig={(c) => { setSystemConfig(c); BrowserFS.saveSystemConfig(c); }} />}
                {win.id === 'about' && (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#09090b]/60">
                        <IconLogo className="w-32 h-32 mb-6" />
                        <h2 className="text-2xl font-black uppercase">Nanggroe AI v9.1</h2>
                        <div className="text-[10px] font-mono text-emerald-500 mb-8 tracking-widest">GLASS EDITION</div>
                        <div className="text-[11px] text-zinc-400 max-w-xs leading-relaxed">Advanced Multi-Agent Trading Ecosystem with Deep Neural Memory and Adaptive Glass Interface.</div>
                    </div>
                )}
            </WindowFrame>
          ))}

          {/* DOCK */}
          <Taskbar windows={windows} onToggleWindow={toggleWindow} onStartClick={() => toggleWindow('about')} />
        </div>
    );
};

export default App;
