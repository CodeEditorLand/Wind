var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { Emitter } from "vs/base/common/event.js";
import {
} from "vs/base/parts/storage/common/storage.js";
import { IntegrationService } from "../../Integration/Tauri/Service.js";
import { StorageProblem } from "./Error.js";
class EffectStorage {
  constructor(Database, Integration) {
    this.Database = Database;
    this.Integration = Integration;
    const ListenEffect = Integration.Listen(
      `storage://did-change/${Database.Name}`,
      (Event) => {
        if (Event.payload) {
          this.OnDidChangeStorageEmitter.fire(Event.payload);
        }
      }
    );
    Effect.runFork(ListenEffect);
  }
  static {
    __name(this, "EffectStorage");
  }
  OnDidChangeStorageEmitter = new Emitter();
  onDidChangeStorage = this.onDidChangeStorageEmitter.event;
  get items() {
    const GetItemsEffect = this.Integration.Invoke(
      "Storage.GetItems",
      { DatabaseName: this.Database.Name }
    );
    return new Map(Effect.runSync(Effect.orDie(GetItemsEffect)));
  }
  get size() {
    return this.items.size;
  }
  get(key, fallbackValue) {
    const value = this.items.get(key);
    return value ?? fallbackValue;
  }
  set(key, value) {
    const request = value === void 0 ? { delete: [key] } : { insert: /* @__PURE__ */ new Map([[key, value]]) };
    this.update(request);
  }
  delete(key) {
    this.update({ delete: [key] });
  }
  update(request) {
    const UpdateEffect = this.Integration.Invoke(
      "Storage.UpdateItems",
      { DatabaseName: this.Database.Name, Request: request }
    ).pipe(
      Effect.mapError(
        (Cause) => new StorageProblem({ Cause, Context: "UpdateItemsFailed" })
      )
    );
    Effect.runFork(UpdateEffect);
  }
  async init() {
    const InitEffect = this.Integration.Invoke("Storage.Init", {
      DatabaseName: this.Database.Name,
      Path: this.Database.Path
    }).pipe(
      Effect.mapError(
        (Cause) => new StorageProblem({ Cause, Context: "InitFailed" })
      )
    );
    return Effect.runPromise(InitEffect);
  }
  async close() {
    this.OnDidChangeStorageEmitter.dispose();
  }
  async flush() {
    return Promise.resolve();
  }
  optimize() {
    return Promise.resolve();
  }
}
export {
  EffectStorage
};
//# sourceMappingURL=Storage.js.map
