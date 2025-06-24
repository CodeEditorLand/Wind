/*
 * File: Wind/Source/Application/Clipboard/Service.ts
 * Role: Defines the service interface and Effect.Service for the application-level
 *       clipboard service, which conforms to the `IClipboardService` from VS Code.
 * Responsibilities:
 *   - Declare the contract for the Clipboard service, ensuring API compatibility.
 *   - Provide the `Effect.Service` class for dependency injection.
 */

import { Effect } from "effect";
import type { IClipboardService } from "vs/platform/clipboard/common/clipboardService.js";

/**
 * The `Effect.Service` for the `IClipboardService`.
 *
 * This service provides an abstraction over the system clipboard, allowing the
 * application to read and write text and other resources. It uses the tag
 * "vscode/ClipboardService" for identification within the DI container, maintaining
 * compatibility with VS Code's service lookup mechanism.
 */
export class Clipboard extends Effect.Service<IClipboardService>(
	"vscode/ClipboardService",
) {}
