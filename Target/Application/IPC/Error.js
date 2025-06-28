var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Data } from "../../effect";
class GrpcConnectionProblem extends Data.TaggedError(
  "GrpcConnectionProblem"
) {
  static {
    __name(this, "GrpcConnectionProblem");
  }
}
class IpcProblem extends Data.TaggedError("IpcProblem") {
  static {
    __name(this, "IpcProblem");
  }
}
class ProtoSerializationProblem extends Data.TaggedError(
  "ProtoSerializationProblem"
) {
  static {
    __name(this, "ProtoSerializationProblem");
  }
  message;
  constructor(Properties) {
    super(Properties);
    this.message = `Protobuf ${this.Direction} failed: ${this.Cause}`;
  }
}
export {
  GrpcConnectionProblem,
  IpcProblem,
  ProtoSerializationProblem
};
//# sourceMappingURL=Error.js.map
