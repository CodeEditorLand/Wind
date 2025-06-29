/**
 * @module Service (Application/Debug)
 * @description Defines the service for managing debugging sessions, breakpoints,
 * and debug-related providers, conforming to the `vscode.debug` API.
 */

import { Effect, Ref } from "effect";
import type { IExtensionDescription } from "vs/platform/extensions/common/extensions.js";
import type { MainThreadDebugShape } from "vs/workbench/api/common/extHost.protocol.js";
import {
	Disposable,
	type Breakpoint,
	type DebugAdapterDescriptorFactory,
	type DebugAdapterTrackerFactory,
	type DebugConfiguration,
	type DebugConfigurationProvider,
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
	readonly onDidChangeBreakpoints: Event<any>;
	readonly registerDebugConfigurationProvider: (
		type: string,
		provider: DebugConfigurationProvider,
		trigger: number,
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

		const MainThreadProxy = IPC.CreateProxy<MainThreadDebugShape>(
			"$rpc:mainThreadDebug",
		);

		const { event: OnDidChangeActiveDebugSession } = CreateEventStream<
			DebugSession | undefined
		>();
		const { event: OnDidStartDebugSession } =
			CreateEventStream<DebugSession>();
		const { event: OnDidReceiveDebugSessionCustomEvent } =
			CreateEventStream<any>();
		const { event: OnDidTerminateDebugSession } =
			CreateEventStream<DebugSession>();
		const { event: OnDidChangeBreakpoints } = CreateEventStream<any>();

		const RegisterProvider = <T extends ProviderEntry["Provider"]>(
			Registry: Ref.Ref<Map<number, ProviderEntry>>,
			Data: Omit<ProviderEntry, "Provider"> & { Provider: T },
		) =>
			Effect.gen(function* (Generator) {
				const Handle = ++HandleCounter.current;
				yield* Generator(
					Ref.update(Registry, (Map) => Map.set(Handle, Data as any)),
				);
				yield* Generator(
					IPC.SendNotification("$registerDebugTypes", [Data.Type]),
				);
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

		return {
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
				Type,
				Provider,
				_Trigger,
				Extension,
			) =>
				RegisterProvider(
					GetState().DebugConfigurationProviders as any,
					{ Type, Provider, Extension },
				),
			registerDebugAdapterDescriptorFactory: (Type, Factory, Extension) =>
				RegisterProvider(
					GetState().DebugAdapterDescriptorFactories as any,
					{ Type, Provider: Factory, Extension },
				),
			registerDebugAdapterTrackerFactory: (Type, Factory, Extension) =>
				RegisterProvider(
					GetState().DebugAdapterTrackerFactories as any,
					{ Type, Provider: Factory, Extension },
				),
			startDebugging: (Folder, NameOrConfiguration, Options) =>
				Effect.gen(function* (Generator) {
					const ConfigurationDTO =
						typeof NameOrConfiguration === "string"
							? { name: NameOrConfiguration }
							: NameOrConfiguration;
					const OptionsDTO = {
						parentSession: Options?.parentSession?.id,
						lifecycleManagedByParent:
							Options?.lifecycleManagedByParent,
					};
					return yield* Generator(
						MainThreadProxy.$startDebugging(
							Folder?.uri,
							ConfigurationDTO,
							OptionsDTO,
						),
					);
				}).pipe(
					Effect.mapError(
						(Cause) => new StartDebuggingProblem({ Cause }),
					),
				),
			stopDebugging: (Session) =>
				Effect.gen(function* (Generator) {
					const ActiveSession = GetState().ActiveDebugSession;
					const SessionToStop = Session ?? ActiveSession;
					if (!SessionToStop) {
						return;
					}
					yield* Generator(
						MainThreadProxy.$stopDebugging(SessionToStop.id),
					);
				}),
			addBreakpoints: (Breakpoints) =>
				Effect.sync(() =>
					MainThreadProxy.$addBreakpoints(Breakpoints as any),
				),
			removeBreakpoints: (Breakpoints) =>
				Effect.sync(() =>
					MainThreadProxy.$removeBreakpoints(Breakpoints as any),
				),
		};
	}),
}) {}
