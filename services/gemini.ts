import { SwarmAgent, AgentState, ModelOption, Attachment, SystemConfiguration, SystemAction, GroundingSource, KnowledgeItem } from "../types";
import { BrowserFS } from "./file_system";
import { LLMRouter } from "./llm_router";
import { BrowserCore } from "./browser_core";
import { DesktopIntelligence } from "./desktop_intelligence";
import { MemoryManager } from "./memory_manager";
import { MarketService } from "./market.ts";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AutonomousAgent {
  private history: { role: string; parts: { text: string }[] }[];
  private onStateChange: (state: Partial<AgentState>) => void;
  private swarm: SwarmAgent[];
  private selectedModel: ModelOption;
  private config: SystemConfiguration;
  private router: LLMRouter;
  private openWindows: string[];

  constructor(
    history: { role: string; parts: { text: string }[] }[],
    swarm: SwarmAgent[],
    onStateChange: (state: Partial<AgentState>) => void,
    selectedModel: ModelOption,
    config: SystemConfiguration,
    openWindows: string[] = []
  ) {
    this.history = history;
    this.swarm = swarm;
    this.onStateChange = onStateChange;
    this.selectedModel = selectedModel;
    this.config = config;
    this.router = new LLMRouter(config.apiKeys, config.enableAutoSwitch);
    this.openWindows = openWindows;
  }

  private updateState(updates: Partial<AgentState>) {
    this.onStateChange({ ...updates, activeSwarm: this.swarm });
  }

  private addLog(message: string) {
    this.onStateChange({ logs: [message] });
  }

  async run(prompt: string, attachments?: Attachment[]): Promise<{ text: string, groundingSources: GroundingSource[], actions?: SystemAction[] }> {
    this.addLog(`[KERNEL] Neural Swarm Initialized. SNAPSHOT: ${this.openWindows.join(', ')}`);
    
    // Determine if we need multi-agent parallel processing
    const isSwarmTask = prompt.toLowerCase().includes('analyze') || prompt.toLowerCase().includes('swarm') || prompt.toLowerCase().includes('trade');
    
    if (isSwarmTask && this.swarm.length > 1) {
        return await this.runSwarmParallel(prompt);
    }

    return await this.runSingleAgent(this.swarm[0]?.id || 'alpha-prime', prompt);
  }

  private async runSingleAgent(agentId: string, prompt: string): Promise<{ text: string, groundingSources: GroundingSource[], actions?: SystemAction[] }> {
    const memory = MemoryManager.getAgentMemory(agentId);
    this.updateState({ isActive: true, currentAgent: agentId, currentAction: 'Deep Neural Search...', emotion: 'thinking' });

    try {
      const systemSnapshot = DesktopIntelligence.getSystemSnapshot(this.openWindows);
      const context = memory ? `PREVIOUS_MEMORY: ${memory.summary}\n` : '';
      
      const fullPrompt = `
        ${INSTITUTIONAL_LOGIC}
        AGENT_IDENTITY: ${agentId}
        ${systemSnapshot}
        ${context}
        USER_PROMPT: ${prompt}
        
        RESPONSE_PROTOCOL:
        1. Answer the user clearly.
        2. If an action is needed, use format: [ACTION:TYPE:PAYLOAD]
           Types: OPEN_WINDOW, NAVIGATE_BROWSER, FETCH_MARKET, EXECUTE_TRADE, ANALYZE_SENTIMENT.
      `;

      const result = await this.router.generate(this.selectedModel, fullPrompt);
      const actions = this.parseActions(result.text);

      MemoryManager.saveAgentMemory(agentId, {
          summary: result.text.substring(0, 300) + '...',
          messages: [...this.history, { role: 'user', parts: [{ text: prompt }] }, { role: 'model', parts: [{ text: result.text }] }]
      });

      return { text: result.text, groundingSources: [], actions };
    } catch (error: any) {
      this.addLog(`[ERROR] ${error.message}`);
      return { text: `Neural Link Failure: ${error.message}`, groundingSources: [] };
    } finally {
      this.updateState({ isActive: false, emotion: 'idle' });
    }
  }

  private async runSwarmParallel(prompt: string): Promise<{ text: string, groundingSources: GroundingSource[], actions?: SystemAction[] }> {
    this.addLog(`[NEURAL_LINK] Swarm Parallel Core Activated.`);
    this.addLog(`[SWARM] Spawning ${this.swarm.length} specialized agents simultaneously...`);
    
    // Simulate some "spawning" delay for effect and to show logs
    this.updateState({ currentAction: 'Spawning Neural Nodes...', emotion: 'thinking' });

    const tasks = this.swarm.map(async (agent, index) => {
        // Staggered logs to look more "system-like"
        await sleep(index * 200);
        this.addLog(`[${agent.name}] Node online. Initializing ${agent.capability} module...`);
        
        const memory = MemoryManager.getAgentMemory(agent.id);
        const systemSnapshot = DesktopIntelligence.getSystemSnapshot(this.openWindows);
        
        const agentPrompt = `
            ROLE: ${agent.capability}
            IDENTITY: ${agent.name}
            INSTRUCTIONS: ${agent.instructions}
            TASK: Analyze this request from your specialized perspective: ${prompt}
            ${systemSnapshot}
            ${memory ? `MEMORY: ${memory.summary}` : ''}
            
            FORMAT: Provide a concise technical analysis.
        `;
        
        try {
            const res = await this.router.generate(this.selectedModel, agentPrompt);
            this.addLog(`[${agent.name}] Analysis complete. Transmission successful.`);
            return { name: agent.name, output: res.text };
        } catch (e: any) {
            this.addLog(`[${agent.name}] Link error: ${e.message}`);
            return { name: agent.name, output: `ERROR: ${e.message}` };
        }
    });

    const results = await Promise.all(tasks);
    
    this.addLog(`[SWARM] All nodes reporting. Commencing Neural Synthesis...`);
    this.updateState({ currentAction: 'Synthesizing Swarm Data...', emotion: 'thinking' });
    
    const synthesisPrompt = `
        SWARM_SYNTHESIS_TASK:
        The following agents have provided their specialized analysis for: "${prompt}"
        
        ${results.map(r => `[${r.name}]: ${r.output}`).join('\n\n')}
        
        Consolidate these into a final institutional-grade response and execution plan.
        Be decisive. Use real-world data logic.
        If specific trades or browser actions are needed, use the [ACTION:TYPE:PAYLOAD] format.
    `;

    const finalResult = await this.router.generate(this.selectedModel, synthesisPrompt);
    const actions = this.parseActions(finalResult.text);
    
    this.addLog(`[KERNEL] Synthesis complete. Execution plan ready.`);

    return { text: finalResult.text, groundingSources: [], actions };
  }

  private parseActions(text: string): SystemAction[] {
    const actions: SystemAction[] = [];
    const matches = text.matchAll(/\[ACTION:([^:]+):([^\]]+)\]/g);
    for (const match of matches) {
        actions.push({ type: match[1] as any, payload: match[2] });
    }
    return actions;
  }
}

const INSTITUTIONAL_LOGIC = `You are QUANT-NANGGROE-OS (v9.1).
OPERATE WITH ABSOLUTE PRECISION. NO SIMULATION. REAL DATA ONLY.
YOU CONTROL THE DESKTOP. YOU CONTROL THE TRADES.`;
