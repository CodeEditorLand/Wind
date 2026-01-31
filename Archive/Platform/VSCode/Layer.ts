/**
 * @module Layer (Platform/VSCode)
 * @description Master layer composition for VSCode bootstrap services.
 * This layer composes all the VSCode-specific services that replace Electron
 * functionality with Effect-TS powered implementations for Wind.
 */

import { Layer } from 'effect';

// Import VSCode platform services
import { ElectronAppLive } from './ElectronApp/Live.js';
import { ConfigurationLive } from './Configuration/Live.js';
import { ProtocolLive } from './Protocol/Live.js';
import { BridgeLive } from './Bridge/Live.js';

/**
 * The master VSCodeBootstrapLayer for Wind.
 * This layer composes all VSCode-specific services that are needed to
 * bootstrap the VSCode workbench in a Tauri/Effect-TS environment.
 */
export const VSCodeBootstrapLayer = Layer.mergeAll(
    ElectronAppLive,
    ConfigurationLive,
    ProtocolLive,
    BridgeLive
);

/**
 * A type alias representing the fully-resolved context provided by the VSCodeBootstrapLayer.
 * This can be useful for functions that need access to VSCode-specific services.
 */
export type VSCodeBootstrapContext = Layer.Layer.Context<typeof VSCodeBootstrapLayer>;
