/**
 * @module Effect/Language/Live
 * @description
 * Live implementation of LanguageService. This layer is WIND-LOCAL ONLY:
 * registrations are tracked in an in-memory Map and are NOT forwarded to
 * Mountain or Cocoon - no `language:register` IPC channel exists on the
 * Mountain side. Real language providers route through Cocoon (extension
 * host) and reach Mountain's ProviderRegistration via gRPC; this layer
 * only covers the Wind/UI side of language feature lifecycle (local
 * disposal bookkeeping and `GetLanguages()` over locally-registered
 * selectors). Each registration emits a `land:language:register-local:*`
 * performance mark so misuse (expecting cross-process registration) is
 * visible in trace output.
 */

import type { LanguageService } from "./Interface/LanguageService.js";
import type { LanguageProblem } from "./Type/LanguageProblem.js";

// Inline trace - performance.mark() collected by build-baked OTELBridge.
const _Trace = (Tag: string, Message: string): void => {
	try {
		performance.mark(`land:${Tag}:${Message}`);
	} catch {}
};

const MakeLanguageProblem = (error: unknown): LanguageProblem =>
	error instanceof Error
		? { _tag: "LanguageOperationFailed", error }
		: { _tag: "LanguageOperationFailed", error: new Error(String(error)) };

/** Monotonically increasing handle counter for provider disposals. */
let NextHandle = 1;

function makeLanguageService(): LanguageService {
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

	const RegisterProvider = async (
		type: string,
		selector: string,
		provider: unknown,
	): Promise<{ readonly dispose: () => void }> => {
		try {
			const Handle = NextHandle++;
			ActiveProviders.set(Handle, { selector, type, provider });

			// Wind-local only - nothing is sent to Mountain/Cocoon.
			_Trace(
				"language",
				`register-local:${type}:${selector}:handle=${Handle}`,
			);

			return MakeDisposable(Handle);
		} catch (error) {
			throw MakeLanguageProblem(error);
		}
	};

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

		GetLanguages: async () => {
			try {
				// Return the set of selectors for which providers are registered
				const Selectors = new Set(
					[...ActiveProviders.values()].map((P) => P.selector),
				);
				return [...Selectors] as readonly string[];
			} catch (error) {
				throw MakeLanguageProblem(error);
			}
		},
	};

	return Service;
}

export const LiveLanguageService = makeLanguageService();

export default LiveLanguageService;
