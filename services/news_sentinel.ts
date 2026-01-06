import { NewsItem, NewsSentinelOutput } from "../types";
import { AuditLogger } from "./audit_logger";

export const NewsSentinel = {
    /**
     * NEWS & MACRO SENTINEL (Sensor)
     * Output must be state & score based. Time decay is mandatory.
     */
    analyze: (news: NewsItem[]): NewsSentinelOutput => {
        AuditLogger.log('SENSOR', 'NewsSentinel: Analyzing Market News', { newsCount: news?.length });
        if (!news || news.length === 0) {
            const output: NewsSentinelOutput = {
                eventType: 'NOISE',
                impactScore: 0.1,
                directionalUncertainty: 0.5,
                timeDecay: 0
            };
            AuditLogger.log('SENSOR', 'NewsSentinel: No News Data', output, 'WARNING');
            return output;
        }
        
        const headlines = news.map(n => n.headline.toLowerCase());
        const macroKeywords = ['fed', 'cpi', 'fomc', 'gdp', 'inflation', 'rates', 'jobs', 'payrolls', 'interest'];
        const scheduledKeywords = ['report', 'calendar', 'upcoming', 'forecast', 'expected'];
        const shockKeywords = ['war', 'crash', 'collapse', 'halt', 'hack', 'crisis', 'emergency', 'black swan'];
        
        let impactScore = 0.2;
        let eventType: 'MACRO' | 'SCHEDULED' | 'SHOCK' | 'NOISE' = 'NOISE';
        
        for (const h of headlines) {
            if (shockKeywords.some(k => h.includes(k))) {
                eventType = 'SHOCK';
                impactScore = 0.95;
                break;
            }
            if (macroKeywords.some(k => h.includes(k))) {
                eventType = 'MACRO';
                impactScore = Math.max(impactScore, 0.8);
            } else if (scheduledKeywords.some(k => h.includes(k))) {
                eventType = 'SCHEDULED';
                impactScore = Math.max(impactScore, 0.5);
            }
        }
        
        const directionalUncertainty = eventType === 'SHOCK' ? 0.9 : eventType === 'MACRO' ? 0.5 : 0.2;
        const timeDecay = Math.floor((Date.now() - news[0].timestamp) / 1000);

        const output: NewsSentinelOutput = {
            eventType,
            impactScore,
            directionalUncertainty,
            timeDecay
        };

        AuditLogger.log('SENSOR', 'NewsSentinel: Analysis Complete', output);
        return output;
    }
};
