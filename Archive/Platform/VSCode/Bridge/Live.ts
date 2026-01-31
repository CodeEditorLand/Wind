/**
 * @module Live (Platform/VSCode/Bridge)
 * @description Live implementation layer for the enhanced Bridge service.
 * This layer integrates AGENT 2's completed services with the bridge enhancement.
 */

import { Layer } from 'effect';
import { BridgeService } from './Service.js';
import { ElectronAppService } from '../ElectronApp/Service.js';
import { ConfigurationService } from '../Configuration/Service.js';
import { ProtocolService } from '../Protocol/Service.js';

/**
 * Live implementation layer for BridgeService
 * This layer composes all required dependencies and provides the enhanced bridge functionality.
 */
export const BridgeLive = BridgeService.Default as Layer.Layer<
  BridgeService,
  never,
  | typeof ElectronAppService
  | typeof ConfigurationService
  | typeof ProtocolService
>;
