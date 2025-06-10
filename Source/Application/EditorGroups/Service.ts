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
