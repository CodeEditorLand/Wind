/**
 * @module Service (Application/EditorGroup)
 * @description Defines the service interface and live implementation for the
 * application-level editor groups service, which conforms to the `IEditorGroupService`
 * contract from VS Code.
 */

import { Effect, Ref } from "effect";
import { Emitter, Event } from "@codeeditorland/output/vs/base/common/event.js";
import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import {
	IStorageService,
	StorageScope,
	StorageTarget,
} from "@codeeditorland/output/vs/platform/storage/common/storage.js";
import {
	EditorGroupModel,
	type ISerializedEditorGroupModel,
} from "@codeeditorland/output/vs/workbench/common/editor/editorGroupModel.js";
import {
	GroupDirection,
	GroupsOrder,
	type IEditorGroup,
	type IEditorGroupService,
} from "@codeeditorland/output/vs/workbench/services/editor/common/editorGroupsService.js";

import { EditorGroupProblem } from "./Error.js";

const EDITOR_PART_UI_STATE_STORAGE_KEY = "editorpart.state";

/**
 * Represents the serializable state of the editor grid UI.
 */
export interface IEditorPartUIState {
	readonly SerializedGrid: any;
	readonly ActiveGroup: number;
	readonly MostRecentActiveGroups: number[];
}

/**
 * The `Effect.Service` for the `IEditorGroupService`.
 *
 * This service manages the editor grid layout, including the creation, removal,
 * and state management of editor groups. It persists its state to the `IStorageService`.
 */
export class EditorGroupService extends Effect.Service<IEditorGroupService>()(
	"vscode/EditorGroupService",
	{
		effect: Effect.gen(function* (Generator) {
			const InstantiationService = yield* Generator(
				IInstantiationService,
			);
			const StorageService = yield* Generator(IStorageService);

			// Internal state is managed within a single Ref for atomicity.
			const State = yield* Generator(
				Ref.make({
					Groups: new Map<number, EditorGroupModel>(),
					Mru: [] as number[],
					ActiveGroupId: 0,
				}),
			);

			const OnDidAddGroupEmitter = new Emitter<IEditorGroup>();
			// ... other event emitters would be defined here.

			/**
			 * Persists the current state of the editor groups to storage.
			 */
			const SaveState = Ref.get(State).pipe(
				Effect.flatMap((CurrentState) =>
					Effect.sync(() => {
						const SerializedGrid = {
							root: {
								data: Array.from(
									CurrentState.Groups.values(),
								).map((Group) => Group.serialize()),
							},
						};
						const StateToStore: IEditorPartUIState = {
							SerializedGrid,
							ActiveGroup: CurrentState.ActiveGroupId,
							MostRecentActiveGroups: CurrentState.Mru,
						};
						StorageService.store(
							EDITOR_PART_UI_STATE_STORAGE_KEY,
							JSON.stringify(StateToStore),
							StorageScope.WORKSPACE,
							StorageTarget.MACHINE,
						);
					}),
				),
				Effect.catchAll((Cause) =>
					Effect.logError(
						"Failed to save editor group state.",
						Cause,
					),
				),
			);

			/**
			 * Loads and initializes the state of the editor groups from storage.
			 */
			const InitializeState = Effect.sync(() => {
				const RawState = StorageService.get(
					EDITOR_PART_UI_STATE_STORAGE_KEY,
					StorageScope.WORKSPACE,
				);
				if (!RawState) {
					return;
				}
				const StoredState: IEditorPartUIState = JSON.parse(RawState);
				const SerializedGroups: ISerializedEditorGroupModel[] =
					StoredState.SerializedGrid?.root?.data ?? [];

				const InitialGroups = new Map<number, EditorGroupModel>();
				for (const SerializedGroup of SerializedGroups) {
					const Group = InstantiationService.createInstance(
						EditorGroupModel,
						SerializedGroup,
					);
					InitialGroups.set(Group.id, Group);
				}

				return {
					Groups: InitialGroups,
					Mru: StoredState.MostRecentActiveGroups,
					ActiveGroupId: StoredState.ActiveGroup,
				};
			}).pipe(
				Effect.flatMap((InitialState) =>
					InitialState ? Ref.set(State, InitialState) : Effect.void,
				),
				Effect.flatMap(() => Ref.get(State)),
				Effect.flatMap((CurrentState) => {
					// Ensure at least one group exists.
					if (CurrentState.Groups.size === 0) {
						const FirstGroup = InstantiationService.createInstance(
							EditorGroupModel,
							undefined,
						);
						return Ref.update(State, (S) => ({
							Groups: S.Groups.set(FirstGroup.id, FirstGroup),
							Mru: [FirstGroup.id, ...S.Mru],
							ActiveGroupId: FirstGroup.id,
						}));
					}
					return Effect.void;
				}),
				Effect.andThen(SaveState),
			);

			// Initialize state on service creation.
			yield* Generator(InitializeState);

			const GetCurrentState = () => Effect.runSync(Ref.get(State));

			const ServiceImplementation: IEditorGroupService = {
				_serviceBrand: undefined,
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
					return S.Groups.get(S.ActiveGroupId)!;
				},
				get groups() {
					return Array.from(GetCurrentState().Groups.values());
				},
				getGroup: (Identifier: number) =>
					GetCurrentState().Groups.get(Identifier),
				getGroups: (Order: GroupsOrder) => {
					const S = GetCurrentState();
					if (Order === GroupsOrder.MOST_RECENTLY_ACTIVE) {
						return S.Mru.map((Id) => S.Groups.get(Id)!);
					}
					return Array.from(S.Groups.values());
				},
				addGroup: (Location, Direction) => {
					const NewGroup = InstantiationService.createInstance(
						EditorGroupModel,
						undefined,
					);
					const UpdateEffect = Ref.update(State, (S) => ({
						Groups: S.Groups.set(NewGroup.id, NewGroup),
						Mru: [NewGroup.id, ...S.Mru],
						ActiveGroupId: S.ActiveGroupId, // Active group does not change here
					})).pipe(
						Effect.tap(() =>
							Effect.sync(() =>
								OnDidAddGroupEmitter.fire(NewGroup),
							),
						),
						Effect.andThen(SaveState),
					);
					Effect.runFork(UpdateEffect);
					return NewGroup;
				},
				removeGroup: (Group) => {
					const Id = typeof Group === "number" ? Group : Group.id;
					const UpdateEffect = Ref.get(State).pipe(
						Effect.flatMap((S) => {
							if (S.Groups.size <= 1) {
								return Effect.fail(
									new EditorGroupProblem({
										Context: "CannotRemoveLastGroup",
									}),
								);
							}
							const NewMru = S.Mru.filter((Gid) => Gid !== Id);
							const NewActiveId =
								S.ActiveGroupId === Id
									? NewMru[0]
									: S.ActiveGroupId;
							const NewGroups = new Map(S.Groups);
							NewGroups.delete(Id);

							return Ref.set(State, {
								Groups: NewGroups,
								Mru: NewMru,
								ActiveGroupId: NewActiveId,
							}).pipe(Effect.andThen(SaveState), Effect.as(true));
						}),
					);
					return Effect.runSync(
						Effect.orElse(UpdateEffect, () =>
							Effect.succeed(false),
						),
					);
				},
				// Stubs for other write methods
				moveGroup: () => {
					throw new Error("Function not implemented.");
				},
				mergeGroup: () => {
					throw new Error("Function not implemented.");
				},
				copyGroup: () => {
					throw new Error("Function not implemented.");
				},
				activateGroup: () => {
					throw new Error("Function not implemented.");
				},
				setGroupOrientation: () => {
					throw new Error("Function not implemented.");
				},
				get partOptions() {
					return {} as any;
				},
				onDidChangePartOptions: new Emitter().event,
			};

			return ServiceImplementation;
		}),
	},
) {}
