/**
 * @module ParseJSON (Integration/Tauri/File)
 * @description Defines a safe Effect for parsing a JSON string.
 */
import { Effect } from "effect";
import { IntegrationConfigurationProblem } from "../Configuration/Error.js";
/**
 * An Effect that safely parses a JSON string into an object.
 * This is a standard library operation wrapped in an Effect for type-safe
 * error handling within Effect pipelines.
 */
export declare const ParseJSON: (JSONString: string) => Effect.Effect<object, IntegrationConfigurationProblem>;
//# sourceMappingURL=ParseJSON.d.ts.map