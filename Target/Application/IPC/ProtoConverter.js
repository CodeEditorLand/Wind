var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import {
  NullValue,
  Value as ProtoValue
} from "google-protobuf/google/protobuf/struct_pb.js";
import { ProtoSerializationProblem } from "./Error.js";
const EncodeValue = /* @__PURE__ */ __name((JavaScriptValue) => Effect.try({
  try: /* @__PURE__ */ __name(() => {
    if (JavaScriptValue === void 0) {
      const Value = new ProtoValue();
      Value.setNullValue(NullValue.NULL_VALUE);
      return Value;
    }
    return ProtoValue.fromJavaScript(JavaScriptValue);
  }, "try"),
  catch: /* @__PURE__ */ __name((Cause) => new ProtoSerializationProblem({
    Cause,
    Direction: "Encoding"
  }), "catch")
}), "EncodeValue");
const DecodeValue = /* @__PURE__ */ __name((ProtoValueInstance) => Effect.try({
  try: /* @__PURE__ */ __name(() => {
    if (ProtoValueInstance === void 0) {
      return void 0;
    }
    if (ProtoValueInstance.getKindCase() === ProtoValue.KindCase.NULL_VALUE) {
      return null;
    }
    return ProtoValueInstance.toJavaScript();
  }, "try"),
  catch: /* @__PURE__ */ __name((Cause) => new ProtoSerializationProblem({
    Cause,
    Direction: "Decoding"
  }), "catch")
}), "DecodeValue");
export {
  DecodeValue,
  EncodeValue
};
//# sourceMappingURL=ProtoConverter.js.map
