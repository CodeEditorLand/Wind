/*
 * File: Wind/Source/Application/File/Live.ts
 * Responsibility:
 * Modified: 2025-06-09 15:50:41 UTC
 * Dependency: ../FileSystem/mod.js, ../Log.js, ./Definition.js, ./Service.js, effect
 */

/**
 * @module Live (File/Application)
 * @description Provides the live implementation of the IFileService as a Layer.
 */
import { Layer } from "effect";

import { FileSystemProvider } from "../FileSystem/mod.js";
import { Log } from "../Log.js";
import { Definition } from "./Definition.js";
import { Tag } from "./Service.js";

/**
 * The live implementation Layer for the File service.
 *
 * It uses `Layer.effect` to construct the service instance from its definition.
 *
 * This Layer has context requirements: it needs a `LogService` and a
 * `FileSystemProvider` to be available in the layer provided to it. The master
 * `AppLayer` is responsible for providing these dependencies.
 */
const Live: Layer.Layer<
	import("./Service.js").Interface,
	never, // This layer itself introduces no new errors.
	Log.Interface | FileSystemProvider.Interface
> = Layer.effect(Tag, Definition);

export default Live;
