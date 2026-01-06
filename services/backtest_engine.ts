
import { CandleData, StrategySignal } from "../types";
import { StrategyEngine } from "./strategy_engine";
import { MathEngine } from "./math_engine";

export interface BacktestResult {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    netProfit: number;
    maxDrawdown: number;
    equityCurve: number[];
}

export const BacktestEngine = {
    
    // --- SIMPLE WALK-FORWARD SIMULATOR ---
    runSimple: (candles: CandleData[], initialCapital: number = 10000): BacktestResult => {
        let capital = initialCapital;
        let position = 0; // 0 = flat, 1 = long, -1 = short
        let entryPrice = 0;
        let trades = 0;
        let wins = 0;
        let totalProfit = 0;
        let totalLoss = 0;
        let maxCapital = initialCapital;
        let maxDrawdown = 0;
        const equityCurve = [initialCapital];

        // We need a lookback period (e.g., 50 candles) to start generating signals
        for (let i = 50; i < candles.length; i++) {
            const window = candles.slice(0, i);
            const technicals = MathEngine.analyzeSequence(window);
            const signals = StrategyEngine.evaluate(window, technicals);
            const consensus = StrategyEngine.generateConsensus(signals);
            
            const price = candles[i].close;

            // Simple Logic: Buy if Strong Buy, Sell if Strong Sell
            if (position === 0) {
                if (consensus.verdict === 'STRONG BUY') {
                    position = 1;
                    entryPrice = price;
                } else if (consensus.verdict === 'STRONG SELL') {
                    position = -1;
                    entryPrice = price;
                }
            } else if (position === 1) {
                // Exit Long
                if (consensus.verdict === 'SELL' || consensus.verdict === 'STRONG SELL' || i === candles.length - 1) {
                    const profit = (price - entryPrice) / entryPrice * capital;
                    capital += profit;
                    trades++;
                    if (profit > 0) { wins++; totalProfit += profit; }
                    else totalLoss += Math.abs(profit);
                    position = 0;
                }
            } else if (position === -1) {
                // Exit Short
                if (consensus.verdict === 'BUY' || consensus.verdict === 'STRONG BUY' || i === candles.length - 1) {
                    const profit = (entryPrice - price) / entryPrice * capital;
                    capital += profit;
                    trades++;
                    if (profit > 0) { wins++; totalProfit += profit; }
                    else totalLoss += Math.abs(profit);
                    position = 0;
                }
            }

            equityCurve.push(capital);
            if (capital > maxCapital) maxCapital = capital;
            const dd = (maxCapital - capital) / maxCapital;
            if (dd > maxDrawdown) maxDrawdown = dd;
        }

        return {
            totalTrades: trades,
            winRate: trades > 0 ? wins / trades : 0,
            profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit,
            netProfit: capital - initialCapital,
            maxDrawdown,
            equityCurve
        };
    }
};
