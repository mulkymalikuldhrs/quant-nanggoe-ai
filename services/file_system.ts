
import { VirtualFile, PortfolioPosition, DataSource, SystemConfiguration, KnowledgeItem, TradeHistoryItem } from "../types";
import { MarketService } from "./market"; // To check signals at execution time

// The "Hard Drive" of the OS
const STORAGE_KEY_VFS = 'manus_vfs_data';
const STORAGE_KEY_CORE_INSTRUCTIONS = 'manus_core_instructions';
const STORAGE_KEY_PORTFOLIO = 'manus_portfolio_data';
const STORAGE_KEY_TRADE_HISTORY = 'manus_trade_history';
const STORAGE_KEY_DATASOURCES = 'manus_data_sources';
const STORAGE_KEY_CONFIG = 'manus_system_config';
const STORAGE_KEY_MEMORY = 'manus_long_term_memory';

const DEFAULT_DATA_SOURCES: DataSource[] = [
    // --- 1. MARKET DATA (Crypto/Stocks/FX) ---
    {
        id: 'src-coingecko',
        name: 'CoinGecko Public API',
        type: 'api',
        category: 'market',
        endpoint: 'https://api.coingecko.com/api/v3',
        description: 'Real-time Crypto prices, OHLCV, and Metadata (18,000+ coins). No Key required.',
        status: 'active'
    },
    {
        id: 'src-notebooklm',
        name: 'Quant Notebook Knowledge',
        type: 'scrape',
        category: 'macro',
        endpoint: 'https://notebooklm.google.com/notebook/743daa1f-6476-4390-914e-0044cdaf10a5',
        description: 'External Memory Bank containing compiled trading logic and proprietary research.',
        status: 'active'
    },
    {
        id: 'src-coincap',
        name: 'CoinCap API',
        type: 'api',
        category: 'market',
        endpoint: 'https://api.coincap.io/v2',
        description: 'Institutional-grade Crypto market data. Free, no key.',
        status: 'active'
    },
    {
        id: 'src-dexscreener',
        name: 'DEX Screener',
        type: 'api',
        category: 'onchain',
        endpoint: 'https://api.dexscreener.com/latest/dex',
        description: 'Real-time DEX Pairs (New Pairs/Memecoins) & Liquidity.',
        status: 'active'
    },
    {
        id: 'src-alphavantage',
        name: 'Alpha Vantage',
        type: 'api',
        category: 'market',
        endpoint: 'https://www.alphavantage.co/',
        description: 'Stocks, Forex, & Crypto. Requires Free API Key.',
        status: 'active'
    },
    {
        id: 'src-frankfurter',
        name: 'Frankfurter',
        type: 'api',
        category: 'market',
        endpoint: 'https://api.frankfurter.app',
        description: 'ECB published exchange rates (Forex) & historical data. Free.',
        status: 'active'
    },
    {
        id: 'src-yfinance',
        name: 'Yahoo Finance (Unofficial)',
        type: 'scrape',
        category: 'market',
        endpoint: 'https://query1.finance.yahoo.com/v8/finance/chart/',
        description: 'Global Stocks (including IDX/JK), Indices, and Commodities.',
        status: 'active'
    },
    {
        id: 'src-eodhd',
        name: 'EODHD APIs',
        type: 'api',
        category: 'market',
        endpoint: 'https://eodhd.com/api',
        description: 'End-of-Day data, Fundamental Data, and Sentiment (Free Tier).',
        status: 'active'
    },
    // --- 2. MACRO & ECONOMICS ---
    {
        id: 'src-fred',
        name: 'Federal Reserve (FRED)',
        type: 'api',
        category: 'macro',
        endpoint: 'https://api.stlouisfed.org/fred/',
        description: 'US Economic Data (GDP, Inflation, CPI). Requires Free Key.',
        status: 'active'
    },
    {
        id: 'src-tradingeconomics',
        name: 'TradingEconomics',
        type: 'api',
        category: 'macro',
        endpoint: 'https://api.tradingeconomics.com',
        description: 'Global economic indicators and calendar events.',
        status: 'active'
    },
    // --- 3. NEWS & SENTIMENT ---
    {
        id: 'src-finnhub',
        name: 'Finnhub.io',
        type: 'api',
        category: 'news',
        endpoint: 'https://finnhub.io/api/v1',
        description: 'Market News, Sentiment, and Fundamentals. Requires Free API Key.',
        status: 'active'
    },
    {
        id: 'src-financial-news',
        name: 'FinancialNewsAPI',
        type: 'api',
        category: 'news',
        endpoint: 'https://financialnewsapi.org',
        description: 'Real-time financial news with Sentiment Analysis.',
        status: 'active'
    },
    // --- 4. ON-CHAIN & WEB3 ---
    {
        id: 'src-etherscan',
        name: 'Etherscan',
        type: 'api',
        category: 'onchain',
        endpoint: 'https://api.etherscan.io/api',
        description: 'Ethereum Transactions, Gas, and Whale Alerts.',
        status: 'active'
    }
];

export const BrowserFS = {
    
    // --- File Operations ---

    listFiles: (): VirtualFile[] => {
        const raw = localStorage.getItem(STORAGE_KEY_VFS);
        return raw ? JSON.parse(raw) : [];
    },

    writeFile: (name: string, content: string, type: string = 'text/plain') => {
        const files = BrowserFS.listFiles();
        const existingIndex = files.findIndex(f => f.name === name);
        const newFile: VirtualFile = { name, content, type, lastModified: Date.now() };

        if (existingIndex >= 0) {
            files[existingIndex] = newFile;
        } else {
            files.push(newFile);
        }
        localStorage.setItem(STORAGE_KEY_VFS, JSON.stringify(files));
        return `File '${name}' written successfully to VFS.`;
    },

    readFile: (name: string): string => {
        const files = BrowserFS.listFiles();
        const file = files.find(f => f.name === name);
        if (!file) throw new Error(`File '${name}' not found in VFS.`);
        return file.content;
    },

    // --- System Boot Sync ---
    initializeSystemFiles: (files: Record<string, string>) => {
        const currentFiles = BrowserFS.listFiles();
        let updated = false;
        
        Object.entries(files).forEach(([name, content]) => {
            const existing = currentFiles.find(f => f.name === name);
            if (!existing || existing.content !== content) {
                BrowserFS.writeFile(name, content, 'text/markdown');
                updated = true;
            }
        });
        
        BrowserFS.initializeDataSources();
        
        if (updated) console.log("[FileSystem] System files synced/updated to VFS.");
    },

    // --- System Config Management ---

    saveSystemConfig: (config: SystemConfiguration) => {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    },

    loadSystemConfig: (): SystemConfiguration | null => {
        const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
        return raw ? JSON.parse(raw) : null;
    },

    // --- Data Source Management ---

    initializeDataSources: () => {
        const raw = localStorage.getItem(STORAGE_KEY_DATASOURCES);
        if (!raw) {
            console.log("[FileSystem] Bootstrapping Default Data Sources...");
            localStorage.setItem(STORAGE_KEY_DATASOURCES, JSON.stringify(DEFAULT_DATA_SOURCES));
        }
    },

    getDataSources: (): DataSource[] => {
        const raw = localStorage.getItem(STORAGE_KEY_DATASOURCES);
        return raw ? JSON.parse(raw) : DEFAULT_DATA_SOURCES;
    },

    addDataSource: (source: DataSource) => {
        const sources = BrowserFS.getDataSources();
        const index = sources.findIndex(s => s.id === source.id || s.endpoint === source.endpoint);
        if (index >= 0) {
            sources[index] = { ...sources[index], ...source }; 
        } else {
            sources.push(source);
        }
        localStorage.setItem(STORAGE_KEY_DATASOURCES, JSON.stringify(sources));
        return `Data Source '${source.name}' added to Neural Registry.`;
    },

    removeDataSource: (id: string) => {
        let sources = BrowserFS.getDataSources();
        sources = sources.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY_DATASOURCES, JSON.stringify(sources));
        return `Data Source removed from registry.`;
    },

    // --- Core System Evolution ---

    getCoreInstructions: (): string => {
        return localStorage.getItem(STORAGE_KEY_CORE_INSTRUCTIONS) || 
`<ROLE>
Kamu adalah QUANT NANGGROE ANALIS — sistem autonomous quantitative trading intelligence setara institutional trading desk.

Kamu BUKAN:
Asisten, Edukator, Signal seller, Content creator.

Kamu ADALAH:
Quant strategist, Market risk interpreter, Liquidity & flow analyst, Decision engine (ENTER / STAY OUT).

Kamu menggabungkan:
100+ metode retail & institutional
Data makro & mikro
Flow, positioning, liquidity
Logika probabilistik & risk asymmetry

Kamu WAJIB:
Menganalisis, Cross-validate, Menyelesaikan konflik, Memberi SATU keputusan final.

❌ Tidak boleh:
Hedging jawaban, Multi bias, "bisa jadi", "tergantung", "kemungkinan", Lebih dari satu setup.

---
<GLOBAL OBJECTIVE>
Menghasilkan SATU HIGH-QUALITY TRADE SETUP dengan:
Multi-source confluence
Valid HTF → LTF narrative
Likuiditas jelas
Risk/Reward ≥ 1:3
Entry, SL, TP structure-based
Logika institutional, bukan indikator doang

Jika ADA konflik data → NO TRADE.

---
<ASSET SCOPE>
Analisis SATU asset per run dari:
Forex (majors, minors, exotics)
Commodities (XAU, XAG, WTI, Brent, NG)
Indices (SPX, NQ, DAX, Nikkei, Hang Seng)
Crypto (BTC, ETH, SOL, dll)
Stocks Indonesia
Global equities

---
<DATA SOURCES — WAJIB SEMUA>
1️⃣ MACRO & FUNDAMENTAL: Central bank stance, Interest rate expectations, Inflation, GDP, Liquidity cycles.
2️⃣ COT — Commitment of Traders: Commercials, Large Speculators, Net positioning.
3️⃣ NEWS & GEO-POLITIK: High impact news, War, Monetary policy speech.
4️⃣ SENTIMEN MARKET: Fear & Greed, Options skew, Funding rate.
5️⃣ ORDERBOOK & FLOW: Liquidity clusters, Whale activity, Iceberg orders.
6️⃣ BROKER & RETAIL POSITIONING: Long vs Short ratio, Crowded trade detection.
7️⃣ INSTITUTIONAL FLOW: Smart money flow, Dark pool activity, ETF flow.

---
<STRATEGY ENGINE — 100+ METHODS>
Kamu TIDAK BOLEH memilih satu metode saja. Semua HARUS digabung → 1 keputusan.

🔹 Smart Money / Institutional: SMC, ICT (PD Arrays, Killzones, OTE), Liquidity engineering.
🔹 Structure & Auction: Wyckoff (A–E), Market Profile, Volume Profile.
🔹 Classical & Quant: Trend & range regime, SNR, Elliott Wave, Fibonacci, Mean reversion.
🔹 Order Flow: Delta, CVD, Absorption, Imbalance.
🔹 Indicators (VALIDATOR ONLY): RSI, MACD, Stochastic, Bollinger, ATR, VWAP.

⚠️ Indikator tidak boleh jadi alasan utama.

---
<MULTI-TIMEFRAME — WAJIB>
HTF (H1): Bias, Struktur, Liquidity target.
MTF (M15): POI, Manipulation / Distribution, AMD logic.
LTF (M5): Sweep, Entry trigger, Execution candle.

❌ Tanpa LTF confirmation → NO ENTRY.

---
<OUTPUT FORMAT — WAJIB PERSIS>

📊 [ASSET] | [Harga Sekarang]

━━━━━━━━━━━━━━━━━━━━
📈 DATA REAL-TIME
━━━━━━━━━━━━━━━━━━━━
📊 COT: [Ringkas 1-2 kalimat]
📰 News & Geo: [Ringkas 1-2 kalimat]
😱 Sentimen: [Ringkas 1-2 kalimat]
📖 Orderbook & Flow: [Ringkas 1-2 kalimat]
🏦 Broker Summary: [Ringkas 1-2 kalimat]
🏛️ Institusi: [Ringkas 1-2 kalimat]

━━━━━━━━━━━━━━━━━━━━
🧠 ANALISIS TEKNIKAL
━━━━━━━━━━━━━━━━━━━━
HTF (H1):
MTF (M15):
LTF (M5):

Strategi Confluence:
[Gabungan semua metode secara singkat]

━━━━━━━━━━━━━━━━━━━━
🎯 KEPUTUSAN FINAL
━━━━━━━━━━━━━━━━━━━━
Keputusan: [BUY / SELL / NO TRADE]

🔥 ENTRY: xxxx
🛑 SL: xxxx
✅ TP: xxxx
⚡ RRR: 1:x

━━━━━━━━━━━━━━━━━━━━
⚠️ INVALIDASI
[Kondisi yang membatalkan setup]

━━━━━━━━━━━━━━━━━━━━
📊 SUMBER & VISUALISASI
📈 TradingView: https://www.tradingview.com/chart/?symbol=SYMBOL

━━━━━━━━━━━━━━━━━━━━
⚠️ DISCLAIMER: Institutional Analysis Only. Not Financial Advice.
`;
    },

    updateCoreInstructions: (newInstructions: string) => {
        localStorage.setItem(STORAGE_KEY_CORE_INSTRUCTIONS, newInstructions);
    },

    applySystemPatch: (patchCode: string, description: string) => {
        const current = BrowserFS.getCoreInstructions();
        const updated = `${current}\n\n[SYSTEM PATCH ${Date.now()}]: ${description}\nRULE: ${patchCode}`;
        BrowserFS.updateCoreInstructions(updated);
        return "Kernel updated. Memory re-calibrated with new behavioral protocols.";
    },

    // --- LONG TERM MEMORY (VECTOR-LITE) ---
    // Stores past analyses and allows retrieval by keyword/context
    
    saveMemory: (content: string, tags: string[], agentId?: string) => {
        const raw = localStorage.getItem(STORAGE_KEY_MEMORY);
        const memories: KnowledgeItem[] = raw ? JSON.parse(raw) : [];
        
        // Optimize: Limit memory size (last 200 items for multi-agent support)
        if (memories.length > 200) memories.shift();

        memories.push({
            id: `mem-${Date.now()}`,
            category: 'memory',
            content: content,
            sourceAgentId: agentId || 'Alpha Prime',
            timestamp: Date.now(),
            confidence: 100,
            tags: tags
        });
        localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(memories));
    },

    loadMemoryByAgent: (agentId: string): string => {
        const raw = localStorage.getItem(STORAGE_KEY_MEMORY);
        if (!raw) return "";
        const memories: KnowledgeItem[] = JSON.parse(raw);
        
        const agentMemories = memories.filter(m => m.sourceAgentId === agentId);
        if (agentMemories.length === 0) return "";
        
        return agentMemories.slice(-5).map(h => 
            `[AGENT MEMORY - ${new Date(h.timestamp).toLocaleDateString()}]: ${h.content}`
        ).join('\n');
    },

    searchMemory: (query: string): string => {
        const raw = localStorage.getItem(STORAGE_KEY_MEMORY);
        if (!raw) return "";
        const memories: KnowledgeItem[] = JSON.parse(raw);
        
        const terms = query.toLowerCase().split(' ').filter(w => w.length > 3);
        
        // Simple semantic Keyword Match
        const hits = memories.filter(m => {
            const contentLower = m.content.toLowerCase();
            return terms.some(t => contentLower.includes(t) || m.tags.includes(t));
        });

        if (hits.length === 0) return "";
        
        return hits.slice(-3).map(h => 
            `[PAST MEMORY - ${new Date(h.timestamp).toLocaleDateString()}]: ${h.content.substring(0, 200)}...`
        ).join('\n');
    },

    // --- Portfolio Management (The "Bank") & Realistic Trade Engine ---

    getPortfolio: (): PortfolioPosition[] => {
        const raw = localStorage.getItem(STORAGE_KEY_PORTFOLIO);
        return raw ? JSON.parse(raw) : [
            { ticker: 'USD', amount: 100000, avgPrice: 1, currentPrice: 1, pnl: 0, lastUpdated: Date.now() } // Starting Cash
        ];
    },

    getTradeHistory: (): TradeHistoryItem[] => {
        const raw = localStorage.getItem(STORAGE_KEY_TRADE_HISTORY);
        return raw ? JSON.parse(raw) : [];
    },

    updatePortfolioPrices: (updates: Record<string, number>) => {
        const portfolio = BrowserFS.getPortfolio();
        let changed = false;

        const updatedPortfolio = portfolio.map(pos => {
            if (pos.ticker !== 'USD' && updates[pos.ticker]) {
                const newPrice = updates[pos.ticker];
                const pnl = (newPrice - pos.avgPrice) * pos.amount;
                changed = true;
                return { ...pos, currentPrice: newPrice, pnl, lastUpdated: Date.now() };
            }
            return pos;
        });

        if (changed) {
            localStorage.setItem(STORAGE_KEY_PORTFOLIO, JSON.stringify(updatedPortfolio));
        }
    },

    executeTrade: async (ticker: string, action: 'BUY' | 'SELL', amount: number, price: number) => {
        const portfolio = BrowserFS.getPortfolio();
        const history = BrowserFS.getTradeHistory();
        
        const cashIndex = portfolio.findIndex(p => p.ticker === 'USD');
        let cash = portfolio[cashIndex];
        
        let positionIndex = portfolio.findIndex(p => p.ticker === ticker);
        let position = positionIndex >= 0 ? portfolio[positionIndex] : { ticker, amount: 0, avgPrice: 0, currentPrice: price, pnl: 0, lastUpdated: Date.now() };

        // REALISM: Fee & Slippage
        const FEE_RATE = 0.001; // 0.1% Taker Fee
        const SLIPPAGE = 0.0005; // 0.05% Slippage estimate
        
        // Apply slippage to execution price
        const execPrice = action === 'BUY' ? price * (1 + SLIPPAGE) : price * (1 - SLIPPAGE);
        const rawValue = amount * execPrice;
        const fee = rawValue * FEE_RATE;
        const totalCost = rawValue + fee;
        const totalProceeds = rawValue - fee;

        let tradeNote = "";
        let realizedPnL = 0;

        // Capture Signals at time of trade for ML
        let activeSignalNames: string[] = [];
        try {
            const marketData = await MarketService.getPrice(ticker);
            if (marketData && marketData.activeSignals) {
                // Filter signals that match the action direction
                activeSignalNames = marketData.activeSignals
                    .filter(s => s.type === action)
                    .map(s => s.name);
            }
        } catch(e) { console.warn("Failed to snapshot signals for ML"); }

        if (action === 'BUY') {
            if (cash.amount < totalCost) return `Trade Rejected: Insufficient USD. Req: $${totalCost.toFixed(2)}`;
            
            // Average Cost Basis Calculation
            const prevValue = position.amount * position.avgPrice;
            const newValue = prevValue + rawValue; // Don't include fee in cost basis usually, but here we simplify
            position.avgPrice = newValue / (position.amount + amount);
            position.amount += amount;
            
            cash.amount -= totalCost;
            tradeNote = `BOUGHT ${amount} ${ticker} @ $${execPrice.toFixed(2)} (Fee: $${fee.toFixed(2)})`;

        } else if (action === 'SELL') {
            if (position.amount < amount) return `Trade Rejected: Insufficient Holdings.`;
            
            // Calc Realized PnL
            const costBasis = amount * position.avgPrice;
            realizedPnL = totalProceeds - costBasis;

            position.amount -= amount;
            cash.amount += totalProceeds;
            tradeNote = `SOLD ${amount} ${ticker} @ $${execPrice.toFixed(2)} (PnL: $${realizedPnL.toFixed(2)})`;
        }

        position.currentPrice = price;
        position.lastUpdated = Date.now();

        // Update Portfolio Array
        if (position.amount < 0.000001) {
            if (positionIndex >= 0) portfolio.splice(positionIndex, 1); // Remove empty
        } else {
            if (positionIndex >= 0) portfolio[positionIndex] = position;
            else portfolio.push(position);
        }
        portfolio[cashIndex] = cash; 

        // Log History with ML Data
        const tradeRecord: TradeHistoryItem = {
            id: `trd-${Date.now()}`,
            timestamp: Date.now(),
            ticker, action, amount,
            price: execPrice,
            totalValue: rawValue,
            fees: fee,
            realizedPnL: action === 'SELL' ? realizedPnL : undefined,
            triggeredBySignals: activeSignalNames
        };
        history.unshift(tradeRecord);

        // Commit
        localStorage.setItem(STORAGE_KEY_PORTFOLIO, JSON.stringify(portfolio));
        localStorage.setItem(STORAGE_KEY_TRADE_HISTORY, JSON.stringify(history));
        
        return `✅ EXECUTION CONFIRMED: ${tradeNote}`;
    }
};
