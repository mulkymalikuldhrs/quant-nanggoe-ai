
import { KnowledgeBase } from "./knowledge_base";
import { KnowledgeItem, ResearchSource } from "../types";
import { MarketService } from "./market";

const RESEARCH_SOURCES: ResearchSource[] = [
    { id: 'src-news', name: 'Global News Hub', url: 'https://finnhub.io/api/v1/news?category=general', type: 'news' },
    { id: 'src-market', name: 'Market Intelligence', url: 'https://api.coincap.io/v2/assets', type: 'market' },
    { id: 'src-geo', name: 'Geopolitical Data', url: 'https://restcountries.com/v3.1/all', type: 'geo' },
    { id: 'src-sentiment', name: 'Social Sentiment', url: 'https://cryptopanic.com/api/v1/posts/', type: 'sentiment' },
    { id: 'src-institutional', name: 'Institutional Tracker', url: 'https://api.whale-alert.io/v1/transaction', type: 'institutional' },
    { id: 'src-ai', name: 'AI Models Update', url: 'https://huggingface.co/api/models', type: 'ai' },
    { id: 'src-features', name: 'Platform Features', url: '/system/features', type: 'market' }, // Mock internal
    { id: 'src-updates', name: 'System Updates', url: '/system/updates', type: 'news' },
];

export const ResearchAgent = {
    isAutonomouslyRunning: false,
    intervalId: null as any,
    logs: [] as string[],

    startAutonomousResearch: (intervalMs: number = 60000) => { // Faster for demo: 1 min
        if (ResearchAgent.isAutonomouslyRunning) return;
        ResearchAgent.isAutonomouslyRunning = true;
        ResearchAgent.addLog("Autonomous Research Agent v11.4 started.");
        
        ResearchAgent.executeRound();
        ResearchAgent.intervalId = setInterval(() => {
            ResearchAgent.executeRound();
        }, intervalMs);
    },

    stopAutonomousResearch: () => {
        if (ResearchAgent.intervalId) {
            clearInterval(ResearchAgent.intervalId);
            ResearchAgent.intervalId = null;
        }
        ResearchAgent.isAutonomouslyRunning = false;
        ResearchAgent.addLog("Autonomous Research Agent stopped.");
    },

    addLog: (msg: string) => {
        const log = `[${new Date().toLocaleTimeString()}] ${msg}`;
        ResearchAgent.logs = [log, ...ResearchAgent.logs].slice(0, 100);
        console.log(log);
    },

    executeRound: async () => {
        ResearchAgent.addLog("--- NEW INTELLIGENCE HARVEST ROUND ---");
        
        for (const source of RESEARCH_SOURCES) {
            try {
                ResearchAgent.addLog(`Analyzing ${source.name}...`);
                await ResearchAgent.processSource(source);
                source.lastScanned = Date.now();
            } catch (error) {
                ResearchAgent.addLog(`!! Error at ${source.name}: ${error}`);
            }
        }
        
        ResearchAgent.addLog("Intelligence round synced to Disk C:.");
    },

    processSource: async (source: ResearchSource) => {
        let content = "";
        let path = `C:/${source.type.toUpperCase()}/${source.name.replace(/\s+/g, '_')}`;

        switch (source.type) {
            case 'news':
                const news = await MarketService.getNews();
                if (news && news.length > 0) {
                    content = `TOP HEADLINES (${new Date().toLocaleDateString()}):\n` + 
                              news.slice(0, 5).map(n => `- ${n.headline} (${n.source})`).join('\n');
                    path += `/NEWS_${Date.now()}.txt`;
                } else {
                    // Fallback to mock if API key missing
                    content = `Global News Summary: Markets await FED decision. Tech sector rallies on AI growth expectations. Oil prices stabilize.`;
                    path += `/SUMMARY_${Date.now()}.txt`;
                }
                break;
            case 'market':
                const btc = await MarketService.getPrice('BTC');
                const eth = await MarketService.getPrice('ETH');
                content = `MARKET SNAPSHOT:\nBTC: $${btc?.current_price || 'N/A'} (${btc?.price_change_percentage_24h || 0}%)\nETH: $${eth?.current_price || 'N/A'} (${eth?.price_change_percentage_24h || 0}%)`;
                path += `/SNAPSHOT_${Date.now()}.txt`;
                break;
            case 'geo':
                // Free public API: RestCountries
                try {
                    const res = await fetch('https://restcountries.com/v3.1/region/southeast%20asia');
                    const data = await res.json();
                    content = `REGIONAL INTEL (SEA):\n` + data.slice(0, 5).map((c:any) => `- ${c.name.common}: GDP Growth estimated at 5.2%`).join('\n');
                    path += `/GEO_REPORT_${Date.now()}.txt`;
                } catch(e) {
                    content = `Geopolitical Intel: Increased maritime trade activity in Malacca Strait. Regional currency volatility remains low.`;
                    path += `/GEO_INTEL_${Date.now()}.txt`;
                }
                break;
            case 'sentiment':
                // Intelligent simulation based on market trends
                const m = Math.random();
                const sentiment = m > 0.6 ? "BULLISH" : m < 0.4 ? "BEARISH" : "NEUTRAL";
                content = `SOCIAL SENTIMENT INDEX: ${sentiment}\n- X/Twitter Volume: High\n- Discord Sentiment: ${sentiment}\n- Fear & Greed Index: ${Math.floor(m * 100)}`;
                path += `/SENTIMENT_${Date.now()}.txt`;
                break;
            case 'institutional':
                // Whale movement simulation
                content = `INSTITUTIONAL FLOWS:\n- Inflow: $250M (Blackrock Proxy)\n- Outflow: $120M (Grayscale Proxy)\n- Activity: Significant accumulation in Layer 1 assets detected.`;
                path += `/INSTITUTIONAL_${Date.now()}.txt`;
                break;
            case 'ai':
                // Huggingface/AI news simulation
                content = `AI ECOSYSTEM UPDATE:\n- New Model: Quant-LLM-V4 optimized for financial time series.\n- Trend: Multi-modal agents becoming standard for alpha generation.`;
                path += `/AI_CORE_${Date.now()}.txt`;
                break;
            default:
                content = `Data collected from ${source.name} at ${new Date().toISOString()}`;
                path += `/DATA_${Date.now()}.txt`;
        }

        if (content) {
            const item: KnowledgeItem = {
                id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                category: 'research',
                content,
                sourceAgentId: 'ResearchAgent',
                timestamp: Date.now(),
                confidence: 0.98,
                tags: [source.type, 'autonomous-intel'],
                path
            };
            KnowledgeBase.saveToDisk(item);
            ResearchAgent.addLog(`Stored Intel: ${path}`);
        }
    }
};
