/*
 * File: Wind/Source/Application/TreeView/Definition.ts
 * Role: Provides the live implementation of the TreeView service and a native
 *       data provider proxy.
 * Responsibilities:
 *   - `NativeTreeViewDataProvider`: A `TreeDataProvider` implementation that fetches
 *     its data from the Mountain backend by invoking Tauri commands. It acts as
 *     the client-side counterpart to a native provider in Mountain.
 *   - `Definition`: The live implementation of our `TreeViewService`, which is
 *     a thin wrapper around VS Code's `IViewsService` to register providers.
 */

import { invoke } from "@tauri-apps/api/tauri";
import { Effect } from "effect";
import { Emitter, type Event } from "vs/base/common/event.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IViewsService } from "vs/workbench/common/views.js";
import type { TreeDataProvider, TreeItem, TreeView } from "vscode";

import { Views } from "../Views/mod.js";
import type { Interface as TreeViewServiceInterface } from "./Service.js";

// This is the DTO structure defined in Mountain's FileExplorerViewProvider.
// It must be kept in sync.
interface TreeItemDTO {
	readonly handle: string;

	readonly label: { readonly label: string };

	// None | Collapsed | Expanded
	readonly collapsibleState: 0 | 1 | 2;

	readonly resourceUri?: string;

	readonly command?: {
		readonly id: string;

		readonly title: string;

		readonly arguments?: readonly any[];
	};
}

/**
 * A proxy `TreeDataProvider` that fetches its data from the Mountain backend.
 * This class is used for any tree view whose data is provided natively in Rust.
 */
export class NativeTreeViewDataProvider
	implements TreeDataProvider<TreeItemDTO>
{
	private _onDidChangeTreeData = new Emitter<
		TreeItemDTO | TreeItemDTO[] | undefined | null | void
	>();

	readonly onDidChangeTreeData: Event<
		TreeItemDTO | TreeItemDTO[] | undefined | null | void
	> = this._onDidChangeTreeData.event;

	constructor(
		private readonly ViewID: string,

		private readonly LogService: ILogService,
	) {}

	/**
	 * Returns the `TreeItem` for a given element. Since our DTO from the backend
	 * is already shaped like a `TreeItem`, we can just return it.
	 */
	getTreeItem(element: TreeItemDTO): TreeItem | Thenable<TreeItem> {
		return element;
	}

	/**
	 * Calls the Mountain backend to get the children of an element.
	 */
	async getChildren(
		element?: TreeItemDTO,
	): Promise<TreeItemDTO[] | undefined> {
		this.LogService.trace(
			`[NativeTreeViewDataProvider] Getting children for view '${this.ViewID}'`,

			element,
		);

		try {
			const children = await invoke<TreeItemDTO[]>(
				"GetTreeViewChildren",

				{
					ViewID: this.ViewID,

					ElementHandle: element?.handle,
				},
			);

			return children;
		} catch (error) {
			this.LogService.error(
				`[NativeTreeViewDataProvider] Failed to get children for ${this.ViewID}:`,

				error,
			);

			return [];
		}
	}
}

/**
 * An Effect that builds the live implementation of the TreeViewService.
 */
const Definition = Effect.gen(function* (_) {
	const ViewsService = yield* _(Views.Tag);

	const LogService = yield* _(ILogService);

	const Service: TreeViewServiceInterface = {
		registerTreeDataProvider<T>(
			viewId: string,

			provider: TreeDataProvider<T>,
		): TreeView<T> {
			LogService.info(
				`[TreeViewService] Registering tree data provider for view: ${viewId}`,
			);

			// VS Code's workbench consumes the provider via the viewsService.
			// It returns a TreeView object that we can then return to the caller.
			return ViewsService.registerTreeDataProvider(
				viewId,

				provider,
			) as TreeView<T>;
		},
	};

	return Service;
});

export default Definition;
