/*
 * File: Wind/Source/Application/Environment/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:41 UTC
 * Dependency: effect, vs/workbench/services/environment/electron-sandbox/environmentService
 * Export: Interface
 */

import { Context } from "effect";
import type { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";

/**
 * @module Tag (Service Tag for INativeWorkbenchEnvironmentService)
 * @description Represents the `INativeWorkbenchEnvironmentService` interface from VSCode.
 */
export type Interface = INativeWorkbenchEnvironmentService;

/**
 * @description The `effect-ts` `Context.Tag` for the `INativeWorkbenchEnvironmentService`.
 */
const EnvironmentServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/NativeWorkbenchEnvironmentService",
);

export default EnvironmentServiceTag;
