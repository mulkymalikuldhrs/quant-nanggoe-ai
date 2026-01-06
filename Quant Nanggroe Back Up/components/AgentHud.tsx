
import React, { useEffect, useRef, useState } from 'react';
import { AgentState, SwarmAgent, SystemPatch } from '../types';
import SwarmGraph from './SwarmGraph';
import { BrowserFS } from '../services/file_system';
import { MLEngine } from '../services/ml_engine';
import { IconSearch, IconDownload, IconCheck, IconShield, IconCode, IconGlobe, IconLink, IconBrain } from './Icons';

interface Props {
  state: AgentState;
  agents: SwarmAgent[];
}

const AgentHud: React.FC<Props> = ({ state, agents }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'audit' | 'sources' | 'brain'>('live');
  const [evState, setEvState] = useState(MLEngine.getEvolutionState());
  
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.logs, state.currentAction]);

  useEffect(() => {
      // Poll for evolution updates
      const interval = setInterval(() => {
          setEvState(MLEngine.getEvolutionState());
      }, 5000);
      return () => clearInterval(interval);
  }, []);

  const auditLogs = state.knowledgeBase.filter(k => k.category === 'event').reverse();
  const dataSources = BrowserFS.getDataSources();
  const activeTaskCount = state.tasks.filter(t => t.status === 'active').length;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50/80">
      {/* Tabs */}
      <div className="flex-none flex items-center justify-between px-2 pt-2 border-b border-gray-200/60 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-1 overflow-x-auto">
          {['live', 'audit', 'sources', 'brain'].map((tab) => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide rounded-t-lg transition-all ${
                    activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-sm border border-b-0 border-gray-200 translate-y-[1px]' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
             >
                 {tab === 'brain' ? 'Neural Net' : tab}
             </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pr-2 pb-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase hidden md:inline bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                Gen {evState.generation}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${state.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* LIVE VIEW */}
        {activeTab === 'live' && (
            <div className="h-full flex flex-col">
                <div className="h-[180px] md:h-[200px] flex-none border-b border-gray-200 bg-white shadow-inner flex items-center justify-center relative">
                    <SwarmGraph agents={agents} state={state} />
                    
                    {/* Active Task Overlay */}
                    {activeTaskCount > 0 && (
                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                            {state.tasks.filter(t => t.status === 'active').map(t => (
                                <div key={t.id} className="bg-blue-50/90 backdrop-blur px-2 py-0.5 rounded border border-blue-100 text-[8px] text-blue-600 font-bold flex items-center gap-1 shadow-sm">
                                    <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
                                    {agents.find(a => a.id === t.agentId)?.name || 'Agent'} Working...
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Active Thought Process Terminal */}
                <div className="flex-1 flex flex-col bg-[#0f172a] text-gray-300 font-mono text-[10px]">
                    <div className="px-3 py-1.5 border-b border-gray-700 bg-[#1e293b] flex items-center justify-between">
                        <span className="font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Neural Uplink
                        </span>
                    </div>
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                        {state.logs.length === 0 && <div className="text-gray-600 italic">...Waiting for input...</div>}
                        {state.logs.map((log, i) => {
                            const isApi = log.includes('[API]') || log.includes('[MARKET]');
                            const isDeploy = log.includes('[DEPLOY]');
                            const isFail = log.includes('[FAIL]') || log.includes('CRITICAL');
                            const isML = log.includes('[ML ENGINE]');
                            
                            return (
                                <div key={i} className={`break-all border-l-2 pl-2 ${isFail ? 'border-red-500' : isML ? 'border-purple-500' : isApi ? 'border-blue-500' : isDeploy ? 'border-green-500' : 'border-gray-700'}`}>
                                    <span className="text-gray-500 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                    <span className={isFail ? 'text-red-400 font-bold' : isML ? 'text-purple-400' : isApi ? 'text-blue-300' : isDeploy ? 'text-green-400' : 'text-gray-300'}>
                                        {log}
                                    </span>
                                </div>
                            );
                        })}
                        {state.isActive && (
                            <div className="animate-pulse text-blue-500">_</div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* BRAIN (NEURAL NET) VIEW */}
        {activeTab === 'brain' && (
            <div className="h-full flex flex-col bg-gray-50 p-4 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                        <IconBrain className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Evolution Engine (Gen {evState.generation})</h3>
                        <p className="text-[10px] text-gray-500">Last Optimization: {new Date(evState.lastOptimization).toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Top Optimized Strategies</h4>
                        <div className="space-y-3">
                            {Object.entries(evState.weights).sort(([,a], [,b]) => (b as number) - (a as number)).map(([name, weight]) => (
                                <div key={name} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-[10px] font-medium text-gray-700">
                                        <span>{name}</span>
                                        <span>Weight: {(weight as number).toFixed(2)}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-purple-500 transition-all duration-500" 
                                            style={{ width: `${((weight as number) / 10) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* AUDIT VIEW */}
        {activeTab === 'audit' && (
            <div className="h-full flex flex-col bg-gray-50">
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {auditLogs.map((log) => (
                        <div key={log.id} className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 uppercase tracking-wider text-gray-600">
                                    {log.category}
                                </span>
                                <span className="text-[9px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-1 rounded">{log.sourceAgentId}</span>
                                <span className="text-[11px] text-gray-600 leading-tight">{log.content}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* SOURCES VIEW */}
        {activeTab === 'sources' && (
            <div className="h-full flex flex-col bg-gray-50">
                 <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {dataSources.map(source => (
                        <div key={source.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                             <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${source.type === 'api' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                        <IconGlobe className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">{source.name}</div>
                                        <div className="text-[9px] text-gray-400 uppercase">{source.category}</div>
                                    </div>
                                </div>
                             </div>
                             <code className="text-[9px] bg-gray-50 p-1 rounded text-gray-500 truncate">{source.endpoint}</code>
                        </div>
                    ))}
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AgentHud;
