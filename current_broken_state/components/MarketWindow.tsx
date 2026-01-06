
import React, { useState, useEffect } from 'react';
import { MarketService } from '../services/market';
import { MarketTicker, NewsItem, ChartPoint, CandleData } from '../types';
import RealTimeChart from './RealTimeChart';
import { IconSearch, IconGlobe, IconLink, IconShield } from './Icons';

const ASSET_LISTS = {
    crypto: ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'PEPE', 'WIF'],
    stocks: ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'COIN', 'MSTR'],
    forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'XAGUSD', 'AUDUSD'], // Gold/Silver included here
    indices: ['SPX', 'NDX', 'IHSG']
};

const MarketWindow: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'crypto' | 'stocks' | 'forex' | 'news'>('crypto');
    const [tickers, setTickers] = useState<MarketTicker[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
    const [chartData, setChartData] = useState<(ChartPoint | CandleData)[]>([]);
    const [loadingChart, setLoadingChart] = useState(false);
    
    const fetchTickers = async () => {
        if (activeTab === 'news') {
            const newsItems = await MarketService.getNews();
            setNews(newsItems);
            return;
        }

        const assets = activeTab === 'forex' 
            ? ASSET_LISTS.forex 
            : activeTab === 'stocks' 
            ? [...ASSET_LISTS.stocks, ...ASSET_LISTS.indices] 
            : ASSET_LISTS.crypto;

        const results = [];
        for (const sym of assets) {
            const t = await MarketService.getPrice(sym);
            if (t) results.push(t);
        }
        setTickers(results);
    };

    const fetchChart = async (symbol: string) => {
        setLoadingChart(true);
        const history = await MarketService.getMarketChart(symbol, 30); // Request more data for math
        setChartData(history);
        setLoadingChart(false);
    };

    useEffect(() => {
        setTickers([]); // Clear old list
        fetchTickers();
        const interval = setInterval(fetchTickers, 60000);
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'news') fetchChart(selectedAsset);
    }, [selectedAsset, activeTab]);

    const activeTicker = tickers.find(t => t.symbol === selectedAsset);

    return (
        <div className="flex h-full w-full bg-gray-50/50 flex-col">
            
            {/* Top Tabs */}
            <div className="flex-none px-4 pt-2 border-b border-gray-200 bg-white flex gap-4 overflow-x-auto">
                {['crypto', 'stocks', 'forex', 'news'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { 
                            setActiveTab(tab as any); 
                            if(tab === 'stocks') setSelectedAsset('AAPL'); 
                            if(tab === 'crypto') setSelectedAsset('BTC');
                            if(tab === 'forex') setSelectedAsset('EURUSD');
                        }}
                        className={`text-xs font-bold py-2 border-b-2 uppercase tracking-wider transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab === 'forex' ? 'FX & Comm' : tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 flex overflow-hidden">
                
                {/* NEWS VIEW */}
                {activeTab === 'news' ? (
                    <div className="w-full h-full overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {news.length === 0 && <div className="text-center text-gray-400 text-xs mt-10">No News Available (Check Finnhub Key)</div>}
                        {news.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-xs font-bold text-gray-800 leading-tight mb-1">{item.headline}</h4>
                                    <span className="text-[9px] text-gray-400 whitespace-nowrap ml-2">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 line-clamp-2">{item.summary}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{item.source}</span>
                                    <a href={item.url} target="_blank" className="text-gray-400 hover:text-blue-500">
                                        <IconLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* MARKET VIEW (Sidebar + Chart) */
                    <>
                        <div className="w-1/3 min-w-[180px] bg-white border-r border-gray-200 flex flex-col">
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {tickers.map(ticker => {
                                    const verdict = ticker.consensus?.verdict || 'NEUTRAL';
                                    const score = ticker.consensus?.score || 0;
                                    let verdictColor = 'text-gray-500 bg-gray-100';
                                    if (score > 50) verdictColor = 'text-green-700 bg-green-100';
                                    else if (score > 20) verdictColor = 'text-green-600 bg-green-50';
                                    else if (score < -50) verdictColor = 'text-red-700 bg-red-100';
                                    else if (score < -20) verdictColor = 'text-red-600 bg-red-50';

                                    return (
                                        <div 
                                            key={ticker.id}
                                            onClick={() => setSelectedAsset(ticker.symbol)}
                                            className={`px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${selectedAsset === ticker.symbol ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-xs text-gray-700">{ticker.symbol}</span>
                                                <span className="font-mono text-xs text-gray-900">${ticker.current_price.toLocaleString(undefined, { maximumSignificantDigits: 6 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1.5">
                                                <span className={`text-[10px] font-bold ${ticker.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {ticker.price_change_percentage_24h.toFixed(2)}%
                                                </span>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${verdictColor}`}>
                                                    {verdict}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col bg-white">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-gray-900">{activeTicker?.name || selectedAsset}</h2>
                                            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{activeTicker?.source}</span>
                                        </div>
                                        <div className="mt-1 flex items-baseline gap-2">
                                            <span className="text-2xl font-mono font-bold text-gray-800">
                                                ${activeTicker?.current_price.toLocaleString() || '---'}
                                            </span>
                                            <span className={`text-sm font-bold ${activeTicker && activeTicker.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {activeTicker?.price_change_percentage_24h.toFixed(2)}% (24h)
                                            </span>
                                        </div>
                                    </div>
                                    {/* CONSENSUS CARD */}
                                    {activeTicker?.consensus && (
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 shadow-sm w-[200px]">
                                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Algo Consensus</div>
                                            <div className={`text-sm font-bold flex items-center gap-2 ${activeTicker.consensus.score > 0 ? 'text-green-600' : activeTicker.consensus.score < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                                <IconShield className="w-4 h-4" />
                                                {activeTicker.consensus.verdict} ({activeTicker.consensus.score}%)
                                            </div>
                                            <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${activeTicker.consensus.score > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                                                    style={{ width: `${Math.abs(activeTicker.consensus.score)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between mt-1 text-[8px] text-gray-400">
                                                <span>{activeTicker.consensus.bullishCount} BULL</span>
                                                <span>{activeTicker.consensus.bearishCount} BEAR</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* SIGNAL TAPE */}
                                {activeTicker?.activeSignals && activeTicker.activeSignals.length > 0 && (
                                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                        {activeTicker.activeSignals.slice(0, 6).map((s, i) => (
                                            <div key={i} className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border ${s.type === 'BUY' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider">{s.name}</span>
                                                    <span className="text-[8px] opacity-70">{s.category} • Strength: {s.strength}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 p-6 relative">
                                {loadingChart ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : null}
                                
                                <div className="w-full h-full bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden p-1 shadow-inner">
                                    {chartData.length > 0 ? (
                                        <RealTimeChart data={chartData} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                            {activeTab === 'crypto' ? "Loading Data..." : "API Key Required for Intraday Chart"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MarketWindow;
