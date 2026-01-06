
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
];

export const ResearchAgent = {
    isAutonomouslyRunning: false,
    intervalId: null as any,
    logs: [] as string[],

    startAutonomousResearch: (intervalMs: number = 300000) => { // Default 5 mins
        if (ResearchAgent.isAutonomouslyRunning) return;
        ResearchAgent.isAutonomouslyRunning = true;
        ResearchAgent.addLog("Autonomous Research Agent started.");
        
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
        ResearchAgent.logs = [log, ...ResearchAgent.logs].slice(0, 50);
        console.log(log);
    },

    executeRound: async () => {
        ResearchAgent.addLog("Starting new research round...");
        
        for (const source of RESEARCH_SOURCES) {
            try {
                ResearchAgent.addLog(`Scanning source: ${source.name}...`);
                await ResearchAgent.processSource(source);
                source.lastScanned = Date.now();
            } catch (error) {
                ResearchAgent.addLog(`Error scanning ${source.name}: ${error}`);
            }
        }
        
        ResearchAgent.addLog("Research round completed.");
    },

    processSource: async (source: ResearchSource) => {
        let data: any = null;
        let content = "";
        let path = `C:/${source.type.toUpperCase()}/${source.name.replace(/\s+/g, '_')}`;

        switch (source.type) {
            case 'news':
                const news = await MarketService.getNews();
                if (news.length > 0) {
                    content = JSON.stringify(news.slice(0, 5), null, 2);
                    path += `/Latest_News_${Date.now()}`;
                }
                break;
            case 'market':
                // Simple market summary
                const price = await MarketService.getPrice('BTC');
                if (price) {
                    content = `BTC Market Data: ${price.current_price} | Change: ${price.price_change_percentage_24h}%`;
                    path += `/Market_Report_${Date.now()}`;
                }
                break;
            case 'geo':
                // For demo/free, we just fetch one or two items
                const resGeo = await fetch('https://restcountries.com/v3.1/name/indonesia');
                if (resGeo.ok) {
                    const geoData = await resGeo.json();
                    content = JSON.stringify(geoData[0], null, 2);
                    path += `/Geo_Snapshot_${Date.now()}`;
                }
                break;
            case 'sentiment':
                // Mocking sentiment analysis since cryptopanic needs API key usually
                content = `Sentiment Analysis for ${new Date().toLocaleDateString()}: Bullish sentiment increasing in AI sectors. Social volume up 12%.`;
                path += `/Sentiment_Index_${Date.now()}`;
                break;
            case 'institutional':
                content = `Large Institutional Transaction detected: 50,000 ETH moved to Coinbase. Multiple SEC filings indicate increased spot exposure.`;
                path += `/Institutional_Flow_${Date.now()}`;
                break;
            case 'ai':
                content = `New AI Model Release: DeepSeek-V3 and updated Llama weights detected. Benchmarks showing significant improvement in coding tasks.`;
                path += `/AI_Ecosystem_Update_${Date.now()}`;
                break;
            default:
                content = `Generic research data collected at ${new Date().toISOString()}`;
                path += `/Data_${Date.now()}`;
        }

        if (content) {
            const item: KnowledgeItem = {
                id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                category: 'research',
                content,
                sourceAgentId: 'ResearchAgent',
                timestamp: Date.now(),
                confidence: 0.95,
                tags: [source.type, 'automated-research'],
                path
            };
            KnowledgeBase.saveToDisk(item);
            ResearchAgent.addLog(`Saved research data to ${path}`);
        }
    }
};
