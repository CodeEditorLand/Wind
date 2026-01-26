/**
 * @module Live (Platform/VSCode/Protocol)
 * @description Live implementation layer for ProtocolService.
 * This module provides the live implementation that integrates with Wind's
 * existing infrastructure and provides Tauri-compatible protocol handling.
 */

import { Layer } from 'effect';
import { ProtocolService } from './Service.js';

/**
 * The live implementation layer for ProtocolService.
 * This layer doesn't require external dependencies since it provides
 * protocol handling that bridges VSCode's expectations with Tauri's capabilities.
 */
export const ProtocolLive = ProtocolService.Default as Layer.Layer<
    ProtocolService,
    never,
    never
>;
