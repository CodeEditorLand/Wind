/**
 * @module Error (Application/IPC)
 * @description Defines domain-specific, tagged errors for Inter-Process
 * Communication (IPC) operations.
 */

import { Data } from "effect";

/**
 * A structured, tagged error for failures during a gRPC connection attempt,
 * server setup, or operation. It captures the underlying cause and provides
t * context to indicate which part of the process failed.
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
 * JavaScript value and a Google Protobuf `Value` type.
 */
export class ProtoSerializationProblem extends Data.TaggedError(
	"ProtoSerializationProblem",
)<{
	readonly Cause: unknown;
	readonly Direction: "Encoding" | "Decoding";
}> {
	public override readonly message: string;
	constructor(Properties: {
		readonly Cause: unknown;
		readonly Direction: "Encoding" | "Decoding";
	}) {
		super(Properties);
		this.message = `Protobuf ${this.Direction} failed: ${this.Cause}`;
	}
}
