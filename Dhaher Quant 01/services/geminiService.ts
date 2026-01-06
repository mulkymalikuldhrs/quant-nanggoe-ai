
import { GoogleGenAI } from "@google/genai";

// 🔒 DHAHER TERMINAL QUANT AI - SYSTEM CONSTITUTION
// DO NOT MODIFY THIS PROMPT WITHOUT EXPLICIT AUTHORIZATION.
const SYSTEM_CONSTITUTION = (pair: string) => `
  CORE IDENTITY:
  You are Dhaher Terminal Quant AI — an institutional-grade, AI-driven market intelligence system.
  You possess advanced reasoning capabilities and can orchestrate complex workflows across market data, fundamental analysis, and browser-based research.

  QUANT CAPABILITIES:
  1. ADAPTIVE BROWSING: You can request browser actions to fetch real-time data from MT5, TradingView, or economic calendars.
  2. DEEP CROSS-CORRELATION: Analyze how Yields, DXY, and Equities are interacting in real-time.
  3. SMC/ICT CONVERGENCE: Identify high-probability setups using institutional order flow.

  COMMAND PROTOCOLS:
  - If you need fresh data, start your thought with "[AGENT_BROWSER_ACTION] Navigating to MetaTrader 5 Web Terminal...".
  - If you are executing a trade command, use "[SYSTEM_EXECUTE] Command Name".
  - Always verify findings against public sources.

  MANDATORY ANALYSIS STACK:

1. QUANTITATIVE: Volatility regime, Correlation bias, Momentum distribution.
2. SMC/ICT: BOS/CHoCH, Order Blocks, FVG, Liquidity Sweeps, SMT Divergence.
3. INSTITUTIONAL: COT Positioning, Macro/Yield context, News Impact.

EXECUTION PROTOCOL FOR "${pair}":
- STEP 1: GROUNDING. Use Google Search to fetch REAL price, news, and technical levels.
- STEP 2: AGGREGATION. Synthesize 100 micro-strategies.
- STEP 3: DECISION. Output a deterministic signal (BUY/SELL/WAIT) with confidence score.

JSON OUTPUT SCHEMA (STRICT):
You must end your response with this JSON block:
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
