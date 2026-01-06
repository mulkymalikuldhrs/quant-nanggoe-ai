
/**
 * Quant Nanggroe AI v11.0 - AutoSwitch API System
 * Handles automatic failover, retries, and provider switching for critical services.
 */

export interface AutoSwitchProvider<T, R> {
    name: string;
    id: string;
    execute: (params: T) => Promise<R>;
    isAvailable?: () => boolean;
}

export interface AutoSwitchOptions {
    maxRetries?: number;
    retryDelay?: number;
    enableAutoSwitch?: boolean;
    onProviderChange?: (oldProvider: string, newProvider: string) => void;
}

export class AutoSwitch<T, R> {
    private providers: AutoSwitchProvider<T, R>[];
    private options: AutoSwitchOptions;
    private cooldowns: Record<string, number> = {};

    constructor(providers: AutoSwitchProvider<T, R>[], options: AutoSwitchOptions = {}) {
        this.providers = providers;
        this.options = {
            maxRetries: 3,
            retryDelay: 2000,
            enableAutoSwitch: true,
            ...options
        };
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private isCoolingDown(id: string): boolean {
        const cooldownUntil = this.cooldowns[id];
        if (!cooldownUntil) return false;
        if (Date.now() > cooldownUntil) {
            delete this.cooldowns[id];
            return false;
        }
        return true;
    }

    private setCooldown(id: string, ms: number = 60000) {
        this.cooldowns[id] = Date.now() + ms;
    }

    async execute(params: T): Promise<{ data: R; providerId: string }> {
        let lastError: any = null;
        
        // Filter available providers
        const availableProviders = this.providers.filter(p => {
            if (p.isAvailable && !p.isAvailable()) return false;
            if (this.isCoolingDown(p.id)) return false;
            return true;
        });

        if (availableProviders.length === 0) {
            throw new Error("No available API providers found or all are in cooldown.");
        }

        for (let i = 0; i < availableProviders.length; i++) {
            const provider = availableProviders[i];
            let retries = 0;

            while (retries < (this.options.maxRetries || 3)) {
                try {
                    console.log(`[AutoSwitch] Attempting with ${provider.name} (${provider.id})...`);
                    const data = await provider.execute(params);
                    return { data, providerId: provider.id };
                } catch (error: any) {
                    const status = error?.status || error?.response?.status;
                    const message = error?.message || "";

                    // If rate limited, retry with exponential backoff
                    if (status === 429 || message.includes('429') || message.toLowerCase().includes('rate limit')) {
                        const delay = (this.options.retryDelay || 2000) * Math.pow(2, retries);
                        console.warn(`[AutoSwitch] ${provider.name} rate limited. Retrying in ${delay}ms...`);
                        await this.sleep(delay);
                        retries++;
                        continue;
                    }

                    // For other errors, log and try next provider if auto-switch is enabled
                    console.error(`[AutoSwitch] ${provider.name} failed:`, message);
                    this.setCooldown(provider.id, 30000); // 30s cooldown for non-rate-limit errors
                    lastError = error;
                    break; // Exit retry loop to try next provider
                }
            }

            if (!this.options.enableAutoSwitch) break;
            
            if (i < availableProviders.length - 1) {
                console.info(`[AutoSwitch] Switching from ${provider.name} to ${availableProviders[i+1].name}...`);
                if (this.options.onProviderChange) {
                    this.options.onProviderChange(provider.id, availableProviders[i+1].id);
                }
            }
        }

        throw lastError || new Error("All providers failed to execute.");
    }
}
