/**
 * @module Define
 * @description
 * Defines the service for registering language feature providers such as for
 * hovers, completions, and definitions. It conforms to a subset of the
 * `vscode.languages` API surface.
 */

import { Effect } from "effect";
import type {
	CodeActionProvider,
	CodeActionProviderMetadata,
	CompletionItemProvider,
	DefinitionProvider,
	DocumentSelector,
	HoverProvider,
	ReferenceProvider,
} from "vscode";

import {
	Disposable as VSCodeDisposable,
	type IDisposable,
} from "../../Platform/Vscode/Type.js";
import { ProviderRegistrationProblem } from "./Problem.js";

/**
 * The contract for the LanguageFeature service. This interface mirrors a subset
 * of the `vscode.languages` API, focusing on provider registration.
 */
export interface Interface {
	readonly RegisterHoverProvider: (
		Selector: DocumentSelector,
		Provider: HoverProvider,
	) => Effect.Effect<IDisposable, ProviderRegistrationProblem>;
	readonly RegisterCompletionItemProvider: (
		Selector: DocumentSelector,
		Provider: CompletionItemProvider,
		TriggerCharacters: string[],
	) => Effect.Effect<IDisposable, ProviderRegistrationProblem>;
	readonly RegisterDefinitionProvider: (
		Selector: DocumentSelector,
		Provider: DefinitionProvider,
	) => Effect.Effect<IDisposable, ProviderRegistrationProblem>;
	readonly RegisterReferenceProvider: (
		Selector: DocumentSelector,
		Provider: ReferenceProvider,
	) => Effect.Effect<IDisposable, ProviderRegistrationProblem>;
	readonly RegisterCodeActionsProvider: (
		Selector: DocumentSelector,
		Provider: CodeActionProvider,
		Metadata: CodeActionProviderMetadata | undefined,
	) => Effect.Effect<IDisposable, ProviderRegistrationProblem>;
}

/**
 * The `Effect.Service` for managing language features.
 *
 * This service provides methods for extensions to register various language
 * feature providers. In this implementation, these registrations are stubs that
 * return a no-op `Disposable`. A full implementation would proxy these
 * registrations to the `Mountain` host process via an IPC channel.
 */
export class LanguageFeatureService extends Effect.Service<Interface>()(
	"Service/LanguageFeature",
	{
		sync: () => ({
			RegisterHoverProvider: () =>
				Effect.succeed(new VSCodeDisposable(() => {})),
			RegisterCompletionItemProvider: () =>
				Effect.succeed(new VSCodeDisposable(() => {})),
			RegisterDefinitionProvider: () =>
				Effect.succeed(new VSCodeDisposable(() => {})),
			RegisterReferenceProvider: () =>
				Effect.succeed(new VSCodeDisposable(() => {})),
			RegisterCodeActionsProvider: () =>
				Effect.succeed(new VSCodeDisposable(() => {})),
		}),
	},
) {}
