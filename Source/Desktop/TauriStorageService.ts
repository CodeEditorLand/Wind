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
interface IStorageEntry {
  key: string;
  value: any;
  timestamp: number;
  version: number;
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
      const parsedData = JSON.parse(data);
      
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
      
      console.log(`[TauriStorageService] Loaded ${this.storage.size} entries from storage`);
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

      await writeTextFile(this.storagePath, JSON.stringify(storageData, null, 2), { 
        dir: BaseDirectory.AppData 
      });

      console.log(`[TauriStorageService] Saved ${this.storage.size} entries to storage`);
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
   * Dispose storage service
   */
  dispose(): void {
    this.storage.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance for global storage
export const tauriStorageService = new TauriStorageService('vscode-global');
