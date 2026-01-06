import { 
    QuantScannerOutput, 
    SMCOutput, 
    NewsSentinelOutput, 
    FlowWhaleOutput, 
    PressureState,
    MarketState
} from "../types";

export const PressureNormalizationEngine = {
    /**
     * PRESSURE NORMALIZATION ENGINE
     * Converts all agent sensor outputs into numerical pressures (0.0 - 1.0).
     */
    normalize: (
        market: MarketState,
        quant: QuantScannerOutput,
        smc: SMCOutput,
        news: NewsSentinelOutput,
        flow: FlowWhaleOutput
    ): PressureState => {
        let buyPressure = 0;
        let sellPressure = 0;
        
        // 1. Quant Scanner Influence (Technical)
        if (quant.structureState === 'BULL') buyPressure += 0.3 * quant.trendStrength;
        if (quant.structureState === 'BEAR') sellPressure += 0.3 * quant.trendStrength;
        
        // 2. SMC Influence (Liquidity)
        if (smc.liquiditySweep) {
            // Sweep high -> Sell pressure, Sweep low -> Buy pressure
            // This is simplified; real logic would check direction of sweep
            buyPressure += 0.2 * smc.displacementStrength;
            sellPressure += 0.2 * smc.displacementStrength;
        }
        
        // 3. News Sentinel Influence (Macro)
        if (news.impactScore > 0.5) {
            const newsImpact = news.impactScore * (1 - news.directionalUncertainty);
            // News sentiment would ideally provide direction, here we use directionalUncertainty as a risk factor
            buyPressure += 0.2 * newsImpact;
            sellPressure += 0.2 * newsImpact;
        }
        
        // 4. Flow Influences (Whales)
        if (flow.positioningBias === 'LONG') buyPressure += 0.3 * flow.flowImbalance;
        if (flow.positioningBias === 'SHORT') sellPressure += 0.3 * flow.flowImbalance;

        // 5. Normalization
        const total = buyPressure + sellPressure || 1;
        buyPressure = buyPressure / total;
        sellPressure = sellPressure / total;

        // Confidence Score based on confluence of directions
        const confidenceScore = Math.max(buyPressure, sellPressure);

        return {
            buyPressure,
            sellPressure,
            volatilityRisk: market.volatility,
            liquidityCondition: market.liquidity,
            confidenceScore
        };
    }
};
