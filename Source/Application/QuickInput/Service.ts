/*
 * File: Wind/Source/Application/QuickInput/Service.ts
 * Role: Defines the service interface and Context.Tag for the IQuickInputService.
 * Responsibilities:
 *   - Provide a `Context.Tag` that can be used to request the `IQuickInputService`
 *     from the dependency injection container.
 */

import { Context } from "effect";
import type { IQuickInputService } from "vs/platform/quickinput/common/quickInput.js";

/**
 * The service interface for the QuickInput service.
 * This is an alias for VS Code's `IQuickInputService`.
 */
export type Interface = IQuickInputService;

/**
 * The Context.Tag for the QuickInput service, using the canonical
 * VS Code identifier for service lookups.
 */
export const Tag = Context.Tag<Interface>(
	"@quickInputService",
) as Context.Tag<IQuickInputService>;
