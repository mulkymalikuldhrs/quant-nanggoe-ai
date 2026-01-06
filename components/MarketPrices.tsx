
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MarketPrice, Instrument } from '../types';
import { LoaderIcon, AlertTriangleIcon, HistoryIcon } from './Icons';

type Category = Instrument['category'];

const CATEGORIES: { id: Category, name: string }[] = [
    { id: 'major', name: 'Majors' },
    { id: 'minor', name: 'Minors' },
    { id: 'crypto', name: 'Crypto' },
    { id: 'index', name: 'Indices' },
    { id: 'commodity', name: 'Commodities' },
    { id: 'stock', name: 'Stocks' },
];

interface MarketPricesProps {
    prices: MarketPrice[];
    loading: boolean;
    error: string | null;
    onInstrumentSelect: (pairId: string) => void;
    selectedPair: string;
    isReplayMode: boolean;
}

const PriceRow: React.FC<{ item: MarketPrice; isSelected: boolean; onSelect: () => void; isReplay: boolean; }> = ({ item, isSelected, onSelect, isReplay }) => {
    const prevPriceRef = useRef<number | null>(null);
    const [priceState, setPriceState] = useState<'up' | 'down' | 'neutral'>('neutral');

    useEffect(() => {
        if (isReplay && prevPriceRef.current !== null && item.price !== prevPriceRef.current) {
            setPriceState(item.price > prevPriceRef.current ? 'up' : 'down');
            const timer = setTimeout(() => setPriceState('neutral'), 300);
            return () => clearTimeout(timer);
        }
        prevPriceRef.current = item.price;
    }, [item.price, isReplay]);

    const changeColor = item.changePercent >= 0 ? 'text-green-500' : 'text-red-500';
    const rowBgClass = isSelected ? 'bg-yellow-500/30' : 'hover:bg-white/5';
    const priceBgClass = {
        up: 'bg-green-500/30',
        down: 'bg-red-500/30',
        neutral: '',
    }[priceState];

    return (
        <li key={item.id}>
           <button 
            onClick={onSelect}
            className={`w-full flex justify-between items-center p-1 rounded-md transition-colors text-left ${rowBgClass}`}
           >
                <span className="font-semibold text-gray-200 w-1/3 truncate">{item.name}</span>
                <span className={`w-1/3 text-right transition-colors duration-300 rounded px-1 ${priceBgClass}`}>
                    {isReplay ? item.price.toFixed(item.id.includes('JPY') ? 3 : 5) : '--.--'}
                </span>
                <span className={`ml-2 w-1/3 inline-block text-right font-bold ${isReplay ? changeColor : 'text-gray-500'}`}>
                    {isReplay ? `${item.changePercent.toFixed(2)}%` : '-.--%'}
                </span>
            </button>
        </li>
    );
};


const MarketPrices: React.FC<MarketPricesProps> = ({ prices, loading, error, onInstrumentSelect, selectedPair, isReplayMode }) => {
    const [activeTab, setActiveTab] = useState<Category>('major');

    const categorizedPrices = useMemo(() => {
        return prices.filter(p => p.category === activeTab);
    }, [prices, activeTab]);

    if (loading) {
        return <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-lg">
            <LoaderIcon className="w-6 h-6 text-gray-400" />
        </div>;
    }
    
    return (
        <div className="h-full flex flex-col">
             {/* Status Notice */}
            <div className={`flex-shrink-0 flex items-center justify-center gap-2 text-center p-1.5 text-xs font-mono border-b border-[var(--color-border)] ${
                isReplayMode ? 'bg-sky-900/50 text-sky-300' : 'bg-red-900/50 text-red-300'
            }`}>
                {isReplayMode ? <HistoryIcon className="w-4 h-4" /> : <AlertTriangleIcon className="w-4 h-4" />}
                <span>{isReplayMode ? 'Market Replay Mode Active' : 'Data Feed Disconnected'}</span>
            </div>
            <div className="h-full flex flex-row flex-grow min-h-0">
                {/* Vertical Tabs */}
                <div className="flex-shrink-0 border-r border-[var(--color-border)] w-24">
                    <div className="flex flex-col p-2 gap-1">
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`px-2 py-1.5 text-xs font-bold rounded-md transition-all duration-200 w-full text-left ${activeTab === cat.id ? 'bg-yellow-500/20 text-yellow-200' : 'text-gray-400 hover:bg-white/10'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Price List */}
                <div className="flex-grow overflow-y-auto relative text-xs p-2">
                     {error && (
                        <div className="flex items-center justify-center h-full">
                            <span className="text-red-500 font-mono text-xs">{error}</span>
                        </div>
                     )}
                    <ul className="space-y-1 font-mono" aria-live="polite">
                        {categorizedPrices.map(item => (
                            <PriceRow
                                key={item.id}
                                item={item}
                                isSelected={item.id === selectedPair}
                                onSelect={() => onInstrumentSelect(item.id)}
                                isReplay={isReplayMode}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MarketPrices;
