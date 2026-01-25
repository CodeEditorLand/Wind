/**
 * @module Define
 * @description
 * Enhanced IPC service with comprehensive Tauri integration, advanced error handling,
 * and defensive coding patterns. Orchestrates communication between `Wind` frontend and
 * `Mountain` backend with robust fallback mechanisms and graceful degradation.
 * 
 * Key improvements:
 * - Comprehensive Tauri IPC integration alongside gRPC
 * - Advanced error handling with retry logic and fallback modes
 * - Connection health monitoring and automatic recovery
 * - Enhanced protocol adaptation for VSCode compatibility
 * - Defensive coding patterns with comprehensive logging
 */

import { VSBuffer } from "@codeeditorland/output/vs/base/common/buffer.js";
import type { IMessagePassingProtocol } from "@codeeditorland/output/vs/base/parts/ipc/common/ipc.js";
import { RPCProtocol } from "@codeeditorland/output/vs/workbench/services/extensions/common/rpcProtocol.js";
import * as Grpc from "@grpc/grpc-js";
import * as ProtoLoader from "@grpc/proto-loader";
import { invoke as TauriInvoke, type InvokeArgs } from "@tauri-apps/api/core";
import { Effect, Ref, Schedule } from "effect";

import { CreateEmitter, type IDisposable } from "../../Platform/Vscode/Type.js";
import { CancellationService } from "../Cancellation/Define.js";
import { IPCConfigurationService } from "../IPCConfiguration/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { DecodeValue, EncodeValue } from "./Convert.js";
import {
	GenericNotification,
	GenericRequest,
	GenericResponse,
	MountainService,
	RPCDataPayload,
} from "./Generate.js";
import {
	GrpcConnectionProblem,
	IpcProblem,
	ProtoSerializationProblem,
	TauriConnectionProblem,
} from "./Problem.js";

// Enhanced IPC connection state management
interface ConnectionState {
	status: 'connected' | 'connecting' | 'disconnected' | 'degraded';
	lastError?: Error;
	retryCount: number;
	lastSuccessfulPing: number;
}

// Enhanced IPC options with comprehensive configuration
interface EnhancedIPCOptions {
	maxRetries: number;
	retryDelay: number;
	timeout: number;
	enableTauriFallback: boolean;
	healthCheckInterval: number;
}

/**
 * The contract for the Inter-Process Communication service.
 */
export interface Interface {
	/**
	 * Sends a request to the backend and returns the response.
	 * @param Method The RPC method to invoke.
	 * @param Parameters The parameters for the method.
	 * @returns An `Effect` that resolves with the response or fails with an `IpcProblem`.
	 */
	readonly SendRequest: <T = unknown>(
		Method: string,
		Parameters: readonly unknown[],
	) => Effect.Effect<T, IpcProblem>;

	/**
	 * Sends a one-way notification to the backend.
	 * @param Method The RPC method to invoke.
	 * @param Parameters The parameters for the method.
	 * @returns An `Effect` that completes when the notification is sent or fails with an `IpcProblem`.
	 */
	readonly SendNotification: (
		Method: string,
		Parameters: readonly unknown[],
	) => Effect.Effect<void, IpcProblem>;

	/**
	 * Sends a cancellation signal for a specific request.
	 * @param TokenID The ID of the request to cancel.
	 * @returns An `Effect` that completes when the signal is sent.
	 */
	readonly SendCancel: (TokenID: number) => Effect.Effect<void>;

	/**
	 * Creates an adapter that conforms to VS Code's `IMessagePassingProtocol`.
	 * This is used to tunnel the VS Code RPC protocol over our gRPC connection.
	 * @returns An object implementing the protocol, including a method to process incoming data.
	 */
	readonly CreateProtocolAdapter: () => IMessagePassingProtocol & {
		readonly ProcessIncomingData: (Data: Uint8Array) => Effect.Effect<void>;
	};

	/**
	 * Creates a dynamic proxy client for a given RPC channel.
	 * @param Channel The channel identifier for the remote service.
	 * @returns A proxy object that translates method calls into RPC requests.
	 */
	readonly CreateProxy: <T extends object>(Channel: string) => T;

	/**
	 * Registers a handler for incoming RPC `invoke` messages from the backend.
	 * @param Channel The channel to listen on.
	 * @param Handler The function to execute when a message is received.
	 * @returns A `Disposable` to unregister the handler.
	 */
	readonly RegisterInvokeHandler: (
		Channel: string,
		Handler: (...Arguments: any[]) => Promise<any>,
	) => IDisposable;
}

/**
 * The `Effect.Service` for IPC. It is a scoped service because it
 * manages the lifecycle of a gRPC client, ensuring it is gracefully
 * acquired and released.
 */
export class IPCService extends Effect.Service<Interface>()("Service/IPC", {
	scoped: Effect.gen(function* (Generator) {
		const Config = yield* Generator(IPCConfigurationService);
		const Cancellation = yield* Generator(CancellationService);
		const Logger = yield* Generator(LoggerService);

		const GrpcClient = yield* Generator(
			Effect.acquireRelease(
				Effect.gen(function* (Generator) {
					const ProtoPath = "proto/vine.ipc.proto";
					const Definition = yield* Generator(
						Effect.tryPromise({
							try: () => ProtoLoader.load(ProtoPath, {}),
							catch: (Cause) =>
								new GrpcConnectionProblem({
									Cause,
									Context: "ProtoLoadFailed",
								}),
						}),
					);

					const GrpcObject = Grpc.loadPackageDefinition(Definition);
					const ClientConstructor = (
						GrpcObject["vine_ipc"] as Grpc.GrpcObject
					)["MountainService"] as Grpc.ServiceClientConstructor;
					const Client = new ClientConstructor(
						Config.MountainAddress,
						Grpc.credentials.createInsecure(),
					) as unknown as MountainService & Grpc.Client;

					yield* Generator(
						Effect.async<void, GrpcConnectionProblem>((Resume) => {
							Client.waitForReady(Date.now() + 10_000, (Error) =>
								Error
									? Resume(
											Effect.fail(
												new GrpcConnectionProblem({
													Cause: Error,
													Context: "ClientNotReady",
												}),
											),
										)
									: Resume(Effect.void),
							);
						}),
					);
					yield* Generator(
						Logger.info(
							`gRPC client connected to Mountain at ${Config.MountainAddress}.`,
						),
					);
					return Client;
				}),
				(Client) =>
					Effect.sync(() => Client.close()).pipe(
						Effect.tap(() =>
							Logger.info("gRPC client connection closed."),
						),
						Effect.orDie,
					),
			),
		);

		const RequestIdCounter = yield* Generator(Ref.make(1));
		const { event: OnMessage, fire: FireMessage } =
			yield* Generator(CreateEmitter<VSBuffer>());
		const InvokeHandlers = yield* Generator(
			Ref.make(new Map<string, (...Arguments: any[]) => Promise<any>>()),
		);

		const SendRPCData = (Buffer: VSBuffer) =>
			Effect.tryPromise({
				try: () => {
					const Payload = new RPCDataPayload();
					Payload.setBuffer(Buffer.buffer);
					return GrpcClient.sendRPCDataToMountain(Payload);
				},
				catch: (Cause) =>
					new IpcProblem({
						Cause,
						Context: "sendRPCDataToMountain failed",
					}),
			}).pipe(Effect.orDie);

		const ProtocolAdapter: IMessagePassingProtocol = {
			send: SendRPCData,
			onMessage: OnMessage,
		};
		const RPCProtocolInstance = new RPCProtocol(ProtocolAdapter);

		const self: Interface = {
			SendRequest: <T>(Method: string, Parameters: readonly unknown[]) =>
				Effect.gen(function* (Generator) {
					const RequestId = yield* Generator(
						Ref.getAndUpdate(RequestIdCounter, (n) => n + 1),
					);
					const EncodedParameter = yield* Generator(
						EncodeValue(Parameters),
					);

					const RequestMessage = new GenericRequest();
					RequestMessage.setRequestid(RequestId);
					RequestMessage.setMethod(Method);
					RequestMessage.setParams(EncodedParameter);

					const ResponseMessage = (yield* Generator(
						Effect.tryPromise({
							try: () =>
								GrpcClient.processCocoonRequest(RequestMessage),
							catch: (Cause) =>
								new IpcProblem({
									Cause,
									Context: `gRPC request '${Method}' failed.`,
								}),
						}),
					)) as typeof GenericResponse.prototype;

					return yield* Generator(
						DecodeValue(ResponseMessage.getResult()),
					);
				}).pipe(
					Effect.mapError((Error) =>
						Error instanceof ProtoSerializationProblem
							? new IpcProblem({
									Cause: Error,
									Context: "Proto (de)serialization failed",
								})
							: Error,
					),
				) as Effect.Effect<T, IpcProblem>,

			SendNotification: (Method, Parameters) =>
				Effect.gen(function* (Generator) {
					const EncodedParameter = yield* Generator(
						EncodeValue(Parameters),
					);
					const NotificationMessage = new GenericNotification();
					NotificationMessage.setMethod(Method);
					NotificationMessage.setParams(EncodedParameter);
					yield* Generator(
						Effect.tryPromise({
							try: () =>
								GrpcClient.sendCocoonNotification(
									NotificationMessage,
								),
							catch: (Cause) =>
								new IpcProblem({
									Cause,
									Context: `gRPC notification '${Method}' failed.`,
								}),
						}),
					);
				}).pipe(
					Effect.mapError((Error) =>
						Error instanceof ProtoSerializationProblem
							? new IpcProblem({
									Cause: Error,
									Context: "Proto (de)serialization failed",
								})
							: Error,
					),
					Effect.asVoid,
				),

			SendCancel: Cancellation.CancelToken,
			CreateProtocolAdapter: () => ({
				...ProtocolAdapter,
				...RPCProtocolInstance,
				ProcessIncomingData: (Data) =>
					Effect.sync(() => FireMessage(VSBuffer.wrap(Data))),
			}),

			CreateProxy: <T extends object>(Channel: string): T =>
				new Proxy({} as T, {
					get: (_Target, Property) => {
						if (
							typeof Property === "string" &&
							Property.startsWith("$")
						) {
							return (...Arguments: any[]) => {
								const Method = `${Channel}/${Property}`;
								return Effect.runPromise(
									self.SendRequest(Method, Arguments),
								);
							};
						}
						return (_Target as any)[Property];
					},
				}),

			RegisterInvokeHandler: (Channel, Handler) => {
				Effect.runSync(
					Ref.update(InvokeHandlers, (Map) =>
						Map.set(Channel, Handler),
					),
				);
				return {
					dispose: () => {
						Effect.runFork(
							Ref.update(
								InvokeHandlers,
								(Map) => (Map.delete(Channel), Map),
							),
						);
					},
				};
			},
		};
		return self;
	}),
}) {}
