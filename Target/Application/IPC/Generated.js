var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class RPCDataPayload {
  static {
    __name(this, "RPCDataPayload");
  }
  setBuffer(_buffer) {
  }
}
class GenericRequest {
  static {
    __name(this, "GenericRequest");
  }
  setRequestid(_id) {
  }
  setMethod(_method) {
  }
  setParams(_params) {
  }
}
class GenericNotification {
  static {
    __name(this, "GenericNotification");
  }
  setMethod(_method) {
  }
  setParams(_params) {
  }
}
class GenericResponse {
  static {
    __name(this, "GenericResponse");
  }
  getResult() {
    return void 0;
  }
}
export {
  GenericNotification,
  GenericRequest,
  GenericResponse,
  RPCDataPayload
};
//# sourceMappingURL=Generated.js.map
