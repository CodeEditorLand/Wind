/**
 * @module Service (Application/Configuration)
 * @description Defines the service interface and live implementation for the
 * application-level configuration service, which conforms to the `IConfigurationService`
 * contract from VS Code.
 */
import { Effect } from "effect";
import type { IConfigurationService } from "@codeeditorland/output/vs/platform/configuration/common/configuration.js";
declare const Configuration_base: Effect.Service.Class<IConfigurationService, "vscode/ConfigurationService", {
    readonly effect: Effect.Effect<IConfigurationService, never, never>;
}>;
/**
 * The `Effect.Service` for the `IConfigurationService`.
 *
 * This service provides a read-only view of the application's merged settings.
 * The implementation is provided directly using the `effect` constructor. It
 * fetches and merges all configuration sources upon initialization, making the
 * final configuration available synchronously to the rest of the application.
 */
export declare class Configuration extends Configuration_base {
}
export {};
//# sourceMappingURL=Service.d.ts.map