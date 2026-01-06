
import { MathEngine } from './math_engine';
import { MLEngine } from './ml_engine';
import { CandleData, StrategySignal, ConsensusReport, TechnicalIndicators } from '../types';

export const StrategyEngine = {
    
    // --- 0. MARKET REGIME DETECTION (The "Context") ---
    // Determines if we are Trending, Ranging, or Volatile.
    detectRegime: (t: TechnicalIndicators): 'TRENDING_BULL' | 'TRENDING_BEAR' | 'RANGING' | 'VOLATILE' => {
        const adx = t.adx; // Trend Strength (>25 is trending)
        const maFast = t.sma.ma20;
        const maSlow = t.sma.ma50;
        const atr = t.atr;
        const price = t.sma.ma10; // Proxy for current price if raw not avail

        // High Volatility Check (ATR > 5% of price)
        if (atr > (price * 0.05)) return 'VOLATILE'; 

        if (adx > 25) {
            if (maFast > maSlow) return 'TRENDING_BULL';
            return 'TRENDING_BEAR';
        }
        
        return 'RANGING';
    },

    // --- 1. THE STRATEGY MATRIX (Parametric Scanning) ---

    scanTrendMatrix: (closes: number[], ma: TechnicalIndicators['sma'], regime: string): StrategySignal[] => {
        const signals: StrategySignal[] = [];
        const currentPrice = closes[closes.length - 1];

        // Only look for Trend signals if we are NOT in a Ranging market
        if (regime === 'RANGING') return signals;

        // A. Moving Average Ribbon
        let bullishCount = 0;
        const mas = [ma.ma10, ma.ma20, ma.ma50, ma.ma100, ma.ma200];
        mas.forEach(v => { if (currentPrice > v) bullishCount++; });

        if (bullishCount === 5) {
            const name = "Full Bullish Alignment (Price > All MAs)";
            signals.push({ name, category: 'TREND', type: 'BUY', strength: 95, weight: MLEngine.getWeight(name), description: "Strongest possible uptrend signature." });
        } else if (bullishCount === 0) {
            const name = "Full Bearish Alignment (Price < All MAs)";
            signals.push({ name, category: 'TREND', type: 'SELL', strength: 95, weight: MLEngine.getWeight(name), description: "Strongest possible downtrend signature." });
        }

        // B. Crossovers (Golden/Death)
        if (ma.ma50 > ma.ma200) {
            const name = "Golden Cross State (50>200)";
            signals.push({ name, category: 'TREND', type: 'BUY', strength: 85, weight: MLEngine.getWeight(name), description: "Macro bull market active." });
        }
        if (ma.ma50 < ma.ma200) {
            const name = "Death Cross State (50<200)";
            signals.push({ name, category: 'TREND', type: 'SELL', strength: 85, weight: MLEngine.getWeight(name), description: "Macro bear market active." });
        }

        return signals;
    },

    scanOrderBlockMatrix: (candles: CandleData[]): StrategySignal[] => {
        const signals: StrategySignal[] = [];
        if (candles.length < 5) return signals;

        const last = candles[candles.length - 1];
        const profile = MathEngine.calculateVolumeProfile(candles.slice(-50), 10);
        const poc = profile[0]?.price; // Point of Control (Highest Volume Price)

        // If current price is near POC and we see a reversal pattern
        const currentPrice = last.close;
        const dist = Math.abs(currentPrice - poc) / poc;

        if (dist < 0.01) {
            const name = "POC Rejection Zone";
            signals.push({ name, category: 'VOLUME', type: 'NEUTRAL', strength: 60, weight: 4, description: "Price is at the Point of Control. High probability of chop or reversal." });
        }

        return signals;
    },

    scanOscillatorMatrix: (t: TechnicalIndicators, regime: string): StrategySignal[] => {
        const signals: StrategySignal[] = [];

        // In Ranging markets, Oscillators are King. In Trending, they trigger false reversals.
        // We adjust weights dynamically based on regime.
        const weightMultiplier = regime === 'RANGING' ? 1.5 : 0.8;

        // RSI Tiers
        if (t.rsi < 25) { // Stricter logic
            const name = "RSI Extreme Oversold (<25)";
            signals.push({ name, category: 'MOMENTUM', type: 'BUY', strength: 90, weight: MLEngine.getWeight(name) * weightMultiplier, description: "Deep value territory." });
        }
        else if (t.rsi > 75) {
            const name = "RSI Extreme Overbought (>75)";
            signals.push({ name, category: 'MOMENTUM', type: 'SELL', strength: 90, weight: MLEngine.getWeight(name) * weightMultiplier, description: "Mania territory." });
        }

        // Stochastic
        if (t.stoch.k < 20 && t.stoch.d < 20 && t.stoch.k > t.stoch.d) {
            const name = "Stoch Golden Cross (Oversold)";
            signals.push({ name, category: 'MOMENTUM', type: 'BUY', strength: 80, weight: MLEngine.getWeight(name) * weightMultiplier, description: "Momentum shifting up from bottom." });
        }

        // VWAP Deviation
        if (t.vwap) {
            const vwapBands = MathEngine.calculateVWAPBands([], t.vwap, 2.5); // Use actual candles if available
            // Note: vwapBands needs candles to work properly, but we can approximate deviation
        }

        return signals;
    },

    scanPatternMatrix: (candles: CandleData[]): StrategySignal[] => {
        const signals: StrategySignal[] = [];
        if (candles.length < 3) return signals;
        
        const cur = candles[candles.length - 1];
        const prev = candles[candles.length - 2];
        const isGreen = (c: CandleData) => c.close > c.open;
        
        // Bullish Engulfing
        if (!isGreen(prev) && isGreen(cur) && cur.open < prev.close && cur.close > prev.open) {
            const name = "Bullish Engulfing";
            signals.push({ name, category: 'PATTERN', type: 'BUY', strength: 75, weight: MLEngine.getWeight(name), description: "Buyers totally overwhelmed sellers." });
        }

        return signals;
    },

    scanVolatilityMatrix: (closes: number[], t: TechnicalIndicators): StrategySignal[] => {
        const signals: StrategySignal[] = [];
        const currentPrice = closes[closes.length - 1];

        // BB Breakout
        if (currentPrice > t.bollinger.upper) {
            const name = "Bollinger Breakout";
            signals.push({ name, category: 'VOLATILITY', type: 'BUY', strength: 70, weight: MLEngine.getWeight(name), description: "Volatility expanding to upside." });
        } else if (currentPrice < t.bollinger.lower) {
            const name = "Bollinger Breakdown";
            signals.push({ name, category: 'VOLATILITY', type: 'SELL', strength: 70, weight: MLEngine.getWeight(name), description: "Volatility expanding to downside." });
        }

        return signals;
    },

    // --- 2. MASTER EVALUATION ---

    evaluate: (candles: CandleData[], technicals: TechnicalIndicators): StrategySignal[] => {
        const closes = candles.map(c => c.close);
        const regime = StrategyEngine.detectRegime(technicals);
        
        let allSignals: StrategySignal[] = [];
        
        // Inject Regime Signal as a base context
        allSignals.push({
            name: `Market Regime: ${regime}`,
            category: 'VOLATILITY',
            type: regime.includes('BULL') ? 'BUY' : regime.includes('BEAR') ? 'SELL' : 'NEUTRAL',
            strength: 50,
            weight: 5.0, // High importance
            description: `System detected ${regime} environment.`
        });
        
        allSignals = [
            ...allSignals,
            ...StrategyEngine.scanTrendMatrix(closes, technicals.sma, regime),
            ...StrategyEngine.scanOscillatorMatrix(technicals, regime),
            ...StrategyEngine.scanPatternMatrix(candles),
            ...StrategyEngine.scanVolatilityMatrix(closes, technicals)
        ];

        return allSignals;
    },

    // --- 3. CONSENSUS ENGINE (Weighted Voting) ---
    
    generateConsensus: (signals: StrategySignal[]): ConsensusReport => {
        let bullScore = 0;
        let bearScore = 0;
        let totalWeights = 0;

        signals.forEach(s => {
            if (s.type === 'BUY') bullScore += (s.strength * s.weight);
            if (s.type === 'SELL') bearScore += (s.strength * s.weight);
            totalWeights += s.weight;
        });

        // Normalize Score (-100 to +100)
        const rawScore = (bullScore - bearScore); 
        const maxPossible = totalWeights * 100 || 1; 
        const normalizedScore = (rawScore / maxPossible) * 100;

        let verdict: ConsensusReport['verdict'] = 'NEUTRAL';
        if (normalizedScore > 50) verdict = 'STRONG BUY';
        else if (normalizedScore > 20) verdict = 'BUY';
        else if (normalizedScore < -50) verdict = 'STRONG SELL';
        else if (normalizedScore < -20) verdict = 'SELL';

        return {
            score: Math.round(normalizedScore),
            verdict,
            totalSignals: signals.length,
            bullishCount: signals.filter(s => s.type === 'BUY').length,
            bearishCount: signals.filter(s => s.type === 'SELL').length,
            topFactors: signals.sort((a,b) => (b.strength * b.weight) - (a.strength * a.weight)).slice(0, 3).map(s => s.name)
        };
    }
};
