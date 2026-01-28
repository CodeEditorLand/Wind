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

import { invoke } from '@tauri-apps/api/core';
import { BaseDirectory, writeTextFile, readTextFile, createDir, exists, metadata } from '@tauri-apps/api/fs';

/**
 * Storage entry interface
 */
interface IStorageEntry<T = unknown> {
  readonly key: string;
  readonly value: T;
  readonly timestamp: number;
  readonly version: number;
  readonly ttl?: number; // Time to live in milliseconds
}

interface IStorageMetadata {
  readonly version: string;
  readonly created: number;
  readonly lastModified: number;
  readonly entryCount: number;
  readonly totalSize: number;
}

interface IStorageQuota {
  readonly maxSize: number;
  readonly currentSize: number;
  readonly warningThreshold: number;
  readonly exceeded: boolean;
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
export class TauriStorageService {
  private storagePath: string;
  private storage: Map<string, any> = new Map();
  private metadata: IStorageMetadata;
  private isInitialized: boolean = false;
  private encryptionKey: string | null = null;
  private storageQuota: number = 100 * 1024 * 1024; // 100MB default quota
  private currentUsage: number = 0;

  constructor(private storageName: string = 'vscode-workbench') {
    this.storagePath = `storage/${storageName}.json`;
    this.metadata = {
      version: '1.0.0',
      created: Date.now(),
      lastModified: Date.now(),
      entryCount: 0
    };

    console.log(`[TauriStorageService] Initializing storage: ${storageName}`);
    this.initialize();
  }

  /**
   * Initialize storage service
   */
  private async initialize(): Promise<void> {
    try {
      // Ensure storage directory exists
      await createDir('storage', { dir: BaseDirectory.AppData, recursive: true });
      
      // Load existing storage data
      await this.loadStorage();
      
      this.isInitialized = true;
      console.log(`[TauriStorageService] Storage initialized: ${this.storageName}`);
    } catch (error) {
      console.error(`[TauriStorageService] Failed to initialize storage:`, error);
      // Create empty storage
      this.storage.clear();
      this.isInitialized = true;
    }
  }

  /**
   * Load storage data from file
   */
  private async loadStorage(): Promise<void> {
    try {
      const fileExists = await exists(this.storagePath, { dir: BaseDirectory.AppData });
      if (!fileExists) {
        console.log(`[TauriStorageService] Storage file does not exist, creating new: ${this.storagePath}`);
        return;
      }

      const data = await readTextFile(this.storagePath, { dir: BaseDirectory.AppData });
      
      // Try to decrypt data if it's encrypted
      const decryptedData = await this.decryptData(data);
      const parsedData = JSON.parse(decryptedData);
      
      if (parsedData.metadata) {
        this.metadata = parsedData.metadata;
      }
      
      if (parsedData.entries) {
        this.storage.clear();
        parsedData.entries.forEach((entry: IStorageEntry) => {
          this.storage.set(entry.key, entry.value);
        });
        this.metadata.entryCount = this.storage.size;
      }
      
      // Update current usage based on file size
      const fileMetadata = await metadata(this.storagePath, { dir: BaseDirectory.AppData });
      this.currentUsage = fileMetadata.size || data.length;
      
      console.log(`[TauriStorageService] Loaded ${this.storage.size} entries from storage (${this.currentUsage} bytes)`);
    } catch (error) {
      console.error(`[TauriStorageService] Failed to load storage:`, error);
      throw error;
    }
  }

  /**
   * Save storage data to file
   */
  private async saveStorage(): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[TauriStorageService] Storage not initialized, cannot save');
      return;
    }

    try {
      this.metadata.lastModified = Date.now();
      this.metadata.entryCount = this.storage.size;

      const entries: IStorageEntry[] = [];
      this.storage.forEach((value, key) => {
        entries.push({
          key,
          value,
          timestamp: Date.now(),
          version: 1
        });
      });

      const storageData = {
        metadata: this.metadata,
        entries: entries
      };

      const jsonData = JSON.stringify(storageData, null, 2);
      
      // Check storage quota
      await this.checkStorageQuota(jsonData.length);
      
      // Encrypt data if encryption key is available
      const dataToSave = this.encryptionKey 
        ? await this.encryptData(jsonData)
        : jsonData;

      await writeTextFile(this.storagePath, dataToSave, { 
        dir: BaseDirectory.AppData 
      });

      // Update current usage
      this.currentUsage = dataToSave.length;

      console.log(`[TauriStorageService] Saved ${this.storage.size} entries to storage (${dataToSave.length} bytes)`);
    } catch (error) {
      console.error(`[TauriStorageService] Failed to save storage:`, error);
      throw error;
    }
  }

  /**
   * Get value from storage
   */
  async get(key: string, defaultValue?: any): Promise<any> {
    if (!this.isInitialized) {
      console.warn('[TauriStorageService] Storage not initialized');
      return defaultValue;
    }

    const value = this.storage.get(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Set value in storage
   */
  async set(key: string, value: any): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[TauriStorageService] Storage not initialized, cannot set value');
      return;
    }

    this.storage.set(key, value);
    await this.saveStorage();
  }

  /**
   * Delete value from storage
   */
  async delete(key: string): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[TauriStorageService] Storage not initialized, cannot delete value');
      return;
    }

    this.storage.delete(key);
    await this.saveStorage();
  }

  /**
   * Check if key exists in storage
   */
  async has(key: string): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('[TauriStorageService] Storage not initialized');
      return false;
    }

    return this.storage.has(key);
  }

  /**
   * Get all keys from storage
   */
  async keys(): Promise<string[]> {
    if (!this.isInitialized) {
      console.warn('[TauriStorageService] Storage not initialized');
      return [];
    }

    return Array.from(this.storage.keys());
  }

  /**
   * Get storage size
   */
  async size(): Promise<number> {
    if (!this.isInitialized) {
      console.warn('[TauriStorageService] Storage not initialized');
      return 0;
    }

    return this.storage.size;
  }

  /**
   * Clear all storage data
   */
  async clear(): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[TauriStorageService] Storage not initialized, cannot clear');
      return;
    }

    this.storage.clear();
    await this.saveStorage();
  }

  /**
   * Get storage metadata
   */
  getMetadata(): IStorageMetadata {
    return { ...this.metadata };
  }

  /**
   * Check if storage is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Check storage quota
   */
  private async checkStorageQuota(dataSize: number): Promise<void> {
    const totalSize = this.currentUsage + dataSize;
    if (totalSize > this.storageQuota) {
      throw new Error(`Storage quota exceeded: ${totalSize} bytes exceeds ${this.storageQuota} bytes limit`);
    }
  }

  /**
   * Encrypt data using Tauri's secure storage
   */
  private async encryptData(data: string): Promise<string> {
    try {
      // Use Tauri's invoke to encrypt data with secure storage
      const encryptedData = await invoke<string>('encrypt_data', { 
        data, 
        key: this.encryptionKey 
      });
      return encryptedData;
    } catch (error) {
      console.warn('[TauriStorageService] Encryption failed, storing plain text:', error);
      return data; // Fallback to plain text
    }
  }

  /**
   * Decrypt data using Tauri's secure storage
   */
  private async decryptData(encryptedData: string): Promise<string> {
    try {
      const decryptedData = await invoke<string>('decrypt_data', { 
        data: encryptedData, 
        key: this.encryptionKey 
      });
      return decryptedData;
    } catch (error) {
      console.warn('[TauriStorageService] Decryption failed, reading plain text:', error);
      return encryptedData; // Assume it's plain text
    }
  }

  /**
   * Set encryption key for sensitive data
   */
  setEncryptionKey(key: string): void {
    this.encryptionKey = key;
    console.log('[TauriStorageService] Encryption key set');
  }

  /**
   * Set storage quota
   */
  setQuota(quotaInMB: number): void {
    this.storageQuota = quotaInMB * 1024 * 1024;
    console.log(`[TauriStorageService] Storage quota set to ${quotaInMB}MB`);
  }

  /**
   * Get current storage usage
   */
  getUsage(): { used: number; quota: number; percentage: number } {
    return {
      used: this.currentUsage,
      quota: this.storageQuota,
      percentage: (this.currentUsage / this.storageQuota) * 100
    };
  }

  /**
   * Dispose storage service
   */
  dispose(): void {
    this.storage.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance for global storage
export const tauriStorageService = new TauriStorageService('vscode-global');
