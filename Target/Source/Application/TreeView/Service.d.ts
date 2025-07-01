/**
 * @module Service (Application/TreeView)
 * @description Defines the service for creating and managing `vscode.TreeView`
 * instances. This service acts as a factory, handling the registration of tree
 * data providers with the host and managing the lifecycle of each tree view.
 */
import { Effect } from "effect";
import { type Event } from "vs/base/common/event.js";
import { ILogService } from "vs/platform/log/common/log.js";
import type { TreeDataProvider, TreeItem, TreeView } from "vscode";

import { IntegrationService } from "../../Integration/Tauri/Service.js";

/**
 * The DTO for a tree item received from the Mountain backend.
 */
export interface TreeItemDTO {
	readonly handle: string;
	readonly label: {
		readonly label: string;
	};
	readonly collapsibleState: 0 | 1 | 2;
	readonly resourceUri?: string;
	readonly command?: {
		readonly id: string;
		readonly title: string;
		readonly arguments?: readonly any[];
	};
}
/**
 * A proxy `TreeDataProvider` that fetches its data from the `Mountain` backend.
 * This class is used for any tree view whose data is provided natively. It
 * translates Monaco/VS Code's provider requests into IPC calls to the host.
 */
export declare class NativeTreeViewDataProvider
	implements TreeDataProvider<TreeItemDTO>
{
	private readonly ViewId;
	private readonly Integration;
	private readonly LoggerService;
	private readonly OnDidChangeTreeDataEmitter;
	readonly onDidChangeTreeData: Event<
		TreeItemDTO | TreeItemDTO[] | undefined | null | void
	>;
	constructor(
		ViewId: string,
		Integration: IntegrationService,
		LoggerService: ILogService,
	);
	getTreeItem(Element: TreeItemDTO): TreeItem | Thenable<TreeItem>;
	getChildren(Element?: TreeItemDTO): ProviderResult<TreeItemDTO[]>;
}
/**
 * The contract for the TreeView service. It wraps VS Code's `IViewsService`
 * for the specific purpose of registering tree data providers.
 */
export interface TreeViewServiceMethods {
	readonly registerTreeDataProvider: <T>(
		viewId: string,
		provider: TreeDataProvider<T>,
	) => TreeView<T>;
}
declare const TreeViewService_base: Effect.Service.Class<
	TreeViewServiceMethods,
	"viewsService",
	{
		readonly effect: Effect.Effect<
			{
				registerTreeDataProvider: <T>(
					viewId: string,
					provider: TreeDataProvider<T>,
				) => TreeView<T>;
			},
			unknown,
			unknown
		>;
	}
>;
/**
 * The `Effect.Service` for the TreeView service. It uses the "viewsService"
 * identifier to ensure it can be located by legacy VS Code components.
 */
export declare class TreeViewService extends TreeViewService_base {}
export {};
