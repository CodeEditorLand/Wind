/**
 * @module Error (Application/IPC)
 * @description Defines domain-specific, tagged errors for Inter-Process
 * Communication (IPC) operations.
 */
declare const GrpcConnectionProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "GrpcConnectionProblem";
} & Readonly<A>;
/**
 * A structured, tagged error for failures during a gRPC connection attempt,
 * server setup, or operation. It captures the underlying cause and provides
t * context to indicate which part of the process failed.
 */
export declare class GrpcConnectionProblem extends GrpcConnectionProblem_base<{
    readonly Cause: unknown;
    readonly Context: "ProtoLoadFailed" | "ClientInstantiationFailed" | "ClientNotReady" | "ServerBindFailed" | "ServerStartFailed" | "ServerShutdownFailed";
}> {
}
declare const IpcProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "IpcProblem";
} & Readonly<A>;
/**
 * A generic, tagged error for failures that occur during a specific IPC
 * request or notification, such as a network error or a failure to
 * serialize/deserialize a message.
 */
export declare class IpcProblem extends IpcProblem_base<{
    readonly Cause: unknown;
    readonly Context: string;
}> {
}
declare const ProtoSerializationProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "ProtoSerializationProblem";
} & Readonly<A>;
/**
 * A tagged error representing a failure during the conversion between a
 * JavaScript value and a Google Protobuf `Value` type.
 */
export declare class ProtoSerializationProblem extends ProtoSerializationProblem_base<{
    readonly Cause: unknown;
    readonly Direction: "Encoding" | "Decoding";
}> {
    readonly message: string;
    constructor(Properties: {
        readonly Cause: unknown;
        readonly Direction: "Encoding" | "Decoding";
    });
}
export {};
