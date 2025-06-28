/**
 * @module Live (Application/IPC)
 * @description Provides the "live" implementation `Layer` for the IPC service.
 */
import { Layer } from "effect";
import { IPCService } from "./Service.js";
import { IPCConfigurationService } from "Source/Application/IPCConfiguration/Service.js";
import { CancellationService } from "Source/Application/Cancellation/Service.js";
import { LoggerService } from "Source/Application/Logger/Service.js";
/**
 * The live implementation `Layer` for the `IPCService`.
 *
 * It is derived from the default implementation in the service definition.
 * Because `IPCService` is scoped, this layer must also be scoped.
 * It depends on other core services to function.
 */
export declare const IPCLive: Layer.Layer<IPCService, never, IPCConfigurationService | CancellationService | LoggerService>;
