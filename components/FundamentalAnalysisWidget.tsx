
import React from 'react';
import { FundamentalAnalysisData, NewsEvent } from '../types';
import { AlertTriangleIcon, BotIcon } from './Icons';

interface FundamentalAnalysisWidgetProps {
  pair: string;
  aiData?: FundamentalAnalysisData;
  aiNews?: NewsEvent[];
}

const FundamentalAnalysisWidget: React.FC<FundamentalAnalysisWidgetProps> = ({ pair, aiData, aiNews }) => {
    
    if (!aiData) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-xl">
                <BotIcon className="w-8 h-8 text-gray-700 mb-3" />
                <h4 className="font-bold text-gray-500 text-[10px] uppercase tracking-widest mb-1">Waiting for Intelligence</h4>
                <p className="text-[9px] text-gray-700 font-mono px-4">
                    Run "Analyze Market" to fetch real-time fundamental data via AI Grounding.
                </p>
            </div>
        );
    }

    const getSentimentColor = (label: string) => {
        if (label.includes('Greed') || label === 'Bullish') return 'text-green-400';
        if (label.includes('Fear') || label === 'Bearish') return 'text-red-400';
        return 'text-gray-400';
    };

    return (
        <div className="h-full overflow-y-auto p-3 text-xs font-mono scrollbar-hide">
            {/* AI Sentiment Gauge */}
            <div className="mb-4 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">AI Sentiment Score</span>
                    <span className={`text-lg font-black ${getSentimentColor(aiData.sentiment_label)}`}>
                        {aiData.sentiment_score}/100
                    </span>
                </div>
                <div className="w-full bg-black h-1.5 rounded-full overflow-hidden mb-1">
                    <div 
                        className={`h-full ${getSentimentColor(aiData.sentiment_label).replace('text-', 'bg-')}`} 
                        style={{ width: `${aiData.sentiment_score}%` }}
                    ></div>
                </div>
                <div className="text-right text-[9px] font-bold text-gray-400 uppercase">{aiData.sentiment_label}</div>
            </div>

            {/* Institutional Bias */}
            <div className="mb-4">
                <h4 className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Institutional Bias</h4>
                <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        aiData.institutional_bias === 'Long' ? 'bg-green-500/20 text-green-400' :
                        aiData.institutional_bias === 'Short' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                        {aiData.institutional_bias}
                    </div>
                    <span className="text-[9px] text-gray-500">derived from search analysis</span>
                </div>
            </div>

            {/* Key Themes */}
            <div className="mb-4">
                <h4 className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Key Macro Themes</h4>
                <ul className="space-y-1">
                    {aiData.key_themes?.map((theme, i) => (
                        <li key={i} className="text-[10px] text-gray-300 flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {theme}
                        </li>
                    ))}
                </ul>
            </div>

             {/* Live News Feed (Sourced from AI) */}
             {aiNews && aiNews.length > 0 && (
                <div>
                    <h4 className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Live News Wire</h4>
                    <div className="space-y-2">
                        {aiNews.map((news, i) => (
                            <div key={i} className="bg-white/[0.02] p-2 rounded border border-white/5">
                                <div className="flex justify-between text-[8px] text-gray-500 mb-0.5">
                                    <span>{news.source}</span>
                                    <span>{news.time}</span>
                                </div>
                                <div className="text-[9px] text-gray-300 leading-tight">{news.headline}</div>
                            </div>
                        ))}
                    </div>
                </div>
             )}
        </div>
    );
};

export default FundamentalAnalysisWidget;
