/**
 * @module Service (Application/LanguageFeature)
 * @description Defines the service for registering language feature providers
 * such as for hovers, completions, and definitions. It conforms to the
 * `vscode.languages` API surface.
 */
import { Effect } from "effect";
import type { IExtensionDescription } from "vs/platform/extensions/common/extensions.js";
import { Disposable } from "Source/Platform/VSCode/Type.js";
import type { CodeActionProvider, CodeActionProviderMetadata, CompletionItemProvider, DefinitionProvider, DocumentSelector, HoverProvider, ReferenceProvider } from "vscode";
import { ProviderRegistrationProblem } from "./Error.js";
/**
 * The contract for the LanguageFeature service. This interface mirrors a subset
 * of the `vscode.languages` API, focusing on provider registration.
 */
interface LanguageFeature {
    readonly RegisterHoverProvider: (Selector: DocumentSelector, Provider: HoverProvider, Extension: IExtensionDescription) => Effect.Effect<Disposable, ProviderRegistrationProblem>;
    readonly RegisterCompletionItemProvider: (Selector: DocumentSelector, Provider: CompletionItemProvider, TriggerCharacters: string[], Extension: IExtensionDescription) => Effect.Effect<Disposable, ProviderRegistrationProblem>;
    readonly RegisterDefinitionProvider: (Selector: DocumentSelector, Provider: DefinitionProvider, Extension: IExtensionDescription) => Effect.Effect<Disposable, ProviderRegistrationProblem>;
    readonly RegisterReferenceProvider: (Selector: DocumentSelector, Provider: ReferenceProvider, Extension: IExtensionDescription) => Effect.Effect<Disposable, ProviderRegistrationProblem>;
    readonly RegisterCodeActionsProvider: (Selector: DocumentSelector, Provider: CodeActionProvider, Metadata: CodeActionProviderMetadata | undefined, Extension: IExtensionDescription) => Effect.Effect<Disposable, ProviderRegistrationProblem>;
}
declare const LanguageFeatureService_base: Effect.Service.Class<LanguageFeature, "Service/LanguageFeature", {
    readonly sync: () => {
        RegisterHoverProvider: () => Effect.Effect<any, never, never>;
        RegisterCompletionItemProvider: () => Effect.Effect<any, never, never>;
        RegisterDefinitionProvider: () => Effect.Effect<any, never, never>;
        RegisterReferenceProvider: () => Effect.Effect<any, never, never>;
        RegisterCodeActionsProvider: () => Effect.Effect<any, never, never>;
    };
}>;
/**
 * The `Effect.Service` for managing language features.
 *
 * This service provides methods for extensions to register various language
 * feature providers. In this implementation, these registrations are stubs that
 * return a no-op `Disposable`. A full implementation would proxy these
- * registrations to the `Mountain` host process via an IPC channel.
 */
export declare class LanguageFeatureService extends LanguageFeatureService_base {
}
export {};
