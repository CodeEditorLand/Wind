/**
 * @module Define
 * @description
 * Defines the service for managing debugging sessions, breakpoints, and all
 * debug-related providers, conforming to the `vscode.debug` API.
 */

import type { IExtensionDescription } from "@codeeditorland/output/vs/platform/extensions/common/extensions.js";
import type { MainThreadDebugServiceShape } from "@codeeditorland/output/vs/workbench/api/common/extHost.protocol.js";
import { Effect, Ref } from "effect";
import type {
	Breakpoint,
	BreakpointsChangeEvent,
	DebugAdapterDescriptorFactory,
	DebugAdapterTrackerFactory,
	DebugConfiguration,
	DebugConfigurationProvider,
	DebugConfigurationProviderTriggerKind,
	DebugConsole,
	DebugSession,
	DebugSessionCustomEvent,
	DebugSessionOptions,
	Event,
	WorkspaceFolder,
} from "vscode";

import {
	Disposable as VSCodeDisposable,
	type IDisposable,
} from "../../Platform/Vscode/Type.js";
import { CreateEventStream } from "../../Utility/EventStream.js";
import { IPCService } from "../IPC/Define.js";
import {
	DebugProviderRegistrationProblem,
	StartDebuggingProblem,
} from "./Problem.js";

/**
 * Represents a registered debug provider with its associated metadata.
 */
export interface ProviderEntry {
	readonly Type: string;
	readonly Provider:
		| DebugConfigurationProvider
		| DebugAdapterDescriptorFactory
		| DebugAdapterTrackerFactory;
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
 * The contract for the Debug service, mirroring the `vscode.debug` API surface.
 */
export interface Interface {
	readonly activeDebugSession: DebugSession | undefined;
	readonly activeDebugConsole: DebugConsole;
	readonly breakpoints: readonly Breakpoint[];
	readonly onDidChangeActiveDebugSession: Event<DebugSession | undefined>;
	readonly onDidStartDebugSession: Event<DebugSession>;
	readonly onDidReceiveDebugSessionCustomEvent: Event<DebugSessionCustomEvent>;
	readonly onDidTerminateDebugSession: Event<DebugSession>;
	readonly onDidChangeBreakpoints: Event<BreakpointsChangeEvent>;
	readonly registerDebugConfigurationProvider: (
		type: string,
		provider: DebugConfigurationProvider,
		trigger: DebugConfigurationProviderTriggerKind,
	) => Effect.Effect<IDisposable, DebugProviderRegistrationProblem>;
	readonly registerDebugAdapterDescriptorFactory: (
		type: string,
		factory: DebugAdapterDescriptorFactory,
	) => Effect.Effect<IDisposable, DebugProviderRegistrationProblem>;
	readonly registerDebugAdapterTrackerFactory: (
		type: string,
		factory: DebugAdapterTrackerFactory,
	) => Effect.Effect<IDisposable, DebugProviderRegistrationProblem>;
	readonly startDebugging: (
		folder: WorkspaceFolder | undefined,
		nameOrConfig: string | DebugConfiguration,
		options?: DebugSessionOptions,
	) => Effect.Effect<boolean, StartDebuggingProblem>;
	readonly stopDebugging: (
		session?: DebugSession,
	) => Effect.Effect<void, Error>;
	readonly addBreakpoints: (
		breakpoints: readonly Breakpoint[],
	) => Effect.Effect<void>;
	readonly removeBreakpoints: (
		breakpoints: readonly Breakpoint[],
	) => Effect.Effect<void>;
}

/**
 * The `Effect.Service` for the Debug service.
 */
export class DebugService extends Effect.Service<Interface>()("Service/Debug", {
	effect: Effect.gen(function* (Generator) {
		const IPC = yield* Generator(IPCService);
		const HandleCounter = { current: 0 };

		const State = yield* Generator(
			Ref.make<DebuggerState>({
				ActiveDebugSession: undefined,
				ActiveDebugConsole: { append: () => {}, appendLine: () => {} },
				Breakpoints: [],
				DebugConfigurationProviders: new Map(),
				DebugAdapterDescriptorFactories: new Map(),
				DebugAdapterTrackerFactories: new Map(),
			}),
		);

		const MainThreadProxy = IPC.CreateProxy<MainThreadDebugServiceShape>(
			"$rpc:mainThreadDebug",
		);

		const { Event: OnDidChangeActiveDebugSession } =
			yield* Generator(CreateEventStream<DebugSession | undefined>());
		const { Event: OnDidStartDebugSession } =
			yield* Generator(CreateEventStream<DebugSession>());
		const { Event: OnDidReceiveDebugSessionCustomEvent } =
			yield* Generator(CreateEventStream<DebugSessionCustomEvent>());
		const { Event: OnDidTerminateDebugSession } =
			yield* Generator(CreateEventStream<DebugSession>());
		const { Event: OnDidChangeBreakpoints } =
			yield* Generator(CreateEventStream<BreakpointsChangeEvent>());

		const RegisterProvider = <T extends ProviderEntry["Provider"]>(
			Registry: Ref.Ref<Map<number, ProviderEntry>>,
			Data: Omit<ProviderEntry, "Provider" | "Extension"> & {
				Provider: T;
			},
		) =>
			Effect.gen(function* (Generator) {
				const Handle = ++HandleCounter.current;
				yield* Generator(
					Ref.update(Registry, (Map) => Map.set(Handle, Data as any)),
				);
				yield* Generator(
					IPC.SendNotification("$registerDebugTypes", [Data.Type]),
				);

				const CleanupEffect = Ref.update(Registry, (Map) => {
					Map.delete(Handle);
					return Map;
				}).pipe(
					Effect.andThen(
						IPC.SendNotification("$unregisterDebugTypes", [
							Data.Type,
						]),
					),
				);

				return new VSCodeDisposable(() =>
					Effect.runFork(CleanupEffect),
				);
			}).pipe(
				Effect.mapError(
					(Cause) =>
						new DebugProviderRegistrationProblem({
							DebugType: Data.Type,
							Cause,
						}),
				),
			);

		const GetState = () => Effect.runSync(Ref.get(State));

		const self: Interface = {
			get activeDebugSession() {
				return GetState().ActiveDebugSession;
			},
			get activeDebugConsole() {
				return GetState().ActiveDebugConsole;
			},
			get breakpoints() {
				return GetState().Breakpoints;
			},
			onDidChangeActiveDebugSession: OnDidChangeActiveDebugSession,
			onDidStartDebugSession: OnDidStartDebugSession,
			onDidReceiveDebugSessionCustomEvent:
				OnDidReceiveDebugSessionCustomEvent,
			onDidTerminateDebugSession: OnDidTerminateDebugSession,
			onDidChangeBreakpoints: OnDidChangeBreakpoints,
			registerDebugConfigurationProvider: (type, provider, _trigger) =>
				RegisterProvider(
					Ref.get(State).pipe(
						Effect.map((s) => s.DebugConfigurationProviders),
					) as any,
					{ Type: type, Provider: provider },
				),

			registerDebugAdapterDescriptorFactory: (type, factory) =>
				RegisterProvider(
					Ref.get(State).pipe(
						Effect.map((s) => s.DebugAdapterDescriptorFactories),
					) as any,
					{ Type: type, Provider: factory },
				),

			registerDebugAdapterTrackerFactory: (type, factory) =>
				RegisterProvider(
					Ref.get(State).pipe(
						Effect.map((s) => s.DebugAdapterTrackerFactories),
					) as any,
					{ Type: type, Provider: factory },
				),

			startDebugging: (folder, nameOrConfig, options) =>
				Effect.tryPromise({
					try: () => {
						const ConfigurationDTO =
							typeof nameOrConfig === "string"
								? { name: nameOrConfig }
								: nameOrConfig;
						const OptionsDTO = {
							parentSession: options?.parentSession?.id,
							lifecycleManagedByParent:
								options?.lifecycleManagedByParent,
						};
						return MainThreadProxy.$startDebugging(
							folder?.uri,
							ConfigurationDTO,
							OptionsDTO,
						);
					},
					catch: (Cause) => new StartDebuggingProblem({ Cause }),
				}),

			stopDebugging: (session?: DebugSession) =>
				Effect.tryPromise({
					try: () => {
						const ActiveSession = GetState().ActiveDebugSession;
						const SessionToStop = session ?? ActiveSession;
						if (SessionToStop) {
							return MainThreadProxy.$stopDebugging(
								SessionToStop.id,
							);
						}
						return Promise.resolve();
					},
					catch: (Cause) =>
						new Error("Failed to stop debugging", { Cause }),
				}),

			addBreakpoints: (breakpoints) =>
				Effect.sync(() =>
					MainThreadProxy.$registerBreakpoints(breakpoints as any),
				),

			removeBreakpoints: (breakpoints) =>
				Effect.sync(() =>
					MainThreadProxy.$unregisterBreakpoints(
						breakpoints
							.filter((bp) => (bp as any).id)
							.map((bp) => (bp as any).id),
						[],
						[],
					),
				),
		};
		return self;
	}),
}) {}
