/**
 * @module Problem
 * @description
 * This module defines domain-specific, tagged errors for Inter-Process
 * Communication (IPC) operations. These structured errors provide clear context
 * for failures that can occur within the `IPCService`.
 */

import { Data } from "effect";

/**
 * A structured, tagged error for failures during a gRPC connection attempt,
 * server setup, or operation. It captures the underlying cause and provides
 * context to indicate which part of the process failed.
 */
export class GrpcConnectionProblem extends Data.TaggedError(
	"GrpcConnectionProblem",
)<{
	readonly Cause: unknown;
	readonly Context:
		| "ProtoLoadFailed"
		| "ClientInstantiationFailed"
		| "ClientNotReady"
		| "ServerBindFailed"
		| "ServerStartFailed"
		| "ServerShutdownFailed";
}> {}

/**
 * A generic, tagged error for failures that occur during a specific IPC
 * request or notification, such as a network error or a failure to
 * serialize/deserialize a message.
 */
export class IpcProblem extends Data.TaggedError("IpcProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}

/**
 * A tagged error representing a failure during the conversion between a
 * JavaScript value and a Google Protobuf `Value` type. This provides clear
 * diagnostics for serialization and deserialization issues.
 */
export class ProtoSerializationProblem extends Data.TaggedError(
	"ProtoSerializationProblem",
)<{
	readonly Cause: unknown;
	readonly Direction: "Encoding" | "Decoding";
}> {}
