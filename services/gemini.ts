
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { GroundingSource, AgentRole, AgentTask, AgentState, SwarmAgent, AgentCapability, KnowledgeItem, ModelOption, Attachment, SystemConfiguration, AgentTool, ApiKeys, SystemPatch, Artifact, DataSource, SystemAction } from "../types";
import { BrowserFS } from "./file_system";
import { LLMRouter } from "./llm_router";
import { MarketService } from "./market";
import { MLEngine } from "./ml_engine";
import { BrowserCore } from "./browser_core"; // Import Browser Core

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

import { DesktopIntelligence } from "./desktop_intelligence";

export class AutonomousAgent {
  private history: { role: string; parts: { text: string }[] }[];
  private onStateChange: (state: Partial<AgentState>) => void;
  private swarm: SwarmAgent[];
  private knowledgeBase: KnowledgeItem[] = [];
  private evolutionLevel: number = 1;
  private selectedModel: ModelOption;
  private config: SystemConfiguration;
  private router: LLMRouter;
  private openWindows: any = {}; // Changed to hold full window state

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
    this.onStateChange({ 
        ...updates, 
        knowledgeBase: this.knowledgeBase, 
        activeSwarm: this.swarm,
        evolutionLevel: this.evolutionLevel
    });
  }

  private addLog(message: string) {
    this.onStateChange({ logs: [message] });
  }

  private speak(text: string) {
      if (!this.config.enableVoiceResponse) return;
      try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.pitch = 0.9; 
          utterance.rate = 1.1; 
          const voices = window.speechSynthesis.getVoices();
          const preferred = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang === 'en-US');
          if (preferred) utterance.voice = preferred;
          window.speechSynthesis.speak(utterance);
      } catch(e) { console.warn("Voice Error", e); }
  }

    async run(prompt: string, attachments?: Attachment[]): Promise<{ text: string, groundingSources: GroundingSource[], actions?: SystemAction[] }> {
      const coreInstructions = BrowserFS.getCoreInstructions();
      this.addLog(`[KERNEL] Alpha Prime Connected. Windows Open: ${this.openWindows.join(', ')}`);

      // --- MULTI-AGENT MEMORY LOAD ---
      const agentId = this.swarm[0]?.id || 'Alpha Prime';
      const longTermMemory = BrowserFS.loadMemoryByAgent(agentId);
      if (longTermMemory) this.addLog(`[MEMORY] Long-term context loaded for ${agentId}.`);

      // --- AUTO-LEARNING LOOP ---
      if (this.config.enableAutoLearning) {
          this.addLog(`[ML ENGINE] Optimizing Neural Weights based on trade history...`);
          const optimizationResult = MLEngine.optimize();
          this.addLog(`[ML ENGINE] ${optimizationResult}`);
          const evState = MLEngine.getEvolutionState();
          this.evolutionLevel = evState.generation;
      }

      const pastContext = BrowserFS.searchMemory(prompt);
      const combinedContext = `${longTermMemory}\n${pastContext}`;
      
      if (pastContext) this.addLog(`[MEMORY] Recall triggered: Found related past analysis.`);

      this.updateState({ isActive: true, currentAgent: 'Alpha Prime', currentAction: `Initializing Recursive Loop (Gen ${this.evolutionLevel})...`, logs: [], emotion: 'thinking' });
      
      try {
          const result = await this.runEcosystemWorkflow(prompt, coreInstructions, combinedContext, attachments);
          this.updateState({ emotion: 'confident' });
          
          // --- MULTI-AGENT MEMORY SAVE ---
          BrowserFS.saveMemory(result.text.substring(0, 500), ['analysis', 'trade_setup'], agentId);

          if (this.config.enableVoiceResponse) {
               const summary = result.text.split('\n').filter(l => !l.includes('```') && l.length > 20).slice(0, 3).join('. ');
               this.speak(summary);
          }

          return result;
      } catch (error: any) {
        console.error("Colony Error:", error);
        this.addLog(`CRITICAL FAILURE: ${error.message}`);
        this.updateState({ emotion: 'error' });
        return { text: `System Error: ${error.message}. Check Config or Network.`, groundingSources: [] };
    } finally {
        setTimeout(() => this.updateState({ isActive: false, emotion: 'idle' }), 5000);
    }
  }

  private async runEcosystemWorkflow(prompt: string, coreInst: string, memoryContext: string, attachments?: Attachment[]): Promise<{ text: string, groundingSources: GroundingSource[], actions: SystemAction[] }> {
    
    // 1. DYNAMIC PLANNING with OS AWARENESS & BROWSER VISION
    const desktopSnapshot = DesktopIntelligence.getSystemSnapshot(this.openWindows);
    
    const contextPrompt = `
    ${desktopSnapshot}
    
    EXTERNAL INTELLIGENCE:
    - You have access to the QUANT NOTEBOOK (Proprietary Research) at: 
      https://notebooklm.google.com/notebook/743daa1f-6476-4390-914e-0044cdaf10a5
    - Consult this notebook URL via the browser tool if deep fundamental validation is needed.

    CAPABILITIES:
    - You can OPEN/CLOSE windows via \`system_actions\`.
    - You can BROWSE the web. If the user asks to "check news" or "read this url", you MUST assume you can do it.
    
    To Navigate: Return JSON action \`{ "type": "NAVIGATE_BROWSER", "payload": "https://..." }\`.
    The system will auto-read the content for you in the next step.
    `;

    // 2. PARALLEL EXECUTION
    let tasks: AgentTask[] = [{ id: '1', agentId: '0', role: 'portfolio-manager', description: 'Analyze User Request', status: 'pending' }];
    let actions: SystemAction[] = [];
    let finalSynthesis = "";

    // 3. Simple Loop for this implementation
    // If the prompt implies browsing, we add a specific browser task
    if (prompt.toLowerCase().includes('news') || prompt.toLowerCase().includes('http') || prompt.toLowerCase().includes('search') || prompt.toLowerCase().includes('check')) {
        this.addLog(`[DECISION] Web Browsing Required. Engaging Browser Core.`);
        
        // Extract URL or Search Term (Basic Heuristic for now, usually LLM does this)
        let targetUrl = "https://duckduckgo.com/?q=finance+news";
        const urlMatch = prompt.match(/https?:\/\/[^\s]+/);
        if (urlMatch) targetUrl = urlMatch[0];
        else if (prompt.includes('news')) targetUrl = "https://finance.yahoo.com";
        else targetUrl = `https://duckduckgo.com/?q=${encodeURIComponent(prompt.replace('check', '').trim())}`;

        // Add action to open browser
        actions.push({ type: 'OPEN_WINDOW', payload: 'browser' });
        actions.push({ type: 'NAVIGATE_BROWSER', payload: targetUrl });
        
        this.updateState({ activeBrowserUrl: targetUrl });
        this.addLog(`[BROWSER] Navigating to ${targetUrl}...`);
        
        // Simulate "Reading" delay
        await sleep(1500);
        
        try {
            this.addLog(`[BROWSER] Extracting Text Content (Reader Mode)...`);
            const pageData = await BrowserCore.fetchPage(targetUrl);
            const browserKnowledge: KnowledgeItem = {
                id: `web-${Date.now()}`,
                category: 'fact',
                content: `WEBPAGE CONTENT (${pageData.title}):\n${pageData.content.substring(0, 2000)}...`,
                sourceAgentId: 'BrowserCore',
                timestamp: Date.now(),
                confidence: 100,
                tags: ['web_scrape']
            };
            this.knowledgeBase.push(browserKnowledge);
            this.addLog(`[BROWSER] Successfully read ${pageData.title}`);
        } catch (e) {
            this.addLog(`[BROWSER] Failed to read page: ${e}`);
        }
    }

    // 4. SYNTHESIS
    this.updateState({ currentAgent: 'Alpha Prime', currentAction: 'Synthesizing Reports...', emotion: 'confident' });
    
    const reports = this.knowledgeBase.filter(k => k.timestamp > (Date.now() - 60000)).map(k => `--- ${k.sourceAgentId} ---\n${k.content}`).join('\n\n');

    const synthesisPrompt = `
${coreInst}
${contextPrompt}

USER REQUEST: "${prompt}"
AVAILABLE INTELLIGENCE:
${reports}

--- MISSION ---
Synthesize the intelligence. If you read a webpage, SUMMARIZE it.
If you have no data, state what you tried.
`;
    
    const res = await this.router.generate(this.selectedModel, synthesisPrompt);
    finalSynthesis = res.text;

    // Clean JSON from text for display
    finalSynthesis = finalSynthesis.replace(/```json[\s\S]*?```/g, '').trim();

    return { text: finalSynthesis, groundingSources: [], actions };
  }
}
