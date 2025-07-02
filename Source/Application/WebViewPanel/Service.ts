/**
 * @module Service (Application/WebViewPanel)
 * @description Defines the service for creating and managing `vscode.WebviewPanel` instances.
 */

import { Effect, Ref } from "effect";
import { generateUuid } from "@codeeditorland/output/vs/base/common/uuid.js";
import type { IExtensionDescription } from "@codeeditorland/output/vs/platform/extensions/common/extensions.js";
import {
	Disposable,
	type ViewColumn,
	type WebviewPanel as VSCodeWebviewPanel,
	type WebviewOptions,
	type WebviewPanelOptions,
	type WebviewPanelSerializer,
} from "vscode";

import {
	ConvertContentOptionsToDTO,
	ConvertPanelOptionsToDTO,
	ConvertShowOptionsToDTO,
} from "../../TypeConverter/WebView.js";
import { HostService } from "../Host/Service.js";
import { IPCService } from "../IPC/Service.js";
import { WebViewPanelProblem } from "./Error.js";
import { WebViewPanelImplementation } from "./WebViewPanelImplementation.js";

/**
 * The contract for the WebViewPanel service.
 */
export interface WebViewPanel {
	readonly CreateWebviewPanel: (
		Extension: IExtensionDescription,
		ViewType: string,
		Title: string,
		ShowOptions:
			| ViewColumn
			| { viewColumn: ViewColumn; preserveFocus?: boolean },
		Options?: WebviewPanelOptions & WebviewOptions,
	) => Effect.Effect<VSCodeWebviewPanel, WebViewPanelProblem>;
	readonly RegisterWebviewPanelSerializer: (
		Extension: IExtensionDescription,
		ViewType: string,
		Serializer: WebviewPanelSerializer,
	) => Effect.Effect<Disposable, WebViewPanelProblem>;
}

/**
 * The `Effect.Service` for managing webview panels.
 */
export class WebViewPanelService extends Effect.Service<WebViewPanel>()(
	"Service/WebViewPanel",
	{
		effect: Effect.gen(function* () {
			const IPC = yield* IPCService;
			const Host = yield* HostService;
			const ActivePanels = yield* Ref.make(
				new Map<string, WebViewPanelImplementation>(),
			);

			// Register RPC handlers to receive updates from the host.
			IPC.RegisterInvokeHandler("$onDidDisposeWebview", ([Handle]) =>
				Effect.runPromise(
					Ref.get(ActivePanels).pipe(
						Effect.map((Map) => Map.get(Handle)?.dispose()),
					),
				),
			);
			IPC.RegisterInvokeHandler(
				"$onDidReceiveMessage",
				([Handle, Message]) =>
					Effect.runPromise(
						Ref.get(ActivePanels).pipe(
							Effect.map((Map) =>
								Map.get(Handle)?.fireDidReceiveMessage(Message),
							),
						),
					),
			);
			IPC.RegisterInvokeHandler(
				"$onDidChangeWebviewPanelViewState",
				([Handle, NewState]) =>
					Effect.runPromise(
						Ref.get(ActivePanels).pipe(
							Effect.map((Map) =>
								Map.get(Handle)?.updateViewState(NewState),
							),
						),
					),
			);

			const CreateWebviewPanel = (
				Extension: IExtensionDescription,
				ViewType: string,
				Title: string,
				ShowOptions:
					| ViewColumn
					| { viewColumn: ViewColumn; preserveFocus?: boolean },
				Options: WebviewPanelOptions & WebviewOptions = {},
			) =>
				Effect.gen(function* () {
					const Handle = generateUuid();
					const ViewColumnValue =
						typeof ShowOptions === "object"
							? ShowOptions.viewColumn
							: ShowOptions;
					const PreserveFocus =
						typeof ShowOptions === "object"
							? !!ShowOptions.preserveFocus
							: false;

					yield* IPC.SendRequest<string>("$createWebviewPanel", [
						Handle,
						ViewType,
						Title,
						ConvertShowOptionsToDTO(ViewColumnValue, PreserveFocus),
						ConvertPanelOptionsToDTO(Options),
						ConvertContentOptionsToDTO(Extension, Options),
					]);

					const Panel = new WebViewPanelImplementation(
						Handle,
						Host,
						Extension,
						() =>
							Effect.runSync(
								Ref.update(ActivePanels, (Map) => {
									Map.delete(Handle);
									return Map;
								}),
							),
						ViewType,
						Title,
						Options,
						ViewColumnValue,
					);

					yield* Ref.update(ActivePanels, (Map) =>
						Map.set(Handle, Panel),
					);
					return Panel as VSCodeWebviewPanel;
				}).pipe(
					Effect.mapError(
						(Cause) =>
							new WebViewPanelProblem({
								Cause,
								Context: "CreateWebviewPanelFailed",
							}),
					),
				);

			return {
				CreateWebviewPanel,
				RegisterWebviewPanelSerializer: (
					_Extension: IExtensionDescription,
					ViewType: string,
					_Serializer: WebviewPanelSerializer,
				) =>
					Effect.sync(() => {
						IPC.SendNotification(
							"$registerWebviewPanelSerializer",
							[ViewType, {}],
						);
						return new Disposable(() => {
							IPC.SendNotification(
								"$unregisterWebviewPanelSerializer",
								[ViewType],
							);
						});
					}).pipe(
						Effect.mapError(
							(Cause) =>
								new WebViewPanelProblem({
									Cause,
									Context: "RegisterSerializerFailed",
								}),
						),
					),
			};
		}),
	},
) {}
