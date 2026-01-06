
import React, { useState, useMemo } from 'react';
import Widget from './Widget';
import { ActivityIcon, SearchIcon } from './Icons';
import { MarketPrice } from '../types';

interface ScannedAsset extends MarketPrice {
  regime: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number; // 0-100 based on momentum magnitude
}

const MiSiScreener: React.FC<{ prices: MarketPrice[], onSelect: (id: string) => void }> = ({ prices, onSelect }) => {
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState<keyof ScannedAsset>('score');

  // REAL QUANT LOGIC (Simple but Honest)
  const scannedData = useMemo(() => {
    return prices.map(p => {
      // 1. Regime: Determined by daily change direction
      let regime: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      if (p.changePercent > 0.1) regime = 'BULLISH';
      else if (p.changePercent < -0.1) regime = 'BEARISH';

      // 2. Score: Determined by absolute momentum strength (capped at 100)
      // A change of 2% or more gets a score of 90+. Small changes get lower scores.
      const volatilityScore = Math.min(99, Math.floor(Math.abs(p.changePercent) * 30 + 40));
      
      return {
        ...p,
        regime,
        score: volatilityScore
      } as ScannedAsset;
    }).filter(p => p.id.toLowerCase().includes(filter.toLowerCase()) || p.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));
  }, [prices, filter, sortKey]);

  return (
    <Widget title="MiSi Real-Time Scanner" icon={<ActivityIcon className="w-4 h-4 text-blue-500" />}>
      <div className="h-full flex flex-col font-mono">
        <div className="flex items-center gap-3 mb-3 bg-black/60 px-3 py-2 rounded-xl border border-white/5 shadow-inner">
          <SearchIcon className="w-3.5 h-3.5 text-gray-700" />
          <input 
            type="text" 
            placeholder="FILTER TICKERS..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent border-none outline-none text-[10px] text-white w-full uppercase placeholder-gray-800"
          />
        </div>
        
        <div className="flex-grow overflow-y-auto pr-1 scrollbar-hide">
          <table className="w-full text-[9px] border-collapse">
            <thead className="sticky top-0 bg-[#0A0A0A] z-10">
              <tr className="text-gray-700 border-b border-white/5 uppercase font-black tracking-tighter">
                <th className="text-left py-2 px-1 cursor-pointer hover:text-gray-400 transition-colors" onClick={() => setSortKey('id')}>Ticker</th>
                <th className="text-left py-2 px-1">Regime (24h)</th>
                <th className="text-right py-2 px-1 cursor-pointer hover:text-gray-400 transition-colors" onClick={() => setSortKey('score')}>Vol Score</th>
              </tr>
            </thead>
            <tbody>
              {scannedData.map(asset => (
                <tr 
                  key={asset.id} 
                  onClick={() => onSelect(asset.id)}
                  className="border-b border-white/[0.02] hover:bg-white/5 cursor-pointer transition-all duration-300 group"
                >
                  <td className="py-2.5 px-1 font-bold text-gray-400 group-hover:text-white transition-colors">{asset.id}</td>
                  <td className="py-2.5 px-1">
                    <span className={`px-1.5 py-0.5 rounded-sm font-black text-[8px] ${
                      asset.regime === 'BULLISH' ? 'text-green-500/70 bg-green-500/5' : 
                      asset.regime === 'BEARISH' ? 'text-red-500/70 bg-red-500/5' : 'text-gray-600 bg-gray-500/5'
                    }`}>
                      {asset.regime}
                    </span>
                  </td>
                  <td className="py-2.5 px-1 text-right">
                    <span className={`font-black tracking-tighter text-[11px] ${
                      asset.score > 80 ? 'text-yellow-500' : 'text-blue-500'
                    }`}>
                      {asset.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center opacity-40">
           <span className="text-[8px] uppercase font-black tracking-widest text-gray-600">LIVE MOMENTUM CALCULATION</span>
        </div>
      </div>
    </Widget>
  );
};

export default MiSiScreener;
