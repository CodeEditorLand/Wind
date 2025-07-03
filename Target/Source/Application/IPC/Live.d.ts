/**
 * @module Live (Application/IPC)
 * @description Provides the "live" implementation `Layer` for the IPC service.
 */
import { Layer } from "effect";
import { CancellationService } from "../Cancellation/Service.js";
import { IPCConfigurationService } from "../IPCConfiguration/Service.js";
import { LoggerService } from "../Logger/Service.js";
import { IPCService } from "./Service.js";
/**
 * The live implementation `Layer` for the `IPCService`.
 *
 * It is derived from the default implementation in the service definition.
 * Because `IPCService` is scoped, this layer must also be scoped.
 * It depends on other core services to function.
 */
export declare const IPCLive: Layer.Layer<IPCService, never, IPCConfigurationService | CancellationService | LoggerService>;
//# sourceMappingURL=Live.d.ts.map