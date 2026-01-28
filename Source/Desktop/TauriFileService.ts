/**
 * @module TauriFileService
 * @description
 * Tauri File Service implementation for VSCode workbench integration.
 * Replaces Electron's file system service with Tauri's file system APIs.
 * 
 * Architecture:
 * - Uses Tauri's filesystem API for file operations
 * - Implements VSCode IFileService interface
 * - Provides file watching capabilities
 * - Handles file system events and errors
 * 
 * VSCode Source Reference: `vs/platform/files/common/files.ts`
 * TODO: Complete file watching implementation
 * TODO: Implement proper error handling and recovery
 * TODO: Add file system event propagation
 */

import { invoke } from '@tauri-apps/api/core';
import { BaseDirectory, readTextFile, writeTextFile, readBinaryFile, writeBinaryFile, createDir, removeDir, removeFile, exists, copyFile, renameFile, readDir, metadata } from '@tauri-apps/api/fs';
import { watch, unwatch, type FileSystemWatcher as TauriWatcher } from '@tauri-apps/api/fs';

/**
 * File system entry interface
 */
interface IFileSystemEntry {
  readonly path: string;
  readonly name: string;
  readonly isDirectory: boolean;
  readonly size?: number;
  readonly modified?: number;
  readonly created?: number;
}

interface IFileServiceConfig {
  readonly enableFileWatching: boolean;
  readonly maxFileSize: number;
  readonly allowedExtensions: readonly string[];
}

type FileOperationResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * File system event
 */
interface IFileSystemEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed';
  path: string;
  oldPath?: string;
}

/**
 * File service options
 */
interface IFileServiceOptions {
  enableFileWatching: boolean;
  enableRecursiveWatching: boolean;
  pollingInterval?: number;
}

/**
 * Tauri File Service implementation
 */
export class TauriFileService {
  private watchers: Map<string, TauriWatcher> = new Map();
  private eventListeners: Map<string, Set<(event: IFileSystemEvent) => void>> = new Map();
  private options: IFileServiceOptions;

  constructor(options: Partial<IFileServiceOptions> = {}) {
    this.options = {
      enableFileWatching: true,
      enableRecursiveWatching: false,
      pollingInterval: 5000,
      ...options
    };

    console.log('[TauriFileService] Initializing Tauri file service');
  }

  /**
   * Check if file or directory exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      return await exists(path, { dir: BaseDirectory.AppData });
    } catch (error) {
      console.error(`[TauriFileService] Error checking existence of ${path}:`, error);
      return false;
    }
  }

  /**
   * Read file as text
   */
  async readFile(path: string, encoding: string = 'utf-8'): Promise<string> {
    try {
      return await readTextFile(path, { dir: BaseDirectory.AppData });
    } catch (error) {
      console.error(`[TauriFileService] Error reading file ${path}:`, error);
      throw new Error(`Failed to read file: ${path}`);
    }
  }

  /**
   * Read file as binary
   */
  async readFileBinary(path: string): Promise<Uint8Array> {
    try {
      return await readBinaryFile(path, { dir: BaseDirectory.AppData });
    } catch (error) {
      console.error(`[TauriFileService] Error reading binary file ${path}:`, error);
      throw new Error(`Failed to read binary file: ${path}`);
    }
  }

  /**
   * Write text to file
   */
  async writeFile(path: string, content: string, encoding: string = 'utf-8'): Promise<void> {
    try {
      await writeTextFile(path, content, { dir: BaseDirectory.AppData });
    } catch (error) {
      console.error(`[TauriFileService] Error writing file ${path}:`, error);
      throw new Error(`Failed to write file: ${path}`);
    }
  }

  /**
   * Write binary data to file
   */
  async writeFileBinary(path: string, content: Uint8Array): Promise<void> {
    try {
      await writeBinaryFile(path, content, { dir: BaseDirectory.AppData });
    } catch (error) {
      console.error(`[TauriFileService] Error writing binary file ${path}:`, error);
      throw new Error(`Failed to write binary file: ${path}`);
    }
  }

  /**
   * Create directory
   */
  async createDirectory(path: string, recursive: boolean = true): Promise<void> {
    try {
      await createDir(path, { dir: BaseDirectory.AppData, recursive });
    } catch (error) {
      console.error(`[TauriFileService] Error creating directory ${path}:`, error);
      throw new Error(`Failed to create directory: ${path}`);
    }
  }

  /**
   * Delete file or directory
   */
  async delete(path: string, recursive: boolean = false): Promise<void> {
    try {
      const pathExists = await this.exists(path);
      if (!pathExists) {
        console.warn(`[TauriFileService] Path does not exist: ${path}`);
        return;
      }

      // Determine if path is directory or file using metadata
      const metadata = await this.stat(path);
      if (metadata.isDirectory) {
        await removeDir(path, { dir: BaseDirectory.AppData, recursive });
      } else {
        await removeFile(path, { dir: BaseDirectory.AppData });
      }
    } catch (error) {
      console.error(`[TauriFileService] Error deleting ${path}:`, error);
      throw new Error(`Failed to delete: ${path}`);
    }
  }

  /**
   * Copy file
   */
  async copy(source: string, target: string): Promise<void> {
    try {
      await copyFile(source, target, { dir: BaseDirectory.AppData });
    } catch (error) {
      console.error(`[TauriFileService] Error copying ${source} to ${target}:`, error);
      throw new Error(`Failed to copy file: ${source} -> ${target}`);
    }
  }

  /**
   * Move/rename file
   */
  async move(source: string, target: string): Promise<void> {
    try {
      await renameFile(source, target, { dir: BaseDirectory.AppData });
    } catch (error) {
      console.error(`[TauriFileService] Error moving ${source} to ${target}:`, error);
      throw new Error(`Failed to move file: ${source} -> ${target}`);
    }
  }

  /**
   * List directory contents
   */
  async readDirectory(path: string): Promise<IFileSystemEntry[]> {
    try {
      // Use Tauri's readDir API to list directory contents
      const entries = await readDir(path, { dir: BaseDirectory.AppData });
      
      const fileSystemEntries: IFileSystemEntry[] = entries.map(entry => ({
        path: entry.path,
        name: entry.name || entry.path.split('/').pop() || entry.path,
        isDirectory: entry.isDirectory,
        size: entry.size || 0,
        modified: entry.modified ? new Date(entry.modified).getTime() : Date.now()
      }));
      
      return fileSystemEntries;
    } catch (error) {
      console.error(`[TauriFileService] Error reading directory ${path}:`, error);
      throw new Error(`Failed to read directory: ${path}`);
    }
  }

  /**
   * Get file statistics
   */
  async stat(path: string): Promise<IFileSystemEntry> {
    try {
      // Use Tauri's metadata API to get detailed file stats
      const fileMetadata = await metadata(path, { dir: BaseDirectory.AppData });
      
      const stats: IFileSystemEntry = {
        path: path,
        name: path.split('/').pop() || path,
        isDirectory: fileMetadata.isDirectory,
        size: fileMetadata.size || 0,
        modified: fileMetadata.modified ? new Date(fileMetadata.modified).getTime() : Date.now()
      };
      
      return stats;
    } catch (error) {
      console.error(`[TauriFileService] Error getting stats for ${path}:`, error);
      throw new Error(`Failed to get file stats: ${path}`);
    }
  }

  /**
   * Watch file or directory for changes
   */
  async watch(path: string, recursive: boolean = false): Promise<string> {
    if (!this.options.enableFileWatching) {
      console.warn('[TauriFileService] File watching is disabled');
      return '';
    }

    try {
      const watcher = await watch(path, {
        recursive: recursive || this.options.enableRecursiveWatching,
        delayMs: this.options.pollingInterval
      }, (event) => {
        this.handleFileSystemEvent(path, event);
      });

      const watchId = `watch_${Date.now()}_${path}`;
      this.watchers.set(watchId, watcher);
      
      console.log(`[TauriFileService] Started watching: ${path}`);
      return watchId;
    } catch (error) {
      console.error(`[TauriFileService] Error watching ${path}:`, error);
      throw new Error(`Failed to watch path: ${path}`);
    }
  }

  /**
   * Stop watching file or directory
   */
  async unwatch(watchId: string): Promise<void> {
    const watcher = this.watchers.get(watchId);
    if (watcher) {
      try {
        await unwatch(watchId);
        this.watchers.delete(watchId);
        console.log(`[TauriFileService] Stopped watching: ${watchId}`);
      } catch (error) {
        console.error(`[TauriFileService] Error unwatching ${watchId}:`, error);
      }
    }
  }

  /**
   * Handle file system events from watcher
   */
  private handleFileSystemEvent(path: string, event: any): void {
    // TODO: Map Tauri file system events to VSCode file system events
    // Tauri events: { type: 'Create' | 'Modify' | 'Remove', path: string }
    
    const fileEvent: IFileSystemEvent = {
      type: this.mapEventType(event.type),
      path: event.path
    };

    this.notifyEventListeners(path, fileEvent);
  }

  /**
   * Map Tauri event type to VSCode event type
   */
  private mapEventType(tauriType: string): IFileSystemEvent['type'] {
    switch (tauriType) {
      case 'Create': return 'created';
      case 'Modify': return 'modified';
      case 'Remove': return 'deleted';
      default: return 'modified';
    }
  }

  /**
   * Notify event listeners
   */
  private notifyEventListeners(path: string, event: IFileSystemEvent): void {
    const listeners = this.eventListeners.get(path);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`[TauriFileService] Error in event listener for ${path}:`, error);
        }
      });
    }
  }

  /**
   * Add event listener for file system events
   */
  onFileEvent(path: string, listener: (event: IFileSystemEvent) => void): void {
    if (!this.eventListeners.has(path)) {
      this.eventListeners.set(path, new Set());
    }
    this.eventListeners.get(path)!.add(listener);
  }

  /**
   * Remove event listener
   */
  offFileEvent(path: string, listener: (event: IFileSystemEvent) => void): void {
    const listeners = this.eventListeners.get(path);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(path);
      }
    }
  }

  /**
   * Check if path is directory
   */
  async isDirectory(path: string): Promise<boolean> {
    try {
      const stats = await this.stat(path);
      return stats.isDirectory;
    } catch (error) {
      console.error(`[TauriFileService] Error checking if ${path} is directory:`, error);
      return false;
    }
  }

  /**
   * Check if path is file
   */
  async isFile(path: string): Promise<boolean> {
    try {
      const stats = await this.stat(path);
      return !stats.isDirectory;
    } catch (error) {
      console.error(`[TauriFileService] Error checking if ${path} is file:`, error);
      return false;
    }
  }

  /**
   * Get file size
   */
  async getSize(path: string): Promise<number> {
    try {
      const stats = await this.stat(path);
      return stats.size || 0;
    } catch (error) {
      console.error(`[TauriFileService] Error getting size of ${path}:`, error);
      return 0;
    }
  }

  /**
   * Get file modification time
   */
  async getModifiedTime(path: string): Promise<number> {
    try {
      const stats = await this.stat(path);
      return stats.modified || 0;
    } catch (error) {
      console.error(`[TauriFileService] Error getting modified time of ${path}:`, error);
      return 0;
    }
  }

  /**
   * Dispose file service
   */
  dispose(): void {
    console.log('[TauriFileService] Disposing file service');
    
    // Stop all watchers
    this.watchers.forEach((watcher, watchId) => {
      this.unwatch(watchId).catch(error => {
        console.error(`[TauriFileService] Error disposing watcher ${watchId}:`, error);
      });
    });
    
    this.watchers.clear();
    this.eventListeners.clear();
  }
}

// Export singleton instance
export const tauriFileService = new TauriFileService();
