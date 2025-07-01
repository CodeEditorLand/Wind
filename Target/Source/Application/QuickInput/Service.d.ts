/**
 * @module Service (Application/QuickInput)
 * @description Defines the service for interacting with VS Code's Quick Pick
 * and Input Box UI elements, conforming to the `IQuickInputService` contract.
 */
import { Effect } from "effect";
declare const QuickInputService_base: Effect.Service.Class<IQuickInputService, "quickInputService", {
    readonly effect: Effect.Effect<IQuickInputService, never, import("../Host/Service.js").Host>;
}>;
/**
 * The `Effect.Service` for the `IQuickInputService`.
 *
 * This implementation proxies UI requests to the native `Mountain` host via
 * the `HostService`. It handles the logic for showing Quick Picks and Input Boxes,
 * translating the results back from the host. Controller-based (stateful)
 * Quick Input instances are not supported in this architecture and will throw
 * an error, as the UI is managed by the native host.
 */
export declare class QuickInputService extends QuickInputService_base {
}
export {};
