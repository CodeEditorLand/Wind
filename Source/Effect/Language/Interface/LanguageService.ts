import type { Effect } from "effect";

import type { LanguageProblem } from "../Type/LanguageProblem.js";

/**
 * Language service interface
 * Microsoft VSCode Reference: ILanguageService from vs/editor/common/languages/language.ts
 */
export interface LanguageService {
	readonly RegisterHoverProvider: (
		selector: string,

		provider: unknown,
	) => Effect.Effect<{ readonly dispose: () => void }, LanguageProblem>;

	readonly RegisterCompletionProvider: (
		selector: string,

		provider: unknown,
	) => Effect.Effect<{ readonly dispose: () => void }, LanguageProblem>;

	readonly RegisterDefinitionProvider: (
		selector: string,

		provider: unknown,
	) => Effect.Effect<{ readonly dispose: () => void }, LanguageProblem>;

	readonly RegisterReferenceProvider: (
		selector: string,

		provider: unknown,
	) => Effect.Effect<{ readonly dispose: () => void }, LanguageProblem>;

	readonly RegisterCodeActionProvider: (
		selector: string,

		provider: unknown,
	) => Effect.Effect<{ readonly dispose: () => void }, LanguageProblem>;

	readonly RegisterDocumentFormattingProvider: (
		selector: string,

		provider: unknown,
	) => Effect.Effect<{ readonly dispose: () => void }, LanguageProblem>;

	readonly RegisterDocumentSymbolProvider: (
		selector: string,

		provider: unknown,
	) => Effect.Effect<{ readonly dispose: () => void }, LanguageProblem>;

	readonly RegisterRenameProvider: (
		selector: string,

		provider: unknown,
	) => Effect.Effect<{ readonly dispose: () => void }, LanguageProblem>;

	readonly GetLanguages: () => Effect.Effect<
		readonly string[],
		LanguageProblem
	>;
}
