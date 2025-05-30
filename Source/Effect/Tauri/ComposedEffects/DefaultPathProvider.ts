import { Effect, Option, pipe } from "effect";

import type { TauriPathError, URI } from "../CoreTypes.js";
import {
	effectTauriDocumentDir,
	effectTauriHomeDir,
} from "../MetaFactory/TauriApiWrappers.js"; // Adjusted path
import { uriToTauriPathOption } from "../PureUtils/PathConverters.js";

export const effectGetFallbackDefaultPath: Effect.Effect<
	Option.Option<string>,
	TauriPathError
> = pipe(
	effectTauriHomeDir,
	Effect.map(Option.some),
	Effect.catchTag("TauriPathError", (e) =>
		e.operation === "homeDir"
			? pipe(
					effectTauriDocumentDir,
					Effect.map(Option.some),
					Effect.catchTag("TauriPathError", (e2) =>
						e2.operation === "documentDir"
							? Effect.succeed(Option.none<string>())
							: Effect.fail(e2),
					),
				)
			: Effect.fail(e),
	),
);

export function effectGetFinalDefaultPath(
	optionsDefaultUri?: URI,
): Effect.Effect<Option.Option<string>, TauriPathError> {
	return pipe(
		uriToTauriPathOption(optionsDefaultUri),
		Option.match({
			onSome: (p) => Effect.succeed(Option.some(p)),
			onNone: () => effectGetFallbackDefaultPath,
		}),
	);
}
