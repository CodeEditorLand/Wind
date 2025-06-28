/*
 * File: Wind/Source/Application/LanguageFeatures/Definition.ts
 * Role: Provides the live implementation of the `LanguageFeaturesService`.
 * Responsibilities:
 *   - Implements the Monaco `languages.*Provider` interfaces (e.g., HoverProvider).
 *   - Acts as a bridge, forwarding requests from the Monaco editor to the `Mountain`
 *     backend via Tauri commands.
 *   - Converts the DTOs received from `Mountain` into the rich objects Monaco expects.
 */

import { invoke } from "@tauri-apps/api/tauri";
import { Effect } from "effect";
import * as monaco from "monaco-editor";
import type { languages } from "monaco-editor";
import { CancellationToken } from "vs/base/common/cancellation.js";
import { ILogService } from "vs/platform/log/common/log.js";

import type { Interface as LanguageFeaturesServiceInterface } from "./Service.js";

// --- Hover Provider Bridge ---
class MountainHoverProvider implements languages.HoverProvider {
	constructor(private readonly logService: ILogService) {}

	async provideHover(
		model: monaco.editor.ITextModel,

		position: monaco.Position,

		token: CancellationToken,
	): Promise<languages.Hover | undefined> {
		this.logService.trace(
			`[MountainHoverProvider] Requesting hover for ${model.uri.toString()} at L${position.lineNumber}, C${position.column}`,
		);

		try {
			const result = await invoke<HoverDTO | null>(
				"mountain_provide_hover",

				{
					uri: model.uri.toString(),

					position: {
						LineNumber: position.lineNumber,

						Column: position.column,
					},
				},
			);

			if (!result || token.isCancellationRequested) {
				return undefined;
			}

			return {
				contents: result.Contents.map((c) => ({
					value: c.Value,

					isTrusted: c.IsTrusted,
				})),

				range: result.Range,
			};
		} catch (error) {
			this.logService.error(
				"[MountainHoverProvider] Failed to provide hover:",

				error,
			);

			return undefined;
		}
	}
}

// --- Completion Provider Bridge ---
class MountainCompletionProvider implements languages.CompletionItemProvider {
	triggerCharacters = [".", "(", '"', "'", " "];

	constructor(private readonly logService: ILogService) {}

	async provideCompletionItems(
		model: monaco.editor.ITextModel,

		position: monaco.Position,

		context: languages.CompletionContext,

		token: CancellationToken,
	): Promise<languages.CompletionList | undefined> {
		this.logService.trace(
			`[MountainCompletionProvider] Requesting completions for ${model.uri.toString()} at L${position.lineNumber}, C${position.column}`,
		);

		try {
			const contextDTO: CompletionContextDTO = {
				TriggerKind: context.triggerKind,

				TriggerCharacter: context.triggerCharacter,
			};

			const result = await invoke<CompletionListDTO | null>(
				"mountain_provide_completions",

				{
					uri: model.uri.toString(),

					position: {
						LineNumber: position.lineNumber,

						Column: position.column,
					},

					context: contextDTO,
				},
			);

			if (!result || token.isCancellationRequested) {
				return undefined;
			}

			const suggestions: languages.CompletionItem[] =
				result.Suggestions.map((itemDTO: CompletionItemDTO) => ({
					// A simplified mapping for now
					...itemDTO,

					range: itemDTO.Range,
				}));

			return {
				suggestions,

				incomplete: result.Incomplete,
			};
		} catch (error) {
			this.logService.error(
				"[MountainCompletionProvider] Failed to provide completions:",

				error,
			);

			return undefined;
		}
	}
}

// --- Definition Provider Bridge ---
class MountainDefinitionProvider implements languages.DefinitionProvider {
	constructor(private readonly logService: ILogService) {}

	async provideDefinition(
		model: monaco.editor.ITextModel,

		position: monaco.Position,

		token: CancellationToken,
	): Promise<languages.Definition | undefined> {
		this.logService.trace(
			`[MountainDefinitionProvider] Requesting definition for ${model.uri.toString()} at L${position.lineNumber}, C${position.column}`,
		);

		try {
			const result = await invoke<LocationDTO[] | null>(
				"mountain_provide_definition",

				{
					uri: model.uri.toString(),

					position: {
						LineNumber: position.lineNumber,

						Column: position.column,
					},
				},
			);

			if (!result || token.isCancellationRequested) {
				return undefined;
			}

			return result.map((loc) => ({
				uri: monaco.Uri.parse(loc.Uri),

				range: loc.Range,
			}));
		} catch (error) {
			this.logService.error(
				"[MountainDefinitionProvider] Failed to provide definition:",

				error,
			);

			return undefined;
		}
	}
}

// --- Reference Provider Bridge ---
class MountainReferenceProvider implements languages.ReferenceProvider {
	constructor(private readonly logService: ILogService) {}

	async provideReferences(
		model: monaco.editor.ITextModel,

		position: monaco.Position,

		context: languages.ReferenceContext,

		token: CancellationToken,
	): Promise<languages.Location[] | undefined> {
		this.logService.trace(
			`[MountainReferenceProvider] Requesting references for ${model.uri.toString()} at L${position.lineNumber}, C${position.column}`,
		);

		try {
			const result = await invoke<LocationDTO[] | null>(
				"mountain_provide_references",

				{
					uri: model.uri.toString(),

					position: {
						LineNumber: position.lineNumber,

						Column: position.column,
					},

					context: { includeDeclaration: context.includeDeclaration },
				},
			);

			if (!result || token.isCancellationRequested) {
				return undefined;
			}

			return result.map((loc) => ({
				uri: monaco.Uri.parse(loc.Uri),

				range: loc.Range,
			}));
		} catch (error) {
			this.logService.error(
				"[MountainReferenceProvider] Failed to provide references:",

				error,
			);

			return undefined;
		}
	}
}

/**
 * An Effect that builds the live implementation of the LanguageFeaturesService.
 */
const Definition = Effect.gen(function* (_) {
	const logService = yield* _(ILogService);

	const initialize = (): Effect.Effect<void, never> =>
		Effect.sync(() => {
			logService.info(
				"[LanguageFeaturesService] Registering Monaco language providers.",
			);

			// Register for ALL languages ('*'). Mountain will handle the filtering based on
			// extension registrations and document selectors.
			monaco.languages.registerHoverProvider(
				"*",

				new MountainHoverProvider(logService),
			);

			monaco.languages.registerCompletionItemProvider(
				"*",

				new MountainCompletionProvider(logService),
			);

			monaco.languages.registerDefinitionProvider(
				"*",

				new MountainDefinitionProvider(logService),
			);

			monaco.languages.registerReferenceProvider(
				"*",

				new MountainReferenceProvider(logService),
			);
		});

	const Service: LanguageFeaturesServiceInterface = {
		Initialize: initialize,
	};

	return Service;
});

export default Definition;
