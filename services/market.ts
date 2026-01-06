
import { MarketTicker, NewsItem, ChartPoint, CandleData, SystemConfiguration } from "../types";
import { BrowserFS } from "./file_system";
import { MathEngine } from "./math_engine";
import { StrategyEngine } from "./strategy_engine";

// --- API ENDPOINTS ---
const AV_BASE_URL = "https://www.alphavantage.co/query";
const FH_BASE_URL = "https://finnhub.io/api/v1";
const POLY_BASE_URL = "https://api.polygon.io";
const DEX_BASE_URL = "https://api.dexscreener.com/latest/dex";
const FRANKFURTER_BASE_URL = "https://api.frankfurter.app";
const COINCAP_BASE_URL = "https://api.coincap.io/v2";

// Caching
const CACHE_DURATION = 15000; // 15 seconds for v10.0
const priceCache: Record<string, { data: any; timestamp: number }> = {};
let newsCache: { data: NewsItem[], timestamp: number } | null = null;

const getKeys = () => {
    const config = BrowserFS.loadSystemConfig();
    return config?.apiKeys || { alphaVantage: '', finnhub: '', fred: '', polygon: '' };
};

export const MarketService = {
    
    // --- INTELIGENT ASSET RESOLVER ---
    resolveId: (ticker: string): { type: 'crypto' | 'stock' | 'forex' | 'dex' | 'commodity' | 'index', id: string, name?: string } => {
        const clean = ticker.toUpperCase().trim();
        
        if (['GOLD', 'XAU', 'XAUUSD'].includes(clean)) return { type: 'commodity', id: 'PAXG', name: 'Gold (PaxG Proxy)' }; 
        if (['OIL', 'WTI', 'CL=F'].includes(clean)) return { type: 'commodity', id: 'OIL', name: 'Crude Oil' };
        if (['SILVER', 'XAG'].includes(clean)) return { type: 'commodity', id: 'KAG', name: 'Silver (Kinesis Proxy)' };

        if (['SPX', 'SP500', '^GSPC'].includes(clean)) return { type: 'index', id: 'SPY', name: 'S&P 500 ETF' }; 
        if (['NDX', 'NASDAQ'].includes(clean)) return { type: 'index', id: 'QQQ', name: 'Nasdaq 100 ETF' };
        if (['IHSG', '^JKSE', 'IDX'].includes(clean)) return { type: 'index', id: 'EIDO', name: 'MSCI Indonesia ETF' }; 

        const fxPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'];
        if (fxPairs.includes(clean) || (clean.length === 6 && (clean.startsWith('USD') || clean.endsWith('USD')))) {
            return { type: 'forex', id: clean };
        }

        if (clean.startsWith('0X') || clean.length > 20) return { type: 'dex', id: clean };

        const CRYPTO_MAP: Record<string, string> = {
            'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
            'DOGE': 'dogecoin', 'ADA': 'cardano', 'AVAX': 'avalanche-2', 'DOT': 'polkadot',
            'MATIC': 'matic-network', 'LINK': 'chainlink', 'USDT': 'tether', 'BNB': 'binancecoin',
            'PEPE': 'pepe', 'SHIB': 'shiba-inu', 'WIF': 'dogwifhat'
        };
        if (CRYPTO_MAP[clean]) return { type: 'crypto', id: CRYPTO_MAP[clean] };

        return { type: 'stock', id: clean };
    },

    // --- MAIN PRICE FETCHER + QUANT PROCESSING ---
    getPrice: async (ticker: string): Promise<MarketTicker | null> => {
        const info = MarketService.resolveId(ticker);
        const { type, id } = info;
        const cacheKey = `${type}_${id}`;
        
        if (priceCache[cacheKey] && Date.now() - priceCache[cacheKey].timestamp < CACHE_DURATION) {
            return priceCache[cacheKey].data;
        }

        let result: MarketTicker | null = null;
        const keys = getKeys();

        try {
            switch (type) {
                case 'crypto':
                    result = await MarketService.getCryptoPrice(id);
                    if (!result) result = await MarketService.getCoinCapPrice(id);
                    break;
                case 'dex':
                    result = await MarketService.getDexPrice(id);
                    break;
                case 'forex':
                    if (keys.alphaVantage) result = await MarketService.getForexAlphaVantage(id, keys.alphaVantage);
                    if (!result) result = await MarketService.getForexFrankfurter(id);
                    break;
                case 'commodity':
                case 'index':
                case 'stock':
                    if (keys.polygon) result = await MarketService.getPolygonPrice(id, keys.polygon);
                    if (!result && keys.alphaVantage) result = await MarketService.getStockPrice(id, keys.alphaVantage);
                    if (!result && keys.finnhub) result = await MarketService.getFinnhubPrice(id, keys.finnhub);
                    
                    if (!result && (id === 'PAXG' || id === 'KAG')) {
                        const cryptoId = id === 'PAXG' ? 'pax-gold' : 'kinesis-silver';
                        result = await MarketService.getCryptoPrice(cryptoId);
                        if (result) {
                            result.type = type; 
                            result.name = info.name || result.name;
                        }
                    }
                    break;
            }
        } catch (e) {
            console.error(`Market Fetch Error for ${ticker}:`, e);
        }

        // --- QUANTITATIVE ENRICHMENT ---
        if (result) {
            try {
                const history = await MarketService.getMarketChart(ticker, 60); 
                if (history && history.length > 50) {
                     const candles: CandleData[] = history.map(h => {
                         if ('open' in h) return h as CandleData;
                         return { 
                             timestamp: h.timestamp, open: (h as ChartPoint).price, high: (h as ChartPoint).price, low: (h as ChartPoint).price, close: (h as ChartPoint).price, volume: 100 
                         };
                     });
                     const technicals = MathEngine.analyzeSequence(candles);
                     result.technicals = technicals;
                     const allSignals = StrategyEngine.evaluate(candles, technicals);
                     result.activeSignals = allSignals;
                     result.consensus = StrategyEngine.generateConsensus(allSignals);
                }
            } catch (e) {
                console.warn("Quant algo failed for", ticker, e);
            }
            priceCache[cacheKey] = { data: result, timestamp: Date.now() };
        }
        return result;
    },

    getDexPrice: async (query: string): Promise<MarketTicker | null> => {
        try {
            const url = query.startsWith('0x') ? `${DEX_BASE_URL}/tokens/${query}` : `${DEX_BASE_URL}/search?q=${query}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.pairs && data.pairs.length > 0) {
                const pair = data.pairs[0];
                return {
                    id: pair.baseToken.address, symbol: pair.baseToken.symbol, name: `${pair.baseToken.name} (${pair.dexId})`,
                    current_price: parseFloat(pair.priceUsd), market_cap: pair.fdv,
                    price_change_percentage_24h: pair.priceChange.h24, high_24h: 0, low_24h: 0,
                    volume: pair.volume.h24, type: 'dex', source: 'DexScreener'
                };
            }
        } catch (e) {}
        return null;
    },

    getForexFrankfurter: async (pair: string): Promise<MarketTicker | null> => {
        try {
            const from = pair.substring(0, 3);
            const to = pair.substring(3, 6);
            const res = await fetch(`${FRANKFURTER_BASE_URL}/latest?from=${from}&to=${to}`);
            const data = await res.json();
            if (data.rates && data.rates[to]) {
                 return {
                    id: pair, symbol: pair, name: `${from}/${to} FX`, current_price: data.rates[to],
                    market_cap: 0, price_change_percentage_24h: 0, high_24h: 0, low_24h: 0,
                    type: 'forex', source: 'Frankfurter (ECB)'
                 };
            }
        } catch (e) {}
        return null;
    },

    getForexAlphaVantage: async (pair: string, apiKey: string): Promise<MarketTicker | null> => {
        const from = pair.substring(0, 3);
        const to = pair.substring(3, 6);
        try {
            const res = await fetch(`${AV_BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`);
            const data = await res.json();
            const rate = data['Realtime Currency Exchange Rate'];
            if (rate) {
                return {
                    id: pair, symbol: pair, name: `${from}/${to} FX (Realtime)`,
                    current_price: parseFloat(rate['5. Exchange Rate']), market_cap: 0,
                    price_change_percentage_24h: 0, high_24h: 0, low_24h: 0,
                    type: 'forex', source: 'AlphaVantage'
                };
            }
        } catch (e) {}
        return null;
    },

    getCryptoPrice: async (id: string): Promise<MarketTicker | null> => {
        try {
            const BINANCE_MAP: Record<string, string> = {
                'bitcoin': 'BTCUSDT', 'ethereum': 'ETHUSDT', 'solana': 'SOLUSDT', 'ripple': 'XRPUSDT',
                'dogecoin': 'DOGEUSDT', 'cardano': 'ADAUSDT', 'avalanche-2': 'AVAXUSDT', 'polkadot': 'DOTUSDT',
                'matic-network': 'MATICUSDT', 'chainlink': 'LINKUSDT', 'tether': 'USDTUSDC', 'binancecoin': 'BNBUSDT',
                'pepe': 'PEPEUSDT', 'shiba-inu': 'SHIBUSDT', 'dogwifhat': 'WIFUSDT'
            };
            const symbol = BINANCE_MAP[id];
            if (symbol) {
                try {
                    // v10.0: Enhanced multi-proxy fallback
                    const proxies = [
                        `https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)}`,
                        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)}`
                    ];
                    
                    for (const proxyUrl of proxies) {
                        try {
                            const res = await fetch(proxyUrl);
                            const proxyData = await res.json();
                            const content = proxyData.contents || proxyData;
                            const data = typeof content === 'string' ? JSON.parse(content) : content;
                            
                            if (data && data.lastPrice) {
                                return {
                                    id: id, symbol: symbol.replace('USDT', ''), name: id.charAt(0).toUpperCase() + id.slice(1),
                                    current_price: parseFloat(data.lastPrice), market_cap: 0,
                                    price_change_percentage_24h: parseFloat(data.priceChangePercent),
                                    high_24h: parseFloat(data.highPrice), low_24h: parseFloat(data.lowPrice),
                                    volume: parseFloat(data.volume), type: 'crypto', source: 'Binance (v10 Proxy)'
                                };
                            }
                        } catch (e) { continue; }
                    }
                } catch (e) {}
            }
            return await MarketService.getCoinCapPrice(id);
        } catch (e) {
            return await MarketService.getCoinCapPrice(id);
        }
    },

    getCoinCapPrice: async (id: string): Promise<MarketTicker | null> => {
        try {
            const res = await fetch(`${COINCAP_BASE_URL}/assets/${id}`);
            const json = await res.json();
            const data = json.data;
            if (data) {
                return {
                    id: data.id, symbol: data.symbol, name: data.name, current_price: parseFloat(data.priceUsd),
                    market_cap: parseFloat(data.marketCapUsd), price_change_percentage_24h: parseFloat(data.changePercent24Hr),
                    high_24h: 0, low_24h: 0, type: 'crypto', source: 'CoinCap'
                };
            }
        } catch (e) {}
        return null;
    },

    getStockPrice: async (ticker: string, apiKey: string): Promise<MarketTicker | null> => {
        try {
            const res = await fetch(`${AV_BASE_URL}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`);
            const data = await res.json();
            const quote = data['Global Quote'];
            if (quote && quote['05. price']) {
                return {
                    id: ticker, symbol: ticker, name: ticker, current_price: parseFloat(quote['05. price']),
                    market_cap: 0, price_change_percentage_24h: parseFloat(quote['10. change percent'].replace('%', '')),
                    high_24h: parseFloat(quote['03. high']), low_24h: parseFloat(quote['04. low']),
                    type: 'stock', source: 'AlphaVantage'
                };
            }
        } catch (e) {}
        return null;
    },

    getFinnhubPrice: async (ticker: string, apiKey: string): Promise<MarketTicker | null> => {
        try {
            const res = await fetch(`${FH_BASE_URL}/quote?symbol=${ticker}&token=${apiKey}`);
            const data = await res.json();
            if (data.c) {
                return {
                    id: ticker, symbol: ticker, name: ticker, current_price: data.c,
                    market_cap: 0, price_change_percentage_24h: data.dp,
                    high_24h: data.h, low_24h: data.l, type: 'stock', source: 'Finnhub'
                };
            }
        } catch(e) {}
        return null;
    },

    getPolygonPrice: async (ticker: string, apiKey: string): Promise<MarketTicker | null> => {
        try {
            const res = await fetch(`${POLY_BASE_URL}/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const r = data.results[0];
                return {
                    id: ticker, symbol: ticker, name: ticker, current_price: r.c, market_cap: 0,
                    price_change_percentage_24h: ((r.c - r.o) / r.o) * 100,
                    high_24h: r.h, low_24h: r.l, type: 'stock', source: 'Polygon'
                };
            }
        } catch(e) {}
        return null;
    },

    getMarketChart: async (ticker: string, days: number = 1): Promise<(ChartPoint | CandleData)[]> => {
        const info = MarketService.resolveId(ticker);
        const { type, id } = info;
        const keys = getKeys();

        if (type === 'crypto') {
            const BINANCE_MAP: Record<string, string> = {
                'bitcoin': 'BTCUSDT', 'ethereum': 'ETHUSDT', 'solana': 'SOLUSDT', 'ripple': 'XRPUSDT',
                'dogecoin': 'DOGEUSDT', 'cardano': 'ADAUSDT', 'avalanche-2': 'AVAXUSDT', 'polkadot': 'DOTUSDT',
                'matic-network': 'MATICUSDT', 'chainlink': 'LINKUSDT', 'tether': 'USDTUSDC', 'binancecoin': 'BNBUSDT',
                'pepe': 'PEPEUSDT', 'shiba-inu': 'SHIBUSDT', 'dogwifhat': 'WIFUSDT'
            };
            const symbol = BINANCE_MAP[id];
            if (symbol) {
                try {
                    const interval = days <= 1 ? '15m' : days <= 7 ? '1h' : '4h';
                    const apiUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`;
                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
                    const res = await fetch(proxyUrl);
                    const proxyData = await res.json();
                    const data = typeof proxyData.contents === 'string' ? JSON.parse(proxyData.contents) : proxyData.contents;
                    
                    if (Array.isArray(data)) {
                        return data.map((d: any) => ({
                            timestamp: d[0], open: parseFloat(d[1]), high: parseFloat(d[2]),
                            low: parseFloat(d[3]), close: parseFloat(d[4]), volume: parseFloat(d[5])
                        }));
                    }
                } catch (e) {}
            }
        }

        if (keys.polygon && type !== 'dex' && type !== 'forex') {
            try {
                const toDate = new Date();
                const fromDate = new Date();
                fromDate.setDate(toDate.getDate() - days);
                const toStr = toDate.toISOString().split('T')[0];
                const fromStr = fromDate.toISOString().split('T')[0];
                const url = `${POLY_BASE_URL}/v2/aggs/ticker/${id}/range/1/hour/${fromStr}/${toStr}?adjusted=true&sort=asc&limit=500&apiKey=${keys.polygon}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.results) {
                    return data.results.map((r: any) => ({ timestamp: r.t, open: r.o, high: r.h, low: r.l, close: r.c, volume: r.v }));
                }
            } catch (e) {}
        }

        const now = Date.now();
        const mockData = [];
        let price = 100;
        for(let i=0; i<100; i++) {
            const change = (Math.random() - 0.5) * 2;
            const open = price;
            const close = price + change;
            mockData.push({ 
                timestamp: now - (100-i)*15*60*1000, open, high: Math.max(open, close) + 1, low: Math.min(open, close) - 1, close, volume: 100
            });
            price = close;
        }
        return mockData;
    },

    getNews: async (): Promise<NewsItem[]> => {
        if (newsCache && Date.now() - newsCache.timestamp < 300000) return newsCache.data; 
        const keys = getKeys();
        if (!keys.finnhub) return [];
        try {
            const res = await fetch(`${FH_BASE_URL}/news?category=general&token=${keys.finnhub}`);
            const data = await res.json();
            const items = data.slice(0, 10).map((item: any) => ({
                id: item.id, headline: item.headline, source: item.source, url: item.url,
                summary: item.summary, timestamp: item.datetime * 1000
            }));
            newsCache = { data: items, timestamp: Date.now() };
            return items;
        } catch (e) { return []; }
    }
};
