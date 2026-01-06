
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64 string
  name?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  isThinking?: boolean;
  timestamp: number;
  groundingSources?: GroundingSource[];
  attachments?: Attachment[];
  error?: boolean;
}

// --- Hedge Fund Ecosystem Types ---

export type AgentCapability = 
  | 'portfolio-manager' // The Boss (Alpha Prime)
  | 'quant'             // Technical Analyst
  | 'fundamental'       // News/Macro Analyst
  | 'risk-manager'      // Risk Control
  | 'algo-dev'          // Coder (Backtesting)
  | 'general'
  | string;             // Allow dynamic capabilities

export type AgentRole = AgentCapability | 'reviewer';
export type AgentTool = 'googleSearch' | 'codeExecution' | 'browserNavigation' | 'googleDrive' | 'systemUpgrade' | 'marketData' | 'spawnAgent';

export interface SwarmAgent {
  id: string;
  name: string;
  capability: AgentCapability;
  instructions: string;
  color?: string; // Hex Code
  tools: AgentTool[];
  isTemporary?: boolean; 
  health?: 'healthy' | 'recovering' | 'critical'; 
}

export type KnowledgeCategory = 'fact' | 'code' | 'pattern' | 'trade_signal' | 'synthesis' | 'event' | 'patch' | 'memory';

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  content: string;
  sourceAgentId: string;
  timestamp: number;
  confidence: number;
  tags: string[];
  metadata?: any; 
}

export interface AgentTask {
  id: string;
  agentId: string;
  role: AgentRole;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'scheduled' | 'rejected';
  result?: string;
  critique?: string;
  producedKnowledgeIds?: string[];
  scheduledFor?: number;
  attempt?: number; // For recursive loops
}

export type LLMProvider = 'google' | 'groq' | 'openai' | 'llm7' | 'custom';

export interface ModelOption {
  id: string;
  name: string;
  provider: LLMProvider;
  contextWindow?: number;
}

export interface ApiKeys {
  google: string;
  groq: string;
  openai: string;
  huggingface: string;
  llm7: string;
  // Data Source Keys
  alphaVantage: string;
  finnhub: string;
  fred: string;
  polygon: string;
}

export interface SystemConfiguration {
  enableSelfHealing: boolean;
  enableAutoScaling: boolean;
  enableDynamicTools: boolean;
  enableScheduling: boolean;
  enableAutoSwitch: boolean; 
  enableVoiceResponse: boolean; // New
  enableAutoLearning: boolean; // Machine Learning
  apiKeys: ApiKeys;
}

export interface AgentState {
  isActive: boolean;
  currentAgent: string | null;
  currentAction: string;
  tasks: AgentTask[];
  logs: string[];
  knowledgeBase: KnowledgeItem[]; 
  activeSwarm: SwarmAgent[]; 
  evolutionLevel: number; 
  emotion: 'idle' | 'thinking' | 'speaking' | 'happy' | 'error' | 'curious' | 'frustrated' | 'confident'; 
  activeArtifact?: Artifact; 
  activeBrowserUrl?: string; // NEW: Tracks what the agent is "viewing"
}

export interface SystemPatch {
  id: string;
  filename: string;
  description: string;
  codeBlock: string;
  status: 'proposed' | 'applied';
  author: string;
  timestamp: number;
  targetConfigKey?: string;
}

// --- DATA SOURCE TYPES ---
export interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'rss' | 'scrape' | 'database';
  category: 'market' | 'macro' | 'news' | 'social' | 'onchain';
  endpoint: string;
  description: string;
  status: 'active' | 'inactive';
  lastAccessed?: number;
}

// --- VIBE CODING & FINANCE TYPES ---

export interface Artifact {
  id: string;
  type: 'html' | 'react' | 'markdown';
  title: string;
  content: string;
  status: 'generating' | 'ready';
}

export interface VirtualFile {
  name: string;
  content: string;
  type: string;
  lastModified: number;
}

export interface PortfolioPosition {
  ticker: string;
  amount: number; // Shares/Coins
  avgPrice: number;
  currentPrice: number; // Last known
  pnl: number;
  lastUpdated: number;
}

export interface TradeHistoryItem {
    id: string;
    timestamp: number;
    ticker: string;
    action: 'BUY' | 'SELL';
    amount: number;
    price: number;
    totalValue: number;
    fees: number;
    realizedPnL?: number;
    triggeredBySignals?: string[]; // To track which signals caused this trade
}

export interface TradeSignal {
  id: string;
  ticker: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  timestamp: number;
}

// --- ADVANCED QUANT TYPES ---

export interface TechnicalIndicators {
    rsi: number;
    stoch: { k: number, d: number };
    cci: number;
    adx: number;
    macd: {
        macdLine: number;
        signalLine: number;
        histogram: number;
    };
    bollinger: {
        upper: number;
        middle: number;
        lower: number;
    };
    vwap: number;
    atr: number;
    sma: {
        ma10: number;
        ma20: number;
        ma50: number;
        ma100: number;
        ma200: number;
    };
}

export type SignalCategory = 'TREND' | 'MOMENTUM' | 'VOLATILITY' | 'VOLUME' | 'PATTERN';

export interface StrategySignal {
    name: string; 
    category: SignalCategory;
    type: 'BUY' | 'SELL' | 'NEUTRAL';
    strength: number; // 0-100 Confidence
    weight: number; // Importance (1-5)
    description: string;
}

export interface ConsensusReport {
    score: number; // -100 (Strong Sell) to 100 (Strong Buy)
    verdict: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
    totalSignals: number;
    bullishCount: number;
    bearishCount: number;
    topFactors: string[];
}

export interface NeuralWeights {
    [signalName: string]: number; // Maps Signal Name -> Weight (0.1 to 10.0)
}

export interface EvolutionState {
    generation: number;
    lastOptimization: number;
    bestStrategies: string[];
    weights: NeuralWeights;
}

export interface MarketTicker {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    market_cap: number;
    price_change_percentage_24h: number;
    high_24h: number;
    low_24h: number;
    type?: 'crypto' | 'stock' | 'forex' | 'commodity' | 'dex' | 'index';
    volume?: number;
    source?: string;
    technicals?: TechnicalIndicators; // Embedded Math
    activeSignals?: StrategySignal[]; // Raw Signals
    consensus?: ConsensusReport; // Final Verdict
}

export interface ChartPoint {
    timestamp: number;
    price: number;
}

export interface CandleData {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface NewsItem {
    id: string;
    headline: string;
    source: string;
    url: string;
    summary: string;
    timestamp: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

// --- NEW: AI MOTOR CORTEX ACTIONS ---
export type SystemActionType = 
    | 'OPEN_WINDOW' 
    | 'CLOSE_WINDOW' 
    | 'MAXIMIZE_WINDOW'
    | 'NAVIGATE_BROWSER'
    | 'EXECUTE_TRADE'
    | 'SYSTEM_NOTIFY'
    | 'SET_MARKET_ASSET';

export interface SystemAction {
    type: SystemActionType;
    payload: any;
}

export interface SystemNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: number;
}

// --- DHAHER QUANT 01 INTEGRATION TYPES ---

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
