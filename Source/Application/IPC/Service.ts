/**
 * @module Service (Application/IPC)
 * @description Defines the high-level service for Inter-Process Communication (IPC)
 * between Wind and Mountain. It orchestrates gRPC client/server connections,
 * RPC protocol adaptation, and request/notification dispatching.
 */

import * as Grpc from "@grpc/grpc-js";
import * as ProtoLoader from "@grpc/proto-loader";
import { Effect, Ref } from "effect";
import { VSBuffer } from "@codeeditorland/output/vs/base/common/buffer.js";
import { Emitter } from "@codeeditorland/output/vs/base/common/event.js";
import type { IMessagePassingProtocol } from "@codeeditorland/output/vs/base/parts/ipc/common/ipc.js";
import { RPCProtocol } from "@codeeditorland/output/vs/workbench/services/extensions/common/rpcProtocol.js";
import type { Disposable } from "vscode";

import { CancellationService } from "../Cancellation/Service.js";
import { IPCConfigurationService } from "../IPCConfiguration/Service.js";
import { LoggerService } from "../Logger/Service.js";
import {
	GrpcConnectionProblem,
	IpcProblem,
	ProtoSerializationProblem,
} from "./Error.js";
import {
	GenericNotification,
	GenericRequest,
	RPCDataPayload,
	type GenericResponse,
	type MountainService,
} from "./Generated.js";
import { DecodeValue, EncodeValue } from "./ProtoConverter.js";

/**
 * The contract for the IPC service.
 */
export interface IPC {
	readonly SendRequest: <T = unknown>(
		Method: string,
		Parameters: readonly unknown[],
	) => Effect.Effect<T, IpcProblem>;
	readonly SendNotification: (
		Method: string,
		Parameters: readonly unknown[],
	) => Effect.Effect<void, IpcProblem>;
	readonly SendCancel: (TokenId: number) => Effect.Effect<void, never>;
	readonly CreateProtocolAdapter: () => IMessagePassingProtocol & {
		ProcessIncomingData: (Data: Uint8Array) => Effect.Effect<void, never>;
	};
	readonly CreateProxy: <T extends object>(Channel: string) => T;
	readonly RegisterInvokeHandler: (
		Channel: string,
		Handler: (...Arguments: any[]) => Promise<any>,
	) => Disposable;
}

/**
 * The `Effect.Service` for IPC. It is a scoped service because it
 * manages the lifecycle of a gRPC client, ensuring it is gracefully
 * acquired and released.
 */
export class IPCService extends Effect.Service<IPC>()("Service/IPC", {
	scoped: Effect.gen(function* () {
		const Config = yield* IPCConfigurationService;
		const Cancellation = yield* CancellationService;
		const Logger = yield* LoggerService;

		const GrpcClient = yield* Effect.acquireRelease(
			Effect.gen(function* () {
				// NOTE: In a real environment, this path might be configured differently.
				const ProtoPath = "proto/vine.ipc.proto";
				const Definition = yield* Effect.tryPromise({
					try: () => ProtoLoader.load(ProtoPath, {}),
					catch: (Cause) =>
						new GrpcConnectionProblem({
							Cause,
							Context: "ProtoLoadFailed",
						}),
				});

				const GrpcObject = Grpc.loadPackageDefinition(Definition);
				const ClientConstructor = (
					GrpcObject["vine_ipc"] as Grpc.GrpcObject
				)["MountainService"] as Grpc.ServiceClientConstructor;

				const Client = new ClientConstructor(
					Config.MountainAddress,
					Grpc.credentials.createInsecure(),
				) as unknown as MountainService & Grpc.Client;

				yield* Effect.async<void, GrpcConnectionProblem>((Resume) => {
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
				});
				yield* Logger.info(
					`gRPC client connected to Mountain at ${Config.MountainAddress}.`,
				);
				return Client;
			}),
			(Client) =>
				Effect.sync(() => Client.close()).pipe(
					Effect.tap(() =>
						Logger.info("gRPC client connection closed."),
					),
				),
		);

		const RequestIdCounter = yield* Ref.make(1);
		const OnMessageEmitter = new Emitter<VSBuffer>();
		const InvokeHandlers = yield* Ref.make(
			new Map<string, (...Arguments: any[]) => Promise<any>>(),
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
			}).pipe(Effect.orDie); // Errors in sending RPC data are fatal.

		const ProtocolAdapter: IMessagePassingProtocol = {
			send: (Buffer) => Effect.runFork(SendRPCData(Buffer)),
			onMessage: OnMessageEmitter.event,
		};

		const RPCProtocolInstance = new RPCProtocol(ProtocolAdapter);

		const self: IPC = {
			SendRequest: <T>(Method: string, Parameters: readonly unknown[]) =>
				Effect.gen(function* () {
					const RequestId = yield* Ref.getAndUpdate(
						RequestIdCounter,
						(n) => n + 1,
					);
					const EncodedParameter = yield* EncodeValue(Parameters);

					const RequestMessage = new GenericRequest();
					RequestMessage.setRequestid(RequestId);
					RequestMessage.setMethod(Method);
					RequestMessage.setParams(EncodedParameter);

					const ResponseMessage = (yield* Effect.tryPromise({
						try: () =>
							GrpcClient.processCocoonRequest(RequestMessage),
						catch: (Cause) =>
							new IpcProblem({
								Cause,
								Context: `gRPC request '${Method}' failed.`,
							}),
					})) as typeof GenericResponse.prototype;

					return yield* DecodeValue(ResponseMessage.getResult());
				}).pipe(
					Effect.mapError((Error) =>
						Error instanceof ProtoSerializationProblem
							? new IpcProblem({
									Cause: Error,
									Context:
										"Proto serialization/deserialization failed",
								})
							: Error,
					),
				) as Effect.Effect<T, IpcProblem>,

			SendNotification: (Method, Parameters) =>
				Effect.gen(function* () {
					const EncodedParameter = yield* EncodeValue(Parameters);
					const NotificationMessage = new GenericNotification();
					NotificationMessage.setMethod(Method);
					NotificationMessage.setParams(EncodedParameter);
					yield* Effect.tryPromise({
						try: () =>
							GrpcClient.sendCocoonNotification(
								NotificationMessage,
							),
						catch: (Cause) =>
							new IpcProblem({
								Cause,
								Context: `gRPC notification '${Method}' failed.`,
							}),
					});
				}).pipe(
					Effect.mapError((Error) =>
						Error instanceof ProtoSerializationProblem
							? new IpcProblem({
									Cause: Error,
									Context:
										"Proto serialization/deserialization failed",
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
					Effect.sync(() =>
						OnMessageEmitter.fire(VSBuffer.wrap(Data)),
					),
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

			RegisterInvokeHandler: (
				Channel: string,
				Handler: (...args: any[]) => Promise<any>,
			) => {
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
