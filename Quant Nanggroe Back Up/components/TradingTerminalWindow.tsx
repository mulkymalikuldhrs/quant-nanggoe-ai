
import React, { useEffect, useRef, useState } from 'react';
import { IconChart, IconTerminal, IconGlobe } from './Icons';

declare global {
    interface Window {
        TradingView: any;
    }
}

const TradingTerminalWindow: React.FC = () => {
    const [mode, setMode] = useState<'analysis' | 'execution'>('analysis');
    const containerRef = useRef<HTMLDivElement>(null);

    // TradingView Loader
    useEffect(() => {
        if (mode === 'analysis') {
            const script = document.createElement('script');
            script.src = "https://s3.tradingview.com/tv.js";
            script.async = true;
            script.onload = () => {
                if (window.TradingView && containerRef.current) {
                    containerRef.current.innerHTML = ''; // Clear prev
                    new window.TradingView.widget({
                        "width": "100%",
                        "height": "100%",
                        "symbol": "FX:EURUSD",
                        "interval": "15",
                        "timezone": "Etc/UTC",
                        "theme": "dark",
                        "style": "1",
                        "locale": "en",
                        "toolbar_bg": "#f1f3f6",
                        "enable_publishing": false,
                        "withdateranges": true,
                        "hide_side_toolbar": false,
                        "allow_symbol_change": true,
                        "details": true,
                        "hotlist": true,
                        "calendar": true,
                        "container_id": "tv_chart_container"
                    });
                }
            };
            document.head.appendChild(script);
        }
    }, [mode]);

    return (
        <div className="h-full w-full flex flex-col bg-[#131722]">
            {/* Terminal Header / Switcher */}
            <div className="flex-none h-10 bg-[#1e222d] border-b border-[#2a2e39] flex items-center justify-between px-4">
                <div className="flex bg-[#131722] p-0.5 rounded-lg border border-[#2a2e39]">
                    <button 
                        onClick={() => setMode('analysis')}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'analysis' ? 'bg-[#2962ff] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <IconChart className="w-3 h-3" /> Analysis
                    </button>
                    <button 
                        onClick={() => setMode('execution')}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'execution' ? 'bg-[#2962ff] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <IconTerminal className="w-3 h-3" /> MT5 Web
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-mono text-gray-400">
                            {mode === 'analysis' ? 'TV DATA FEED' : 'METAQUOTES GATEWAY'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-hidden">
                {mode === 'analysis' ? (
                    <div id="tv_chart_container" ref={containerRef} className="h-full w-full bg-[#131722]" />
                ) : (
                    /* MT5 WEB TERMINAL IFRAME */
                    <div className="h-full w-full flex flex-col">
                        <div className="flex-none bg-[#fdfdfd] border-b border-gray-200 px-4 py-2 text-[10px] text-gray-500 flex justify-between">
                            <span>Provider: <strong>MetaQuotes Software Corp.</strong></span>
                            <span>Secure Connection (SSL)</span>
                        </div>
                        <iframe 
                            src="https://trade.mql5.com/trade?servers=MetaQuotes-Demo&trade_server=MetaQuotes-Demo&demo_all_servers=1&startup_mode=open_demo&lang=en" 
                            className="w-full h-full border-none"
                            allowFullScreen={true}
                            title="MetaTrader 5 Web Terminal"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TradingTerminalWindow;
