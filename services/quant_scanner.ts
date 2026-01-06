import { CandleData, QuantScannerOutput } from "../types";
import { MathEngine } from "./math_engine";

export const QuantScanner = {
    /**
     * QUANT-SCANNER (Technical Sensor)
     * Output: Numeric & State-based only. No "Buy/Sell" opinions.
     */
    analyze: (candles: CandleData[]): QuantScannerOutput => {
        if (!candles || candles.length < 50) {
            return {
                trendStrength: 0,
                structureState: 'NEUTRAL',
                volatilityExpansion: false
            };
        }

        const closes = candles.map(c => c.close);
        const adx = MathEngine.calculateADX(candles);
        const sma50 = MathEngine.calculateSMA(closes, 50);
        const sma200 = MathEngine.calculateSMA(closes, 200);
        
        const trendStrength = Math.min(adx / 50, 1.0);
        let structureState: 'BULL' | 'BEAR' | 'NEUTRAL' = 'NEUTRAL';
        
        const lastPrice = closes[closes.length - 1];
        if (lastPrice > sma50 && sma50 > sma200) structureState = 'BULL';
        else if (lastPrice < sma50 && sma50 < sma200) structureState = 'BEAR';
        
        const bb = MathEngine.calculateBollingerBands(closes);
        const volatilityExpansion = (bb.upper - bb.lower) > (MathEngine.calculateSMA(closes, 20) * 0.05);

        return {
            trendStrength,
            structureState,
            volatilityExpansion
        };
    }
};
