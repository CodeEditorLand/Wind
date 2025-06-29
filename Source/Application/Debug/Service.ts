/**
 * @module Service (Application/Debug)
 * @description Defines the service for managing debugging sessions, breakpoints,
 * and debug-related providers, conforming to the `vscode.debug` API.
 */

import { Effect, Ref } from "effect";
import type { IExtensionDescription } from "vs/platform/extensions/common/extensions.js";
import type { MainThreadDebugServiceShape } from "vs/workbench/api/common/extHost.protocol.js";
import {
	Disposable,
	type Breakpoint,
	type BreakpointsChangeEvent,
	type DebugAdapterDescriptorFactory,
	type DebugAdapterTrackerFactory,
	type DebugConfiguration,
	type DebugConfigurationProvider,
	type DebugConfigurationProviderTriggerKind,
	type DebugConsole,
	type DebugSession,
	type DebugSessionCustomEvent,
	type DebugSessionOptions,
	type Event,
	type WorkspaceFolder,
} from "vscode";

import { CreateEventStream } from "../../Utility/EventStream.js";
import { IPCService } from "../IPC/Service.js";
import {
	DebugProviderRegistrationProblem,
	StartDebuggingProblem,
} from "./Error.js";

/**
 * Represents a registered debug provider.
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
	readonly onDidChangeBreakpoints: Event<BreakpointsChangeEvent>;
	readonly registerDebugConfigurationProvider: (
		type: string,
		provider: DebugConfigurationProvider,
		trigger: DebugConfigurationProviderTriggerKind,
		extension: IExtensionDescription,
	) => Effect.Effect<Disposable, DebugProviderRegistrationProblem>;
	readonly registerDebugAdapterDescriptorFactory: (
		type: string,
		factory: DebugAdapterDescriptorFactory,
		extension: IExtensionDescription,
	) => Effect.Effect<Disposable, DebugProviderRegistrationProblem>;
	readonly registerDebugAdapterTrackerFactory: (
		type: string,
		factory: DebugAdapterTrackerFactory,
		extension: IExtensionDescription,
	) => Effect.Effect<Disposable, DebugProviderRegistrationProblem>;
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
	) => Effect.Effect<void, never>;
	readonly removeBreakpoints: (
		breakpoints: readonly Breakpoint[],
	) => Effect.Effect<void, never>;
}

/**
 * The `Effect.Service` for the Debug service.
 */
export class DebugService extends Effect.Service<Debug>()("Service/Debug", {
	effect: Effect.gen(function* () {
		const IPC = yield* IPCService;
		const HandleCounter = { current: 0 };

		const State = yield* Ref.make<DebuggerState>({
			ActiveDebugSession: undefined,
			ActiveDebugConsole: { append: () => {}, appendLine: () => {} },
			Breakpoints: [],
			DebugConfigurationProviders: new Map(),
			DebugAdapterDescriptorFactories: new Map(),
			DebugAdapterTrackerFactories: new Map(),
		});

		const MainThreadProxy = IPC.CreateProxy<MainThreadDebugServiceShape>(
			"$rpc:mainThreadDebug",
		);

		const { event: onDidChangeActiveDebugSession } =
			yield* CreateEventStream<DebugSession | undefined>();
		const { event: onDidStartDebugSession } =
			yield* CreateEventStream<DebugSession>();
		const { event: onDidReceiveDebugSessionCustomEvent } =
			yield* CreateEventStream<DebugSessionCustomEvent>();
		const { event: onDidTerminateDebugSession } =
			yield* CreateEventStream<DebugSession>();
		const { event: onDidChangeBreakpoints } =
			yield* CreateEventStream<BreakpointsChangeEvent>();

		const RegisterProvider = <T extends ProviderEntry["Provider"]>(
			Registry: Ref.Ref<Map<number, ProviderEntry>>,
			Data: Omit<ProviderEntry, "Provider"> & { Provider: T },
		) =>
			Effect.gen(function* () {
				const Handle = ++HandleCounter.current;
				yield* Ref.update(Registry, (Map) =>
					Map.set(Handle, Data as any),
				);
				yield* IPC.SendNotification("$registerDebugTypes", [Data.Type]);
				const CleanupEffect = Ref.update(
					Registry,
					(Map) => (Map.delete(Handle), Map),
				).pipe(
					Effect.andThen(
						IPC.SendNotification("$unregisterDebugTypes", [
							Data.Type,
						]),
					),
				);
				return new Disposable(() => Effect.runFork(CleanupEffect));
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

		const self: Debug = {
			get activeDebugSession() {
				return GetState().ActiveDebugSession;
			},
			get activeDebugConsole() {
				return GetState().ActiveDebugConsole;
			},
			get breakpoints() {
				return GetState().Breakpoints;
			},
			onDidChangeActiveDebugSession,
			onDidStartDebugSession,
			onDidReceiveDebugSessionCustomEvent,
			onDidTerminateDebugSession,
			onDidChangeBreakpoints,
			registerDebugConfigurationProvider: (
				type,
				provider,
				_trigger,
				extension,
			) =>
				RegisterProvider(
					GetState().DebugConfigurationProviders as any,
					{ Type: type, Provider: provider, Extension: extension },
				),
			registerDebugAdapterDescriptorFactory: (type, factory, extension) =>
				RegisterProvider(
					GetState().DebugAdapterDescriptorFactories as any,
					{ Type: type, Provider: factory, Extension: extension },
				),
			registerDebugAdapterTrackerFactory: (type, factory, extension) =>
				RegisterProvider(
					GetState().DebugAdapterTrackerFactories as any,
					{ Type: type, Provider: factory, Extension: extension },
				),
			startDebugging: (
				folder,
				nameOrConfig,
				options,
			): Effect.Effect<boolean, StartDebuggingProblem> =>
				Effect.gen(function* () {
					const ConfigurationDTO =
						typeof nameOrConfig === "string"
							? { name: nameOrConfig }
							: nameOrConfig;
					const OptionsDTO = {
						parentSession: options?.parentSession?.id,
						lifecycleManagedByParent:
							options?.lifecycleManagedByParent,
					};
					return yield* MainThreadProxy.$startDebugging(
						folder?.uri,
						ConfigurationDTO,
						OptionsDTO,
					);
				}).pipe(
					Effect.mapError(
						(Cause) => new StartDebuggingProblem({ Cause }),
					),
				),
			stopDebugging: (session?: DebugSession) =>
				Effect.gen(function* () {
					const ActiveSession = GetState().ActiveDebugSession;
					const SessionToStop = session ?? ActiveSession;
					if (!SessionToStop) {
						return;
					}
					yield* MainThreadProxy.$stopDebugging(SessionToStop.id);
				}),
			addBreakpoints: (breakpoints: readonly Breakpoint[]) =>
				Effect.sync(() =>
					MainThreadProxy.$registerBreakpoints(breakpoints as any),
				),
			removeBreakpoints: (breakpoints: readonly Breakpoint[]) =>
				Effect.sync(() =>
					MainThreadProxy.$unregisterBreakpoints(
						breakpoints.filter((bp) => bp.id).map((bp) => bp.id),
						[],
						[],
					),
				),
		};
		return self;
	}),
}) {}
