import type { LanguageProblem } from "../Type/LanguageProblem.js";

/**
 * Language service interface
 * Microsoft VSCode Reference: ILanguageService from vs/editor/common/languages/language.ts
 */
export interface LanguageService {
	readonly RegisterHoverProvider: (
		selector: string,

		provider: unknown,
	) => Promise<{ readonly dispose: () => void }>;

	readonly RegisterCompletionProvider: (
		selector: string,

		provider: unknown,
	) => Promise<{ readonly dispose: () => void }>;

	readonly RegisterDefinitionProvider: (
		selector: string,

		provider: unknown,
	) => Promise<{ readonly dispose: () => void }>;

	readonly RegisterReferenceProvider: (
		selector: string,

		provider: unknown,
	) => Promise<{ readonly dispose: () => void }>;

	readonly RegisterCodeActionProvider: (
		selector: string,

		provider: unknown,
	) => Promise<{ readonly dispose: () => void }>;

	readonly RegisterDocumentFormattingProvider: (
		selector: string,

		provider: unknown,
	) => Promise<{ readonly dispose: () => void }>;

	readonly RegisterDocumentSymbolProvider: (
		selector: string,

		provider: unknown,
	) => Promise<{ readonly dispose: () => void }>;

	readonly RegisterRenameProvider: (
		selector: string,

		provider: unknown,
	) => Promise<{ readonly dispose: () => void }>;

	readonly GetLanguages: () => Promise<
		readonly string[]
	>;
}
