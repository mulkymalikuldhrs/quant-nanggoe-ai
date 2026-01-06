import React, { useEffect, useRef, memo, useState, useMemo } from 'react';
import { LoaderIcon } from './Icons';

// To prevent TypeScript errors on the new TradingView() constructor
declare global {
    interface Window {
        TradingView: any;
    }
}

// Singleton to ensure the script is loaded only once.
let tradingViewScriptPromise: Promise<void> | null = null;

const loadTradingViewScript = (): Promise<void> => {
    if (tradingViewScriptPromise) {
        return tradingViewScriptPromise;
    }

    if (window.TradingView) {
        return Promise.resolve();
    }
    
    tradingViewScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.async = true;
        
        script.onload = () => resolve();

        script.onerror = (error) => {
            console.error('TradingView script failed to load.', error);
            tradingViewScriptPromise = null; // Reset promise on error to allow retry.
            reject(new Error('TradingView script failed to load.'));
        };

        document.head.appendChild(script);
    });

    return tradingViewScriptPromise;
};

const getTVSymbol = (pairId: string): string => {
    const mappings: Record<string, string> = {
        'US500': 'SP:SPX',
        'NAS100': 'TVC:NDX',
        'UK100': 'TVC:UKX',
        'GER40': 'XETR:DAX',
        'JP225': 'TVC:NI225',
        'HK50': 'TVC:HSI',
        'STOXX50E': 'INDEX:SX5E',
        'DJI': 'TVC:DJI',
        'XAUUSD': 'OANDA:XAUUSD',
        'XAGUSD': 'OANDA:XAGUSD',
        'WTI': 'TVC:USOIL',
        'UKOIL': 'TVC:UKOIL',
        'XCUUSD': 'COMEX:HG1!',
        'NATGAS': 'TVC:NATURALGAS',
        'BTCUSD': 'COINBASE:BTCUSD',
        'ETHUSD': 'COINBASE:ETHUSD',
        'SOLUSD': 'COINBASE:SOLUSD',
        'XRPUSD': 'COINBASE:XRPUSD',
        'DOGEUSD': 'COINBASE:DOGEUSD',
        'ADAUSD': 'COINBASE:ADAUSD',
        'LINKUSD': 'COINBASE:LINKUSD',
        'LTCUSD': 'COINBASE:LTCUSD',
        'AAPL': 'NASDAQ:AAPL',
        'MSFT': 'NASDAQ:MSFT',
        'NVDA': 'NASDAQ:NVDA',
        'TSLA': 'NASDAQ:TSLA',
        'GOOGL': 'NASDAQ:GOOGL',
        'AMZN': 'NASDAQ:AMZN',
        'META': 'NASDAQ:META',
        'JPM': 'NYSE:JPM'
    };

    if (mappings[pairId]) {
        return mappings[pairId];
    }
    
    // Default for Forex pairs
    if (pairId.length === 6 && /^[A-Z]+$/.test(pairId)) {
        return `OANDA:${pairId}`;
    }

    return pairId; // Fallback
};

interface CustomChartingWidgetProps {
  pair: string;
  theme: 'light' | 'dark';
}

const CustomChartingWidget: React.FC<CustomChartingWidgetProps> = ({ pair, theme }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<any>(null);
    const [isScriptReady, setIsScriptReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const containerId = useMemo(() => `tradingview_widget_${Math.random().toString(36).substring(2, 9)}`, []);

    // Step 1: Load the TradingView script once.
    useEffect(() => {
        let isMounted = true;
        loadTradingViewScript()
            .then(() => {
                if (isMounted) {
                    setIsScriptReady(true);
                }
            })
            .catch(error => {
                console.error("Fatal: Could not load charting library.", error);
            });
        
        return () => {
            isMounted = false;
        };
    }, []);

    // Step 2: Create or update the widget when script is ready or props change.
    useEffect(() => {
        if (!isScriptReady || !containerRef.current) {
            return;
        }
        
        setIsLoading(true);
        let isChartReady = false;

        const widgetOptions = {
            autosize: true,
            symbol: getTVSymbol(pair),
            interval: "60",
            timezone: "Etc/UTC",
            theme: theme,
            style: "1",
            locale: "en",
            enable_publishing: false,
            hide_side_toolbar: false,
            allow_symbol_change: false,
            withdateranges: true,
            details: true,
            hotlist: true,
            calendar: true,
            container_id: containerId,
            backgroundColor: "rgba(0,0,0,0)",
            gridColor: theme === 'dark' ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
        };

        // The onChartReady callback must be passed in the constructor options.
        // Calling it as a method on the widget instance caused a runtime error.
        const tvWidget = new window.TradingView.widget({
            ...widgetOptions,
            onChartReady: () => {
                isChartReady = true;
                setIsLoading(false);
            },
        });
        widgetRef.current = tvWidget;

        // Fallback timeout to hide the loader if onChartReady doesn't fire.
        const fallbackTimeout = setTimeout(() => {
            if (!isChartReady) {
                setIsLoading(false);
                console.warn('TradingView chart onChartReady event did not fire within 5 seconds. Hiding loader.');
            }
        }, 5000);
        
        return () => {
            clearTimeout(fallbackTimeout);
            if (widgetRef.current) {
                try {
                    widgetRef.current.remove();
                    widgetRef.current = null;
                } catch (e) {
                    console.error("Error removing TradingView widget:", e);
                }
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [isScriptReady, pair, theme, containerId]);


    return (
        <div className="h-full w-full relative">
            {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.3)] z-10 rounded-lg">
                    <LoaderIcon className="w-8 h-8 text-[var(--color-text-secondary)]" />
                 </div>
            )}
            <div id={containerId} ref={containerRef} className="h-full w-full" />
        </div>
    );
};

export default memo(CustomChartingWidget);