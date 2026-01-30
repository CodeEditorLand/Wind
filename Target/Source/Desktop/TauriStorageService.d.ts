/**
 * @module TauriStorageService
 * @description
 * Tauri Storage Service implementation for VSCode workbench integration.
 * Replaces Electron's storage system with Tauri's file-based storage.
 *
 * Architecture:
 * - Uses Tauri's filesystem API for persistent storage
 * - Implements VSCode storage service interface
 * - Provides key-value storage with persistence
 *
 * TODO: Implement proper encryption for sensitive data
 * TODO: Add storage quota management
 * TODO: Implement backup and restore functionality
 * TODO: Add migration support for storage schema changes
 */
interface IStorageMetadata {
    readonly version: string;
    readonly created: number;
    readonly lastModified: number;
    readonly entryCount: number;
    readonly totalSize: number;
}
/**
 * Storage metadata
 */
interface IStorageMetadata {
    version: string;
    created: number;
    lastModified: number;
    entryCount: number;
}
/**
 * Tauri Storage Service implementation
 */
export declare class TauriStorageService {
    private storageName;
    private storagePath;
    private storage;
    private metadata;
    private isInitialized;
    private encryptionKey;
    private storageQuota;
    private currentUsage;
    constructor(storageName?: string);
    /**
     * Initialize storage service
     */
    private initialize;
    /**
     * Load storage data from file
     */
    private loadStorage;
    /**
     * Save storage data to file
     */
    private saveStorage;
    /**
     * Get value from storage
     */
    get(key: string, defaultValue?: any): Promise<any>;
    /**
     * Set value in storage
     */
    set(key: string, value: any): Promise<void>;
    /**
     * Delete value from storage
     */
    delete(key: string): Promise<void>;
    /**
     * Check if key exists in storage
     */
    has(key: string): Promise<boolean>;
    /**
     * Get all keys from storage
     */
    keys(): Promise<string[]>;
    /**
     * Get storage size
     */
    size(): Promise<number>;
    /**
     * Clear all storage data
     */
    clear(): Promise<void>;
    /**
     * Get storage metadata
     */
    getMetadata(): IStorageMetadata;
    /**
     * Check if storage is initialized
     */
    isReady(): boolean;
    /**
     * Check storage quota
     */
    private checkStorageQuota;
    /**
     * Encrypt data using Tauri's secure storage
     */
    private encryptData;
    /**
     * Decrypt data using Tauri's secure storage
     */
    private decryptData;
    /**
     * Set encryption key for sensitive data
     */
    setEncryptionKey(key: string): void;
    /**
     * Set storage quota
     */
    setQuota(quotaInMB: number): void;
    /**
     * Get current storage usage
     */
    getUsage(): {
        used: number;
        quota: number;
        percentage: number;
    };
    /**
     * Dispose storage service
     */
    dispose(): void;
}
export declare const tauriStorageService: TauriStorageService;
export {};
//# sourceMappingURL=TauriStorageService.d.ts.map