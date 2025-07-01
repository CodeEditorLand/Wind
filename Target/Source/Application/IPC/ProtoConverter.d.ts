/**
 * @module ProtoConverter (Application/IPC)
 * @description Contains Effect-based functions to convert between
 * JavaScript values and Google Protobuf `Value` types.
 */
import { Effect } from "effect";
import { Value as ProtoValue } from "google-protobuf/google/protobuf/struct_pb.js";
import { ProtoSerializationProblem } from "./Error.js";
/**
 * An Effect that converts a JavaScript value into a `google.protobuf.Value`.
 * @param JavaScriptValue The JavaScript value to encode.
 * @returns An `Effect` that resolves to a `ProtoValue` or fails.
 */
export declare const EncodeValue: (JavaScriptValue: any) => Effect.Effect<ProtoValue, ProtoSerializationProblem>;
/**
 * An Effect that converts a `google.protobuf.Value` back into a JavaScript value.
 * @param ProtoValueInstance The Protobuf Value to decode.
 * @returns An `Effect` that resolves to the corresponding JavaScript value or fails.
 */
export declare const DecodeValue: (ProtoValueInstance?: ProtoValue) => Effect.Effect<any, ProtoSerializationProblem>;
