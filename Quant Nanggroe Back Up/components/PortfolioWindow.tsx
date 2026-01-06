
import React, { useEffect, useState } from 'react';
import { BrowserFS } from '../services/file_system';
import { MarketService } from '../services/market';
import { PortfolioPosition, TradeHistoryItem } from '../types';
import { IconBook, IconCheck } from './Icons';

const PortfolioWindow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'holdings' | 'history'>('holdings');
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
  const [history, setHistory] = useState<TradeHistoryItem[]>([]);
  const [lastSync, setLastSync] = useState<number>(Date.now());
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = () => {
      setPortfolio(BrowserFS.getPortfolio());
      setHistory(BrowserFS.getTradeHistory());
  };

  const syncPrices = async () => {
      setIsSyncing(true);
      const current = BrowserFS.getPortfolio();
      const updates: Record<string, number> = {};
      const assets = current.filter(p => p.ticker !== 'USD' && p.amount > 0);
      
      for (const asset of assets) {
          const marketData = await MarketService.getPrice(asset.ticker);
          if (marketData) {
              updates[asset.ticker] = marketData.current_price;
          }
      }

      if (Object.keys(updates).length > 0) {
          BrowserFS.updatePortfolioPrices(updates);
          loadData();
          setLastSync(Date.now());
      }
      setIsSyncing(false);
  };

  useEffect(() => {
    loadData();
    syncPrices();
    const interval = setInterval(loadData, 1000);
    const priceInterval = setInterval(syncPrices, 60000);
    return () => { clearInterval(interval); clearInterval(priceInterval); };
  }, []);

  const totalValue = portfolio.reduce((acc, p) => {
      if (p.ticker === 'USD') return acc + p.amount;
      return acc + (p.amount * p.currentPrice);
  }, 0);

  return (
    <div className="h-full w-full flex flex-col bg-gray-50/50">
        <div className="flex-none bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                 <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <IconBook className="w-4 h-4 text-emerald-600" />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-gray-800 uppercase tracking-widest">Alpha Fund Holdings</div>
                    <div className="text-[9px] text-gray-500 flex items-center gap-1">
                        {isSyncing ? (
                            <span className="text-blue-500 animate-pulse font-medium">SYNCING MARKET...</span>
                        ) : (
                            <span>Last Sync: {new Date(lastSync).toLocaleTimeString()}</span>
                        )}
                    </div>
                 </div>
            </div>
            <div className="text-right">
                <div className="text-xs text-gray-500 uppercase font-medium">Total AUM</div>
                <div className="text-lg font-mono font-bold text-gray-900 tracking-tight">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
            <button 
                onClick={() => setActiveTab('holdings')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'holdings' ? 'text-blue-600 bg-white border-r border-gray-200 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Current Holdings
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'history' ? 'text-blue-600 bg-white border-l border-gray-200 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Trade History ({history.length})
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {activeTab === 'holdings' ? (
                /* HOLDINGS TABLE */
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100/50 sticky top-0 z-10 backdrop-blur-sm">
                        <tr className="border-b border-gray-200 text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                            <th className="py-2 px-4">Asset</th>
                            <th className="py-2 px-4 text-right">Qty</th>
                            <th className="py-2 px-4 text-right">Price</th>
                            <th className="py-2 px-4 text-right">Avg</th>
                            <th className="py-2 px-4 text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {portfolio.map((pos) => {
                            const isCash = pos.ticker === 'USD';
                            const value = isCash ? pos.amount : pos.amount * pos.currentPrice;
                            const pnl = isCash ? 0 : (pos.currentPrice - pos.avgPrice) * pos.amount;
                            const pnlPercent = isCash ? 0 : ((pos.currentPrice - pos.avgPrice) / pos.avgPrice) * 100;
                            const pnlColor = pnl >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50';

                            return (
                                <tr key={pos.ticker} className="group hover:bg-white transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-xs text-gray-900">{pos.ticker}</div>
                                        {!isCash && (
                                            <div className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${pnlColor}`}>
                                                {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}% (${pnl.toFixed(2)})
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right text-xs font-mono text-gray-600">{pos.amount.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right text-xs font-mono text-gray-600">{isCash ? '$1.00' : `$${pos.currentPrice.toLocaleString()}`}</td>
                                    <td className="py-3 px-4 text-right text-xs font-mono text-gray-400">{isCash ? '-' : `$${pos.avgPrice.toLocaleString()}`}</td>
                                    <td className="py-3 px-4 text-right text-xs font-mono font-bold text-gray-900">${value.toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                /* HISTORY TABLE */
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100/50 sticky top-0 z-10 backdrop-blur-sm">
                        <tr className="border-b border-gray-200 text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                            <th className="py-2 px-4">Time</th>
                            <th className="py-2 px-4">Action</th>
                            <th className="py-2 px-4 text-right">Filled</th>
                            <th className="py-2 px-4 text-right">Value</th>
                            <th className="py-2 px-4 text-right">PnL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                         {history.map(tx => (
                             <tr key={tx.id} className="hover:bg-white transition-colors">
                                 <td className="py-2 px-4 text-[10px] text-gray-500 font-mono">
                                     {new Date(tx.timestamp).toLocaleDateString()}<br/>
                                     {new Date(tx.timestamp).toLocaleTimeString()}
                                 </td>
                                 <td className="py-2 px-4">
                                     <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tx.action === 'BUY' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                         {tx.action} {tx.ticker}
                                     </span>
                                 </td>
                                 <td className="py-2 px-4 text-right text-[10px] font-mono text-gray-600">
                                     {tx.amount}<br/>
                                     <span className="text-gray-400">@ ${tx.price.toFixed(2)}</span>
                                 </td>
                                 <td className="py-2 px-4 text-right text-[10px] font-mono font-bold text-gray-800">
                                     ${tx.totalValue.toFixed(2)}
                                 </td>
                                 <td className="py-2 px-4 text-right text-[10px] font-mono">
                                     {tx.realizedPnL ? (
                                         <span className={tx.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                                             {tx.realizedPnL >= 0 ? '+' : ''}{tx.realizedPnL.toFixed(2)}
                                         </span>
                                     ) : (
                                         <span className="text-gray-300">-</span>
                                     )}
                                 </td>
                             </tr>
                         ))}
                    </tbody>
                </table>
            )}

            {portfolio.length <= 1 && history.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-12 text-gray-400 gap-2">
                    <IconBook className="w-8 h-8 opacity-20" />
                    <p className="text-xs font-medium">No Data Available</p>
                    <p className="text-[10px]">Command Alpha Prime to start trading</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default PortfolioWindow;
