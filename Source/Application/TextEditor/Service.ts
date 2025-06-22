/*
 * File: Wind/Source/Application/TextEditor/Service.ts
 * Role: Defines the service interface and Context.Tag for the ITextFileService.
 * Responsibilities:
 *   - Provide a `Context.Tag` that can be used to request the `ITextFileService`
 *     from the dependency injection container.
 *
 * NOTE: The service was renamed from `ITextEditorService` to `ITextFileService`
 * to more accurately reflect the VS Code service being implemented (`textFileService.ts`).
 */

import { Context } from "effect";
import type { ITextFileService } from "vs/workbench/services/textfile/common/textfiles.js";

/**
 * The service interface for the TextFile service.
 * This is an alias for VS Code's `ITextFileService`.
 */
export type Interface = ITextFileService;

/**
 * The Context.Tag for the TextFile service, using the canonical
 * VS Code identifier for service lookups.
 */
export const Tag = Context.Tag<Interface>(
	"textFileService",
) as Context.Tag<ITextFileService>;
