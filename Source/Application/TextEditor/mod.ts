/*
 * File: Wind/Source/Application/TextEditor/mod.ts
 * Responsibility: Exports the TextEditor service's dependency injection Tag, Interface, and Live implementation for the Sky frontend, enabling the resolution of untyped editor inputs into concrete EditorInput instances for the workbench.
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: ./Live.js
 * Export: Interface, Live, Tag
 */

/**
 * @module TextEditor (Application)
 * @description This module provides the `ITextEditorService`, which is responsible
 * for resolving untyped editor inputs (like a URI) into concrete `EditorInput`
 * instances that the workbench can render.
 */

import { Live as LiveTextEditorServiceLayer } from "./Live.js";
import {
	Tag as TextEditorServiceTag,
	type Interface as TextEditorServiceInterface,
} from "./Service.js";

/**
 * The Context.Tag for the TextEditor service.
 * @see Service.Interface
 */
export const Tag = TextEditorServiceTag;
export type Interface = TextEditorServiceInterface;

/**
 * The live implementation Layer for the TextEditor service.
 * @see Live
 */
export const Live = LiveTextEditorServiceLayer;
