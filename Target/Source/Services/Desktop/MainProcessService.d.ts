/**
 * @module TauriMainProcessService
 * @description
 * Tauri implementation of VSCode's IMainProcessService.
 * Provides IPC communication between renderer and main process using Tauri APIs.
 *
 * Architecture:
 * 1. Tauri IPC invoke for command execution
 * 2. Event listeners for main process communication
 * 3. Channel-based communication pattern
 *
 * TODOs:
 * - Implement actual Tauri IPC invoke functionality
 * - Create proper channel management
 * - Handle Tauri-specific events
 * - Add error handling and retry logic
 */
import { Disposable } from "@codeeditorland/output/vs/base/common/lifecycle.js";
import { IChannel, IServerChannel } from "@codeeditorland/output/vs/base/parts/ipc/common/ipc.js";
import { IMainProcessService } from "@codeeditorland/output/vs/platform/ipc/common/mainProcessService.js";
export declare class TauriMainProcessService extends Disposable implements IMainProcessService {
    private readonly windowId;
    readonly _serviceBrand: undefined;
    constructor(windowId: number);
    /**
     * Get a channel for IPC communication
     */
    getChannel(channelName: string): IChannel;
    /**
     * Register a channel for server-side communication
     */
    registerChannel(channelName: string, channel: IServerChannel): void;
    /**
     * Invoke a command on the main process
     */
    invoke<T>(command: string, ...args: any[]): Promise<T>;
}
//# sourceMappingURL=MainProcessService.d.ts.map