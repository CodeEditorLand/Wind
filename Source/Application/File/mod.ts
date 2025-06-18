/*
 * File: Wind/Source/Application/File/mod.ts
 * Responsibility:
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: ../FileSystem/mod.js, ../Log.js, ./Definition.js, ./Type.js, effect
 * Export: FileEntry, Interface, Live, Tag
 */

/**
 * @module File
 * @description Provides the complete public API for the File service, which
 * implements VS Code's `IFileService`. This module aggregates and exports the
 * service interface, context tag, and live implementation layer.
 */

import { Layer } from "effect";

import { Live as LiveFileSystemProvider } from "../FileSystem/mod.js";
import { Log } from "../Log.js";
import { Definition } from "./Definition.js";
import {
	Tag as FileServiceTag,
	type Interface as FileServiceInterface,
} from "./Service.js";
import type { FileEntry as FileServiceEntry } from "./Type.js";

/**
 * The `Context.Tag` for the File service.
 * @see Service.Interface
 */
export const Tag = FileServiceTag;
export type Interface = FileServiceInterface;

/**
 * The live implementation `Layer` for the File service.
 */
export const Live = Layer.effect(Tag, Definition).pipe(
	Layer.provide(Layer.merge(LiveFileSystemProvider, Log.Live)),
);

/**
 * A type representing a single entry within a directory listing.
 * @see Type.FileEntry
 */
export type FileEntry = FileServiceEntry;
