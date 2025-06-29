/**
 * @module Service (Application/Debug)
 * @description Defines the service for managing debugging sessions, breakpoints,
 * and debug-related providers, conforming to the `vscode.debug` API.
 */
import { Effect } from "effect";
import type { IExtensionDescription } from "vs/platform/extensions/common/extensions.js";
import { Disposable, type Breakpoint, type DebugAdapterDescriptorFactory, type DebugAdapterTrackerFactory, type DebugConfiguration, type DebugConfigurationProvider, type DebugConsole, type DebugSession, type DebugSessionCustomEvent, type DebugSessionOptions, type Event, type WorkspaceFolder } from "vscode";
import { DebugProviderRegistrationProblem, StartDebuggingProblem } from "./Error.js";
/**
 * Represents a registered debug provider.
 */
export interface ProviderEntry {
    readonly Type: string;
    readonly Provider: DebugConfigurationProvider | DebugAdapterDescriptorFactory | DebugAdapterTrackerFactory;
    readonly Extension: IExtensionDescription;
}
/**
 * Represents the internal state managed by the Debug service.
 */
export interface DebuggerState {
    readonly ActiveDebugSession: DebugSession | undefined;
    readonly ActiveDebugConsole: DebugConsole;
    readonly Breakpoints: readonly Breakpoint[];
    readonly DebugConfigurationProviders: Map<number, ProviderEntry>;
    readonly DebugAdapterDescriptorFactories: Map<number, ProviderEntry>;
    readonly DebugAdapterTrackerFactories: Map<number, ProviderEntry>;
}
/**
 * The contract for the Debug service, mirroring `vscode.debug`.
 */
export interface Debug {
    readonly activeDebugSession: DebugSession | undefined;
    readonly activeDebugConsole: DebugConsole;
    readonly breakpoints: readonly Breakpoint[];
    readonly onDidChangeActiveDebugSession: Event<DebugSession | undefined>;
    readonly onDidStartDebugSession: Event<DebugSession>;
    readonly onDidReceiveDebugSessionCustomEvent: Event<DebugSessionCustomEvent>;
    readonly onDidTerminateDebugSession: Event<DebugSession>;
    readonly onDidChangeBreakpoints: Event<any>;
    readonly registerDebugConfigurationProvider: (type: string, provider: DebugConfigurationProvider, trigger: number, extension: IExtensionDescription) => Effect.Effect<Disposable, DebugProviderRegistrationProblem>;
    readonly registerDebugAdapterDescriptorFactory: (type: string, factory: DebugAdapterDescriptorFactory, extension: IExtensionDescription) => Effect.Effect<Disposable, DebugProviderRegistrationProblem>;
    readonly registerDebugAdapterTrackerFactory: (type: string, factory: DebugAdapterTrackerFactory, extension: IExtensionDescription) => Effect.Effect<Disposable, DebugProviderRegistrationProblem>;
    readonly startDebugging: (folder: WorkspaceFolder | undefined, nameOrConfig: string | DebugConfiguration, options?: DebugSessionOptions) => Effect.Effect<boolean, StartDebuggingProblem>;
    readonly stopDebugging: (session?: DebugSession) => Effect.Effect<void, Error>;
    readonly addBreakpoints: (breakpoints: readonly Breakpoint[]) => Effect.Effect<void, never>;
    readonly removeBreakpoints: (breakpoints: readonly Breakpoint[]) => Effect.Effect<void, never>;
}
declare const DebugService_base: Effect.Service.Class<Debug, "Service/Debug", {
    readonly effect: Effect.Effect<Record<PropertyKey, any> & {}, any, any>;
}>;
/**
 * The `Effect.Service` for the Debug service.
 */
export declare class DebugService extends DebugService_base {
}
export {};
