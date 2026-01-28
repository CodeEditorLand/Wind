/**
 * @module TauriIPCServer
 * @description
 * Tauri IPC Server implementation for VSCode workbench integration.
 * Replaces Electron's IPC server with Tauri's message passing system.
 * 
 * Architecture:
 * - Uses Tauri's invoke/event system for bidirectional communication
 * - Maps VSCode IPC channels to Tauri message handlers
 * - Provides seamless integration with Wind services
 * 
 * TODO: Complete implementation of all IPC channels
 * TODO: Implement proper error handling and reconnection logic
 * TODO: Add performance monitoring and optimization
 */

import { invoke, emit, listen } from '@tauri-apps/api/core';

/**
 * Interface for Tauri IPC message structure
 */
interface ITauriIPCMessage {
  channel: string;
  data: any;
  sender?: string;
  timestamp: number;
}

/**
 * Tauri IPC Server implementation
 */
export class TauriIPCServer {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnected: boolean = false;
  private messageQueue: ITauriIPCMessage[] = [];

  constructor() {
    console.log('[TauriIPCServer] Initializing Tauri IPC Server');
    this.setupListeners();
  }

  /**
   * Set up Tauri event listeners for IPC communication with Mountain integration
   */
  private async setupListeners(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log('[TauriIPCServer] Setting up IPC listeners with Mountain integration...');
      
      // Listen for messages from the Tauri backend
      await this.setupChannelListener('vscode-ipc-message', (event) => {
        this.handleIncomingMessage(event.payload as ITauriIPCMessage);
      });

      // Listen for Mountain connection status
      await this.setupChannelListener('mountain-ipc-status', (event) => {
        this.handleConnectionStatus(event.payload as { connected: boolean });
      });

      // Listen for Mountain synchronization events
      await this.setupChannelListener('mountain-advanced-sync', (event) => {
        this.handleAdvancedSyncEvent(event.payload as any);
      });

      // Verify Mountain connection
      const mountainStatus = await this.verifyMountainConnection();
      this.isConnected = mountainStatus.connected;
      
      console.log(`[TauriIPCServer] IPC listeners setup complete in ${Date.now() - startTime}ms`);
      console.log(`[TauriIPCServer] Mountain connection status: ${mountainStatus.connected ? 'CONNECTED' : 'DISCONNECTED'}`);
      
      this.processMessageQueue();
    } catch (error) {
      console.error('[TauriIPCServer] Failed to setup listeners:', error);
      this.isConnected = false;
    }
  }

  /**
   * Handle incoming IPC messages
   */
  private handleIncomingMessage(message: ITauriIPCMessage): void {
    const channelListeners = this.listeners.get(message.channel);
    if (channelListeners) {
      channelListeners.forEach(listener => {
        try {
          listener(message.data);
        } catch (error) {
          console.error(`[TauriIPCServer] Error in listener for channel ${message.channel}:`, error);
        }
      });
    }
  }

  /**
   * Handle connection status changes
   */
  private handleConnectionStatus(status: { connected: boolean }): void {
    this.isConnected = status.connected;
    if (this.isConnected) {
      this.processMessageQueue();
    }
  }

  /**
   * Send message via Tauri IPC
   */
  async send(channel: string, data: any): Promise<void> {
    const message: ITauriIPCMessage = {
      channel,
      data,
      timestamp: Date.now()
    };

    if (!this.isConnected) {
      this.messageQueue.push(message);
      return;
    }

    try {
      await invoke('vscode_ipc_send', { message });
    } catch (error) {
      console.error(`[TauriIPCServer] Failed to send message on channel ${channel}:`, error);
      this.messageQueue.push(message);
    }
  }

  /**
   * Register listener for IPC channel
   */
  on(channel: string, listener: (data: any) => void): void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(listener);
  }

  /**
   * Remove listener from IPC channel
   */
  off(channel: string, listener: (data: any) => void): void {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.delete(listener);
      if (channelListeners.size === 0) {
        this.listeners.delete(channel);
      }
    }
  }

  /**
   * Process queued messages
   */
  private async processMessageQueue(): Promise<void> {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift()!;
      try {
        await invoke('vscode_ipc_send', { message });
      } catch (error) {
        console.error('[TauriIPCServer] Failed to send queued message:', error);
        this.messageQueue.unshift(message); // Put back in queue
        break;
      }
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get queued message count
   */
  getQueueSize(): number {
    return this.messageQueue.length;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.listeners.clear();
    this.messageQueue.length = 0;
    this.isConnected = false;
  }
}

// Export singleton instance
export const tauriIPCServer = new TauriIPCServer();
