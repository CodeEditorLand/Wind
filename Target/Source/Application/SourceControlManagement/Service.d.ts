/**
 * @module Service (Application/SourceControlManagement)
 * @description Defines the service interface and live implementation for the
 * Source Control Management service, which conforms to the `ISCMService`.
 */
import { Effect } from "effect";
import { ISCMService } from "@codeeditorland/output/vs/workbench/contrib/scm/common/scm.js";
declare const SourceControlManagementService_base: Effect.Service.Class<ISCMService, "scmService", {
    readonly effect: Effect.Effect<any, unknown, unknown>;
}>;
/**
 * The `Effect.Service` for the `ISCMService`.
 *
 * This service implementation "lifts" the original `SourceControlManagementService`
 * class from VS Code. It orchestrates the following:
 * 1. Instantiates the real `VSCodeSCMService`.
 * 2. Defines an `Initialize` effect that fetches the complete initial SCM state
 *    from the `Mountain` host and sets up listeners for real-time updates.
 * 3. This `Initialize` effect must be run once at application startup.
 */
export declare class SourceControlManagementService extends SourceControlManagementService_base {
}
export {};
//# sourceMappingURL=Service.d.ts.map