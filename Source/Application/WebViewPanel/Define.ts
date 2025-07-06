/**
 * @module Define
 * @description
 * Defines the service for creating and managing `vscode.WebviewPanel` instances.
 * This service acts as a factory and orchestrator, handling communication between
 * the application and the native host for all webview-related operations.
 */

import { generateUuid } from "@codeeditorland/output/vs/base/common/uuid.js";
import type { IExtensionDescription } from "@codeeditorland/output/vs/platform/extensions/common/extensions.js";
import { Effect, Ref } from "effect";
import type {
	ViewColumn,
	WebviewPanel as VSCodeWebviewPanel,
	WebviewOptions,
	WebviewPanelOptions,
	WebviewPanelSerializer,
} from "vscode";

import {
	Disposable as VSCodeDisposable,
	type IDisposable,
} from "../../Platform/Vscode/Type.js";
import { HostService } from "../Host/Define.js";
import { IPCService } from "../IPC/Define.js";
import {
	ConvertContentOptionsToDTO,
	ConvertPanelOptionsToDTO,
	ConvertShowOptionsToDTO,
} from "./Convert.js";
import { WebViewPanelProblem } from "./Problem.js";
import { WebViewPanelImplementation } from "./WebViewPanelImplementation.js";

/**
 * The contract for the WebViewPanel service.
 */
export interface Interface {
	/**
	 * Creates a new webview panel.
	 * @param Extension The extension that owns the panel.
	 * @param ViewType The type of the webview panel.
	 * @param Title The initial title of the panel.
	 * @param ShowOptions Options for where and how to show the panel.
	 * @param Options Additional options for the webview and panel.
	 * @returns An `Effect` that resolves with the created `WebviewPanel` or fails with a `WebViewPanelProblem`.
	 */
	readonly CreateWebviewPanel: (
		Extension: IExtensionDescription,
		ViewType: string,
		Title: string,
		ShowOptions:
			| ViewColumn
			| { viewColumn: ViewColumn; preserveFocus?: boolean },
		Options?: WebviewPanelOptions & WebviewOptions,
	) => Effect.Effect<VSCodeWebviewPanel, WebViewPanelProblem>;

	/**
	 * Registers a serializer for a webview panel, allowing its state to be persisted and restored.
	 * @param Extension The extension that owns the panel.
	 * @param ViewType The type of the webview panel.
	 * @param Serializer The serializer instance.
	 * @returns An `Effect` that resolves with an `IDisposable` to unregister the serializer, or fails with a `WebViewPanelProblem`.
	 */
	readonly RegisterWebviewPanelSerializer: (
		Extension: IExtensionDescription,
		ViewType: string,
		Serializer: WebviewPanelSerializer,
	) => Effect.Effect<IDisposable, WebViewPanelProblem>;
}

/**
 * The `Effect.Service` for managing webview panels.
 */
export class WebViewPanelService extends Effect.Service<Interface>()(
	"Service/WebViewPanel",
	{
		effect: Effect.gen(function* (Generator) {
			const IPC = yield* Generator(IPCService);
			const Host = yield* Generator(HostService);
			const ActivePanels = yield* Generator(
				Ref.make(new Map<string, WebViewPanelImplementation>()),
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
								Map.get(Handle)?.FireDidReceiveMessage(Message),
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
								Map.get(Handle)?.UpdateViewState(NewState),
							),
						),
					),
			);

			return {
				CreateWebviewPanel: (
					Extension,
					ViewType,
					Title,
					ShowOptions,
					Options = {},
				) =>
					Effect.gen(function* (Generator) {
						const Handle = generateUuid();
						const ViewColumnValue =
							typeof ShowOptions === "object"
								? ShowOptions.viewColumn
								: ShowOptions;
						const PreserveFocus =
							typeof ShowOptions === "object"
								? !!ShowOptions.preserveFocus
								: false;

						yield* Generator(
							IPC.SendRequest<string>("$createWebviewPanel", [
								Handle,
								ViewType,
								Title,
								ConvertShowOptionsToDTO(
									ViewColumnValue,
									PreserveFocus,
								),
								ConvertPanelOptionsToDTO(Options),
								ConvertContentOptionsToDTO(Extension, Options),
							]),
						);

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

						yield* Generator(
							Ref.update(ActivePanels, (Map) =>
								Map.set(Handle, Panel),
							),
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
					),

				RegisterWebviewPanelSerializer: (
					_Extension: IExtensionDescription,
					ViewType: string,
					_Serializer: WebviewPanelSerializer,
				) =>
					Effect.tryPromise({
						try: () =>
							IPC.SendNotification(
								"$registerWebviewPanelSerializer",
								[
									ViewType,
									{}, // Options
								],
							).pipe(
								Effect.map(
									() =>
										new VSCodeDisposable(() => {
											IPC.SendNotification(
												"$unregisterWebviewPanelSerializer",
												[ViewType],
											);
										}),
								),
								Effect.runPromise,
							),
						catch: (Cause) =>
							new WebViewPanelProblem({
								Cause,
								Context: "RegisterSerializerFailed",
							}),
					}),
			};
		}),
	},
) {}
