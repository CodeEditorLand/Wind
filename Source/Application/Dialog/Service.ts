/**
 * @module Service (Application/Dialog)
 * @description Defines the service for showing native file dialogs, such as 'Open'
 * and 'Save' dialogs. This service proxies requests to the host process.
 */

import { Effect, Option } from "effect";
import type {
	INativeOpenDialogOptions,
	ISaveDialogOptions,
} from "@codeeditorland/output/vs/platform/dialogs/common/dialogs.js";
import type { OpenDialogOptions, SaveDialogOptions, Uri } from "vscode";

import { HostService } from "../Host/Service.js";
import { DialogProblem } from "./Error.js";

/**
 * The contract for the Dialog service, providing methods to show native
 * file open and save dialogs.
 */
export interface Dialog {
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
	effect: Effect.gen(function* () {
		const Host = yield* HostService;

		const ShowOpenDialog = (Options: OpenDialogOptions = {}) =>
			Host.ShowOpenDialog(Options as INativeOpenDialogOptions).pipe(
				Effect.map(Option.getOrUndefined),
				Effect.mapError(
					(Cause) =>
						new DialogProblem({
							Cause,
							Context: "ShowOpenDialogFailed",
						}),
				),
			);

		const ShowSaveDialog = (Options: SaveDialogOptions = {}) =>
			Host.ShowSaveDialog(Options as ISaveDialogOptions).pipe(
				Effect.map(Option.getOrUndefined),
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
