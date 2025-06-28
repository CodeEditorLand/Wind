/**
 * @module Service (Application/Dialog)
 * @description Defines the service for showing native file dialogs, such as 'Open'
 * and 'Save' dialogs. This service proxies requests to the host process.
 */

import { Effect } from "effect";
import type { OpenDialogOptions, SaveDialogOptions, Uri } from "vscode";
import { HostService } from "Source/Application/Host/Service.js";
import { DialogProblem } from "./Error.js";

/**
 * The contract for the Dialog service, providing methods to show native
 * file open and save dialogs.
 */
interface Dialog {
	readonly ShowOpenDialog: (
		Options?: OpenDialogOptions,
	) => Effect.Effect<readonly Uri[] | undefined, DialogProblem>;
	readonly ShowSaveDialog: (
		Options?: SaveDialogOptions,
	) => Effect.Effect<Uri | undefined, DialogProblem>;
}

/**
 * The `Effect.Service` for the Dialog service.
 *
 * This service implementation depends on the `HostService` to delegate the
 * actual dialog-showing logic to the native backend (`Mountain`). It maps any
 * potential `HostServiceProblem` into a domain-specific `DialogProblem`.
 */
export class DialogService extends Effect.Service<Dialog>()("Service/Dialog", {
	effect: Effect.gen(function* (Generator) {
		const Host = yield* Generator(HostService);

		const ShowOpenDialog = (Options: OpenDialogOptions = {}) =>
			Host.ShowOpenDialog(Options).pipe(
				Effect.mapError(
					(Cause) =>
						new DialogProblem({
							Cause,
							Context: "ShowOpenDialogFailed",
						}),
				),
			);

		const ShowSaveDialog = (Options: SaveDialogOptions = {}) =>
			Host.ShowSaveDialog(Options).pipe(
				Effect.mapError(
					(Cause) =>
						new DialogProblem({
							Cause,
							Context: "ShowSaveDialogFailed",
						}),
				),
			);

		return { ShowOpenDialog, ShowSaveDialog };
	}),
}) {}
