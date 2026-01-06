
import { CandleData, PortfolioPosition, TechnicalIndicators } from "../types";

export interface RiskProfile {
    accountEquity: number;
    riskPerTrade: number; // Percent (e.g., 0.02 for 2%)
    maxDrawdown: number;
}

export const RiskManagement = {
    
    // --- POSITION SIZING (The Core of Survival) ---
    calculatePositionSize: (equity: number, riskPct: number, entry: number, stopLoss: number): { size: number, totalRisk: number } => {
        const amountToRisk = equity * riskPct;
        const riskPerShare = Math.abs(entry - stopLoss);
        
        if (riskPerShare === 0) return { size: 0, totalRisk: 0 };
        
        const size = amountToRisk / riskPerShare;
        return {
            size,
            totalRisk: amountToRisk
        };
    },

    // --- KELLY CRITERION (Optimal Bet Size) ---
    calculateKelly: (winRate: number, profitFactor: number): number => {
        // Kelly % = W - (1 - W) / R
        // W = Win rate, R = Win/Loss ratio
        const kelly = winRate - (1 - winRate) / profitFactor;
        return Math.max(0, Math.min(0.2, kelly)); // Cap at 20% for safety (Fractional Kelly)
    },

    // --- ATR-BASED STOP LOSS ---
    calculateATRStop: (entry: number, atr: number, multiplier: number = 2, direction: 'BUY' | 'SELL'): number => {
        if (direction === 'BUY') return entry - (atr * multiplier);
        return entry + (atr * multiplier);
    },

    // --- PORTFOLIO EXPOSURE SCAN ---
    analyzeExposure: (positions: PortfolioPosition[]): { totalValue: number, concentrationRisk: boolean } => {
        const totalValue = positions.reduce((acc, p) => acc + (p.amount * p.currentPrice), 0);
        
        // Flag if any single position is > 25% of portfolio
        const concentrationRisk = positions.some(p => (p.amount * p.currentPrice) / totalValue > 0.25);
        
        return {
            totalValue,
            concentrationRisk
        };
    }
};
