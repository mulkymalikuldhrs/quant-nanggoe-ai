
import { GoogleGenAI } from "@google/genai";
import { QUANT_ANALYST_ROLE } from "../constants/agent_prompts";

// 🔒 ANALIS QUANT NANGGROE - SYSTEM CONSTITUTION
const SYSTEM_CONSTITUTION = (pair: string) => `
${QUANT_ANALYST_ROLE}

[SPECIFIC_MISSION_FOR_${pair}]:
- Perform a full 100-strategy convergence sweep on ${pair}.
- Search for latest price action, news, and macro events using Google Search.
- Populat the JSON schema strictly.
- ENSURE THE OUTPUT FOLLOWS THE <OUTPUT FORMAT WAJIB PERSIS> SECTION BEFORE THE JSON BLOCK.

JSON OUTPUT SCHEMA (STRICT - MUST BE AT THE VERY END):
{
  "signal": {
    "direction": "BUY" | "SELL" | "WAIT",
    "style": "SCALPING" | "INTRADAY" | "SWING",
    "entry": number,
    "sl": number,
    "tp": number,
    "confidence": number,
    "setup": "Primary Setup Name"
  },
  "strategy_breakdown": {
    "smc_score": number,
    "orderflow_score": number,
    "macro_score": number,
    "volatility_score": number,
    "fundamental_score": number
  },
  "fundamental_data": {
    "sentiment_score": number,
    "sentiment_label": "String",
    "institutional_bias": "Long" | "Short" | "Neutral",
    "key_themes": ["Theme 1", "Theme 2"]
  },
  "latest_news": [
    { "time": "String", "source": "String", "headline": "String", "impact": "High" | "Medium" | "Low" }
  ],
  "reasoning": ["Point 1", "Point 2"],
  "invalidation_logic": "String"
}
`;

export interface AnalysisOptions {
  pair: string;
  accountBalance: number;
  riskPerTrade: number;
  currentPrice: number | null;
  ratios: number[];
}

export async function* getAITradingAnalysis(options: AnalysisOptions): AsyncGenerator<string, void, unknown> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview'; // High-reasoning model
  
  const prompt = `
[COMMAND]: /scan ${options.pair}
[CONTEXT]: Price: ${options.currentPrice || 'SEARCH_REQUIRED'} | Risk: ${options.riskPerTrade}%
[MODE]: INSTITUTIONAL_REAL_DATA

INSTRUCTION:
Perform a full 100-strategy convergence sweep on ${options.pair}. 
Search for latest price action, news, and macro events. 
Populate the JSON schema strictly.
`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_CONSTITUTION(options.pair),
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // Zero creativity, maximum logic
        thinkingConfig: { thinkingBudget: 32768 } // Deep reasoning enabled
      },
    });

    let lastChunk: any = null;
    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
      lastChunk = chunk;
    }

    const groundingChunks = lastChunk?.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && Array.isArray(groundingChunks)) {
        let sourcesText = "\n\n[VERIFIED_PUBLIC_SOURCES]:\n";
        groundingChunks.forEach((c: any) => {
            if (c.web) {
                sourcesText += `• ${c.web.title}: ${c.web.uri}\n`;
            }
        });
        yield sourcesText;
    }
  } catch (error) {
    console.error("Dhaher Quant Core Error:", error);
    yield `[SYSTEM_HALT]: Intelligence Feed Disconnected. Retrying connection...`;
  }
}
