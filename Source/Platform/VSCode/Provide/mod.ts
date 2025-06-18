/*
 * File: Wind/Source/Platform/VSCode/Provide/mod.ts
 * Responsibility: Aggregates and re-exports Wind dependency injection tags and service interfaces for all VS Code platform services (Clipboard, Configuration, Dialog, Editor, File, Host) to provide a single source of truth for dependency declaration in the Land application.
 * Modified: 2025-06-09 15:50:35 UTC
 * Export: Clipboard, Configuration, Dialog, Editor, File, Host
 */

/**
 * @module Provide (Platform/VSCode)
 * @description This module aggregates and exports the `Context.Tag` and service
 * `Interface` for every VS Code platform service that is implemented by the
 * Wind application.
 *
 * This serves as a single source of truth for all provided services, making it
 * easy for any part of the application to declare a dependency on a VS Code service.
 */

import {
	Tag as ClipboardServiceTag,
	type Interface as ClipboardServiceInterface,
} from "../../../Application/Clipboard/Service.js";
import {
	Tag as ConfigurationServiceTag,
	type Interface as ConfigurationServiceInterface,
} from "../../../Application/Configuration/Service.js";
import {
	Tag as DialogServiceTag,
	type Interface as DialogServiceInterface,
} from "../../../Application/Dialog/Service.js";
import {
	Tag as EditorServiceTag,
	type Interface as EditorServiceInterface,
} from "../../../Application/Editor/Service.js";
import {
	Tag as FileServiceTag,
	type Interface as FileServiceInterface,
} from "../../../Application/File/Service.js";
import {
	Tag as HostServiceTag,
	type Interface as HostServiceInterface,
} from "../../../Application/Host/Service.js";

// ... import other service tags and interfaces

// --- Exported Services ---

export const Clipboard = { Tag: ClipboardServiceTag };
export type Clipboard = ClipboardServiceInterface;

export const Configuration = { Tag: ConfigurationServiceTag };
export type Configuration = ConfigurationServiceInterface;

export const Dialog = { Tag: DialogServiceTag };
export type Dialog = DialogServiceInterface;

export const Editor = { Tag: EditorServiceTag };
export type Editor = EditorServiceInterface;

export const File = { Tag: FileServiceTag };
export type File = FileServiceInterface;

export const Host = { Tag: HostServiceTag };
export type Host = HostServiceInterface;

// ... and so on for every other implemented service
