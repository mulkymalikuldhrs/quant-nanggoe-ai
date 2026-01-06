
import { SwarmAgent, AgentState, ModelOption, Attachment, SystemConfiguration, SystemAction, GroundingSource, KnowledgeItem } from "../types";
import { BrowserFS } from "./file_system";
import { LLMRouter } from "./llm_router";
import { BrowserCore } from "./browser_core";
import { DesktopIntelligence } from "./desktop_intelligence";
import { MemoryManager } from "./memory_manager";

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
    const agentId = this.swarm[0]?.id || 'alpha-prime';
    this.addLog(`[KERNEL] Node ${agentId} active. Snapshot: ${this.openWindows.join(', ')}`);

    // Load Memory
    const memory = MemoryManager.getAgentMemory(agentId);
    if (memory) this.addLog(`[MEMORY] Restored context from ${new Date(memory.timestamp).toLocaleTimeString()}`);

    this.updateState({ isActive: true, currentAgent: agentId, currentAction: 'Neural Processing...', emotion: 'thinking' });

    try {
      const systemSnapshot = DesktopIntelligence.getSystemSnapshot(this.openWindows);
      const context = memory ? `PREVIOUS_CONTEXT_SUMMARY: ${memory.summary}\n` : '';
      
      const fullPrompt = `
        ${INSTITUTIONAL_LOGIC}
        ${systemSnapshot}
        ${context}
        USER_PROMPT: ${prompt}
      `;

      const result = await this.router.generate(this.selectedModel, fullPrompt);
      
      // Save Memory
      MemoryManager.saveAgentMemory(agentId, {
          summary: result.text.substring(0, 300) + '...',
          messages: [...this.history, { role: 'user', parts: [{ text: prompt }] }, { role: 'model', parts: [{ text: result.text }] }]
      });

      return { text: result.text, groundingSources: [], actions: [] }; // Actions will be parsed from text if needed, but for now simple
    } catch (error: any) {
      this.addLog(`[ERROR] ${error.message}`);
      return { text: `Neural Link Failure: ${error.message}`, groundingSources: [] };
    } finally {
      this.updateState({ isActive: false, emotion: 'idle' });
    }
  }
}

const INSTITUTIONAL_LOGIC = `You are QUANT-NANGGROE-OS. Operate with institutional precision.`;
