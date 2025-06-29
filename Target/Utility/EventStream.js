var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, PubSub } from "../effect";
import { Emitter } from "vs/base/common/event.js";
const CreateEventStream = /* @__PURE__ */ __name(() => Effect.gen(function* (Generator) {
  const VSCodeEmitter = new Emitter();
  const PubSubInstance = yield* Generator(PubSub.unbounded());
  const Fire = /* @__PURE__ */ __name((Data) => PubSub.publish(PubSubInstance, Data).pipe(
    Effect.andThen(Effect.sync(() => VSCodeEmitter.fire(Data))),
    Effect.asVoid
  ), "Fire");
  const Shutdown = /* @__PURE__ */ __name(() => Effect.all([
    PubSub.shutdown(PubSubInstance),
    Effect.sync(() => VSCodeEmitter.dispose())
  ]).pipe(Effect.asVoid), "Shutdown");
  yield* Generator(Effect.addFinalizer(() => Shutdown()));
  return {
    Fire,
    PubSub: PubSubInstance,
    Event: VSCodeEmitter.event,
    Shutdown
  };
}).pipe(Effect.scoped), "CreateEventStream");
export {
  CreateEventStream
};
//# sourceMappingURL=EventStream.js.map
