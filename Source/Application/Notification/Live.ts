/**
 * @module Live (Application/Notification)
 * @description Provides the "live" implementation `Layer` for the Notification service.
 */

import { Layer } from "effect";
import { ICommandService } from "@codeeditorland/output/vs/platform/commands/common/commands.js";
import { IDialogService } from "@codeeditorland/output/vs/platform/dialogs/common/dialogs.js";
import { IStorageService } from "@codeeditorland/output/vs/platform/storage/common/storage.js";

import { HostService } from "../Host/Service.js";
import { NotificationService } from "./Service.js";

/**
 * The live implementation `Layer` for the `NotificationService`.
 *
 * It automatically includes the dependencies required by its `effect` constructor.
 */
export const NotificationLive: Layer.Layer<
	NotificationService,
	never,
	IStorageService | ICommandService | HostService
> = NotificationService.Default;
