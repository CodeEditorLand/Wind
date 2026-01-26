/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `NotificationService`.
 */

import { IStorageService } from "@codeeditorland/output/vs/platform/storage/common/storage.js";
import { Layer } from "effect";

import { HostService } from "../Host/Define.js";
import { StorageService } from "../Storage/Define.js";
import { NotificationService } from "./Define.js";

/**
 * The live implementation `Layer` for the `NotificationService`.
 *
 * It automatically includes the dependencies required by its `effect` constructor,
 * which are the `IStorageService` and `HostService`.
 */
export const ProvideNotification = NotificationService.Default as Layer.Layer<
	NotificationService,
	never,
	IStorageService | HostService
>;
