/**
 * @module Convert
 * @description
 * This module contains Effect-native functions for converting between standard
 * JavaScript values and the `google.protobuf.Value` type used for gRPC
 * communication. It provides a safe, declarative API for serialization and
 * deserialization.
 */

import { Effect } from "effect";
import {
	NullValue,
	Value as ProtoValue,
} from "google-protobuf/google/protobuf/struct_pb.js";

import { ProtoSerializationProblem } from "./Problem.js";

/**
 * An `Effect` that safely converts a JavaScript value into a
 * `google.protobuf.Value` object for serialization.
 *
 * @param JavaScriptValue The JavaScript value to encode.
 * @returns An `Effect` that resolves to a `ProtoValue` on success, or fails
 * with a `ProtoSerializationProblem` if the conversion is not possible.
 */
export const EncodeValue = (
	JavaScriptValue: any,
): Effect.Effect<ProtoValue, ProtoSerializationProblem> =>
	Effect.try({
		try: () => {
			if (JavaScriptValue === undefined) {
				const Value = new ProtoValue();
				Value.setNullValue(NullValue.NULL_VALUE);
				return Value;
			}
			return ProtoValue.fromJavaScript(JavaScriptValue);
		},
		catch: (Cause) =>
			new ProtoSerializationProblem({
				Cause,
				Direction: "Encoding",
			}),
	});

/**
 * An `Effect` that safely converts a `google.protobuf.Value` object back
 * into its corresponding JavaScript value.
 *
 * @param ProtoValueInstance The Protobuf `Value` instance to decode.
 * @returns An `Effect` that resolves to the decoded JavaScript value, or fails
 * with a `ProtoSerializationProblem` if the conversion is not possible.
 */
export const DecodeValue = (
	ProtoValueInstance?: ProtoValue,
): Effect.Effect<any, ProtoSerializationProblem> =>
	Effect.try({
		try: () => {
			if (ProtoValueInstance === undefined) {
				return undefined;
			}
			// The `getKindCase` method is used to check the type of the value.
			// The generated JS file uses a number enum for this.
			// `NULL_VALUE` corresponds to the case for `null`.
			if (
				ProtoValueInstance.getKindCase() ===
				(ProtoValue.KindCase as any).NULL_VALUE
			) {
				return null;
			}
			return ProtoValueInstance.toJavaScript();
		},
		catch: (Cause) =>
			new ProtoSerializationProblem({
				Cause,
				Direction: "Decoding",
			}),
	});
