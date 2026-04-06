import type { Effect } from "effect";

import type { TextFileProblem } from "../Type/TextFileProblem.js";

/**
 * TextFile service interface
 * Microsoft VSCode Reference: ITextFileService from vs/workbench/services/textfile/common/textfiles.ts
 */
export interface TextFileService {
	readonly Read: (uri: string) => Effect.Effect<string, TextFileProblem>;
	readonly Write: (
		uri: string,
		content: string,
	) => Effect.Effect<void, TextFileProblem>;
	readonly Save: (uri: string) => Effect.Effect<void, TextFileProblem>;
	readonly SaveAll: () => Effect.Effect<void, TextFileProblem>;
	readonly IsDirty: (uri: string) => Effect.Effect<boolean, TextFileProblem>;
	readonly Revert: (uri: string) => Effect.Effect<void, TextFileProblem>;
}
