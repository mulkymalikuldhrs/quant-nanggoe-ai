
import { SwarmAgent, SystemConfiguration } from '../types';

interface AgentMemory {
    id: string;
    messages: any[];
    summary: string;
    lastState: any;
    timestamp: number;
}

export class MemoryManager {
    private static STORAGE_KEY = 'NANGGROE_AGENT_MEMORY';

    static saveAgentMemory(agentId: string, memory: Partial<AgentMemory>) {
        const allMemory = this.getAllMemory();
        allMemory[agentId] = {
            ...(allMemory[agentId] || {}),
            ...memory,
            id: agentId,
            timestamp: Date.now()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allMemory));
    }

    static getAgentMemory(agentId: string): AgentMemory | null {
        const allMemory = this.getAllMemory();
        return allMemory[agentId] || null;
    }

    static getAllMemory(): Record<string, AgentMemory> {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) return {};
        try {
            return JSON.parse(stored);
        } catch {
            return {};
        }
    }

    static clearMemory(agentId?: string) {
        if (agentId) {
            const allMemory = this.getAllMemory();
            delete allMemory[agentId];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allMemory));
        } else {
            localStorage.removeItem(this.STORAGE_KEY);
        }
    }
    
    static saveSystemState(state: any) {
        localStorage.setItem('NANGGROE_SYSTEM_STATE', JSON.stringify({
            ...state,
            timestamp: Date.now()
        }));
    }
    
    static loadSystemState(): any | null {
        const stored = localStorage.getItem('NANGGROE_SYSTEM_STATE');
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }
}
