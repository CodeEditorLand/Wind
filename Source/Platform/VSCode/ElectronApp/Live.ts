/**
 * @module Live (Platform/VSCode/ElectronApp)
 * @description Live implementation layer for ElectronAppService.
 * This module provides the live implementation that bridges the ElectronAppService
 * with Tauri's application APIs and Wind's existing infrastructure.
 */

import { Layer } from 'effect';
import { ElectronAppService } from './Service.js';

/**
 * The live implementation layer for ElectronAppService.
 * This layer doesn't require external dependencies since it directly wraps
 * Tauri's app APIs and provides Electron-compatible functionality.
 */
export const ElectronAppLive = ElectronAppService.Default as Layer.Layer<
    ElectronAppService,
    never,
    never
>;
