/**
 * @module Live (Platform/VSCode/Configuration)
 * @description Live implementation layer for ConfigurationService.
 * This module provides the live implementation that integrates with Wind's
 * existing configuration system and Tauri's capabilities.
 */

import { Layer } from 'effect';
import { ConfigurationService } from './Service.js';

/**
 * The live implementation layer for ConfigurationService.
 * This layer doesn't require external dependencies since it wraps
 * VSCode's existing configuration utilities and provides Wind-specific
 * adaptations.
 */
export const ConfigurationLive = ConfigurationService.Default as Layer.Layer<
    ConfigurationService,
    never,
    never
>;
