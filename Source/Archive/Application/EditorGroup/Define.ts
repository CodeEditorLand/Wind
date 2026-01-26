/**
 * @module Define
 * @description
 * Defines the service interface and live implementation for the application-level
 * editor groups service, which conforms to the `IEditorGroupsService` contract
 * from VS Code. This service manages the editor grid layout, including the
 * creation, removal, and state management of editor groups.
 */

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
	GroupsOrder,
	type IEditorGroup,
	type IEditorGroupsService,
} from "@codeeditorland/output/vs/workbench/services/editor/common/editorGroupsService.js";
import { Effect, Layer, Ref } from "effect";

import { EditorGroupProblem } from "./Problem.js";

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
 * The `Effect.Service` for the `IEditorGroupsService`.
 *
 * This service manages the editor grid layout, including the creation, removal,
 * and state management of editor groups. It persists its state to the `IStorageService`.
 * It is registered with the identifier "editorGroupsService" for compatibility.
 */
export class EditorGroupService extends Effect.Service<IEditorGroupsService>()(
	"editorGroupsService",
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
					ActiveGroupID: 0,
				}),
			);

			const OnDidAddGroupEmitter = new Emitter<IEditorGroup>();

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
							ActiveGroup: CurrentState.ActiveGroupID,
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
					ActiveGroupID: StoredState.ActiveGroup,
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
							ActiveGroupID: FirstGroup.id,
						}));
					}
					return Effect.void;
				}),
				Effect.andThen(SaveState),
			);

			// Initialize state on service creation.
			yield* Generator(InitializeState);

			const GetCurrentState = () => Effect.runSync(Ref.get(State));

			const ServiceImplementation: IEditorGroupsService = {
				_serviceBrand: undefined,
				onDidAddGroup: OnDidAddGroupEmitter.event,
				onDidRemoveGroup: new Emitter().event,
				onDidMoveGroup: new Emitter().event,
				onDidActivateGroup: new Emitter().event,
				onDidChangeGroupIndex: new Emitter().event,
				onDidChangeGroupLocked: new Emitter().event,
				onDidLayout: new Emitter().event,
				onDidScroll: new Emitter().event,

				get count() {
					return GetCurrentState().Groups.size;
				},
				get activeGroup() {
					const S = GetCurrentState();
					return S.Groups.get(S.ActiveGroupID)!;
				},
				get groups() {
					return Array.from(GetCurrentState().Groups.values());
				},
				getGroup: (Identifier: number) =>
					GetCurrentState().Groups.get(Identifier),
				getGroups: (Order: GroupsOrder) => {
					const S = GetCurrentState();
					if (Order === GroupsOrder.MOST_RECENTLY_ACTIVE) {
						return S.Mru.map((ID) => S.Groups.get(ID)!);
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
						ActiveGroupID: S.ActiveGroupID,
					})).pipe(
						Effect.tap(() => OnDidAddGroupEmitter.fire(NewGroup)),
						Effect.andThen(SaveState),
					);
					Effect.runFork(UpdateEffect);
					return NewGroup as IEditorGroup;
				},
				removeGroup: (Group) => {
					const ID = typeof Group === "number" ? Group : Group.id;
					const UpdateEffect = Ref.get(State).pipe(
						Effect.flatMap((S) => {
							if (S.Groups.size <= 1) {
								return Effect.fail(
									new EditorGroupProblem({
										Context: "CannotRemoveLastGroup",
									}),
								);
							}
							const NewMru = S.Mru.filter((GID) => GID !== ID);
							const NewActiveID =
								S.ActiveGroupID === ID
									? NewMru[0]!
									: S.ActiveGroupID;
							const NewGroups = new Map(S.Groups);
							NewGroups.delete(ID);

							return Ref.set(State, {
								Groups: NewGroups,
								Mru: NewMru,
								ActiveGroupID: NewActiveID,
							}).pipe(Effect.andThen(SaveState), Effect.as(true));
						}),
					);
					return Effect.runSync(
						Effect.orElse(UpdateEffect, () =>
							Effect.succeed(false),
						),
					);
				},

				// --- Stub implementations ---
				onDidCreateAuxiliaryEditorPart: Event.None,
				mainPart: {} as any,
				parts: [],
				getPart: () => ({}) as any,
				createAuxiliaryEditorPart: () => Promise.resolve({} as any),
				getScopedInstantiationService: () => InstantiationService,
				get hasRestorableState() {
					return false;
				},
				whenReady: Promise.resolve(),
				whenRestored: Promise.resolve(),
				orientation: 0,
				isReady: true,
				moveGroup: () => ({}) as any,
				copyGroup: () => ({}) as any,
				mergeGroup: () => false,
				mergeAllGroups: () => false,
				activateGroup: () => ({}) as any,
				getSize: () => ({ width: 0, height: 0 }),
				setSize: () => {},
				arrangeGroups: () => {},
				toggleMaximizeGroup: () => {},
				toggleExpandGroup: () => {},
				applyLayout: () => {},
				getLayout: () => ({ orientation: 0, groups: [] }),
				setGroupOrientation: () => {},
				findGroup: () => undefined,
				createEditorDropTarget: () => ({ dispose: () => {} }),
				partOptions: {} as any,
				onDidChangeEditorPartOptions: new Emitter().event,
				enforcePartOptions: () => ({ dispose: () => {} }),
				saveWorkingSet: () => ({}) as any,
				getWorkingSets: () => [],
				applyWorkingSet: () => Promise.resolve(false),
				deleteWorkingSet: () => {},
				registerContextKeyProvider: () => ({ dispose: () => {} }),
			};

			return ServiceImplementation;
		}),
	},
) {}
