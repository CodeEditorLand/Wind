import { Effect, pipe } from "effect";
import { joinPath } from "vs/base/common/resources.js";

import {
	ParseJson,
	ReadRawFile,
	type ConfigurationProblem,
} from "../../../Integration/Configuration.js";
import {
	ResolveFinalDefaultPath,
	type Uri,
} from "../../../Integration/Tauri.js";

const ResolveConfigurationFile = (
	MaybeConfigDirectory: Effect.Effect<Uri, any>,
	FileName: string,
) =>
	pipe(
		MaybeConfigDirectory,
		Effect.map((ConfigDirectory) => joinPath(ConfigDirectory, FileName)),
		Effect.flatMap(ReadRawFile),
		Effect.flatMap(ParseJson),
	);

const ResolveConfiguration = pipe(
	// For now, we assume settings are in the default path resolved by another service.
	// A complete implementation would need to resolve the workspace settings path.
	ResolveFinalDefaultPath(),
	Effect.map((MaybePath) =>
		MaybePath.pipe(Effect.map((Path) => ({ path: Path }) as any)),
	), // This is a hack
	(DefaultPathEffect) =>
		ResolveConfigurationFile(DefaultPathEffect, "settings.json"),
	Effect.mapError(
		(Cause) =>
			new ConfigurationProblem({
				cause: Cause,
				context: "FailedToResolveDefaultSettings",
			}),
	),
);

export default ResolveConfiguration;
