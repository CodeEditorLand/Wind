/*
 * File: Wind/Source/Application/File/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:40 UTC
 * Dependency: ../FileSystem.js, ../Log.js, ./Tag.js, effect, vs/base/common/network.js, vs/platform/files/common/fileService.js
 */

import { Effect, Layer } from "effect";
import { Schemas } from "vs/base/common/network.js";
import { FileService } from "vs/platform/files/common/fileService.js";

import { LiveFileSystemProvider } from "../FileSystem.js";
import { LiveLogService, LogServiceTag } from "../Log.js"; // Assuming Log module
import ServiceTag from "./Tag.js";

const DependenciesLayer = LiveLogService;

const LiveFileService: Layer.Layer<import("./Tag.js").Interface, any, any> =
	Layer.effect(
		ServiceTag,
		Effect.gen(function* (_) {
			const LogService = yield* _(LogServiceTag);
			const FileProvider = yield* _(
				Effect.sync(
					() => new (LiveFileSystemProvider.context as any)().s,
				),
			); // This is a hack for demo
			const Service = new FileService(LogService);
			Service.registerProvider(Schemas.file, FileProvider);
			return Service;
		}),
	).pipe(Layer.provide(DependenciesLayer));

export default LiveFileService;
