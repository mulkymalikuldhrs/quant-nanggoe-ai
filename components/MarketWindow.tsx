
import React, { useState, useEffect } from 'react';
import { MarketService } from '../services/market';
import { MarketTicker, NewsItem, ChartPoint, CandleData } from '../types';
import RealTimeChart from './RealTimeChart';
import { IconSearch, IconGlobe, IconLink, IconShield, IconChart } from './Icons';

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
        <div className="flex h-full w-full bg-[#09090b] flex-col">
            
            {/* Top Tabs */}
            <div className="flex-none px-4 pt-2 border-b border-white/5 bg-[#121214] flex gap-6 overflow-x-auto select-none">
                {['crypto', 'stocks', 'forex', 'news'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { 
                            setActiveTab(tab as any); 
                            if(tab === 'stocks') setSelectedAsset('AAPL'); 
                            if(tab === 'crypto') setSelectedAsset('BTC');
                            if(tab === 'forex') setSelectedAsset('EURUSD');
                        }}
                        className={`text-[10px] font-black py-3 border-b-2 uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-[0_10px_10px_-10px_var(--accent-primary)]' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}
                    >
                        {tab === 'forex' ? 'FX_COMM' : tab.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="flex-1 flex overflow-hidden">
                
                {/* NEWS VIEW */}
                {activeTab === 'news' ? (
                    <div className="w-full h-full overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#09090b]">
                        {news.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-700 uppercase font-black text-[10px] tracking-widest gap-4">
                                <div className="w-12 h-12 border border-zinc-800 rounded-full flex items-center justify-center animate-pulse">
                                    <IconGlobe className="w-6 h-6" />
                                </div>
                                CHECK_FINNHUB_UPLINK
                            </div>
                        )}
                        {news.map(item => (
                            <div key={item.id} className="bg-[#121214] p-5 rounded-2xl border border-white/5 hover:border-zinc-700 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-xs font-bold text-zinc-100 leading-relaxed group-hover:text-[var(--accent-primary)] transition-colors">{item.headline}</h4>
                                    <span className="text-[9px] font-mono text-zinc-600 bg-black px-2 py-0.5 rounded border border-white/5">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 mb-4">{item.summary}</p>
                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <span className="text-[9px] font-black text-[var(--accent-secondary)] uppercase tracking-widest">{item.source}</span>
                                    <a href={item.url} target="_blank" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 transition-all">
                                        <IconLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* MARKET VIEW (Sidebar + Chart) */
                    <>
                        <div className="w-1/3 min-w-[220px] bg-[#09090b] border-r border-white/5 flex flex-col">
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {tickers.map(ticker => {
                                    const verdict = ticker.consensus?.verdict || 'NEUTRAL';
                                    const score = ticker.consensus?.score || 0;
                                    let verdictColor = 'text-zinc-500 bg-zinc-900 border-zinc-800';
                                    if (score > 50) verdictColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                                    else if (score > 20) verdictColor = 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10';
                                    else if (score < -50) verdictColor = 'text-red-400 bg-red-500/10 border-red-500/20';
                                    else if (score < -20) verdictColor = 'text-red-500 bg-red-500/5 border-red-500/10';

                                    return (
                                        <div 
                                            key={ticker.id}
                                            onClick={() => setSelectedAsset(ticker.symbol)}
                                            className={`px-5 py-4 cursor-pointer border-b border-white/5 transition-all relative ${selectedAsset === ticker.symbol ? 'bg-zinc-900/50 border-emerald-500/30' : 'hover:bg-zinc-900/30'}`}
                                        >
                                            {selectedAsset === ticker.symbol && <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 shadow-[0_0_10px_emerald]"></div>}
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-black text-[11px] text-zinc-100 tracking-widest">{ticker.symbol}</span>
                                                <span className="font-mono text-xs text-zinc-100 font-bold">${ticker.current_price.toLocaleString(undefined, { maximumSignificantDigits: 6 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-[10px] font-mono ${ticker.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {ticker.price_change_percentage_24h >= 0 ? '+' : ''}{ticker.price_change_percentage_24h.toFixed(2)}%
                                                </span>
                                                <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${verdictColor}`}>
                                                    {verdict}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col bg-[#09090b]">
                            <div className="px-8 py-6 border-b border-white/5 bg-zinc-900/20 backdrop-blur-xl">
                                <div className="flex justify-between items-start gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter">{activeTicker?.name || selectedAsset}</h2>
                                            <span className="bg-white/5 text-zinc-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-white/5">{activeTicker?.source}</span>
                                        </div>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-3xl font-mono font-black text-zinc-100 tracking-tighter">
                                                ${activeTicker?.current_price.toLocaleString() || '---'}
                                            </span>
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${activeTicker && activeTicker.price_change_percentage_24h >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${activeTicker && activeTicker.price_change_percentage_24h >= 0 ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                                                {activeTicker?.price_change_percentage_24h.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* CONSENSUS CARD (Institutional) */}
                                    {activeTicker?.consensus && (
                                        <div className="bg-[#121214] rounded-2xl p-5 border border-white/5 shadow-2xl min-w-[240px]">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Neural_Consensus</span>
                                                <IconShield className={`w-4 h-4 ${activeTicker.consensus.score > 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                                            </div>
                                            <div className={`text-xl font-black mb-3 ${activeTicker.consensus.score > 0 ? 'text-emerald-400' : activeTicker.consensus.score < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                                                {activeTicker.consensus.verdict}
                                            </div>
                                            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${activeTicker.consensus.score > 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} 
                                                    style={{ width: `${Math.abs(activeTicker.consensus.score)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-[9px] font-black font-mono">
                                                <span className="text-emerald-500">{activeTicker.consensus.bullishCount} BULL_NODES</span>
                                                <span className="text-red-500">{activeTicker.consensus.bearishCount} BEAR_NODES</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* SIGNAL TAPE */}
                                {activeTicker?.activeSignals && activeTicker.activeSignals.length > 0 && (
                                    <div className="mt-8 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                        {activeTicker.activeSignals.map((s, i) => (
                                            <div key={i} className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:scale-105 ${s.type === 'BUY' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[8px] opacity-60 font-bold">{s.category}</span>
                                                        <div className="w-1 h-1 rounded-full bg-current opacity-30"></div>
                                                        <span className="text-[8px] font-mono">STRENGTH: {s.strength}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 p-8 relative bg-[#09090b]">
                                {loadingChart ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                                        <div className="w-10 h-10 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : null}
                                
                                <div className="w-full h-full rounded-3xl border border-white/5 overflow-hidden p-1 bg-black/40 shadow-2xl">
                                    {chartData.length > 0 ? (
                                        <RealTimeChart data={chartData} />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-center gap-4">
                                            <IconChart className="w-12 h-12 text-zinc-800" />
                                            <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Neural_Data_Streaming_Required</div>
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
