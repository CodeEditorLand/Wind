/**
 * @module Definition (EditorGroups)
 * @description A stateful implementation of IEditorGroupsService that manages the
 * editor grid layout, active groups, and persists its state to storage.
 */

import { Effect, Ref } from "effect";
import { Emitter, Event } from "vs/base/common/event.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import {
	IStorageService,
	StorageScope,
	StorageTarget,
} from "vs/platform/storage/common/storage.js";
import {
	EditorGroupModel,
	type ISerializedEditorGroupModel,
} from "vs/workbench/common/editor/editorGroupModel.js";
import {
	GroupDirection,
	GroupsOrder,
	type IEditorGroup,
	type IEditorGroupsService,
	type IEditorIdentifier,
} from "vs/workbench/services/editor/common/editorGroupsService.js";

const EDITOR_PART_UI_STATE_STORAGE_KEY = "editorpart.state";

interface IEditorPartUIState {
	// A simplified representation of the grid layout
	readonly serializedGrid: any;

	readonly activeGroup: number;

	readonly mostRecentActiveGroups: number[];
}

class EditorGroupsServiceImpl implements IEditorGroupsService {
	readonly _serviceBrand: undefined;

	// --- Event Emitters ---
	private readonly _onDidAddGroup = new Emitter<IEditorGroup>();

	readonly onDidAddGroup: Event<IEditorGroup> = this._onDidAddGroup.event;

	// ... other event emitters (onDidChangeGroupIndex, etc.)

	// --- Internal State ---
	private readonly Groups = new Map<number, EditorGroupModel>();

	private Mru: number[] = [];

	private ActiveGroupId: number = 0;

	constructor(
		private readonly InstantiationService: IInstantiationService,

		private readonly StorageService: IStorageService,
	) {}

	public Initialize = Effect.gen(this, function* (_) {
		const RawState = this.StorageService.get(
			EDITOR_PART_UI_STATE_STORAGE_KEY,

			StorageScope.WORKSPACE,
		);

		if (RawState) {
			const StoredState: IEditorPartUIState = JSON.parse(RawState);

			const SerializedGroups: ISerializedEditorGroupModel[] =
				StoredState.serializedGrid?.root?.data ?? [];

			for (const SerializedGroup of SerializedGroups) {
				const Group = this.InstantiationService.createInstance(
					EditorGroupModel,

					SerializedGroup,
				);

				this.Groups.set(Group.id, Group);
			}

			this.Mru = StoredState.mostRecentActiveGroups;

			this.ActiveGroupId = StoredState.activeGroup;
		}

		// Ensure at least one group exists.
		if (this.Groups.size === 0) {
			const FirstGroup = this.InstantiationService.createInstance(
				EditorGroupModel,

				undefined,
			);

			this.Groups.set(FirstGroup.id, FirstGroup);

			this.Mru.unshift(FirstGroup.id);

			this.ActiveGroupId = FirstGroup.id;
		}

		yield* _(this.SaveState());
	});

	private SaveState = () =>
		Effect.sync(() => {
			const SerializedGrid = {
				root: {
					data: Array.from(this.Groups.values()).map((g) =>
						g.serialize(),
					),
				},
			};

			const State: IEditorPartUIState = {
				serializedGrid: SerializedGrid,

				activeGroup: this.ActiveGroupId,

				mostRecentActiveGroups: this.Mru,
			};

			this.StorageService.store(
				EDITOR_PART_UI_STATE_STORAGE_KEY,

				JSON.stringify(State),

				StorageScope.WORKSPACE,

				StorageTarget.MACHINE,
			);
		});

	// --- Public API Getters ---
	get activeGroup(): IEditorGroup {
		return this.Groups.get(this.ActiveGroupId)!;
	}

	get groups(): readonly IEditorGroup[] {
		return Array.from(this.Groups.values());
	}

	get count(): number {
		return this.Groups.size;
	}

	// --- Public API Methods ---
	getGroup(identifier: number): IEditorGroup | undefined {
		return this.Groups.get(identifier);
	}

	getGroups(order: GroupsOrder): readonly IEditorGroup[] {
		const groups = this.groups;

		if (order === GroupsOrder.MOST_RECENTLY_ACTIVE) {
			return [...this.Mru.map((id) => this.getGroup(id)!)];
		}

		return groups;
	}

	addGroup(location: IEditorGroup, direction: GroupDirection): IEditorGroup {
		const NewGroup = this.InstantiationService.createInstance(
			EditorGroupModel,

			undefined,
		);

		this.Groups.set(NewGroup.id, NewGroup);

		this.Mru.unshift(NewGroup.id);

		// A real implementation would modify the grid layout here.
		this._onDidAddGroup.fire(NewGroup);

		Effect.runFork(this.SaveState());

		return NewGroup;
	}

	removeGroup(group: number | IEditorGroup): boolean {
		const Id = typeof group === "number" ? group : group.id;

		// Cannot remove the last group
		if (this.Groups.size === 1) return false;

		this.Groups.delete(Id);

		this.Mru = this.Mru.filter((gId) => gId !== Id);

		if (this.ActiveGroupId === Id) {
			this.ActiveGroupId = this.Mru[0];
		}

		Effect.runFork(this.SaveState());

		return true;
	}

	// ... Full implementation of other methods like moveGroup, mergeGroup, etc.
	// would follow this pattern of mutating state and then calling SaveState.
}

/**
 * An Effect that builds the live implementation of the EditorGroups service.
 */
const Definition = Effect.gen(function* (_) {
	const InstantiationService = yield* _(Instantiation.Tag);

	const StorageService = yield* _(Storage.Tag);

	const ServiceInstance = new EditorGroupsServiceImpl(
		InstantiationService,

		StorageService,
	);

	// Ensure state is loaded on creation
	yield* _(ServiceInstance.Initialize);

	return ServiceInstance;
});

export default Definition;
