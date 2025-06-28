var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Ref } from "../../effect";
import { Emitter, Event } from "vs/base/common/event.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "vs/platform/storage/common/storage.js";
import {
  EditorGroupModel
} from "vs/workbench/common/editor/editorGroupModel.js";
import {
  GroupDirection,
  GroupsOrder
} from "vs/workbench/services/editor/common/editorGroupsService.js";
import { EditorGroupsProblem } from "./Error.js";
const EDITOR_PART_UI_STATE_STORAGE_KEY = "editorpart.state";
class EditorGroupsService extends Effect.Service()(
  "vscode/EditorGroupsService",
  {
    effect: Effect.gen(function* (Generator) {
      const InstantiationService = yield* Generator(
        IInstantiationService
      );
      const StorageService = yield* Generator(IStorageService);
      const State = yield* Generator(
        Ref.make({
          Groups: /* @__PURE__ */ new Map(),
          Mru: [],
          ActiveGroupId: 0
        })
      );
      const OnDidAddGroupEmitter = new Emitter();
      const SaveState = Ref.get(State).pipe(
        Effect.flatMap(
          (CurrentState) => Effect.sync(() => {
            const SerializedGrid = {
              root: {
                data: Array.from(
                  CurrentState.Groups.values()
                ).map((Group) => Group.serialize())
              }
            };
            const StateToStore = {
              SerializedGrid,
              ActiveGroup: CurrentState.ActiveGroupId,
              MostRecentActiveGroups: CurrentState.Mru
            };
            StorageService.store(
              EDITOR_PART_UI_STATE_STORAGE_KEY,
              JSON.stringify(StateToStore),
              StorageScope.WORKSPACE,
              StorageTarget.MACHINE
            );
          })
        ),
        Effect.catchAll(
          (Cause) => Effect.logError(
            "Failed to save editor group state.",
            Cause
          )
        )
      );
      const InitializeState = Effect.sync(() => {
        const RawState = StorageService.get(
          EDITOR_PART_UI_STATE_STORAGE_KEY,
          StorageScope.WORKSPACE
        );
        if (!RawState) {
          return;
        }
        const StoredState = JSON.parse(RawState);
        const SerializedGroups = StoredState.SerializedGrid?.root?.data ?? [];
        const InitialGroups = /* @__PURE__ */ new Map();
        for (const SerializedGroup of SerializedGroups) {
          const Group = InstantiationService.createInstance(
            EditorGroupModel,
            SerializedGroup
          );
          InitialGroups.set(Group.id, Group);
        }
        return {
          Groups: InitialGroups,
          Mru: StoredState.MostRecentActiveGroups,
          ActiveGroupId: StoredState.ActiveGroup
        };
      }).pipe(
        Effect.flatMap(
          (InitialState) => InitialState ? Ref.set(State, InitialState) : Effect.void
        ),
        Effect.flatMap(() => Ref.get(State)),
        Effect.flatMap((CurrentState) => {
          if (CurrentState.Groups.size === 0) {
            const FirstGroup = InstantiationService.createInstance(
              EditorGroupModel,
              void 0
            );
            return Ref.update(State, (S) => ({
              Groups: S.Groups.set(FirstGroup.id, FirstGroup),
              Mru: [FirstGroup.id, ...S.Mru],
              ActiveGroupId: FirstGroup.id
            }));
          }
          return Effect.void;
        }),
        Effect.andThen(SaveState)
      );
      yield* Generator(InitializeState);
      const GetCurrentState = /* @__PURE__ */ __name(() => Effect.runSync(Ref.get(State)), "GetCurrentState");
      const ServiceImplementation = {
        _serviceBrand: void 0,
        onDidAddGroup: OnDidAddGroupEmitter.event,
        // Stubs for other events
        onDidRemoveGroup: new Emitter().event,
        onDidMoveGroup: new Emitter().event,
        onDidActivateGroup: new Emitter().event,
        onDidLayout: new Emitter().event,
        onDidScroll: new Emitter().event,
        get count() {
          return GetCurrentState().Groups.size;
        },
        get activeGroup() {
          const S = GetCurrentState();
          return S.Groups.get(S.ActiveGroupId);
        },
        get groups() {
          return Array.from(GetCurrentState().Groups.values());
        },
        getGroup: /* @__PURE__ */ __name((Identifier) => GetCurrentState().Groups.get(Identifier), "getGroup"),
        getGroups: /* @__PURE__ */ __name((Order) => {
          const S = GetCurrentState();
          if (Order === GroupsOrder.MOST_RECENTLY_ACTIVE) {
            return S.Mru.map((Id) => S.Groups.get(Id));
          }
          return Array.from(S.Groups.values());
        }, "getGroups"),
        addGroup: /* @__PURE__ */ __name((Location, Direction) => {
          const NewGroup = InstantiationService.createInstance(
            EditorGroupModel,
            void 0
          );
          const UpdateEffect = Ref.update(State, (S) => ({
            Groups: S.Groups.set(NewGroup.id, NewGroup),
            Mru: [NewGroup.id, ...S.Mru],
            ActiveGroupId: S.ActiveGroupId
            // Active group does not change here
          })).pipe(
            Effect.tap(
              () => Effect.sync(
                () => OnDidAddGroupEmitter.fire(NewGroup)
              )
            ),
            Effect.andThen(SaveState)
          );
          Effect.runFork(UpdateEffect);
          return NewGroup;
        }, "addGroup"),
        removeGroup: /* @__PURE__ */ __name((Group) => {
          const Id = typeof Group === "number" ? Group : Group.id;
          const UpdateEffect = Ref.get(State).pipe(
            Effect.flatMap((S) => {
              if (S.Groups.size <= 1) {
                return Effect.fail(
                  new EditorGroupsProblem({
                    Context: "CannotRemoveLastGroup"
                  })
                );
              }
              const NewMru = S.Mru.filter((Gid) => Gid !== Id);
              const NewActiveId = S.ActiveGroupId === Id ? NewMru[0] : S.ActiveGroupId;
              const NewGroups = new Map(S.Groups);
              NewGroups.delete(Id);
              return Ref.set(State, {
                Groups: NewGroups,
                Mru: NewMru,
                ActiveGroupId: NewActiveId
              }).pipe(Effect.andThen(SaveState), Effect.as(true));
            })
          );
          return Effect.runSync(
            Effect.orElse(
              UpdateEffect,
              () => Effect.succeed(false)
            )
          );
        }, "removeGroup"),
        // Stubs for other write methods
        moveGroup: /* @__PURE__ */ __name(() => {
          throw new Error("Function not implemented.");
        }, "moveGroup"),
        mergeGroup: /* @__PURE__ */ __name(() => {
          throw new Error("Function not implemented.");
        }, "mergeGroup"),
        copyGroup: /* @__PURE__ */ __name(() => {
          throw new Error("Function not implemented.");
        }, "copyGroup"),
        activateGroup: /* @__PURE__ */ __name(() => {
          throw new Error("Function not implemented.");
        }, "activateGroup"),
        setGroupOrientation: /* @__PURE__ */ __name(() => {
          throw new Error("Function not implemented.");
        }, "setGroupOrientation"),
        get partOptions() {
          return {};
        },
        onDidChangePartOptions: new Emitter().event
      };
      return ServiceImplementation;
    })
  }
) {
  static {
    __name(this, "EditorGroupsService");
  }
}
export {
  EditorGroupsService
};
//# sourceMappingURL=Service.js.map
