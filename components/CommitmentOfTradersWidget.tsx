
import React from 'react';
import { COTData } from '../types';
import { AlertTriangleIcon } from './Icons';

interface CommitmentOfTradersWidgetProps {
  pair: string;
  data: COTData | null;
}

const CotBar: React.FC<{
    label: string;
    long: number;
    short: number;
    total: number;
}> = ({ label, long, short, total }) => {
    const longPercent = (long / total) * 100;
    const shortPercent = (short / total) * 100;
    const net = long - short;

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-300">{label}</span>
                <span className={`font-semibold ${net > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    Net: {net.toLocaleString()}
                </span>
            </div>
            <div className="flex h-5 w-full bg-gray-700/50 rounded overflow-hidden">
                <div 
                    className="bg-green-500/80 flex items-center justify-center text-black font-bold text-[10px]"
                    style={{ width: `${longPercent}%` }}
                    title={`Long: ${long.toLocaleString()}`}
                >
                  {longPercent > 15 ? `${Math.round(longPercent)}%` : ''}
                </div>
                <div 
                    className="bg-red-500/80 flex items-center justify-center text-black font-bold text-[10px]"
                    style={{ width: `${shortPercent}%` }}
                    title={`Short: ${short.toLocaleString()}`}
                >
                   {shortPercent > 15 ? `${Math.round(shortPercent)}%` : ''}
                </div>
            </div>
        </div>
    );
}

const CommitmentOfTradersWidget: React.FC<CommitmentOfTradersWidgetProps> = ({ pair, data }) => {
    if (!data) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <AlertTriangleIcon className="w-10 h-10 text-yellow-500 mb-3" />
                <h4 className="font-bold text-yellow-400 mb-1">Data Feed Required</h4>
                <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                    Enable Market Replay mode to load COT data for {pair}.
                </p>
            </div>
        );
    }
    
    const { nonCommercial, commercial, nonReportable, reportDate } = data;
    const totalLong = nonCommercial.long + commercial.long + nonReportable.long;
    const totalShort = nonCommercial.short + commercial.short + nonReportable.short;
    const totalPositions = totalLong + totalShort;


    return (
        <div className="h-full overflow-y-auto p-2 text-xs font-mono space-y-4">
           <div>
                <div className="flex justify-between items-baseline">
                     <h4 className="text-sm font-bold text-[var(--color-text-secondary)]">COT Positions</h4>
                     <span className="text-[10px] text-gray-500">Report Date: {reportDate}</span>
                </div>
                <div className="mt-2 space-y-3">
                   <CotBar label="Non-Commercial" long={nonCommercial.long} short={nonCommercial.short} total={totalLong + totalShort} />
                   <CotBar label="Commercial" long={commercial.long} short={commercial.short} total={totalLong + totalShort} />
                   <CotBar label="Non-Reportable" long={nonReportable.long} short={nonReportable.short} total={totalLong + totalShort} />
                </div>
           </div>
           <div className="text-center text-[10px] text-gray-600 pt-2">
                Non-Commercial ("Smart Money") positions are key indicators of institutional sentiment.
           </div>
        </div>
    );
};

export default CommitmentOfTradersWidget;
