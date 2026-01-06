
export interface StorageAdapter {
    name: string;
    isAvailable(): Promise<boolean>;
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
}

export class LocalStorageAdapter implements StorageAdapter {
    name = "Browser LocalStorage";

    async isAvailable(): Promise<boolean> {
        return typeof window !== 'undefined' && !!window.localStorage;
    }

    async getItem(key: string): Promise<string | null> {
        return localStorage.getItem(key);
    }

    async setItem(key: string, value: string): Promise<void> {
        localStorage.setItem(key, value);
    }

    async removeItem(key: string): Promise<void> {
        localStorage.removeItem(key);
    }

    async clear(): Promise<void> {
        localStorage.clear();
    }

    async keys(): Promise<string[]> {
        return Object.keys(localStorage);
    }
}

// Future Hybrid Adapters can be added here (e.g., SupabaseAdapter, FileSystemAdapter)
