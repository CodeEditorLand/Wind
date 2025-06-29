var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as Grpc from "@grpc/grpc-js";
import * as ProtoLoader from "@grpc/proto-loader";
import { Effect, Ref } from "../../effect";
import { VSBuffer } from "vs/base/common/buffer.js";
import { Emitter } from "vs/base/common/event.js";
import { RPCProtocol } from "vs/workbench/services/extensions/common/rpcProtocol.js";
import { CancellationService } from "../Cancellation/Service.js";
import { IPCConfigurationService } from "../IPCConfiguration/Service.js";
import { LoggerService } from "../Logger/Service.js";
import {
  GrpcConnectionProblem,
  IpcProblem,
  ProtoSerializationProblem
} from "./Error.js";
import {
  GenericNotification,
  GenericRequest,
  RPCDataPayload
} from "./Generated.js";
import { DecodeValue, EncodeValue } from "./ProtoConverter.js";
class IPCService extends Effect.Service()("Service/IPC", {
  scoped: Effect.gen(function* () {
    const Config = yield* IPCConfigurationService;
    const Cancellation = yield* CancellationService;
    const Logger = yield* LoggerService;
    const GrpcClient = yield* Effect.acquireRelease(
      Effect.gen(function* () {
        const ProtoPath = "proto/vine.ipc.proto";
        const Definition = yield* Effect.tryPromise({
          try: /* @__PURE__ */ __name(() => ProtoLoader.load(ProtoPath, {}), "try"),
          catch: /* @__PURE__ */ __name((Cause) => new GrpcConnectionProblem({
            Cause,
            Context: "ProtoLoadFailed"
          }), "catch")
        });
        const GrpcObject = Grpc.loadPackageDefinition(Definition);
        const ClientConstructor = GrpcObject["vine_ipc"]["MountainService"];
        const Client = new ClientConstructor(
          Config.MountainAddress,
          Grpc.credentials.createInsecure()
        );
        yield* Effect.async((Resume) => {
          Client.waitForReady(
            Date.now() + 1e4,
            (Error2) => Error2 ? Resume(
              Effect.fail(
                new GrpcConnectionProblem({
                  Cause: Error2,
                  Context: "ClientNotReady"
                })
              )
            ) : Resume(Effect.void)
          );
        });
        yield* Logger.info(
          `gRPC client connected to Mountain at ${Config.MountainAddress}.`
        );
        return Client;
      }),
      (Client) => Effect.sync(() => Client.close()).pipe(
        Effect.tap(
          () => Logger.info("gRPC client connection closed.")
        )
      )
    );
    const RequestIdCounter = yield* Ref.make(1);
    const OnMessageEmitter = new Emitter();
    const InvokeHandlers = yield* Ref.make(
      /* @__PURE__ */ new Map()
    );
    const SendRPCData = /* @__PURE__ */ __name((Buffer2) => Effect.tryPromise({
      try: /* @__PURE__ */ __name(() => {
        const Payload = new RPCDataPayload();
        Payload.setBuffer(Buffer2.buffer);
        return GrpcClient.sendRPCDataToMountain(Payload);
      }, "try"),
      catch: /* @__PURE__ */ __name((Cause) => new IpcProblem({
        Cause,
        Context: "sendRPCDataToMountain failed"
      }), "catch")
    }).pipe(Effect.orDie), "SendRPCData");
    const ProtocolAdapter = {
      send: /* @__PURE__ */ __name((Buffer2) => Effect.runFork(SendRPCData(Buffer2)), "send"),
      onMessage: OnMessageEmitter.event
    };
    const RPCProtocolInstance = new RPCProtocol(ProtocolAdapter);
    const self = {
      SendRequest: /* @__PURE__ */ __name((Method, Parameters) => Effect.gen(function* () {
        const RequestId = yield* Ref.getAndUpdate(
          RequestIdCounter,
          (n) => n + 1
        );
        const EncodedParameter = yield* EncodeValue(Parameters);
        const RequestMessage = new GenericRequest();
        RequestMessage.setRequestid(RequestId);
        RequestMessage.setMethod(Method);
        RequestMessage.setParams(EncodedParameter);
        const ResponseMessage = yield* Effect.tryPromise({
          try: /* @__PURE__ */ __name(() => GrpcClient.processCocoonRequest(RequestMessage), "try"),
          catch: /* @__PURE__ */ __name((Cause) => new IpcProblem({
            Cause,
            Context: `gRPC request '${Method}' failed.`
          }), "catch")
        });
        return yield* DecodeValue(ResponseMessage.getResult());
      }).pipe(
        Effect.mapError(
          (Error2) => Error2 instanceof ProtoSerializationProblem ? new IpcProblem({
            Cause: Error2,
            Context: "Proto serialization/deserialization failed"
          }) : Error2
        )
      ), "SendRequest"),
      SendNotification: /* @__PURE__ */ __name((Method, Parameters) => Effect.gen(function* () {
        const EncodedParameter = yield* EncodeValue(Parameters);
        const NotificationMessage = new GenericNotification();
        NotificationMessage.setMethod(Method);
        NotificationMessage.setParams(EncodedParameter);
        yield* Effect.tryPromise({
          try: /* @__PURE__ */ __name(() => GrpcClient.sendCocoonNotification(
            NotificationMessage
          ), "try"),
          catch: /* @__PURE__ */ __name((Cause) => new IpcProblem({
            Cause,
            Context: `gRPC notification '${Method}' failed.`
          }), "catch")
        });
      }).pipe(
        Effect.mapError(
          (Error2) => Error2 instanceof ProtoSerializationProblem ? new IpcProblem({
            Cause: Error2,
            Context: "Proto serialization/deserialization failed"
          }) : Error2
        ),
        Effect.asVoid
      ), "SendNotification"),
      SendCancel: Cancellation.CancelToken,
      CreateProtocolAdapter: /* @__PURE__ */ __name(() => ({
        ...ProtocolAdapter,
        ...RPCProtocolInstance,
        ProcessIncomingData: /* @__PURE__ */ __name((Data) => Effect.sync(
          () => OnMessageEmitter.fire(VSBuffer.wrap(Data))
        ), "ProcessIncomingData")
      }), "CreateProtocolAdapter"),
      CreateProxy: /* @__PURE__ */ __name((Channel) => new Proxy({}, {
        get: /* @__PURE__ */ __name((_Target, Property) => {
          if (typeof Property === "string" && Property.startsWith("$")) {
            return (...Arguments) => {
              const Method = `${Channel}/${Property}`;
              return Effect.runPromise(
                self.SendRequest(Method, Arguments)
              );
            };
          }
          return _Target[Property];
        }, "get")
      }), "CreateProxy"),
      RegisterInvokeHandler: /* @__PURE__ */ __name((Channel, Handler) => {
        Effect.runSync(
          Ref.update(
            InvokeHandlers,
            (Map2) => Map2.set(Channel, Handler)
          )
        );
        return {
          dispose: /* @__PURE__ */ __name(() => {
            Effect.runFork(
              Ref.update(
                InvokeHandlers,
                (Map2) => (Map2.delete(Channel), Map2)
              )
            );
          }, "dispose")
        };
      }, "RegisterInvokeHandler")
    };
    return self;
  })
}) {
  static {
    __name(this, "IPCService");
  }
}
export {
  IPCService
};
//# sourceMappingURL=Service.js.map
