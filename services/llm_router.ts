

import { GoogleGenAI } from "@google/genai";
import { ApiKeys, LLMProvider, ModelOption } from "../types";

// --- Rate Limit & Retry Helpers ---

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
    let retries = 0;
    while (retries < maxRetries) {
        const response = await fetch(url, options);
        if (response.status === 429) {
            const waitTime = Math.pow(2, retries) * 2000; // 2s, 4s, 8s...
            console.warn(`[Router] Rate limit (429) hit. Waiting ${waitTime}ms before retry...`);
            await sleep(waitTime);
            retries++;
            continue;
        }
        return response;
    }
    return fetch(url, options); // Final attempt
}

// --- Provider Implementations ---

async function callGoogle(apiKey: string, modelId: string, prompt: string, systemInstruction?: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const config: any = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;

    // Google SDK handles some retries internally, but 429 is common
    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: config
        });
        return response.text || "No response text.";
    } catch (e: any) {
        if (e.message?.includes('429')) {
             await sleep(2000); // Simple wait for Google
             const retryAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
             const res = await retryAi.models.generateContent({
                model: modelId,
                contents: prompt,
                config: config
             });
             return res.text || "No response text.";
        }
        throw e;
    }
}

async function callOpenAICompatible(baseUrl: string, apiKey: string, modelId: string, prompt: string, systemInstruction?: string) {
    const messages = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });

    const response = await fetchWithRetry(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelId,
            messages: messages,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

// --- The Router ---

export class LLMRouter {
    private keys: ApiKeys;
    private enableAutoSwitch: boolean;

    constructor(keys: ApiKeys, enableAutoSwitch: boolean) {
        this.keys = keys;
        this.enableAutoSwitch = enableAutoSwitch;
    }

    async generate(primaryModel: ModelOption, prompt: string, systemInstruction?: string): Promise<{ text: string, providerUsed: string }> {
        const providers: { option: ModelOption, fn: () => Promise<string> }[] = [];

        providers.push({
            option: primaryModel,
            fn: () => this.executeCall(primaryModel, prompt, systemInstruction)
        });

        if (this.enableAutoSwitch) {
            if (primaryModel.provider !== 'llm7') {
                 providers.push({
                    option: { id: 'gpt-4.1-nano-2025-04-14', name: 'LLM7 Core', provider: 'llm7' },
                    fn: () => callOpenAICompatible('https://api.llm7.io/v1', this.keys.llm7 || 'unused', 'gpt-4.1-nano-2025-04-14', prompt, systemInstruction)
                 });
            }

            if (primaryModel.provider !== 'groq' && this.keys.groq) {
                providers.push({
                    option: { id: 'llama3-70b-8192', name: 'Llama 3 70B (Groq)', provider: 'groq' },
                    fn: () => callOpenAICompatible('https://api.groq.com/openai/v1', this.keys.groq, 'llama3-70b-8192', prompt, systemInstruction)
                });
            }
            if (primaryModel.provider !== 'google' && this.keys.google) {
                providers.push({
                    option: { id: 'gemini-3-flash-preview', name: 'Gemini Flash', provider: 'google' },
                    fn: () => callGoogle(this.keys.google, 'gemini-3-flash-preview', prompt, systemInstruction)
                });
            }
        }

        let lastError = null;
        for (const p of providers) {
            try {
                const text = await p.fn();
                return { text, providerUsed: p.option.provider };
            } catch (e: any) {
                console.warn(`[Router] ${p.option.name} failed:`, e.message);
                lastError = e;
                if (!this.enableAutoSwitch) break; 
            }
        }

        throw lastError || new Error("All LLM providers failed.");
    }

    private async executeCall(model: ModelOption, prompt: string, systemInstruction?: string): Promise<string> {
        switch (model.provider) {
            case 'llm7':
                return callOpenAICompatible('https://api.llm7.io/v1', this.keys.llm7 || 'unused', model.id, prompt, systemInstruction);
            case 'google':
                return callGoogle(this.keys.google, model.id, prompt, systemInstruction);
            case 'groq':
                return callOpenAICompatible('https://api.groq.com/openai/v1', this.keys.groq, model.id, prompt, systemInstruction);
            case 'openai':
                return callOpenAICompatible('https://api.openai.com/v1', this.keys.openai, model.id, prompt, systemInstruction);
            default:
                throw new Error("Unknown provider: " + model.provider);
        }
    }
}
