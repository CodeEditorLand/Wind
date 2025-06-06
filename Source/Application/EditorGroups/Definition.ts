import { Effect, Layer, Ref, Runtime } from "effect";
import type { Dimension } from "vs/base/browser/dom.js";
import { Emitter, Event } from "vs/base/common/event.js";
import { IDisposable } from "vs/base/common/lifecycle.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import {
	IStorageService,
	StorageScope,
	StorageTarget,
} from "vs/platform/storage/common/storage.js";
import {
	IEditorPartOptions,
	IEditorPartOptionsChangeEvent,
} from "vs/workbench/common/editor.js";
import {
	EditorGroupModel,
	ISerializedEditorGroupModel,
} from "vs/workbench/common/editor/editorGroupModel.js";
import {
	EditorGroupLayout,
	GroupDirection,
	GroupsArrangement,
	GroupsOrder,
	IEditorGroup,
	IEditorGroupsService,
	IFindGroupScope,
	IMergeGroupOptions,
} from "vs/workbench/services/editor/common/editorGroupsService.js";

import { InstantiationServiceTag } from "../Instantiation.js";
import { StorageServiceTag } from "../Storage.js";
import { WorkspacesProblem } from "../Workspaces/Error.js";

const EDITOR_PART_UI_STATE_STORAGE_KEY = "editorpart.state";

interface IEditorPartUIState {
	readonly serializedGrid: any; // ISerializedGrid
	readonly activeGroup: number;
	readonly mostRecentActiveGroups: number[];
}

// A simplified in-memory representation of the grid and its state.
// A full implementation would use a proper grid library like VS Code's.
class TauriEditorGroupsService implements IEditorGroupsService {
	readonly _serviceBrand: undefined;

	private readonly Groups: Map<number, EditorGroupModel> = new Map();
	private readonly MostRecentActiveGroups: number[] = [];
	private ActiveGroupId: number | undefined;

	private readonly _onDidAddGroup = new Emitter<IEditorGroup>();
	readonly onDidAddGroup: Event<IEditorGroup> = this._onDidAddGroup.event;

	private readonly _onDidChangeActiveGroup = new Emitter<IEditorGroup>();
	readonly onDidChangeActiveGroup: Event<IEditorGroup> =
		this._onDidChangeActiveGroup.event;

	// --- Stubbed properties and events for interface compliance ---
	readonly onDidRemoveGroup: Event<IEditorGroup> = Event.None;
	readonly onDidMoveGroup: Event<IEditorGroup> = Event.None;
	readonly onDidActivateGroup: Event<IEditorGroup> = Event.None;
	readonly onDidChangeGroupIndex: Event<IEditorGroup> = Event.None;
	readonly onDidChangeGroupLocked: Event<IEditorGroup> = Event.None;
	readonly onDidChangeGroupMaximized: Event<boolean> = Event.None;
	readonly onDidChangeEditorPartOptions: Event<IEditorPartOptionsChangeEvent> =
		Event.None;
	readonly isReady: boolean = true;
	readonly whenReady: Promise<void> = Promise.resolve();
	readonly whenRestored: Promise<void> = Promise.resolve();
	readonly hasRestorableState: boolean = false;
	readonly orientation = 0; // Horizontal
	readonly partOptions: IEditorPartOptions = {} as any;
	readonly mainPart = this as any; // Self-reference for main part
	readonly parts = [this] as any[];

	private InstantiationService!: IInstantiationService;

	private readonly ReadyPromise: Promise<void>;

	constructor() {
		this.ReadyPromise = Effect.runPromise(this.Initialize());
	}

	private Initialize = Effect.gen(function* (this: TauriEditorGroupsService) {
		this.InstantiationService = yield* _(InstantiationServiceTag);
		const StorageService = yield* _(StorageServiceTag);
		const RawState = StorageService.get(
			EDITOR_PART_UI_STATE_STORAGE_KEY,
			StorageScope.WORKSPACE,
		);

		if (RawState) {
			const StoredState = JSON.parse(RawState) as IEditorPartUIState;
			// A full implementation would deserialize the grid here.
			// For now, we just restore the group models.
			const SerializedGroups: ISerializedEditorGroupModel[] =
				StoredState.serializedGrid.root.data ?? [];
			for (const SerializedGroup of SerializedGroups) {
				const Group = this.InstantiationService.createInstance(
					EditorGroupModel,
					SerializedGroup,
				);
				this.Groups.set(Group.id, Group);
			}
			this.MostRecentActiveGroups.push(
				...StoredState.mostRecentActiveGroups,
			);
			this.ActiveGroupId = StoredState.activeGroup;
		}

		if (this.Groups.size === 0) {
			const FirstGroup = this.InstantiationService.createInstance(
				EditorGroupModel,
				undefined,
			);
			this.Groups.set(FirstGroup.id, FirstGroup);
			this.MostRecentActiveGroups.push(FirstGroup.id);
			this.ActiveGroupId = FirstGroup.id;
		}

		yield* _(this.SaveState());
	}).pipe(Effect.catchAll(() => Effect.void));

	private SaveState = Effect.gen(function* (this: TauriEditorGroupsService) {
		const StorageService = yield* _(StorageServiceTag);
		const SerializedGrid = {
			root: {
				data: Array.from(this.Groups.values()).map((g) =>
					g.serialize(),
				),
			},
		};

		const State: IEditorPartUIState = {
			serializedGrid: SerializedGrid,
			activeGroup: this.ActiveGroupId!,
			mostRecentActiveGroups: this.MostRecentActiveGroups,
		};

		StorageService.store(
			EDITOR_PART_UI_STATE_STORAGE_KEY,
			JSON.stringify(State),
			StorageScope.WORKSPACE,
			StorageTarget.MACHINE,
		);
	}).pipe(Effect.catchAll(() => Effect.void));

	// --- IEditorGroupsService Implementation ---

	get activeGroup(): IEditorGroup {
		return this.Groups.get(this.ActiveGroupId!)!;
	}

	get sideGroup(): any {
		// Simplified: always adds a new group to the right.
		return {
			openEditor: (editor: any, options: any) => {
				const NewGroup = this.addGroup(
					this.activeGroup,
					GroupDirection.RIGHT,
				);
				return NewGroup.openEditor(editor, options);
			},
		};
	}

	get groups(): readonly IEditorGroup[] {
		return Array.from(this.Groups.values());
	}

	get count(): number {
		return this.Groups.size;
	}

	getGroups(
		order: GroupsOrder = GroupsOrder.CREATION_TIME,
	): readonly IEditorGroup[] {
		const groupArray = Array.from(this.Groups.values());
		if (order === GroupsOrder.MOST_RECENTLY_ACTIVE) {
			return groupArray.sort((a, b) => {
				const indexA = this.MostRecentActiveGroups.indexOf(a.id);
				const indexB = this.MostRecentActiveGroups.indexOf(b.id);
				return indexA - indexB;
			});
		}
		return groupArray;
	}

	getGroup(identifier: GroupIdentifier): IEditorGroup | undefined {
		return this.Groups.get(identifier);
	}

	activateGroup(group: IEditorGroup | GroupIdentifier): IEditorGroup {
		const GroupId = typeof group === "number" ? group : group.id;
		const FoundGroup = this.Groups.get(GroupId)!;

		this.ActiveGroupId = GroupId;
		const mruIndex = this.MostRecentActiveGroups.indexOf(GroupId);
		if (mruIndex !== -1) {
			this.MostRecentActiveGroups.splice(mruIndex, 1);
		}
		this.MostRecentActiveGroups.unshift(GroupId);

		this._onDidChangeActiveGroup.fire(FoundGroup);
		Effect.runFork(this.SaveState);
		return FoundGroup;
	}

	addGroup(
		location: IEditorGroup | GroupIdentifier,
		direction: GroupDirection,
	): IEditorGroup {
		const NewGroup = this.InstantiationService.createInstance(
			EditorGroupModel,
			undefined,
		);
		this.Groups.set(NewGroup.id, NewGroup);

		this._onDidAddGroup.fire(NewGroup);
		Effect.runFork(this.SaveState);

		return NewGroup;
	}

	removeGroup(group: IEditorGroup | GroupIdentifier): void {
		const GroupId = typeof group === "number" ? group : group.id;
		if (this.Groups.size > 1) {
			this.Groups.delete(GroupId);
			Effect.runFork(this.SaveState);
		}
	}

	// --- Other methods would manipulate the in-memory grid and call SaveState ---
	// --- For brevity, they are stubbed with simple logic or as no-ops. ---

	moveGroup(group: any, location: any, direction: any): IEditorGroup {
		return group;
	}

	mergeGroup(group: any, target: any, options?: any): boolean {
		return true;
	}

	copyGroup(group: any, location: any, direction: any): IEditorGroup {
		return group;
	}

	mergeAllGroups(target?: any): boolean {
		return true;
	}

	enforcePartOptions(options: DeepPartial<IEditorPartOptions>): IDisposable {
		return { dispose: () => {} };
	}
}

const Definition = Effect.gen(function* (_) {
	const service = new TauriEditorGroupsService();
	yield* _(Effect.promise(() => service.whenReady));
	return service;
});

export default Definition;
