/**
 * @module Live (Application/Dialog)
 * @description Provides the "live" implementation `Layer` for the Dialog service.
 */
import { Layer } from "effect";
import { HostService } from "../Host/Service.js";
import { DialogService } from "./Service.js";
/**
 * The live implementation `Layer` for the `DialogService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `DialogService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as the `HostService`.
 */
export declare const DialogLive: Layer.Layer<DialogService, never, HostService>;
//# sourceMappingURL=Live.d.ts.map