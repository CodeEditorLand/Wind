/**
 * @module Generated (Application/IPC)
 * @description Stub service definition for Protobuf-generated types.
 * This file is a stub created to resolve dependencies.
 */

// These are placeholder classes to match the expected structure.
// A real implementation would be generated from a .proto file.

export class RPCDataPayload {
	setBuffer(_buffer: Uint8Array): void {}
}

export class GenericRequest {
	setRequestid(_id: number): void {}
	setMethod(_method: string): void {}
	setParams(_params: any): void {}
}

export class GenericNotification {
	setMethod(_method: string): void {}
	setParams(_params: any): void {}
}

export class GenericResponse {
	getResult(): any | undefined {
		return undefined;
	}
}

export interface MountainService {
	sendRPCDataToMountain(payload: RPCDataPayload): Promise<void>;
	processCocoonRequest(request: GenericRequest): Promise<GenericResponse>;
	sendCocoonNotification(notification: GenericNotification): Promise<void>;
}
