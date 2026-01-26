/**
 * @module Define
 * @description
 * Defines the service for showing native file dialogs, such as 'Open'
 * and 'Save' dialogs. This service proxies requests to the host process via
 * the `HostService`.
 */

import type { INativeOpenDialogOptions } from "@codeeditorland/output/vs/platform/dialogs/common/dialogs.js";
import { Effect, Option } from "effect";
import type { OpenDialogOptions, SaveDialogOptions, Uri } from "vscode";

import { HostService } from "../Host/Define.js";
import { DialogProblem } from "./Problem.js";

/**
 * The contract for the Dialog service, providing methods to show native
 * file open and save dialogs in an Effect-native way.
 */
export interface Interface {
	/**
	 * Shows a native file open dialog to the user.
	 * @param Options Configuration for the open dialog.
	 * @returns An `Effect` that resolves with an array of selected `Uri`s,
	 * or `undefined` if the dialog was cancelled. It can fail with a `DialogProblem`.
	 */
	readonly ShowOpenDialog: (
		Options?: OpenDialogOptions,
	) => Effect.Effect<readonly Uri[] | undefined, DialogProblem>;

	/**
	 * Shows a native file save dialog to the user.
	 * @param Options Configuration for the save dialog.
	 * @returns An `Effect` that resolves with the selected `Uri`, or `undefined`
	 * if the dialog was cancelled. It can fail with a `DialogProblem`.
	 */
	readonly ShowSaveDialog: (
		Options?: SaveDialogOptions,
	) => Effect.Effect<Uri | undefined, DialogProblem>;
}

/**
 * The `Effect.Service` for the `DialogService`.
 *
 * This service implementation depends on the `HostService` to delegate the
 * actual dialog-showing logic to the native backend (`Mountain`). It maps any
 * potential `HostProblem` into a domain-specific `DialogProblem`.
 */
export class DialogService extends Effect.Service<Interface>()(
	"Service/Dialog",
	{
		effect: Effect.gen(function* (Generator) {
			const Host = yield* Generator(HostService);

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
				Host.ShowSaveDialog(Options).pipe(
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
	},
) {}
