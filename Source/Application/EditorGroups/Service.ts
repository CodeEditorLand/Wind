/*
 * File: Wind/Source/Application/EditorGroups/Service.ts
 * Responsibility: Defines the Effect Context Tag and type alias for the VS Code EditorGroups service to enable dependency injection of the service within the Land project's Effect-based architecture, used by the Cocoon sidecar for hosting VS Code extensions.
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: effect, vs/workbench/services/editor/common/editorGroupsService.js
 * Export: Interface, Tag
 */

/**
 * @module Service (EditorGroups/Application)
 * @description Defines the service interface and Context.Tag for the application-level
 * editor groups service, which conforms to the `IEditorGroupsService` from VS Code.
 */

import { Context } from "effect";
import type { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService.js";

/**
 * The service interface for the EditorGroups service.
 * This is an alias for VS Code's `IEditorGroupsService` to ensure API compatibility.
 */
export type Interface = IEditorGroupsService;

/**
 * The Context.Tag for the EditorGroups service.
 * This tag is used to specify a dependency on the editor groups service in the Effect
 * ecosystem, and is identified by the string "vscode/EditorGroupsService".
 */
export const Tag = Context.Tag<Interface>("vscode/EditorGroupsService");
