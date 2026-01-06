
import { TradeSignalData } from '../types';

export const extractSignalFromJSON = (text: string): TradeSignalData | null => {
  try {
    // Robust extraction: finding the last JSON object in the stream
    const jsonMatch = text.match(/\{[\s\S]*?"signal"[\s\S]*?\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const s = parsed.signal;

    if (!s || !s.direction) return null;

    return {
      direction: s.direction as 'BUY' | 'SELL' | 'WAIT',
      pair: s.pair || 'XAUUSD',
      entryType: s.type || 'MARKET',
      tradingStyle: s.style || 'INTRADAY',
      setupModel: s.setup || 'Quant Convergence',
      entry: s.entry?.toString() || "0",
      stopLoss: s.sl?.toString() || "0",
      takeProfit: s.tp?.toString() || "0",
      rrr: s.sl && s.tp && s.entry ? `1:${Math.abs((s.tp - s.entry) / (s.entry - s.sl)).toFixed(1)}` : "N/A",
      confidence: `${s.confidence || 0}%`,
      riskAmountUSD: "0", 
      positionSizeLots: "0",
      keyDrivers: parsed.reasoning || ["Institutional Momentum Convergence"],
      riskAnalysis: parsed.invalidation_logic || "Structural Invalidation",
      strategy_breakdown: parsed.strategy_breakdown || {
        smc_score: 50, orderflow_score: 50, macro_score: 50, volatility_score: 50, fundamental_score: 50
      },
      // Extract AI-sourced data for UI Widgets
      ai_fundamental_data: parsed.fundamental_data,
      ai_news_feed: parsed.latest_news
    };
  } catch (e) {
    console.error("Signal Parsing Logic Error:", e);
    return null;
  }
};

export const parseAllSignals = (text: string): TradeSignalData[] => {
  if (!text) return [];
  const signal = extractSignalFromJSON(text);
  return signal ? [signal] : [];
};
