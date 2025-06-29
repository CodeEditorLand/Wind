/**
 * @module Service (Application/Dialog)
 * @description Defines the service for showing native file dialogs, such as 'Open'
 * and 'Save' dialogs. This service proxies requests to the host process.
 */
import { Effect } from "effect";
import type { OpenDialogOptions, SaveDialogOptions, Uri } from "vscode";
import { DialogProblem } from "./Error.js";
/**
 * The contract for the Dialog service, providing methods to show native
 * file open and save dialogs.
 */
export interface Dialog {
    readonly ShowOpenDialog: (Options?: OpenDialogOptions) => Effect.Effect<readonly Uri[] | undefined, DialogProblem>;
    readonly ShowSaveDialog: (Options?: SaveDialogOptions) => Effect.Effect<Uri | undefined, DialogProblem>;
}
declare const DialogService_base: Effect.Service.Class<Dialog, "Service/Dialog", {
    readonly effect: Effect.Effect<{
        ShowOpenDialog: (Options?: OpenDialogOptions) => Effect.Effect<import("effect/Option").Option<readonly import("vs/workbench/workbench.web.main.internal.js").URI[]>, DialogProblem, never>;
        ShowSaveDialog: (Options?: SaveDialogOptions) => Effect.Effect<import("effect/Option").Option<import("vs/workbench/workbench.web.main.internal.js").URI>, DialogProblem, never>;
    }, never, import("../Host/Service.js").Host>;
}>;
/**
 * The `Effect.Service` for the Dialog service.
 *
 * This service implementation depends on the `HostService` to delegate the
 * actual dialog-showing logic to the native backend (`Mountain`). It maps any
 * potential `HostServiceProblem` into a domain-specific `DialogProblem`.
 */
export declare class DialogService extends DialogService_base {
}
export {};
