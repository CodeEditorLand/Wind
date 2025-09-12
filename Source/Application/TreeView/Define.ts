/**
 * @module Define
 * @description
 * Defines the service for creating and managing `vscode.TreeView` instances,
 * as well as the native data provider that fetches tree data from the host.
 */

import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IViewsService } from "@codeeditorland/output/vs/workbench/common/views.js";
import { Effect } from "effect";
import type {
	ProviderResult,
	TreeDataProvider,
	TreeItem,
	TreeView,
} from "vscode";

import { CreateEmitter, type Event } from "../../Platform/Vscode/Type.js";
import { IntegrationService } from "../Integration/Define.js";

/**
 * The Data Transfer Object for a tree item received from the Mountain backend.
 * This is the serializable representation of a `TreeItem`.
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
 * This class is used for any tree view whose data is provided natively, such as
 * the File Explorer. It translates VS Code's provider requests into IPC calls.
 */
export class NativeTreeViewDataProvider
	implements TreeDataProvider<TreeItemDTO>
{
	private readonly _OnDidChangeTreeDataEmitter = CreateEmitter<
		TreeItemDTO | TreeItemDTO[] | undefined | null | void
	>();

	public readonly onDidChangeTreeData: Event<
		TreeItemDTO | TreeItemDTO[] | undefined | null | void
	> = this._OnDidChangeTreeDataEmitter.event;

	constructor(
		private readonly ViewID: string,
		private readonly Integration: IntegrationService,
		private readonly Logger: ILogService,
	) {}

	/**
	 * Returns the `TreeItem` representation of the given element.
	 * In this case, the DTO is directly compatible with the `TreeItem` interface.
	 * @param Element The data element (DTO).
	 * @returns The `TreeItem` to be rendered.
	 */
	public getTreeItem(Element: TreeItemDTO): TreeItem {
		return Element;
	}

	/**
	 * Fetches the children of a given element from the native host.
	 * If no element is provided, it fetches the root children.
	 * @param Element The parent element (DTO) or `undefined` for the root.
	 * @returns A promise that resolves to an array of children DTOs.
	 */
	public getChildren(Element?: TreeItemDTO): ProviderResult<TreeItemDTO[]> {
		this.Logger.trace(
			`[NativeTreeViewDataProvider] Getting children for view '${this.ViewID}'`,
			Element,
		);

		const GetChildrenEffect = this.Integration.Invoke<TreeItemDTO[]>(
			"GetTreeViewChildren",
			{
				ViewID: this.ViewID,
				ElementHandle: Element?.handle,
			},
		).pipe(
			Effect.catchAll((Cause) => {
				this.Logger.error(
					`[NativeTreeViewDataProvider] Failed to get children for ${this.ViewID}:`,
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
export interface Interface {
	readonly registerTreeDataProvider: <T>(
		viewId: string,
		provider: TreeDataProvider<T>,
	) => TreeView<T>;
}

/**
 * The `Effect.Service` for the TreeView service. It uses the "viewsService"
 * identifier to ensure it can be located by legacy VS Code components that
 * rely on `IViewsService`.
 */
export class TreeViewService extends Effect.Service<Interface>()(
	"viewsService",
	{
		effect: Effect.gen(function* (Generator) {
			const ViewsService = yield* Generator(IViewsService);
			const Logger = yield* Generator(ILogService);

			const registerTreeDataProvider = <T>(
				viewId: string,
				provider: TreeDataProvider<T>,
			): TreeView<T> => {
				Logger.info(
					`[TreeViewService] Registering tree data provider for view: ${viewId}`,
				);

				return ViewsService.registerTreeDataProvider(
					viewId,
					provider as any, // Cast to any to satisfy the complex generic
				) as TreeView<T>;
			};

			return { registerTreeDataProvider };
		}),
	},
) {}
