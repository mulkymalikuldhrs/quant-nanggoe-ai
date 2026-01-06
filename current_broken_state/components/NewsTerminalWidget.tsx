
import React from 'react';
import { NewsEvent } from '../types';
import { BotIcon, AlertTriangleIcon } from './Icons';

interface NewsTerminalWidgetProps {
  // Now accepts news directly from the AI analysis result
  aiNews?: NewsEvent[];
}

const NewsTerminalWidget: React.FC<NewsTerminalWidgetProps> = ({ aiNews }) => {

    if (!aiNews || aiNews.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-xl">
                 <BotIcon className="w-8 h-8 text-gray-700 mb-3" />
                <h4 className="font-bold text-gray-600 text-[10px] uppercase tracking-widest mb-1">News Feed Standby</h4>
                <p className="text-[9px] text-gray-800 font-mono">
                    System awaiting AI Grounding scan...
                </p>
            </div>
        );
    }

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'High': return 'text-red-400 border-red-500/30 bg-red-500/10';
            case 'Medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
            default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
        }
    };

    return (
        <div className="h-full flex flex-col text-[10px] font-mono scrollbar-hide p-2">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <h4 className="font-bold text-gray-500 uppercase tracking-widest">Real-Time Search Results</h4>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[8px] text-green-500 font-bold">VERIFIED</span>
                </div>
            </div>

            <div className="space-y-2 overflow-y-auto pr-1">
                {aiNews.map((item, index) => (
                    <div key={index} className="flex flex-col gap-1 bg-white/[0.02] p-2 rounded-lg border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <div className="flex justify-between items-center">
                             <span className="text-[8px] font-bold text-blue-400">{item.source}</span>
                             <span className={`text-[8px] px-1.5 rounded border ${getImpactColor(item.impact)}`}>
                                {item.impact.toUpperCase()}
                             </span>
                        </div>
                        <p className="text-gray-300 leading-snug">{item.headline}</p>
                        <span className="text-[8px] text-gray-600 text-right">{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsTerminalWidget;
