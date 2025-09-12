/**
 * @module Generate
 * @description
 * This module serves as a placeholder for Protobuf-generated types and service
 * definitions. In a real-world gRPC setup, this file would be automatically
 * generated from a `.proto` definition file. It defines the client-side
 * contract for interacting with the `MountainService` on the native backend.
 */

/**
 * A placeholder for the Protobuf message that wraps raw binary data
 * for the VS Code RPC protocol.
 */
export class RPCDataPayload {
	/**
	 * Sets the buffer payload.
	 * @param _buffer The binary data to send.
	 */
	public setBuffer(_buffer: Uint8Array): void {}
}

/**
 * A placeholder for a generic RPC request message.
 */
export class GenericRequest {
	/**
	 * Sets the unique ID for the request.
	 * @param _id The request identifier.
	 */
	public setRequestid(_id: number): void {}
	/**
	 * Sets the RPC method name.
	 * @param _method The method to invoke.
	 */
	public setMethod(_method: string): void {}
	/**
	 * Sets the parameters for the RPC call.
	 * @param _params The parameters, typically a serialized `google.protobuf.Value`.
	 */
	public setParams(_params: any): void {}
}

/**
 * A placeholder for a generic RPC notification message.
 */
export class GenericNotification {
	/**
	 * Sets the RPC method name for the notification.
	 * @param _method The method to invoke.
	 */
	public setMethod(_method: string): void {}
	/**
	 * Sets the parameters for the RPC notification.
	 * @param _params The parameters, typically a serialized `google.protobuf.Value`.
	 */
	public setParams(_params: any): void {}
}

/**
 * A placeholder for a generic RPC response message.
 */
export class GenericResponse {
	/**
	 * Gets the result from the response.
	 * @returns The result payload, typically a `google.protobuf.Value` or `undefined`.
	 */
	public getResult(): any | undefined {
		return undefined;
	}
}

/**
 * The client-side interface for the `MountainService` gRPC service. It defines
 * the methods available for the `Wind` frontend to call on the native backend.
 */
export interface MountainService {
	/**
	 * Sends raw RPC data from the VS Code protocol to the backend.
	 * This is part of the mechanism to tunnel VS Code's RPC over gRPC.
	 * @param payload The data payload.
	 * @returns A promise that resolves when the data is sent.
	 */
	readonly sendRPCDataToMountain: (payload: RPCDataPayload) => Promise<void>;

	/**
	 * Processes a standard request-response RPC call from the extension host.
	 * @param request The generic request message.
	 * @returns A promise that resolves with the generic response message.
	 */
	readonly processCocoonRequest: (
		request: GenericRequest,
	) => Promise<GenericResponse>;

	/**
	 * Sends a one-way notification to the extension host.
	 * @param notification The generic notification message.
	 * @returns A promise that resolves when the notification is sent.
	 */
	readonly sendCocoonNotification: (
		notification: GenericNotification,
	) => Promise<void>;
}
