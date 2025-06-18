/*
 * File: Wind/Source/Application/TextEditor/Service.ts
 * Responsibility: Defines the service interface and Effect Context.Tag for the TextEditor service, aligning with VS Code's ITextEditorService contract to enable dependency injection of text editing functionality within the Cocoon sidecar.
 * Modified: 2025-06-09 15:50:38 UTC
 * Dependency: effect, vs/workbench/services/textfile/common/textEditorService.js
 * Export: Interface, Tag
 */

/**
 * @module Service (TextEditor/Application)
 * @description Defines the service interface and Context.Tag for the TextEditor service.
 */

import { Context } from "effect";
import type { ITextEditorService } from "vs/workbench/services/textfile/common/textEditorService.js";

/**
 * The service interface for the TextEditor service.
 * This is an alias for VS Code's `ITextEditorService`.
 */
export type Interface = ITextEditorService;

/**
 * The Context.Tag for the TextEditor service.
 */
export const Tag = Context.Tag<Interface>("vscode/TextEditorService");
