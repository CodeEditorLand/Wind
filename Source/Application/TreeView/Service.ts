/**
 * @module Service (Application/TreeView)
 * @description Defines the service for creating and managing `vscode.TreeView`
 * instances. This service acts as a factory, handling the registration of tree
 * data providers with the host and managing the lifecycle of each tree view.
 */

import { Effect } from "effect";
import { Emitter, type Event } from "@codeeditorland/output/vs/base/common/event.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IViewsService } from "@codeeditorland/output/vs/workbench/common/views.js";
import type { TreeDataProvider, TreeItem, TreeView } from "vscode";

import { IntegrationService } from "../../Integration/Tauri/Service.js";

/**
 * The DTO for a tree item received from the Mountain backend.
 */
export interface TreeItemDTO {
	readonly handle: string;
	readonly label: { readonly label: string };
	readonly collapsibleState: 0 | 1 | 2; // None | Collapsed | Expanded
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
export class NativeTreeViewDataProvider
	implements TreeDataProvider<TreeItemDTO>
{
	private readonly OnDidChangeTreeDataEmitter = new Emitter<
		TreeItemDTO | TreeItemDTO[] | undefined | null | void
	>();

	public readonly onDidChangeTreeData: Event<
		TreeItemDTO | TreeItemDTO[] | undefined | null | void
	> = this.OnDidChangeTreeDataEmitter.event;

	constructor(
		private readonly ViewId: string,
		private readonly Integration: IntegrationService,
		private readonly LoggerService: ILogService,
	) {}

	public getTreeItem(Element: TreeItemDTO): TreeItem | Thenable<TreeItem> {
		return Element;
	}

	public getChildren(Element?: TreeItemDTO): ProviderResult<TreeItemDTO[]> {
		this.LoggerService.trace(
			`[NativeTreeViewDataProvider] Getting children for view '${this.ViewID}'`,
			Element,
		);

		const GetChildrenEffect = this.Integration.Invoke<TreeItemDTO[]>(
			"GetTreeViewChildren",
			{
				ViewID: this.ViewId,
				ElementHandle: Element?.handle,
			},
		).pipe(
			Effect.catchAll((Cause) => {
				this.LoggerService.error(
					`[NativeTreeViewDataProvider] Failed to get children for ${this.ViewId}:`,
					Cause,
				);
				return Effect.succeed([]);
			}),
		);

		return Effect.runPromise(GetChildrenEffect);
	}
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

/**
 * The `Effect.Service` for the TreeView service. It uses the "viewsService"
 * identifier to ensure it can be located by legacy VS Code components.
 */
export class TreeViewService extends Effect.Service<TreeViewServiceMethods>()(
	"viewsService",
	{
		effect: Effect.gen(function* (Generator) {
			const ViewsService = yield* Generator(IViewsService);
			const LoggerService = yield* Generator(ILogService);

			const registerTreeDataProvider = <T>(
				viewId: string,
				provider: TreeDataProvider<T>,
			): TreeView<T> => {
				LoggerService.info(
					`[TreeViewService] Registering tree data provider for view: ${viewId}`,
				);

				return ViewsService.registerTreeDataProvider(
					viewId,
					provider,
				) as TreeView<T>;
			};

			return { registerTreeDataProvider };
		}),
	},
) {}
