import { Option, pipe } from "effect";

import { Schemas, URI } from "../CoreTypes.js";

export function uriToTauriPathOption(uri?: URI): Option.Option<string> {
	return pipe(
		Option.fromNullable(uri),
		Option.filter((u) => u.scheme === Schemas.file),
		Option.map((u) => u.fsPath),
	);
}
