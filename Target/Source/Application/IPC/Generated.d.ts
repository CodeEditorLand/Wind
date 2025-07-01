/**
 * @module Generated (Application/IPC)
 * @description Stub service definition for Protobuf-generated types.
 * This file is a stub created to resolve dependencies.
 */
export declare class RPCDataPayload {
	setBuffer(_buffer: Uint8Array): void;
}
export declare class GenericRequest {
	setRequestid(_id: number): void;
	setMethod(_method: string): void;
	setParams(_params: any): void;
}
export declare class GenericNotification {
	setMethod(_method: string): void;
	setParams(_params: any): void;
}
export declare class GenericResponse {
	getResult(): any | undefined;
}
export interface MountainService {
	sendRPCDataToMountain(payload: RPCDataPayload): Promise<void>;
	processCocoonRequest(request: GenericRequest): Promise<GenericResponse>;
	sendCocoonNotification(notification: GenericNotification): Promise<void>;
}
