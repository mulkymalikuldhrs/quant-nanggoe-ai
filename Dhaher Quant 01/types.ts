
export interface FundamentalAnalysisData {
  sentiment_score: number; // 0-100 derived from AI analysis
  sentiment_label: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  institutional_bias: 'Long' | 'Short' | 'Neutral';
  key_themes: string[];
}

export interface NewsEvent {
  time: string;
  source: string;
  headline: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface StrategyClusterScores {
  smc_score: number;
  orderflow_score: number;
  macro_score: number;
  volatility_score: number;
  fundamental_score: number;
}

export interface TradeSignalData {
  direction: 'BUY' | 'SELL' | 'WAIT';
  pair: string;
  entryType: 'MARKET' | 'LIMIT';
  tradingStyle: string;
  setupModel: string;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  rrr: string;
  confidence: string;
  riskAmountUSD: string;
  positionSizeLots: string;
  keyDrivers: string[];
  riskAnalysis: string;
  strategy_breakdown?: StrategyClusterScores;
  invalidation_logic?: string;
  
  // New fields for AI-driven UI population
  ai_fundamental_data?: FundamentalAnalysisData;
  ai_news_feed?: NewsEvent[];
}

export interface SignalLogEntry {
  id: string;
  pair: string;
  direction: 'BUY' | 'SELL' | 'WAIT';
  entryType: 'MARKET' | 'LIMIT';
  tradingStyle: string;
  setupModel: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  rrr: string;
  confidence: string;
  timestamp: string;
  keyDrivers: string[];
  riskAnalysis: string;
  riskAmountUSD: number;
  positionSizeLots: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  strategy_breakdown?: StrategyClusterScores;
}

export type AgentStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'EXECUTING' | 'ERROR';

export interface AgentLogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'ERROR' | 'COMMAND';
}

export interface OpenPosition {
    id: string;
    pair: string;
    direction: 'BUY' | 'SELL';
    positionSizeLots: number;
    currentPL: number;
}

export interface Instrument {
  id: string;
  name: string;
  category: 'major' | 'minor' | 'crypto' | 'index' | 'commodity' | 'stock';
}

export interface MarketPrice extends Instrument {
  price: number;
  change: number;
  changePercent: number;
}

export interface COTData {
  reportDate: string;
  nonCommercial: {
    long: number;
    short: number;
  };
  commercial: {
    long: number;
    short: number;
  };
  nonReportable: {
    long: number;
    short: number;
  };
}
