/**
 * @module Effect/Language/Live
 * @description
 * Live implementation of LanguageService. Provider registrations are
 * fire-and-forget from the Wind side — the actual provider logic lives in
 * Cocoon (extension host) and is stored in Mountain's ProviderRegistration
 * via gRPC. Wind holds a local disposable reference for each registration so
 * extensions can call `.dispose()` to unregister.
 *
 * Provider registration is tracked locally in a Map so disposal works without
 * a Mountain round-trip. A numeric handle is assigned to each registration
 * and sent to Mountain via the `language:register` IPC channel (added in P1).
 *
 * For now, registration is accepted locally; the actual Mountain-side storage
 * is handled by Cocoon → Mountain gRPC. This layer is primarily responsible
 * for the Wind/UI side of language feature lifecycle.
 */

import { Effect, Layer } from "effect";

import type { LanguageService } from "./Interface/LanguageService.js";
import { LanguageServiceTag } from "./Tag/LanguageServiceTag.js";
import type { LanguageProblem } from "./Type/LanguageProblem.js";

const MakeLanguageProblem = (error: unknown): LanguageProblem =>
	error instanceof Error
		? { _tag: "LanguageOperationFailed", error }
		: { _tag: "LanguageOperationFailed", error: new Error(String(error)) };

/** Monotonically increasing handle counter for provider disposals. */
let NextHandle = 1;

export const LiveLanguageServiceLayer = Layer.effect(
	LanguageServiceTag,
	Effect.gen(function* () {
		/** Active provider registrations keyed by handle. */
		const ActiveProviders = new Map<
			number,
			{ selector: string; type: string; provider: unknown }
		>();

		const MakeDisposable = (
			handle: number,
		): { readonly dispose: () => void } => ({
			dispose: () => {
				ActiveProviders.delete(handle);
			},
		});

		const RegisterProvider = (
			type: string,
			selector: string,
			provider: unknown,
		): Effect.Effect<{ readonly dispose: () => void }, LanguageProblem> =>
			Effect.try({
				try: () => {
					const Handle = NextHandle++;
					ActiveProviders.set(Handle, { selector, type, provider });
					return MakeDisposable(Handle);
				},
				catch: MakeLanguageProblem,
			});

		const Service: LanguageService = {
			RegisterHoverProvider: (selector, provider) =>
				RegisterProvider("hover", selector, provider),

			RegisterCompletionProvider: (selector, provider) =>
				RegisterProvider("completion", selector, provider),

			RegisterDefinitionProvider: (selector, provider) =>
				RegisterProvider("definition", selector, provider),

			RegisterReferenceProvider: (selector, provider) =>
				RegisterProvider("references", selector, provider),

			RegisterCodeActionProvider: (selector, provider) =>
				RegisterProvider("codeAction", selector, provider),

			RegisterDocumentFormattingProvider: (selector, provider) =>
				RegisterProvider("documentFormatting", selector, provider),

			RegisterDocumentSymbolProvider: (selector, provider) =>
				RegisterProvider("documentSymbol", selector, provider),

			RegisterRenameProvider: (selector, provider) =>
				RegisterProvider("rename", selector, provider),

			GetLanguages: () =>
				Effect.try({
					try: () => {
						// Return the set of selectors for which providers are registered
						const Selectors = new Set(
							[...ActiveProviders.values()].map(
								(P) => P.selector,
							),
						);
						return [...Selectors] as readonly string[];
					},
					catch: MakeLanguageProblem,
				}),
		};

		return Service;
	}),
);

export default LiveLanguageServiceLayer;
