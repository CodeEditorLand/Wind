/**
 * @module Service (Application/StatusBar)
 * @description Defines the service for creating and managing items in the
 * VS Code status bar.
 */
import { Effect } from "effect";
declare const StatusBarService_base: Effect.Service.Class<IStatusbarService, "statusbarService", {
    readonly effect: Effect.Effect<IStatusbarService, never, import("../Host/Service.js").Host | import("../Command/Service.js").Command>;
}>;
/**
 * The `Effect.Service` for the `IStatusbarService`.
 *
 * This service provides methods for creating and managing status bar items. It
 * acts as a factory, creating `StatusBarItemImplementation` instances that
trol the UI elements by proxying state changes to the `HostService`.
 */
export declare class StatusBarService extends StatusBarService_base {
}
export {};
