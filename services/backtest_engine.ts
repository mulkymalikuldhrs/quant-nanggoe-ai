
import { CandleData, ExecutionReality, DecisionSynthesis, MarketState, PressureState } from "../types";
import { MathEngine } from "./math_engine";
import { MarketService } from "./market";
import { PressureNormalizationEngine, DecisionSynthesisEngine } from "./quantum_engine";

export interface BacktestResult {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    netProfit: number;
    maxDrawdown: number;
    equityCurve: number[];
}

export const BacktestEngine = {
    
    // --- BLUEPRINT FINAL: EXECUTION REALITY ENGINE ---
    getExecutionReality: (): ExecutionReality => {
        return {
            spread: 0.0002, // 2 pips
            slippage: 0.0001,
            partialFill: Math.random() < 0.05,
            orderReject: Math.random() < 0.01,
            latency: 50 + Math.random() * 200 // ms
        };
    },

    runSimple: async (candles: CandleData[], initialCapital: number = 10000): Promise<BacktestResult> => {
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

        const reality = BacktestEngine.getExecutionReality();

        for (let i = 50; i < candles.length; i++) {
            const window = candles.slice(0, i);
            const currentCandle = candles[i];
            const price = currentCandle.close;

            // 1. Get Market State
            const state = MarketService.getMarketState(window);
            
            // 2. Get Agent Outputs (Simplified for backtest speed)
            const quant = MarketService.getQuantScannerOutput(window);
            const smc = MarketService.getSMCOutput(window);
            const news = await MarketService.getNewsSentinelOutput([]); // Empty news for backtest
            const flow = MarketService.getFlowWhaleOutput();

            // 3. Normalize Pressure
            const pressures = PressureNormalizationEngine.normalize(quant, smc, news, flow, state);

            // 4. Synthesize Decision
            const synthesis = DecisionSynthesisEngine.synthesize(state, pressures, price);

            if (reality.orderReject) continue;

            // 5. Execution Logic
            if (position === 0) {
                if (synthesis.action === 'BUY') {
                    position = 1;
                    entryPrice = price + reality.spread + reality.slippage;
                } else if (synthesis.action === 'SELL') {
                    position = -1;
                    entryPrice = price - reality.spread - reality.slippage;
                }
            } else if (position === 1) {
                // Exit Long (Structural Invalidation or Opposing Pressure)
                const isSL = synthesis.entryParameters && price <= synthesis.entryParameters.sl;
                const isTP = synthesis.entryParameters && price >= synthesis.entryParameters.tp[0];
                
                if (isSL || isTP || synthesis.action === 'SELL' || i === candles.length - 1) {
                    const exitPrice = price - reality.slippage;
                    const profit = (exitPrice - entryPrice) / entryPrice * capital;
                    capital += profit;
                    trades++;
                    if (profit > 0) { wins++; totalProfit += profit; }
                    else totalLoss += Math.abs(profit);
                    position = 0;
                }
            } else if (position === -1) {
                // Exit Short
                const isSL = synthesis.entryParameters && price >= synthesis.entryParameters.sl;
                const isTP = synthesis.entryParameters && price <= synthesis.entryParameters.tp[0];

                if (isSL || isTP || synthesis.action === 'BUY' || i === candles.length - 1) {
                    const exitPrice = price + reality.slippage;
                    const profit = (entryPrice - exitPrice) / entryPrice * capital;
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
