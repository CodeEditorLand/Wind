/**
 * @module Service (Application/Clipboard)
 * @description Defines the service interface and live implementation for the
 * application-level clipboard service, conforming to the `IClipboardService`
 * contract from VS Code.
 *
 * Responsibilities:
 *   - Declare the contract and provide the `Effect.Service` tag.
 *   - Implement the service by creating an Effect that bridges the declarative
 *     Effect-TS world with the imperative, promise-based VS Code API.
 */
import { Effect } from "effect";
import type { IClipboardService } from "@codeeditorland/output/vs/platform/clipboard/common/clipboardService.js";
declare const Clipboard_base: Effect.Service.Class<IClipboardService, "vscode/ClipboardService", {
    readonly effect: Effect.Effect<IClipboardService, never, never>;
}>;
/**
 * The `Effect.Service` for the `IClipboardService`.
 *
 * This service provides an abstraction over the system clipboard, allowing the
 * application to read and write text and other resources. It uses the tag

 * "vscode/ClipboardService" for identification within the DI container, maintaining
 * compatibility with VS Code's service lookup mechanism.
 *
 * The implementation is provided directly within the service definition using
 * the `effect` constructor, which depends on the application `Runtime` to
 * execute the underlying integration-layer Effects.
 */
export declare class Clipboard extends Clipboard_base {
}
export {};
//# sourceMappingURL=Service.d.ts.map