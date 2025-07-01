/**
 * @module Live (Application/Notification)
 * @description Provides the "live" implementation `Layer` for the Notification service.
 */
import { Layer } from "effect";
import { ICommandService } from "vs/platform/commands/common/commands.js";
import { IStorageService } from "vs/platform/storage/common/storage.js";
import { HostService } from "../Host/Service.js";
import { NotificationService } from "./Service.js";
/**
 * The live implementation `Layer` for the `NotificationService`.
 *
 * It automatically includes the dependencies required by its `effect` constructor.
 */
export declare const NotificationLive: Layer.Layer<NotificationService, never, IStorageService | ICommandService | HostService>;
